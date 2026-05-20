import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import './orderSuccess.css';
import { Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import NotFound from '../layout/NotFound/NotFound';

const OrderSuccess = () => {

  const location = useLocation();

  if (!location.state || !location.state.fromPaymentPage) {
    return <NotFound/>
  }

  return (
    <div className="orderSuccess">
      <CheckCircleIcon sx={{width: '70px', height: '70px'}} />

      <Typography>Your Order has been Placed successfully </Typography>
      <Link to="/orders">View Orders</Link>
    </div>
  );
};

export default OrderSuccess;
