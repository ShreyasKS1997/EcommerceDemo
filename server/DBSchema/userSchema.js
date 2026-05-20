const mongoose = require('mongoose');
const { default: validator } = require('validator');
const bcrypt = require('bcryptjs');
const jwtToken = require('jsonwebtoken');
const crypto = require('crypto');
const { required } = require('nodemon/lib/config');

const  {Schema} = mongoose;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    minLength: [4, 'Name should have more than 4 character'],
    maxLength: [30, 'Name cannot have more than 30 character'],
  },
  email: {
    type: String,
    required: [true, 'Please enter your Email Address'],
    unique: true,
    validate: [validator.isEmail, 'Please enter a valid Email Address'],
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minLength: [8, 'Password should have more than 8 characters'],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: 'user',
  },

  testAdmin: {
    type: Schema.Types.ObjectId,
    ref: 'testAdminUsers',
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  sandboxId: {
    type: Schema.Types.ObjectId,
    required: false,
    default: null,
  },

  expiresAt: {
    type: Date,
    default: () => Date.now() + 1000 * 60 * 60 * 24 * 30,
  },

  cartItems: {
    type: Object,
    required: false,
    default: {},
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

userSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// JWT Token
userSchema.methods.getJWTToken = function () {
  return jwtToken.sign({ 
    id: this._id, 
    role: this.role, 
    createdBy: this.createdBy,
    sandboxId: this.sandboxId 
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.query.withToken = async function () {
  const docs = await this;
  if (!docs) return [];
  return docs.map(doc => {
    const obj = doc.toObject();
    obj.token = jwtToken.sign({ 
      id: obj._id, 
      role: obj.role, 
      createdBy: obj.createdBy,
      sandboxId: obj.sandboxId 
    }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    return obj;
  })
}

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Reset the password
userSchema.methods.getResetPasswordToken = function () {
  //Generating token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Adding hashed value to userScheme
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('user', userSchema);
