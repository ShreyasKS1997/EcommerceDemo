const express = require('express');

const app = express();

const Middleware = require('./Middleware/error');

const cookieParser = require('cookie-parser');

const bodyParser = require('body-parser');

const fileUpload = require('express-fileupload');

const path = require('path');

//config - server/config/config.env in development and /etc/ssecrets/config.env in onrender production
if (process.env.RENDER === 'true') {
  require('dotenv').config({ path: '/etc/ssecrets/config.env' });
} else {
  require('dotenv').config({ path: 'server/config/config.env' });
}


app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

//Route Imports
const product = require('./routes/productRoute');
const user = require('./routes/userRoute');
const order = require('./routes/orderRoute');
const payment = require('./routes/paymentRoute');
const cart = require('./routes/cartRoute');

app.use('/api/v1', product);
app.use('/api/v1', user);
app.use('/api/v1', order);
app.use('/api/v1', payment);
app.use('/api/v1', cart);

/*var log = console.log;
console.log = function () {
  log.apply(console, arguments);
  console.trace();
};*/

// need for production if node serves static file if node and frontend run together
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'));
  });
} else {
    app.get('/', (req, res) => {
        res.send('API is running in development mode...');
    });
}


// Middleware to handle errors
app.use(Middleware);

module.exports = app;
