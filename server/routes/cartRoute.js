const express = require('express');
const { isAuth } = require('../Middleware/auth');
const { updateCart, getCartItems, deleteItemsInCart, replaceAndUpdateItemsInCart, removeAllCartItems } = require('../controllers/cartController');

const router = express.Router();

router.route('/cart/update').put(isAuth, updateCart);
router.route('/cart/replace').put(isAuth, replaceAndUpdateItemsInCart);
router.route('/cart/get').get(isAuth, getCartItems);
router.route('/cart/remove').post(isAuth, deleteItemsInCart);
router.route('/cart/removeall').delete(isAuth, removeAllCartItems);

module.exports = router;
