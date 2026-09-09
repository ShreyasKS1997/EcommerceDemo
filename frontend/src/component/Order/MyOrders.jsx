import React, { Fragment, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import './myOrders.css';
import { useDispatch } from 'react-redux';
import Loader from '../layout/loader/loader';
import { Link, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import MetaData from '../layout/MetaData';
import LaunchIcon from '@mui/icons-material/Launch';
import { useGetOrderQuery } from '../../Services/orderApi';
import { MuiTheme } from '../../MuiTheme';
import { Button, ThemeProvider } from '@mui/material';
import { DataList } from '../../DataList';

const MyOrders = () => {
  const navigate = useNavigate();

  const {data, isLoading: orderLoading} = useGetOrderQuery();

  const orders = data?.orders ?? [];

  const rows = [];

  orders.forEach((item) => {
    rows.push({
      'Order Id': item._id,
      Item: item.orderItems.length,
      Status: item.orderStatus,
      Amount: item.totalPrice,
    })
  })

  const handleOnViewDetailsCLick = (orderDetails, event) => {
    event.stopPropagation();
    navigate(`/order/${orderDetails['Order Id']}`);
  }

  const columnData = {
    heading: ['Order Id', 'Item', 'Status', 'Amount'],
    data: rows,
    columnLength: 5,
    gridCellTemplateColumn: '2.5fr 1fr 1.5fr 1fr 1fr',
    viewDetailsButton: true,
    viewDetailsButtonAction: handleOnViewDetailsCLick,
  };

  if (orderLoading) {
    return <Loader/>
  }

  return (
    <>
      <MetaData title={'My Orders'} />
        <div className="myOrdersPage">
          <Typography id="myOrdersHeading">Your Orders</Typography>
          <DataList data={columnData}/>
        </div>
    </>
  );
};

export default MyOrders;
