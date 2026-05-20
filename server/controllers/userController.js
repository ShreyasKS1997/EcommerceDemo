const asyncErrorHandler = require('../Middleware/asyncErrorHandler');
const ErrorHandler = require('../utils/ErrorHandler');
const User = require('../DBSchema/userSchema');
const refreshTokenSchema = require('../DBSchema/refreshTokenSchema');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const { v2: cloudinary } = require('cloudinary');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const testAdminUsers = require('../DBSchema/testAdminUsers');
const productSchema = require('../DBSchema/productSchema');
const orderSchema = require('../DBSchema/orderSchema');
const userSchema = require('../DBSchema/userSchema');

exports.refreshToken = asyncErrorHandler(async (req, res, next) => {

  // accessToken check from headers authorization
  const accessToken = req.headers.authorization?.split(' ')[1];

  // refreshToken check from http cookie
  const refreshTokenCookie = req.cookies.token;
  if (!refreshTokenCookie) {
    return next(new ErrorHandler('NO_SESSION', 401, res));
  }

  // hash refreshToken and check for session in db
  const hashedToken = crypto.createHash('sha256').update(refreshTokenCookie).digest('hex');

  const refreshTokenUser = await refreshTokenSchema.findOne({ $or: [{oldTokenHash: hashedToken}, {newTokenHash: hashedToken}]});

  if (!refreshTokenUser) {
    return next(new ErrorHandler('SESSION_REVOKED', 401, res));
  }

  if (hashedToken === refreshTokenUser.oldTokenHash) {
    const createdTime = new Date(refreshTokenUser.rotationTime).getTime();
    if((Date.now() - createdTime) > 30000) {
      return next(new ErrorHandler('Refresh token grace period expired', 401));
    }
  } 

  // if refreshToken expired(idle timout), throw error.
  if (Date.now() > refreshTokenUser.expiresAt) {
    return next(new ErrorHandler('IDLE_SESSION_EXPIRED', 401, res));
  }

  // if absolute session expired, throw error
  if (Date.now() > refreshTokenUser.sessionExpiresAt) {
    return next(new ErrorHandler('SESSION_EXPIRED', 401, res));
  }

  // get user details from accessToken, not found then from refreshToken

  let userDetails;
  if (accessToken) {
    const details = jwt.verify(accessToken, process.env.JWT_SECRET, {ignoreExpiration: true});
    if (details.role === 'user') {
      userDetails = await User.findById(details.id);
    } else {
      userDetails = await testAdminUsers.findById(details.id);
    }
  } else {
    userDetails = await User.findById(refreshTokenUser.userId); // refreshToken always has main user mapped to it
  }

  if (!userDetails) {
    return next(new ErrorHandler('USER_NOT_FOUND', 401, res));
  }

  // get jwtToken
  const jwtToken = userDetails.getJWTToken();

  // create new refresh token
  const refresh = crypto.randomBytes(40).toString('hex');

  // hash the refresh token to store in db
  const refreshTokenHash = crypto.createHash('sha256').update(refresh).digest('hex');

  // set refresh token expiry for 7 days from now
  const date7Day = new Date();
  date7Day.setDate(date7Day.getDate() + 7);

  // update session on db
  refreshTokenUser.oldTokenHash = hashedToken;
  refreshTokenUser.newTokenHash = refreshTokenHash;
  refreshTokenUser.expiresAt = date7Day;
  refreshTokenUser.rotationTime = new Date(Date.now());
  await refreshTokenUser.save();

  // send unhashed refreshToken as http cookie
  res.cookie('token', refresh, {
    expires: date7Day,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  const uDetails = {
    _id: userDetails._id,
    role: userDetails.role,
    token: jwtToken,
  }

  // send latest fetched active user details in json
  res.status(200).json({
    success: true,
    user: uDetails,
  })

})

// Register a user
exports.registerUser = asyncErrorHandler(async (req, res, next) => {

  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return next(new ErrorHandler('CREDENTIAL_MISSING', 210)); // Invalid credentials
  }

  if (req.cookies.token || req.headers.authorization) {
    return next(new ErrorHandler('ANOTHER_USER_LOGGED_IN', 403)); // Forbidden. Refresh Token already exist on the client side
  }

//////////////////////// Check if email is already registered. If yes, send alert to the email ////////////////////////////

  const emailDB = await User.findOne({email: email}); // testAdmin or testUser cannot register or use password
  if (emailDB) {
    const resetToken = emailDB.getResetPasswordToken(); // Generate new Reset Token
    await emailDB.save({validateBeforeSave: false}); // Save new Reset Token in DB

    const resetPasswordURL = `${req.protocol}://${req.get(
      'host'
    )}/password/reset/${resetToken}`; // Password reset url

    const message = `Someone tried to register in our website with this email. If it was not you, we recommend immediately changing your password.
    \n\n Click the below link to reset your password \n\n ${resetPasswordURL}`; // Email message

    try {
      await sendEmail({
        email: emailDB.email,
        subject: 'Security Alert',
        message,
      }); // Send email with subject and message
    } catch (error) {
      // Remove reset password token from DB if there is any error
      console.log(`Error sending mail. Error ${error}`);
      emailDB.resetPasswordToken = undefined;
      emailDB.resetPasswordExpire = undefined;
      await emailDB.save({ validateBeforeSave: false });
    }
  }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  let cloud = {};

  if(!req.body.avatar) { // Default profile image if no image is found in req body
    cloud = {
      public_id: 'DefaultProfileImage',
      secure_url: 'https://res.cloudinary.com/dn1ykttta/image/upload/v1778742950/avatar/DefaultProfileImage.png',
    }
  } else { // Upload image if found in req body
    cloud = await cloudinary.uploader.upload(req.body.avatar, {
      folder: 'avatar',
      width: 150,
      crop: 'scale',
    });
  };

  await User.create({ // testAdmin or testUser cannot register or use password
    name,
    email,
    password,
    sandboxId: new mongoose.Types.ObjectId(),
    avatar: {
      public_id: cloud.public_id, // public id generated from cloudinary upload
      url: cloud.secure_url, // url generated from cloudinary upload
    },
  });

  res.status(200).json({ // Registration Success
    success: true,
    message: 'REGISTRATION_SUCCESSFUL',
    details: `Thank you for registering. You will receive confirmation link if you don't already have an account with this email.`,
  });

});

exports.loginUser = asyncErrorHandler(async (req, res, next) => {

  // Check if refresh Token already exist
  const refreshToken = req.cookies.token;
  if (refreshToken || req.headers.authorization) {
    return next(new ErrorHandler('ANOTHER_USER_LOGGED_IN', 403)); // Forbidden. Refresh Token already exist on the client side
  }

  // Email and password input check
  const {email, password} = req.body;
  if (!email || !password) {
    return next(new ErrorHandler('Please enter Email and Password', 400)); // Bad request
  }

  // Authenticate user.
  const user = await User.findOne({ // testAdmin or testUser cannot login or use password
    email,
  }).select('+password');

  const err = new ErrorHandler('Invalid email or password', 401);
  if (!user) {
    return next(err); // Unauthorized
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(err); // Unauthorized
  }

  // create new session in db
  const date = new Date();
  date.setDate(date.getDate() + 7); // expiry of refresh token on idle for 7 days

  const tokennew = crypto.randomBytes(40).toString('hex'); // refresh token without hash
  const tokennewHash = crypto.createHash('sha256').update(tokennew).digest('hex'); // refresh token with hash

  // create refresh token on db
  await refreshTokenSchema.create({
    userId: user._id,
    newTokenHash: tokennewHash,
    expiresAt: date,
    createdAt: new Date(Date.now()),
    rotationTime: new Date(Date.now()),
  });

  if (req.body.cartItems) {
    Object.keys(req.body.cartItems).forEach((key) => {
      user.cartItems[key] = req.body.cartItems[key];
    });
    user.markModified('cartItems');
    await user.save();
  }

  // send refresh token as http cookie without hash
  res.cookie('token', tokennew, {
    expires: date,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  const {_id, role, createdBy, sandboxId} = user.toObject();

  res.status(200).json({
    success: true,
    user: {
      _id,
      role,
      createdBy,
      sandboxId,
      token: user.getJWTToken()
    }
  })
});

// Logout
exports.logout = asyncErrorHandler(async (req, res, next) => {

  const token = req.cookies.token;

  if (token) {
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await refreshTokenSchema.deleteOne({ $or: [{newTokenHash: tokenHash}, {oldTokenHash: tokenHash} ]});
    } catch (err) {
      return next(new ErrorHandler('Something went wrong', 500));
    }
  }

  res.clearCookie('token', {httpOnly: true, sameSite: 'strict', secure: true});

  res.status(200).json({
    success: true,
    message: 'Log out successful',
  });
});

/*function generatePassword(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}*/

exports.generateTestAdmin = asyncErrorHandler(async (req, res, next) => {

  const cloud = {
    public_id: 'DefaultProfileImage',
    secure_url: 'https://res.cloudinary.com/dn1ykttta/image/upload/v1778742950/avatar/DefaultProfileImage.png',
  }

  const name = 'test_admin_' + (Math.random().toString(36).substring(2,6));
  
  const sandboxId = req.user.sandboxId;

  const email = `test+${sandboxId.toString().substring(0, 4)}+${name}@testAdmin.local`;

  const expiresAt = req.user.expiresAt;

  const role = 'test_admin';

  const user = await testAdminUsers.create({
    name,
    email,
    createdBy: req.user._id,
    sandboxId,
    role,
    expiresAt,
    avatar: {
      public_id: cloud.public_id,
      url: cloud.secure_url,
    },
  });

  req.user.testAdmin = user._id;
  req.user.save()

  const token = user.getJWTToken();

  const userDetails = {
    _id: user._id,
    createdBy: user.createdBy,
    sandboxId: user.sandboxId,
    token: token,
    role: user.role
  }

  res.status(201).json({
    success: true,
    user: userDetails,
  })
})

exports.loadTestAdmin = asyncErrorHandler(async (req, res, next) => {

  const testAdmin = await testAdminUsers.findById(req.user.testAdmin);

  if (!testAdmin) {
    return next(new ErrorHandler('TEST_ADMIN_NOT_FOUND', 404));
  }

  const token = testAdmin.getJWTToken();

  const testAdminDetails = {
    _id: testAdmin._id,
    role: testAdmin.role,
    createdBy: testAdmin.createdBy,
    token: token,
  }

  res.status(200).json({
    success: true,
    user: testAdminDetails
  })
})


exports.loadTestUsers = asyncErrorHandler(async(req, res, next) => {
  const testUsers = await testAdminUsers.find({sandboxId: req.user.sandboxId},
    {name:1, email:1, role:1, createdBy:1, sandboxId:1}).withToken();

  res.status(200).json({
    success: true,
    testUsers
  })
});


exports.createTestUser = asyncErrorHandler(async (req, res, next) => {

  const quantity = req.body.quantity;

  const getAllUserWithSameSandboxId = await testAdminUsers.find({sandboxId: req.user.sandboxId});
  
  if (getAllUserWithSameSandboxId.length >= 7 || 
    req.user.testUsers?.length >= 5) {
      return next(new ErrorHandler('TEST_USER_LIMIT_REACHED', 403));
  }

  if (req.user.testUsers?.length + parseInt(quantity) > 5) {
    return next(new ErrorHandler('MAX_LIMIT_OF_TEST_USERS_IS_5', 403));
  }

  const testUsers = [];

  for (i = 0; i < quantity; i++ ) {

    const testUserObject = {};

    testUserObject.createdBy = req.user._id;

    testUserObject.expiresAt = req.user.expiresAt;

    const name = `test_user_${Math.random().toString(36).substring(2,6)}`;
    testUserObject.name = name;

    testUserObject.sandboxId = req.user.sandboxId;

    testUserObject.email = `test+${req.user.sandboxId.toString().substring(0,4)}+${name}@testUser.local`;

    testUserObject.role = 'test_user';

    testUserObject.avatar = {
      public_id: 'DefaultProfileImage',
      url: 'https://res.cloudinary.com/dn1ykttta/image/upload/v1778742950/avatar/DefaultProfileImage.png'
    };

    testUsers.push(testUserObject);

  }
  const user = await testAdminUsers.insertMany(testUsers);

  for (i = 0; i < testUsers.length; i++) {
    req.user.testUsers.push(user[i]._id);
  }
  await req.user.save();

  res.status(201).json({
    success: true,
  });

});

exports.deleteTestUser = asyncErrorHandler(async (req, res, next) => {

  const testAdmin = req.user;
  const user = await testAdminUsers.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  if (user.avatar.public_id !== 'DefaultProfileImage') {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  await orderSchema.deleteMany({user: req.params.id});
  testAdmin.testUsers = testAdmin.testUsers.filter((item) => item.toString() !== req.params.id);
  await testAdmin.save();
  res.status(200).json({
    success: true,
  });
})

// Forgot password
exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler('USER_NOT_FOUND', 404));
  }

  // get resetPassword token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordURL = `${req.protocol}://${req.get(
    'host'
  )}/password/reset/${resetToken}`;

  const message = `Click the below link to reset your password \n\n ${resetPasswordURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'password reset link',
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    const err = new ErrorHandler(error.message, 500);
    err.details = error.message;
    return next(err);
  }
});

