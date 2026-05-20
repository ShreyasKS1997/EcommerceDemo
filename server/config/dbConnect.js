const mongoose = require('mongoose');

// DB Connect

const connectDB = () => {
  mongoose.connect(process.env.DB_Connect_URI).then((data) => {
    console.log(`mongoose connected to ${data.connection.host}`);
  });
};

module.exports = connectDB;
