const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required!'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required!'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required!'],
    maxLength: [8, 'Product price cannot exceed 8 digits'],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, 'Please enter the product Catagory!'],
  },
  stock: {
    type: Number,
    required: [true, 'Please enter the product stock quantity'],
    maxLength: [4, 'Stock quantity cannot be more than 4 digits'],
    default: 1,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      sandboxId: {
        type: mongoose.Schema.ObjectId,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sandboxId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('product', productSchema);
