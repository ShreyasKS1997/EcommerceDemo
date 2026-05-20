const app = require('./app');

const { v2: cloudinary } = require('cloudinary');

const connectDB = require('./config/dbConnect');

const cron = require('node-cron');

const https = require('https');

const serverStatus = async () => {
  https.get('https://demcom.onrender.com', (res) => {
    if (res.statusCode !== 200) {
      console.log('Server not running');
    }
  });
};

cron.schedule('* 0-59/13 * * * *', function () {
  serverStatus();
});

// uncaught exception error handler
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Server shutting down due to Uncaught Exception');

  process.exit(1);
});

//DB_Connect

connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const server = app.listen(process.env.PORT, '0.0.0.0', () => {
  console.log(`Server is running on ${process.env.PORT}`);
});

// Unhandled Promise Rejection
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Server shutting down due to Unhandled Rejection error');

  server.close(() => {
    process.exit(1);
  });
});
