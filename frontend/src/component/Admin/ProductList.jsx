import { DataGrid } from '@mui/x-data-grid';
import './UserDataGridList.css';
import { useDispatch } from 'react-redux';
import {useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import MetaData from '../layout/MetaData';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SideBar from './Sidebar';
import { useDeleteProductMutation, useGetAllProductsQuery } from '../../Services/productApi';
import Loader from '../layout/loader/loader';
import { useCallback, useMemo, useState } from 'react';
import { useLoadUserQuery } from '../../Services/userApi';
import { ThemeProvider } from '@mui/system';
import { MuiTheme } from '../../MuiTheme';
import { addNotification } from '../../SliceThunks/utils';
import { DataList } from '../../DataList';

const ProductList = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [page, setPage] = useState({page:1});
  const [deleteProductSuccess, setDeleteProductSuccess] = useState(false);

  const {data, isLoading: isGetAllProductsLoading} = useGetAllProductsQuery(page);
  const [deleteProduct, {isLoading:isDeletingProduct, error}] = useDeleteProductMutation();
  const {data:userData} = useLoadUserQuery();

  const products = data?.products || [];
  const filteredProductsCount = data?.filteredProductsCount || 0;

  const deleteProductHandler = useCallback(async(e, productDetails) => {
    e.stopPropagation();
    try {
      setDeleteProductSuccess(true);
      await deleteProduct(productDetails['Product Id']).unwrap();
      setDeleteProductSuccess(false);
    } catch (error) {
      console.log(error);
      setDeleteProductSuccess(false);
    }
  });

  const editProductHandler = useCallback((e, productDetails) => {
    e.stopPropagation();
    navigate(`/admin/product/${productDetails['Product Id']}`);
  });

  const rows = useMemo(() => {
    return products.map((item) => ({
      'Product Id': item._id,
      Stock: item.stock,
      Price: item.price,
      Name: item.name,
      sandboxId: item.sandboxId,
    }));
  }, [products]);

  const columnData = {
    heading: ['Product Id', 'Stock', 'Price', 'Name', 'Actions'],
    data: rows,
    columnLength: 5,
    gridCellTemplateColumn: '2fr 1.5fr 1fr 1.5fr 1fr',
    viewDetailsButton: false,
    ActionButtons: [<EditIcon/>, <DeleteIcon/>],
    ActionButtonsHandler: [editProductHandler, deleteProductHandler],
    excludeData: ['sandboxId'],
  }

  if (isGetAllProductsLoading || isDeletingProduct) {
    return <Loader/>
  }

  if (error) {
    dispatch(addNotification({message: error, errorType: 'error'}));
  }


  return (
    <>
      <MetaData title={`ALL PRODUCTS - Admin`} />

      <div className="dashboard">
        <SideBar />
        <div className="productListContainer">
          <h1 id="productListHeading">ALL PRODUCTS</h1>

          <h3>Note: You can only delete or edit the product that you have created.</h3>

          <DataList data={columnData} />
           
        </div>
      </div>
    </>
  );
};

export default ProductList;
