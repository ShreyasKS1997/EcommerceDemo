const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();
  const date = new Date();
  date.setDate(date.getDate() + 7);

  const userDetails = {
    _id: user._id,
    role: user._role,
    createdBy: user.createdBy,
    sandboxId: user.sandboxId,
    token: token,
  }
  
  res.status(statusCode).json({
    success: true,
    user: userDetails,
  });
};

module.exports = sendToken;
