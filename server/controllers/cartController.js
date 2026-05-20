const productSchema = require("../DBSchema/productSchema");
const userSchema = require("../DBSchema/userSchema");
const asyncErrorHandler = require("../Middleware/asyncErrorHandler");
const ErrorHandler = require("../utils/ErrorHandler");

exports.updateCart = asyncErrorHandler(async (req, res, next) => {
  const {cartItems} = req.body;
  if (!cartItems || Object.keys(cartItems).length <= 0) {
    return next(new ErrorHandler('Empty Request', 400));         // Bad request
  }

  const productsIds = Object.keys(cartItems);
  const products = await productSchema.find({_id: {$in: productsIds}});

  let missingProducts = [];
  if (Object.keys(req.user.cartItems).length !== products.length) {
    missingProducts = products.filter((item) => !Object.hasOwn(req.user.cartItems, item._id));
  }

  const exceecdedQuantityProduct = [];
  productsIds.forEach((key) => {
    const product = products.find((item) => item._id.toString() === key);
    if (cartItems[key] + req.user.cartItems[key] > product.stock) {
      exceecdedQuantityProduct.push(key);
    }
    Object.hasOwn(req.user.cartItems, key) && (cartItems[key] = cartItems[key] + req.user.cartItems[key]);
  });
  if (exceecdedQuantityProduct && exceecdedQuantityProduct.length > 0) {
    return next(new ErrorHandler(`Id's with ${exceecdedQuantityProduct} exceeds max available stock.`, 422)) // unprocessable
  }

  const setList = {};

  for (const [key, value] of Object.entries(cartItems)) {
    setList[`cartItems.${key}`] = value;
  };

  req.user.set(setList);
  await req.user.save();

  res.status(200).json({
    success: true,
    message: 'Cart successfully updated',
    missingProducts: missingProducts
  });
});

exports.replaceAndUpdateItemsInCart = asyncErrorHandler(async(req, res, next) => {
  const {cartItems} = req.body;
  if (!cartItems || Object.keys(cartItems).length <= 0) {
    return next(new ErrorHandler('Empty Request', 400));         // Bad request
  }

  const productsIds = Object.keys(cartItems);
  const products = await productSchema.find({_id: {$in: productsIds}});

  const exceecdedQuantityProduct = [];
  productsIds.forEach((key) => {
    const product = products.find((item) => item._id.toString() === key);
    if (req.user.cartItems[key] > product.stock) {
      exceecdedQuantityProduct.push(key);
    }
  });
  if (exceecdedQuantityProduct && exceecdedQuantityProduct.length > 0) {
    return next(new ErrorHandler(`Id's with ${exceecdedQuantityProduct} exceeds max available stock.`, 422)) // unprocessable
  }

  let missingProducts = [];
  if (Object.keys(req.user.cartItems).length !== products.length) {
    missingProducts = products.filter((item) => !Object.hasOwn(req.user.cartItems, item._id));
  }

  const setList = {};

  for (const [key, value] of Object.entries(cartItems)) {
    setList[`cartItems.${key}`] = value;
  };

  req.user.set(setList);
  await req.user.save();

  res.status(200).json({
    success: true,
    missingProducts: missingProducts
  });
})

exports.deleteItemsInCart = asyncErrorHandler(async(req, res, next) => {
  const {cartItems} = req.body;
  if (!cartItems || cartItems.length <= 0) {
    return next(new ErrorHandler('Empty Request', 400));         // Bad request
  }

  cartItems.forEach((item) => {
    delete req.user.cartItems[item];
  });

  req.user.markModified('cartItems');

  await req.user.save();

  res.status(200).json({
    success: true
  })
})

exports.getCartItems = asyncErrorHandler(async (req, res, next) => {
    const products = await productSchema.find({_id: {$in: Object.keys(req.user.cartItems)}}, {name: 1, price: 1, images: 1, stock: 1});
    let missingProducts = [];
    if (Object.keys(req.user.cartItems).length !== products.length) {
      missingProducts = products.filter((item) => !Object.hasOwn(req.user.cartItems, item._id));
    }
    const cartItems = {}

    products.forEach((items) => {
      const itemid = items._id.toString();
      cartItems[itemid] = {...items.toObject(), quantity: req.user.cartItems[itemid]};
    })

    res.status(200).json({
        success: true,
        cartItems: cartItems,
        missingProducts: missingProducts,
    })
})

exports.removeAllCartItems = asyncErrorHandler(async (req, res, next) => {
  req.user.cartItems = {}
  req.user.save();

  res.status(200).json({
    success: true,
  })
})