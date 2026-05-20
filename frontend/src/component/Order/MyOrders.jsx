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

const MyOrders = () => {
  const navigate = useNavigate();

  const {data: {orders} = {}, isLoading: orderLoading} = useGetOrderQuery();

  const columns = [
    { field: 'id', headerName: 'Order ID', minWidth: 300, flex: 0.2 },
    
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 150,
      flex: 0.2,
      cellClassName: (params) => {
        return params.row.status === 'Delivered' ? 'greenColor' : 'redColor';
      },
    },
    {
      field: 'itemsQty',
      headerName: 'Items Qty',
      type: 'number',
      minWidth: 150,
      flex: 0.1,
    },

    {
      field: 'amount',
      headerName: 'Amount',
      type: 'number',
      minWidth: 270,
      flex: 0.1,
    },

    {
      field: 'actions',
      flex: 0.1,
      headerName: 'Actions',
      minWidth: 150,
      type: 'number',
      sortable: false,
      renderCell: (params) => {
        return (
          <Button onClick={() => navigate(`/order/${params.row.id}`)}>
            <LaunchIcon />
          </Button>
        );
      },
    },
  ];
  const rows = [];

  orders &&
    orders.forEach((item, index) => {
      rows.push({
        itemsQty: item.orderItems.length,
        id: item._id,
        status: item.orderStatus,
        amount: item.totalPrice,
      });
    });

  if (orderLoading) {
    return <Loader/>
  }

  return (
    <>
      <MetaData title={'My Orders'} />
        <div className="myOrdersPage">
          <Typography id="myOrdersHeading">Your Orders</Typography>
          <ThemeProvider theme={MuiTheme}>
            <DataGrid
              rows={rows}
              columns={columns}
              sx={{
                '.greenColor > div': { color: 'green' },
                '.redColor > div': { color: 'red' },
              }}
              pageSize={10}
              disableRowSelectionOnClick
              className="myOrdersTable"
              autoHeight
            />
          </ThemeProvider>
        </div>
    </>
  );
};

export default MyOrders;
