const { isReadable } = require('nodemailer/lib/xoauth2');
const asyncErrorHandler = require('../Middleware/asyncErrorHandler');
const productSchema = require('../DBSchema/productSchema');
const ErrorHandler = require('../utils/ErrorHandler');
const ApiFeatures = require('../utils/apiFeatures');
const { v2 } = require('cloudinary');

//Create Product - admin

exports.createProduct = asyncErrorHandler(async (req, res, next) => {

  const images = JSON.parse(req.body.images);

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    if (req.body.images && req.body.images !== '' && req.body.images.includes('data:image')) {
      const result = await v2.uploader.upload(images[i], {
        folder: 'products',
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  }

  req.body.images = imagesLinks;
  req.body.sandboxId = req.user.sandboxId;

  const product = await productSchema.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

//get all products
exports.getAllProducts = asyncErrorHandler(async (req, res, next) => {
  const resultPerPage = 10;

  const productCount = await productSchema.countDocuments();

  const apifeatures = new ApiFeatures(productSchema.find(), req.query)
    .search()
    .filter();

  let products = await apifeatures.query;

  let filteredProductsCount = products.length;

  apifeatures.pagination(resultPerPage);

  products = await apifeatures.query.clone();

  res.status(200).json({
    success: true,
    products,
    productCount,
    resultPerPage,
    filteredProductsCount,
  });
});

exports.getAdminProducts = asyncErrorHandler(async (req, res, next) => {
  const products = await productSchema.find();
  res.status(200).json({
    success: true,
    products,
  });
});

//update the product - admin
exports.updateProduct = asyncErrorHandler(async (req, res, next) => {
  let product = await productSchema.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  if (product.sandboxId?.toString() !== req.user.sandboxId.toString()) {
    return next(new ErrorHandler('Not Authorised', 403));
  }

  let delOldImages = await JSON.parse(req.body.delOldImages);

  for (const imgDel of delOldImages) {
    await v2.uploader.destroy(imgDel.public_id);
  }

  const imagesLinks = [];

  let imagesMap = new Map();

  delOldImages.map((item) => imagesMap.set(item.public_id, item));

  product.images.filter((item) => item.public_id !== imagesMap.get(item.public_id)?.public_id).map((item) => imagesLinks.push(item));

  const images = await JSON.parse(req.body.images);

  if (images.length + imagesLinks.length > 15) {
    return next(new ErrorHandler('Max allowed images for a product is 15. Try again', 422));
  }

  for (let imgs of images) {
    const result = await v2.uploader.upload(imgs, {
      folder: 'products',
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;

  updateProduct = await productSchema.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    updateProduct,
  });
});

//Delete Product
exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {
  const product = await productSchema.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  if (product.sandboxId.toString() !== req.user.sandboxId.toString()) {
    return next(new ErrorHandler('Not Authorized', 401));
  }

  await product.deleteOne();

  for (let i = 0; i < product.images.length; i++) {
    await v2.uploader.destroy(product.images[i].public_id);
  }

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

// Get Product details

exports.getProductDetails = asyncErrorHandler(async (req, res, next) => {
  const product = await productSchema.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// Create or update the review
exports.createProductReview = asyncErrorHandler(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
    sandboxId: req.user.sandboxId,
  };

  const product = await productSchema.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        (rev.rating = rating), (rev.comment = comment);
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get All reviews of a product
exports.getAllReviews = asyncErrorHandler(async (req, res, next) => {

  const product = await productSchema.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete review
exports.deleteReview = asyncErrorHandler(async (req, res, next) => {
  const product = await productSchema.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let ratings = 0;

  if (!reviews || reviews.length === 0) {
    ratings = 0;
  } else {
    let avg = 0;

    reviews.forEach((rev) => {
      avg += rev.rating;
    });

    ratings = avg / reviews.length;
  }

  const numberOfReviews = !reviews ? 0 : reviews.length;

  await productSchema.findByIdAndUpdate(
    req.query.productId,
    {
      reviews: !reviews ? [] : reviews,
      ratings,
      numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});
