const express = require('express');

const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getAllReviews,
  deleteReview,
  getAdminProducts,
  addToCart,
} = require('../controllers/productController');

const { isAuth, authorization } = require('../Middleware/auth');

const router = express.Router();

router.route('/products').get(getAllProducts);
router
  .route('/admin/products')
  .get(isAuth, authorization('test_admin'), getAdminProducts);
router
  .route('/admin/product/new')
  .post(isAuth, createProduct);
router
  .route('/admin/product/:id')
  .put(isAuth, authorization('test_admin'), updateProduct);
router
  .route('/admin/product/:id')
  .delete(isAuth, authorization('test_admin'), deleteProduct);

router.route('/product/:id').get(getProductDetails);

router.route('/review')
  .put(isAuth, createProductReview)
  .get(getAllReviews)
  .delete(isAuth, deleteReview);

module.exports = router;
