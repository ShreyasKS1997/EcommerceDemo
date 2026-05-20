const ErrorHandler = require('../utils/ErrorHandler');

module.exports = (err, req, res, next) => {
  
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Server Error';

  if (err.name === 'CastError') {
    err = new ErrorHandler(`Resource not found. ${err.path} is invalid`, 404);
  }

  if (err.details?.error === 'SESSION_REVOKED') {
    res.clearCookie('token', {
      sameSite: 'strict',
      httpOnly: true,
      secure: true,
    })
  }

  if (err.name === "TokenExpiredError") {
    err = new ErrorHandler('ACCESS_TOKEN_EXPIRED', 401);
  }

  if (err.code === 11000) {
    return res.status(200).json({ // Registration Success
      success: true,
      message: 'REGISTRATION_SUCCESSFUL',
      details: `Thank you for registering. You will receive confirmation link if you don't already have and account with this email.`,
    });
  }

  if (err.name === 'ValidationError') {
    // get all the errors from mongoose in object
    const errorsObject = Object.values(err.errors).reduce((acc, cur) => {
      acc[cur.path] = cur.message; // create acc object with error name as key and error message as value
      return acc;
    }, {});

    // new ErrorHandler object with error.name as message, statuscode and default details as error.name
    err = new ErrorHandler(err.name, 400);
    err.details = errorsObject // Override details in error handler
  }

  res.status(err.statusCode).json({
    success: false,
    error: {
      message: err.message,
      messageObject: err.details
    },
  });
};
