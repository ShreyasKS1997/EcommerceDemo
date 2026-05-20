const mongoose = require("mongoose");
const { default: validator } = require('validator');
const jwtToken = require('jsonwebtoken');

const {Schema} = mongoose;

const testAdminUsers = new mongoose.Schema({
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
    type: String,
    default: null,
    },

    testUsers: {
    type: [Schema.Types.ObjectId],
    default: [],
    },

    createdAt: {
    type: Date,
    default: Date.now,
    },

    createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: false,
    default: null,
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
}, {minimize: false});

testAdminUsers.index({expiresAt: 1}, {expireAfterSeconds: 0});

testAdminUsers.methods.getJWTToken = function () {
  return jwtToken.sign({ 
    id: this._id, 
    role: this.role, 
    createdBy: this.createdBy,
    sandboxId: this.sandboxId 
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

testAdminUsers.query.withToken = async function () {
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

module.exports = mongoose.model('testAdminUsers', testAdminUsers);