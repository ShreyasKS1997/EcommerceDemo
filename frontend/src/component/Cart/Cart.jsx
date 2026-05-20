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

const Cart = () => {
  const navigate = useNavigate();

  const authStatus = useSelector((state) => state.auth.status);
   
  const dispatch = useDispatch();
  // cart data is stored in redux state 'cart' as soon as it fetches inside onQuerystarted
  const {data: {cartItems:serverCartItems} = {}, isLoading, refetch} = useGetCartItemsQuery();
  const {cartItems:localCartItems} = useSelector((state) => state.cart);
  const [updateCartItems, {isLoading: updateCartLoading}] = useUpdateCartMutation();
  const [replaceItems, {isLoading: replaceItemsLoading}] = useReplaceQuantityMutation();
  const [removeCartItems, {isLoading: removeCartItemsLoading}] = useRemoveCartItemsMutation();

  const needsUpdate = useMemo(() => {
    if (!serverCartItems) return false;
    return JSON.stringify(serverCartItems) !== JSON.stringify(localCartItems);
  }, [localCartItems, serverCartItems]);

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
    <>
      {!localCartItems || (localCartItems && Object.keys(localCartItems).length === 0) ? (
        <div className="emptyCart">
          <RemoveShoppingCartIcon sx={{width: '70px', height: '70px'}}/>

          <Typography>No Product in Your Cart</Typography>
          <Link to="/products">View Products</Link>
        </div>
      ) : (
        <>
          <div className="cartPage">
            <div className="cartHeader">
              <p>Product</p>
              <p>Price</p>
              <p>Quantity</p>
              <p>Subtotal</p>
            </div>

            <div className='cartContainerWrap'>
              {
              localCartItems &&
              Object.entries(localCartItems).map(([id, data]) => {
                const quantity = data.quantity;
                return (
                <div className="cartContainer" key={id}>
                  <CartItemCard item={{id:id, data: data}} deleteCartItems={deleteCartItems} />
                  <p className='cartCenterStyle'>{`₹ ${data.price}`}</p>
                  <div className=" cartInput">
                    <button onClick={() => decreaseQuantity(id, quantity)}>
                      -
                    </button>
                    <input type="number" value={quantity} min={1} max={data.stock} readOnly />
                    <button
                      onClick={() =>
                        increaseQuantity(
                          id,
                          quantity,
                          data.stock
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                  <p className="cartSubtotal">{`₹ ${
                    data.price * quantity
                  }`}</p>
                
                </div>
                )
              })
            }
            {needsUpdate && <div className='updateCartbutton'><button onClick={() => updateCart(localCartItems)}>{`${replaceItemsLoading ? 'Please wait...' : 'Update Cart'}`}</button></div>}
            </div>

            <div className="cartGrossProfit">
              <div className="cartGrossProfitBox">
                <p>Gross Total</p>
                {needsUpdate ? <h3>---</h3> : <p>{`₹ ${Object.entries(localCartItems).reduce(
                  (acc, [curId, curData]) => acc + (curData.quantity * curData.price),
                  0
                )}`}</p>}
              </div>
            </div>
              <div className="checkOutBtn">
                <button onClick={checkoutHandler}>Check Out</button>
              </div>
          </div>
        </>
      )}
    </>
  );
};

export default Cart;
