import React from 'react';
import './ReviewCard.css'
import { Rating } from '@mui/material';
import { useLoadUserQuery } from '../../Services/userApi';

const ReviewCard = ({ review }) => {

  const options = {
    readOnly: true,
    value: review.rating,
    precision: 0.5,
  };
  return (
    <div className="reviewCard">
      <img src='/Profile.png' alt="User" />
      <p>{review.name}</p>
      <Rating {...options} />
      <span className="reviewCardComment">{review.comment}</span>
    </div>
  );
};

export default ReviewCard;
