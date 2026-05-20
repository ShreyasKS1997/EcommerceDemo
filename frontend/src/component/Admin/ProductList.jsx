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

const ProductList = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [page, setPage] = useState({page:1});
  const [deleteProductSuccess, setDeleteProductSuccess] = useState(false);

  const {data, isLoading: isGetAllOrdersLoading} = useGetAllProductsQuery(page);
  const [deleteProduct, {isLoading:isDeletingProduct, error}] = useDeleteProductMutation();
  const {data:userData} = useLoadUserQuery();

  const products = data?.products || [];
  const filteredProductsCount = data?.filteredProductsCount || 0;

  const deleteProductHandler = useCallback(async(e, id) => {
    e.stopPropagation();
    try {
      setDeleteProductSuccess(true);
      await deleteProduct(id).unwrap();
      setDeleteProductSuccess(false);
    } catch (error) {
      console.log(error);
      setDeleteProductSuccess(false);
    }
  });

  const editProductHandler = useCallback((e, id) => {
    e.stopPropagation();
    navigate(`/admin/product/${id}`);
  });

  const columns = useMemo(() => [
    { field: 'id', 
      headerName: 'Product ID',
      flex: 0.3
    },

    {
      field: 'name',
      headerName: 'Name',
      flex: 0.3,
    },
    {
      field: 'stock',
      headerName: 'Stock',
      type: 'number',
      flex: 0.1,
    },

    {
      field: 'price',
      headerName: 'Price',
      type: 'number',
      flex: 0.1,
    },

    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      flex: 0.2,
      sortable: false,
      renderCell: (params) => {
        return (
          <>
            <Button onClick={(e) => editProductHandler(e, params.id)}>
              <EditIcon />
            </Button>

            <Button disabled = {deleteProductSuccess || userData.sandboxId !== params.row.sandboxId} onClick={(e) => deleteProductHandler(e, params.id)}>
              <DeleteIcon />
            </Button>
          </>
        );
      },
    },
  ], [navigate, editProductHandler, deleteProductHandler, deleteProductSuccess, userData]
);


  const rows = useMemo(() => {
    return products.map((item) => ({
      id: item._id,
      stock: item.stock,
      price: item.price,
      name: item.name,
      sandboxId: item.sandboxId,
    }));
  }, [products]);
    

    if (isGetAllOrdersLoading) {
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

          <ThemeProvider theme={MuiTheme}>
            <DataGrid
              rows={rows}
              columns={columns}
              paginationMode='server'
              rowCount={filteredProductsCount}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10
                  },
                },
              }}
              onPaginationModelChange={(model, details) => setPage({page: model.page + 1})}
              disableSelectionOnClick
              autoHeight
              loading={isGetAllOrdersLoading || isDeletingProduct}
            />
          </ThemeProvider>
        </div>
      </div>
    </>
  );
};

export default ProductList;
