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
          <div className='banner1'>
            <h1>This is a demo E-Commerce website</h1>
            <h4>To test this website go to login page which contains test account credentials and login.
              Or you could register using your real email address too and remove all the profile data you entered permanently after testing with click of a button on the Profile Page.</h4>
              <h4>Click below to see the list of features, technical highlights, 
              security implementation and complete functionality behind this e-commerce demo.</h4>
              <a href='/features'>
              <button>
                Check out features list
              </button>
            </a>
              <h4>OR</h4>
            <a href="#container">
              <button>
                Scroll down <CgMouse />
              </button>
            </a>
          </div>
          <div className='bannerAfter'></div>
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
