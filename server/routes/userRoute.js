const express = require('express');

const { isAuth, testAdminSpamControl} = require('../Middleware/auth');

const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  changePassword,
  updateUserProfile,
  getSingleUsers,
  updateUserRole,
  generateTestAdmin,
  createTestUser,
  deleteTestUser,
  loadTestAdmin,
  refreshToken,
  loadTestUsers,
  deleteAllUserData,
} = require('../controllers/userController');

const router = express.Router();

router.route('/register').post(registerUser);

router.route('/login').post(loginUser);

router.route('/password/forgot').post(forgotPassword);

router.route('/password/reset/:token').put(resetPassword);

router.route('/logout').post(logout);

router.route('/me').get(isAuth, getUserDetails);

router.route('/testadmin').get(isAuth, loadTestAdmin);

router.route('/testusers').get(isAuth, loadTestUsers);  

router.route('/password/update').put(isAuth, changePassword);

router.route('/me/update').put(isAuth, updateUserProfile);

router.route('/generate_test_admin').post(isAuth, testAdminSpamControl, generateTestAdmin);

router.route('/generate_test_users').post(isAuth, createTestUser);

router.route('/delete_test_user/:id').delete(isAuth, deleteTestUser);

router.route('/get_test_user/:id').get(isAuth, getSingleUsers);

router.route('/get_test_user_details/:id').get(isAuth, getUserDetails);

router.route('/auth/refresh').get(refreshToken);

router.route('/admin/user/:id').put(isAuth, updateUserRole);

router.route('/delete/all').delete(isAuth, deleteAllUserData);

module.exports = router;
