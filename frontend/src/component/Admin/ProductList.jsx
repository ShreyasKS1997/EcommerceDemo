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
import Pagination from 'react-js-pagination';

const ProductList = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState({page:1});

  const {data, isLoading: isGetAllProductsLoading, isFetching} = useGetAllProductsQuery(currentPage);
  const [deleteProduct, {isLoading:isDeletingProduct, error}] = useDeleteProductMutation();
  const {data:activeUserDetails} = useLoadUserQuery();

  const products = data?.products ?? [];
  const productCount = data?.productCount ?? 0;
  const resultPerPage = data?.resultPerPage ?? 0;
  const filteredProductsCount = data?.filteredProductsCount ?? 0;
  const sandboxId = activeUserDetails?.sandboxId ?? '';

  const setCurrentPageNo = (e) => {
    setCurrentPage({page: e});
  };

  const deleteProductHandler = useCallback(async(e, productDetails) => {
    e.stopPropagation();
    try {
      await deleteProduct(productDetails['Product Id']).unwrap();
    } catch (error) {
      console.log(error);
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
    activeUserSandboxId: sandboxId,
    excludeData: ['sandboxId'],
  }

  if (isGetAllProductsLoading || isDeletingProduct || isFetching) {
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

          <div className='productsPaginationWrap'>       
                  {resultPerPage < filteredProductsCount && (
                    <div className="paginationBox">
                      <Pagination
                        activePage={currentPage.page}
                        itemsCountPerPage={resultPerPage}
                        totalItemsCount={productCount}
                        onChange={setCurrentPageNo}
                        nextPageText="Next"
                        prevPageText="Prev"
                        firstPageText="1st"
                        lastPageText="Last"
                        itemClass="page-item"
                        linkClass="page-link"
                        activeClass="pageItemActive"
                        activeLinkClass="pageLinkActive"
                      />
                    </div>
                  )}
                </div>
           
        </div>
      </div>
    </>
  );
};

export default ProductList;
