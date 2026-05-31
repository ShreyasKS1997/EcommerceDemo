import React, { Fragment, useEffect, useRef } from 'react';
import CheckoutSteps from '../Cart/CheckoutSteps';
import { useSelector, useDispatch } from 'react-redux';
import MetaData from '../layout/MetaData';
import { Typography } from '@mui/material';
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import './payment.css';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import EventIcon from '@mui/icons-material/Event';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useNavigate } from 'react-router-dom';
import { useCreateNewOrderMutation, useProcessPaymentMutation } from '../../Services/orderApi';
import { useLoadUserQuery } from '../../Services/userApi';
import { useState } from 'react';
import { useRemoveAllCartItemsMutation } from '../../Services/cartApi';
import { api } from '../../Services/api';
import { resetState } from '../../SliceThunks/orderSliceThunks';

const Payment = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const {OrderInfo} = useSelector((state) => state.order);

  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const payBtn = useRef(null);
  const stripe = useStripe();
  const elements = useElements();

  const { cartItems } = useSelector((state) => state.cart);
  const {ShippingInfo:shippingInfo} = useSelector((state) => state.order);

  const [processPayment, {isLoading: processPaymentLoading}] = useProcessPaymentMutation();
  const [createNewOrder, {isLoading: createNewOrderLoading}] = useCreateNewOrderMutation();
  const [removeAllCartItems, {isLoading: removeAllCartItemsLoading}] = useRemoveAllCartItemsMutation();

  const {data: user, isLoading: userDataLoading} = useLoadUserQuery();

  const paymentData = {
    amount: Math.round(OrderInfo.totalPrice * 100),
  };

  const orderItems = [];
  Object.keys(cartItems).forEach((key) => {
    const items = {...cartItems[key], product: key};
    orderItems.push(items);
  })

  const order = {
    shippingInfo,
    orderItems: orderItems,
    itemsPrice: OrderInfo.subtotal,
    taxPrice: OrderInfo.tax,
    shippingPrice: OrderInfo.shippingCharges,
    totalPrice: OrderInfo.totalPrice,
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    payBtn.current.disabled = true;

    try {
      setPaymentProcessing(true);

      const data = await processPayment(paymentData).unwrap();

      const client_secret = data.client_secret;

      if (!stripe || !elements) return;

      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: user.name,
            email: user.email,
            address: {
              line1: shippingInfo.address,
              city: shippingInfo.city,
              state: shippingInfo.state,
              postal_code: shippingInfo.pinCode,
              country: shippingInfo.country,
            },
          },
        },
      });

      if (result.error) {
        payBtn.current.disabled = false;
        setPaymentProcessing(false);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          order.paymentInfo = {
            id: result.paymentIntent.id,
            status: result.paymentIntent.status,
          };

          try {
            const ds = await createNewOrder(order).unwrap();
            await removeAllCartItems();
            setPaymentProcessing(true);
            dispatch(resetState());
            navigate('/success', {state: {fromPaymentPage: true}});
          } catch(error) {
            setPaymentProcessing(false);
            payBtn.current.disabled = false;

          }
        } else {
          //handle error alert message
          setPaymentProcessing(false);
          payBtn.current.disabled = false;
        }
      }
    } catch (error) {
      payBtn.current.disabled = false;
      setPaymentProcessing(false);
      console.log(error)
    }
  };

  return (
    <>
      <MetaData title="Payment" />
      <CheckoutSteps activeStep={2} />
      <div className="paymentContainer">
        <h3>Use 4242424242424242 as card number with any future date and any value for CVC to test placing the order</h3>
        <form className="paymentForm" onSubmit={(e) => submitHandler(e)}>
          <Typography fontSize='20px'>Card Info</Typography>
          <div>
            <CreditCardIcon />
            <CardNumberElement className="paymentInput" />
          </div>
          <div>
            <EventIcon />
            <CardExpiryElement className="paymentInput" />
          </div>
          <div>
            <VpnKeyIcon />
            <CardCvcElement className="paymentInput" />
          </div>

          <input
            type="submit"
            value={paymentProcessing ? 'Please wait...' : `Pay  ₹ ${OrderInfo && OrderInfo.totalPrice}`}
            ref={payBtn}
            className="paymentFormBtn"
          />
        </form>
      </div>
    </>
  );
};

export default Payment;
