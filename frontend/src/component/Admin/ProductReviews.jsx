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
import { DataList } from '../../DataList';

const ProductReviews = () => {

  const dispatch = useDispatch();

  const [productId, setProductId] = useState('');
  const [productIdToSend, setProductIdToSend] = useState(skipToken)

  const {data, isLoading} = useGetAllReviewAdminQuery(productIdToSend);
  const [deleteReview, {isLoading: deleteReviewLoading, error: deleteReviewError}] = useDeleteReviewMutation();

  const reviews = data?.reviews || [];

  const deleteReviewHandler = useCallback((event, productDetails) => {
    deleteReview({id: productDetails['Product Id'], productId: productDetails.pid});
  }, [deleteReview]);

  const rows = useMemo(() => {
    return reviews.map((item) => ({
      'Product Id': item._id,
      Rating: item.rating,
      Comment: item.comment,
      User: item.name,
      pid: productId,
    }));
  }, [reviews]);

  const columnData = {
    heading: ['User Id', 'Rating', 'Comment', 'User', 'Action'],
    data: rows,
    columnLength: 5,
    gridCellTemplateColumn: '2fr 0.5fr 2fr 1fr 1fr',
    viewDetailsButton: false,
    ActionButtons: [<DeleteIcon/>],
    ActionButtonsHandler: [deleteReviewHandler],
    excludeData: ['pid'],
  }

  if (isLoading || deleteReviewLoading) {
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
              id="createProductBtnReview"
              type="submit"
              disabled={
                isLoading ? true : false || productId === '' ? true : false
              }
            >
              Search
            </Button>
          </form>

          {reviews.length > 0 ? (
            <DataList data={columnData} />
          ) : (
            <h2 className="noReviewsFound">No Reviews Found</h2>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default ProductReviews;
