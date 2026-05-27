import { CgMouse } from 'react-icons/cg';
import './Home.css';
import Product from '../Product/ProductCard.jsx';
import MetaData from '../layout/MetaData';
import { useDispatch } from 'react-redux';
import Loader from '../layout/loader/loader';
import { useGetAllProductsQuery } from '../../Services/productApi.jsx';

const Home = () => {

  const {data:{products} = {}, isLoading, isError} = useGetAllProductsQuery();

  return (
    <>
      <MetaData title="Home Page" />
      <div className="banner">
        <div className='bannerContainer'>
          <h1>This is a demo E-Commerce website</h1>
          <h1>Welcome to Ecommerce</h1>
          <h2>FIND AMAZING PRODUCTS BELOW</h2>

          <a href="#container">
            <button>
              Scroll <CgMouse />
            </button>
          </a>
        </div>
      </div>

      <div className='bannerCoverDim'></div>

      <h2 className="homeHeading">Featured Products</h2>

      {
        isError ? <div>Something went wrong</div> : (isLoading ? <Loader/> : <div className="container" id="container">
          {products && products.slice(0,3).map((product, index) => <Product product={product} />)}
        </div>)
      }
    </>
  )
}

export default Home;
