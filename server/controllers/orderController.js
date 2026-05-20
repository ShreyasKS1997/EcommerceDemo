const { v2 } = require('cloudinary');
const orderSchema = require('../DBSchema/orderSchema');
const productSchema = require('../DBSchema/productSchema');
const asyncErrorHandler = require('../Middleware/asyncErrorHandler');
const ErrorHandler = require('../utils/ErrorHandler');

//create new order
exports.newOrder = asyncErrorHandler(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await orderSchema.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
    userCollectionName: req.user.role === 'user' ? 'user' : 'testAdminUsers',
    sandboxId: req.user.sandboxId,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

//get single order
exports.getSingleOrder = asyncErrorHandler(async (req, res, next) => {
  const order = await orderSchema
    .findById(req.params.id)
    .populate('user', 'name email');

  if (!order) {
    return next(new ErrorHandler('order not found', 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

//get logged in user orders
exports.myOrders = asyncErrorHandler(async (req, res, next) => {
  const orders = await orderSchema.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

// get all orders - admin
exports.getAllOrders = asyncErrorHandler(async (req, res, next) => {
  const orders = await orderSchema.find({sandboxId: req.user.sandboxId});

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update order status - admin
exports.updateOrder = asyncErrorHandler(async (req, res, next) => {
  const order = await orderSchema.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  if (order.orderStatus === 'Delivered') {
    return next(
      new ErrorHandler('you have already delivered this product', 404)
    );
  }

  if (req.body.status === 'Shipped') {
    order.orderItems.forEach(async (lorder) => {
      await updateStock(lorder.product, lorder.quantity);
    });
  }

  order.orderStatus = req.body.status;

  if (req.body.status === 'Delivered') {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await productSchema.findById(id);

  product.stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

// delete order - admin
exports.deleteOrder = asyncErrorHandler(async (req, res, next) => {
  const order = await orderSchema.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
  });
});
