import React from 'react';
import './CartItemCard.css';
import { Link } from 'react-router-dom';

const CartItemCard = ({ item, deleteCartItems }) => {
  return (
    <div className="CartItemCard">
      <img src={item.data.images[0].url} alt="ssa" />
      <div>
        <Link to={`/product/${item.id}`} target='_blank' rel='noreferrer noopener'>{item.data.name}</Link>
        <p onClick={() => deleteCartItems(item.id)}>Remove</p>
      </div>
    </div>
  );
};

export default CartItemCard;
