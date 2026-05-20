import './ProductCard.css'
import { Rating } from '@mui/material';
import { Link } from 'react-router-dom';

const Product = ({ product }) => {
  const options = {
    readOnly: true,
    prececision: 0.5,
    value: product.ratings,
  };

  return (
    <Link className="productCard" to={`/product/${product._id}`}>
      <img src={product && product.images.length > 0 && product.images[0].url} alt={product?.name} />
      <p>{product.name}</p>
      <div>
        <Rating {...options} />{' '}
        <span className="productCardSpan">
          {' '}
          ({product.numberOfReviews} Reviews){' '}
        </span>
      </div>
      <span>{`₹${product.price}`}</span>
    </Link>
  );
};

export default Product;