// Reset Password
exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
  });

  if (!user) {
    const err = new ErrorHandler('Password reset link is invalid or expired', 400);
    return next(err);
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// Get user details
exports.getUserDetails = asyncErrorHandler(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    user,
  });
});

// Update Password
exports.changePassword = asyncErrorHandler(async (req, res, next) => {

  const user = await User.findById(req.user.id).select('+password');
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler('OLD_PASSWORD_INCORRECT', 400));
  }

  if (req.body.newPassword !== req.body.newConfirmPassword) {
    return next(new ErrorHandler('NEW_PASSWORD_DOES_NOT_MATCH', 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  res.status(200).json({
    success: true,
  })
});

//Update user profile
exports.updateUserProfile = asyncErrorHandler(async (req, res, next) => {
  if (!req.body.name && !req.body.email && !req.body.avatar) {
    return res.sendStatus(204);
  }

  if (req.body.name === req.user.name && req.body.email === req.user.email && !req.body.avatar) {
    return res.sendStatus(204)
  }

  const userProfileData = {};

  (req.user.name.toString() !== req.body.name.toString()) && (userProfileData.name = req.body.name);
  (req.user.email.toString() !== req.body.email.toString()) && (userProfileData.email = req.body.email);

  if (req.body.avatar && req.body.avatar !== '' && req.body.avatar.includes('data:image')) {
    const imageId = req.user.avatar.public_id;
    await cloudinary.uploader.destroy(imageId);
    const myCloud = await cloudinary.uploader.upload(req.body.avatar, {
      folder: 'avatar',
      width: 150,
      crop: 'scale',
    });
    userProfileData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

   req.user.role === 'user' ? await User.findByIdAndUpdate(req.user._id, userProfileData) : 
   await testAdminUsers.findByIdAndUpdate(req.user._id, userProfileData);

  res.status(200).json({
    success: true,
  });
});

// Get single users
exports.getSingleUsers = asyncErrorHandler(async (req, res, next) => {
  const user = await testAdminUsers.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User not found with id - ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//Update user role -- admin
exports.updateUserRole = asyncErrorHandler(async (req, res, next) => {

  if (req.params.id === req.user.createdBy.toString()) {
    return next(new ErrorHandler('NOT_AUTHORISED', 403));
  }

  const user = await testAdminUsers.findById(req.params.id);

  const userUserRole = {};

  (user.name !== req.body.name) && (userUserRole.name = req.body.name);
  (user.email !== req.body.email) && (userUserRole.email = req.body.email);
  (user.role !== req.body.role) && (userUserRole.role = req.body.role);

  const updatedUser = await testAdminUsers.updateOne({_id: req.params.id}, {$set: userUserRole}, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    updatedUser
  });
});

exports.deleteAllUserData = asyncErrorHandler(async (req, res, next) => {
  await orderSchema.deleteMany({sandboxId: req.user.sandboxId});

  await productSchema.deleteMany({sandboxId: req.user.sandboxId});

  const token = req.cookies.token;

  if (token) {
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await refreshTokenSchema.deleteOne({ $or: [{newTokenHash: tokenHash}, {oldTokenHash: tokenHash} ]});
    } catch (err) {
      return next(new ErrorHandler('Something went wrong', 500));
    }
  }

  res.clearCookie('token', {httpOnly: true, sameSite: 'strict', secure: true});

  await testAdminUsers.deleteMany({sandboxId: req.user.sandboxId});

  await userSchema.deleteOne({sandboxId: req.user.sandboxId});

  res.status(200).json({
    success: true
  })
})
