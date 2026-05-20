import React, { useState } from 'react';
import './Products.css';
import Loader from '../layout/loader/loader';
import Product from './ProductCard';
import { useSearchParams } from 'react-router-dom';
import Pagination from 'react-js-pagination';
import Slider from '@mui/material/Slider';
import { Typography } from '@mui/material';
import MetaData from '../layout/MetaData';
import { useGetAllProductsQuery } from '../../Services/productApi';

const categories = [
  'All',
  'Laptop',
  'Footwear',
  'Bottom',
  'Tops',
  'Attire',
  'Camera',
  'SmartPhones',
  'Electronics',
];

const Products = () => {

  const [currentPage, setCurrentPage] = useState(1);

  const [priceLocal, setPriceLocal] = useState([0, 200000]);

  const [priceServer, setPriceServer] = useState([0, 200000]);

  const [category, setCategory] = useState('');

  const [ratingsLocal, setRatingsLocal] = useState(0);

  const [ratingsServer, setRatingsServer] = useState(0);

  const searchParams = useSearchParams();

  const key = searchParams[0].get('keyword');

  const queries = {
    'keyword': key || '',
    'page': currentPage,
    'price[gte]': priceServer[0],
    'price[lte]': priceServer[1],
    'category': category,
    'ratings[gte]': ratingsServer,
  }

  const {data:{products, productCount, resultPerPage, filteredProductsCount} = {}, isLoading, isFetching, isError, isSuccess, refetch} = useGetAllProductsQuery(queries);

  const setCurrentPageNo = (e) => {
    setCurrentPage(e);
  };

  if (isLoading || isFetching) {
    return <Loader />
  }

  if (isError) {
    return <div>Something went wrong</div>
  }

  return (
    <div className="productsContainer">
      
      <MetaData title="PRODUCTS .. ECOMMERCE" />

      <div className="filterBox">
        <div className='price'>
          <Typography>Price</Typography>
          <Slider
            value={priceLocal}
            onChange={(e, newPrice) => setPriceLocal(newPrice)}
            onChangeCommitted = {(e, newPrice) => setPriceServer(newPrice)}
            valueLabelDisplay="auto"
            aria-labelledby="range-slider"
            min={0}
            max={200000}
          />
        </div>

        <div className='category'>
          <Typography className='categories'>Categories</Typography>
          <ul className="categoryBox">
            {categories.map((category) => (
              <li
                className="category-link"
                key={category}
                onClick={(e) => {e.preventDefault(); setCategory(category);}}
              >
                {category}
              </li>
            ))}
          </ul>
        </div>

        <fieldset className='ratings'>
          <Typography component="legend">Ratings Above</Typography>
          <Slider
            value={ratingsLocal}
            onChange={(e, newRating) => {
              setRatingsLocal(newRating);
            }}
            onChangeCommitted={(e, newRating) => {
              setRatingsServer(newRating);
            }}
            aria-labelledby="continuous-slider"
            valueLabelDisplay="auto"
            min={0}
            max={5}
          />
        </fieldset>
      </div>

      <div className='productsPaginationWrap'>
        <div className="products">
          <h2 className="productsHeading">Products</h2>
          <div className="productsList">
          {products &&
            products.map((product) => (
              <Product key={product._id} product={product} />
            ))}
          </div>
        </div>

        {resultPerPage < filteredProductsCount && (
          <div className="paginationBox">
            <Pagination
              activePage={currentPage}
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
  )
}

export default Products;
