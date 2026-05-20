import React, { Fragment, useCallback, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import './UserDataGridList.css';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import MetaData from '../layout/MetaData';
import {Edit as EditIcon} from '@mui/icons-material';
import {Delete as DeleteIcon} from '@mui/icons-material';
import SideBar from './Sidebar';
import {ThemeProvider} from '@mui/material';
import {MuiTheme} from '../../MuiTheme';
import { useDeleteOrderAdminMutation, useGetAllOrdersAdminQuery } from '../../Services/orderApi';
import Loader from '../layout/loader/loader';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../SliceThunks/utils';

const OrderList = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {data, isLoading} = useGetAllOrdersAdminQuery();
  const [deleteOrder, {isLoading: deleteOrderLoading, error: deleteError}] = useDeleteOrderAdminMutation();

  const orders = data?.orders || [];

  const deleteOrderHandler = useCallback((id) => {
    deleteOrder(id);
  }, [deleteOrder]);

  const columns = useMemo(() => [
      { field: 'id', headerName: 'Order ID', minWidth: 300, flex: 1 },

      {
        field: 'status',
        headerName: 'Status',
        minWidth: 150,
        flex: 0.5,
        cellClassName: (params) => {
          return params.row.status === 'Delivered' ? 'greenColor' : 'redColor';
        },
      },
      {
        field: 'itemsQty',
        headerName: 'Items Qty',
        type: 'number',
        minWidth: 150,
        flex: 0.4,
      },

      {
        field: 'amount',
        headerName: 'Amount',
        type: 'number',
        minWidth: 270,
        flex: 0.5,
      },

      {
        field: 'actions',
        flex: 0.3,
        headerName: 'Actions',
        minWidth: 150,
        type: 'actions',
        sortable: false,
        renderCell: (params) => {
          return (
            <>
              <Button onClick={(e) => {e.stopPropagation(); navigate(`/admin/order/${params.id}`)}}>
                <EditIcon />
              </Button>

              <Button onClick={(e) => {e.stopPropagation(); deleteOrderHandler(params.id)}} disabled={deleteOrderLoading}>
                <DeleteIcon />
              </Button>
            </>
          );
        },
      },
    ], [navigate, deleteOrderLoading, deleteOrderHandler]
  );


  const rows = useMemo(() => {
    if (!orders) return [];
    return orders.map((item) => ({
        id: item._id,
        itemsQty: item.orderItems.length,
        amount: item.totalPrice,
        status: item.orderStatus,
    }));
  }, [orders]);

  if (isLoading) {
    return <Loader/>
  }

  if (deleteError) {
    dispatch(addNotification({message: deleteError, errorType: 'error'}));
  }

  return (
    <>
      <MetaData title={`ALL ORDERS - Admin`} />

      <div className="dashboard">
        <SideBar />
        <div className="productListContainer">
          <h1 id="productListHeading">ALL ORDERS</h1>

          <ThemeProvider theme={MuiTheme}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              disableSelectionOnClick
              autoHeight
              loading={deleteOrderLoading}
            />
          </ThemeProvider>
        </div>
      </div>
    </>
  );
};

export default OrderList;
