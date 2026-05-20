const express = require('express');
const {
  processPayment,
  sendStripeApiKey,
} = require('../controllers/paymentController');
const router = express.Router();
const { isAuth } = require('../Middleware/auth');

router.route('/payment/process').post(isAuth, processPayment);

router.route('/stripeapikey').get(isAuth, sendStripeApiKey);

module.exports = router;
