import React, { useEffect, useMemo, useState } from 'react';
import './Cart.css';
import CartItemCard from './CartItemCard';
import { useDispatch, useSelector } from 'react-redux';
import Typography from '@mui/material/Typography';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { Link, useNavigate } from 'react-router-dom';
import { useGetCartItemsQuery, useRemoveCartItemsMutation, useReplaceQuantityMutation, useUpdateCartMutation } from '../../Services/cartApi';
import Loader from '../layout/loader/loader';
import { changeQuantity, removeFromCart } from '../../SliceThunks/cartSliceThunks';
import { skipToken } from '@reduxjs/toolkit/query';

const Cart = () => {
  const navigate = useNavigate();

  const authStatus = useSelector((state) => state.auth.status);
   
  const dispatch = useDispatch();
  // cart data is stored in redux state 'cart' as soon as it fetches inside onQuerystarted
  const {data: {cartItems:serverCartItems} = {}, isLoading, isFetching} = useGetCartItemsQuery(authStatus !== 'authenticated' && skipToken);
  const {cartItems:localCartItems = {}} = useSelector((state) => state.cart);
  const [updateCartItems, {isLoading: updateCartLoading}] = useUpdateCartMutation();
  const [replaceItems, {isLoading: replaceItemsLoading}] = useReplaceQuantityMutation();
  const [removeCartItems, {isLoading: removeCartItemsLoading}] = useRemoveCartItemsMutation();

  const needsUpdate = useMemo(() => {
    if (!serverCartItems) return false;
    return JSON.stringify(serverCartItems) !== JSON.stringify(localCartItems);
  }, [localCartItems, serverCartItems]);

  const viewProductsHandler = () => navigate('/products');

  const updateCart = async(items) => {
    const cartItems = {};
    Object.keys(items).forEach((key) => cartItems[key] = items[key].quantity);
    try {
      await replaceItems({cartItems});
    } catch(error) {
      console.log(error);
    }
  }

  const increaseQuantity = (id, quantity, stock) => {
    if (stock <= quantity) {
      return;
    }
    dispatch(changeQuantity({id, quantity: 1}));
  };

  const decreaseQuantity = (id, quantity) => {
    if (1 >= quantity) {
      return;
    }
    dispatch(changeQuantity({id, quantity: -1}));
  };

  const deleteCartItems = async(id) => {
    if (authStatus === 'authenticated') {
      try {
        await removeCartItems({cartItems: [id]});
      } catch(error) {
        console.log(error);
      }
    } else {
      dispatch(removeFromCart(id));
    }
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=shipping');
  };

  if (isLoading || removeCartItemsLoading) {
    return <Loader/>
  }

  return (
    (!localCartItems || Object.values(localCartItems).length <= 0) ? 
    <div className='noProductsInCart'>
      <RemoveShoppingCartIcon/>
      <p>No Products in your cart</p>
      <button onClick={viewProductsHandler}>View Products</button>
    </div> :
    <>
    <div className='cartGrid'>

      <div className='cartHeader'>Product</div>
      <div className='cartHeader textCenter smallerScreenHide'>Price</div>
      <div className='cartHeader textCenter'>Quantity</div>
      <div className='cartHeader textRight'>Subtotal</div>

      {Object.entries(localCartItems).map(([id, value]) => {
        return (
          <div className='cartItemsCart'>
            <div className='productName'>
              <CartItemCard item={value} deleteCartItems={deleteCartItems}/>
            </div>

            <div className='productPrice textCenter smallerScreenHide'>
              <p>₹ {value.price}</p>
            </div>

            <div className='productQuantity textCenter'>
              {console.log(value)}
              <button onClick={() => decreaseQuantity(id, value.quantity)}>-</button>
              <input min={1} max={1} type='number' value={value.quantity}/>
              <button onClick={() => increaseQuantity(id, value.quantity, value.stock)}>+</button>
            </div>

            <div className='productSubTotal textRight'>
              <p>₹ {value.price * value.quantity}</p>
            </div>
          </div>
        )
      })}
    </div>

      <div className='cartBlock2'>
        <div>
          <span>Gross Total</span>
          {needsUpdate && <button onClick={() => updateCart(localCartItems)}>{replaceItemsLoading || isFetching ? 'Please wait...' : 'Update'}</button>}
          <span>{needsUpdate ? '---' : `
            ₹ ${Object.values(localCartItems).reduce((sum, value) => {
              return sum + (value.price * value.quantity);
            }, 0)}`}
          </span>
        </div>
        <button onClick={checkoutHandler}>
          Check Out
        </button>
      </div>
      </>
  )
}

export default Cart;
