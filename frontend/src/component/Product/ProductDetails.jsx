import React, { useEffect, useState } from 'react';
import Carousel from 'react-material-ui-carousel';
import './ProductDetails.css';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import ReviewCard from './ReviewCard';
import Loader from '../layout/loader/loader';
import MetaData from '../layout/MetaData';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from '@mui/material';
import { Rating } from '@mui/material';
import { useGetProductDetailsQuery, useSubmitReviewMutation } from '../../Services/productApi';
import { useUpdateCartMutation } from '../../Services/cartApi';
import { addToCart as addToCartLocal } from '../../SliceThunks/cartSliceThunks';

const ProductDetails = () => {
  const dispatch = useDispatch();

  const params = useParams();

  const authStatus = useSelector((state) => state.auth.status);

  const [submitReviewButtonDisabled, setSubmitReviewButtonDisabled] = useState(false);

  const {data:product, isLoading, refetch} = useGetProductDetailsQuery(params.id);
  const [addToCart] = useUpdateCartMutation();
  const [submitReview, {isLoading: submitReviewLoading, isSuccess, reset}] = useSubmitReviewMutation();

  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const increaseQuantity = () => {
    if (product.stock <= quantity) return;
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (1 >= quantity) return;
    setQuantity(quantity - 1);
  };

  const addToCartHandler = async() => {
    if (authStatus === 'authenticated') {
      try {
        await addToCart(
          {
            cartItems: {
              [params.id]: quantity
            }
          }
        );
      } catch(error) {
        console.log(error);
      }
    } else {
      dispatch(addToCartLocal(
        {
          [params.id]: {
            name: product.name,
            price: product.price,
            stock: product.stock,
            images: product.images,
            quantity: quantity
          }
        }
      ))
    }
  };

  const submitReviewToggle = () => {
    open ? setOpen(false) : setOpen(true);
  };

  const reviewSubmitHandler = async() => {
    const myForm = new FormData();

    myForm.set('rating', rating);
    myForm.set('comment', comment);
    myForm.set('productId', params.id);

    try {
      await submitReview(myForm).unwrap();
      setSubmitReviewButtonDisabled(true);
      refetch();
      setTimeout(() => {
        setOpen(false);
        setSubmitReviewButtonDisabled(false);
      }, 5000);
    } catch(error) {
        setSubmitReviewButtonDisabled(false);
        console.log(error);
    }
  };


  const options = {
    readOnly: true,
    value: product?.ratings,
    precision: 0.5,
  };

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        reset();
      }, 4000);

      return () => clearTimeout(timer);
    }

  }, [isSuccess, reset]);

  if (isLoading) {
    return <Loader/>
  }

  return (
    <>
      <MetaData title={`${product.name} .. ECOMMERCE`} />
      <div className="productDetails">
        <div className="carouselImageBlock">
          <Carousel sx={{width: '400px', height: '320px'}}>
            {product.images &&
              product.images.map((item, i) => (
                <img
                  className="CarouselImage"
                  key={item && item.url}
                  src={item && item.url}
                  alt={`${i} Slide`}
                />
              ))}
          </Carousel>
        </div>

        <div className="detailsBlockMain">
          <div className="productName">
            <h2>{product.name}</h2>
            <p>Product # {product._id}</p>
          </div>
          <div className="ratingsTop">
            <Rating {...options} />
            <span className="numOfReviews">
              ({product.numberOfReviews} Reviews)
            </span>
          </div>
          <div className="priceAddToCartStatus">
            <h2> {`₹${product.price}`}</h2>
            <div className="addToCart">
              <div className="increaseDecreaseQuantity">
                <button onClick={decreaseQuantity}>-</button>
                <input type='number' min={1} max={product.stock} value={quantity} />
                <button onClick={increaseQuantity}>+</button>
              </div>
              <button
                disabled={product.stock < 1 ? true : false}
                onClick={addToCartHandler}
              >
                Add to Cart
              </button>
            </div>

            <p>
              Status:
              <b className={product.stock < 1 ? 'redColor' : 'greenColor'}>
                {product.stock < 1 ? ' OutOfStock' : ' InStock'}
              </b>
            </p>
          </div>

          <div className="productDesc">
            <p>Description : {product.description}</p>
          </div>

          {authStatus === 'authenticated' && 
            <button onClick={submitReviewToggle} className="submitReview">
              Submit Review
            </button>}
        </div>
      </div>

      <div className="reviewsSection">
        <h3 className="reviewsHeading">REVIEWS</h3>

        <Dialog
          aria-labelledby="simple-dialog-title"
          open={open}
          onClose={submitReviewToggle}
        >
          <DialogTitle>Submit Review</DialogTitle>
          {isSuccess && <div className='successMsg'><h4>Success</h4></div>}
          <DialogContent className="submitDialog">
            <Rating
              onChange={(e) => setRating(e.target.value)}
              value={rating}
              size="large"
            />

            <textarea
              className="submitDialogTextArea"
              cols="30"
              rows="5"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </DialogContent>
          <DialogActions>
            <Button onClick={submitReviewToggle} color="secondary">
              Cancel
            </Button>
            <Button disabled={submitReviewButtonDisabled} onClick={reviewSubmitHandler} color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        {product.reviews && product.reviews[0] ? (
          <div className="reviews">
            {product.reviews &&
              product.reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
          </div>
        ) : (
          <p className="noReviews">No Reviews Yet</p>
        )}
      </div>
    </>
  )
}

export default ProductDetails;
