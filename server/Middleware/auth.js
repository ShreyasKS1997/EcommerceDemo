const ErrorHandler = require('../utils/ErrorHandler');
const asyncErrorHandler = require('./asyncErrorHandler');
const jwt = require('jsonwebtoken');
const User = require('../DBSchema/userSchema');
const crypto = require('crypto');
const refreshTokenSchema = require('../DBSchema/refreshTokenSchema');
const testAdminUsers = require('../DBSchema/testAdminUsers');

exports.isAuth = asyncErrorHandler(async (req, res, next) => {
  const refreshTokenCookie = req.cookies.token;
  if (!refreshTokenCookie) {
    return next(new ErrorHandler('NO_SESSION', 401, res));
  }

  const hashedToken = crypto.createHash('sha256').update(refreshTokenCookie).digest('hex');
  const refreshTokenUser = await refreshTokenSchema.findOne({$or: [{oldTokenHash: hashedToken}, {newTokenHash: hashedToken}]});
  if (!refreshTokenUser) {
    return next(new ErrorHandler('SESSION_REVOKED', 401, res));
  }

    if (hashedToken === refreshTokenUser.oldTokenHash) {
      const createdTime = new Date(refreshTokenUser.rotationTime).getTime();
      if((Date.now() - createdTime) > 30000) {
        return next(new ErrorHandler('Refresh token grace period expired', 401));
      }
    } 

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return next(new ErrorHandler('NO_TOKEN', 401, res));
  }
  
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  if (decodedData.role !== 'user') {
    req.user = await testAdminUsers.findById(decodedData.id);
  } else {
    req.user = await User.findById(decodedData.id);
  }
  if (!req.user) {
    return next(new ErrorHandler('USER_NOT_FOUND', 401, res));
  }

  next();
});

// authorization of routes
exports.authorization = (...roles) => {
  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler('You are not authorised to access this page', 403)
      );
    }
    next();
  };
};

exports.testAdminSpamControl = (async (req, res, next) => {
  const testUser = await User.findOne({createdBy: req.user.id, role: 'test_admin'});
  if (!testUser) {
    next();
  } else {
    res.status(200).json({
      success: true,
      testUser
    });
  }
});
