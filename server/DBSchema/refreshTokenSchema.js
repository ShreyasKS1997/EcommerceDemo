const mongoose = require('mongoose');

const {Schema} = mongoose;

const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    
    oldTokenHash: {
        type: String,
    },

    newTokenHash: {
        type: String,
        required: true,
    },

    expiresAt: {
        type: Date,
        required: true,
    },

    sessionExpiresAt: {
        type: Date,
        default: Date.now() + 30 * 24 * 60 * 60 * 1000,
    },

    createdAt: {
        type: Date,
        required: true,
    },

    rotationTime: {
        type: Date,
        required: true,
    },

    userAgent: String,
    ip: String
});

module.exports = mongoose.model('refreshToken', refreshTokenSchema);