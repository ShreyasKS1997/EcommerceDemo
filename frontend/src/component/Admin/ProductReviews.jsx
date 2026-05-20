import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import './productReviews.css';
import { Button, ThemeProvider } from '@mui/material';
import MetaData from '../layout/MetaData';
import DeleteIcon from '@mui/icons-material/Delete';
import Star from '@mui/icons-material/Star';

import SideBar from './Sidebar';
import { useDeleteReviewMutation, useGetAllReviewAdminQuery } from '../../Services/productApi';
import Loader from '../layout/loader/loader';
import { skipToken } from '@reduxjs/toolkit/query';
import {MuiTheme} from '../../MuiTheme';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../SliceThunks/utils';

const ProductReviews = () => {

  const dispatch = useDispatch();

  const [productId, setProductId] = useState('');
  const [productIdToSend, setProductIdToSend] = useState(skipToken)

  const {data, isLoading} = useGetAllReviewAdminQuery(productIdToSend);
  const [deleteReview, {isLoading: deleteReviewLoading, error: deleteReviewError}] = useDeleteReviewMutation();

  const reviews = data?.reviews || [];

  const deleteReviewHandler = useCallback((id, Pid) => {
    deleteReview({id: id, productId: Pid});
  }, [deleteReview]);


  const columns = useMemo(() => [
    { field: 'id', headerName: 'Review ID', flex: 0.2 },

    {
      field: 'user',
      headerName: 'User',
      flex: 0.2,
    },

    {
      field: 'comment',
      headerName: 'Comment',
      flex: 0.4,
    },

    {
      field: 'rating',
      headerName: 'Rating',
      type: 'number',
      flex: 0.1,

      cellClassName: (params) => {
        return params.id >= 3 ? 'greenColor' : 'redColor';
      },
    },

    {
      field: 'actions',
      flex: 0.1,
      headerName: 'Actions',
      type: 'number',
      sortable: false,
      renderCell: (params) => {
        return (
          <Fragment>
            <Button onClick={() => deleteReviewHandler(params.id, productId)}>
              <DeleteIcon />
            </Button>
          </Fragment>
        );
      },
    },
  ], [deleteReviewHandler, productId]);

  const rows = useMemo(() => {
    return reviews.map((item) => ({
      id: item._id,
      rating: item.rating,
      comment: item.comment,
      user: item.name,
    }));
  }, [reviews]);

  if (isLoading) {
    return <Loader/>
  }

  if (deleteReviewError) {
    dispatch(addNotification({message: deleteReviewError, errorType: 'error'}));
  }

  return (
    <Fragment>
      <MetaData title={`ALL REVIEWS - Admin`} />

      <div className="dashboard">
        <SideBar />
        <div className="productReviewsContainer">
          <form
            className="productReviewsForm"
            onSubmit={() => setProductIdToSend(productId)}
          >
            <h2 className="productReviewsFormHeading">ALL REVIEWS</h2>

            <div>
              <Star />
              <input
                type="text"
                placeholder="Product Id"
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              />
            </div>

            <Button
              id="createProductBtn"
              type="submit"
              disabled={
                isLoading ? true : false || productId === '' ? true : false
              }
            >
              Search
            </Button>
          </form>

          {reviews.length > 0 ? (
            <ThemeProvider theme={MuiTheme}>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={10}
                disableSelectionOnClick
                className="productListTable"
                autoHeight
                loading={deleteReviewLoading}
              />
            </ThemeProvider>
          ) : (
            <h2 className="productReviewsFormHeading">No Reviews Found</h2>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default ProductReviews;
