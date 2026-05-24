import React from 'react';
import './CartItemCard.css';
import { Link } from 'react-router-dom';

const CartItemCard = ({ item, deleteCartItems }) => {
  return (
    <div className="CartItemCard">
      <img src={item.images[0].url} alt="ssa" />
      <div>
        <Link to={`/product/${item._id}`} target='_blank' rel='noreferrer noopener'>{item.name}</Link>
        <p onClick={() => deleteCartItems(item._id)}>Remove</p>
        <h4>₹ {item.price}</h4>
      </div>
    </div>
  );
};

export default CartItemCard;
