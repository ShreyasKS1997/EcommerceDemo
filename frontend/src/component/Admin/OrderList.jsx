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
import { DataList } from '../../DataList';

const OrderList = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {data, isLoading} = useGetAllOrdersAdminQuery();
  const [deleteOrder, {isLoading: deleteOrderLoading, error: deleteError}] = useDeleteOrderAdminMutation();

  const orders = data?.orders || [];

  const deleteOrderHandler = useCallback((e, orderDetails) => {
    deleteOrder(orderDetails['Order Id']);
  }, [deleteOrder]);

  const editOrderHandler = useCallback((e, orderDetails) => {
    e.stopPropagation();
    navigate(`/admin/order/${orderDetails['Order Id']}`);
  });

  const rows = useMemo(() => {
    if (!orders) return [];
    return orders.map((item) => ({
        'Order Id': item._id,
        Items: item.orderItems.length,
        Amount: item.totalPrice,
        Status: item.orderStatus,
    }));
  }, [orders]);

  const columnData = {
    heading: ['Order Id', 'Items', 'Amount', 'Status', 'Actions'],
    data: rows,
    columnLength: 4,
    gridCellTemplateColumn: '2fr 1fr 1fr 1fr 1fr',
    viewDetailsButton: false,
    ActionButtons: [<EditIcon/>, <DeleteIcon/>],
    ActionButtonsHandler: [editOrderHandler, deleteOrderHandler],
  }

  if (isLoading || deleteOrderLoading) {
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

          <DataList data={columnData} />
        </div>
      </div>
    </>
  );
};

export default OrderList;
