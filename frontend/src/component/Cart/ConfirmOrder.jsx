import CheckoutSteps from '../Cart/CheckoutSteps';
import { useDispatch, useSelector } from 'react-redux';
import MetaData from '../layout/MetaData';
import './ConfirmOrder.css';
import { Link, useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import { useLoadUserQuery } from '../../Services/userApi';
import Loader from '../layout/loader/loader';
import { addOrderInfo } from '../../SliceThunks/orderSliceThunks';

const ConfirmOrder = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { ShippingInfo } = useSelector((state) => state.order);
  const {cartItems} = useSelector((state) => state.cart);
  const { data: user, isLoading, isError } = useLoadUserQuery();

  const subtotal = Math.round(Object.values(cartItems).reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  ));

  const shippingCharges = subtotal > 1000 ? 0 : 200;

  const tax = Math.round(subtotal * 0.18);

  const totalPrice = subtotal + tax + shippingCharges;

  const address = `${ShippingInfo.address}, ${ShippingInfo.city}, ${ShippingInfo.state}, ${ShippingInfo.pinCode}, ${ShippingInfo.country}`;

  const proceedToPayment = () => {
    const data = {
      subtotal,
      shippingCharges,
      tax,
      totalPrice,
    };

    dispatch(addOrderInfo(data));

    navigate('/process/payment');
  };

  if (isLoading) {
    return <Loader/>
  }

  if (isError) {
    return <div>Something went wrong</div>
  }

  return (
    <>
      <MetaData title="Confirm Order" />
      <CheckoutSteps activeStep={1} />
      <div className="confirmOrderPage">
        <div>
          <div className="confirmshippingArea">
            <Typography>Shipping Info</Typography>
            <div className="confirmshippingAreaBox">
              <div>
                <p>Name :</p>
                <p>{user.name}</p>
              </div>
              <div>
                <p>Phone :</p>
                <p>{ShippingInfo.phoneNo}</p>
              </div>
              <div>
                <p>Address :</p>
                <p>{address}</p>
              </div>
            </div>
          </div>
          <div className="confirmCartItems">
            <Typography>Your Cart Items</Typography>
            <div className="confirmCartItemsContainer">
              {cartItems &&
                Object.keys(cartItems).map((key) => (
                  <div key={key}>
                    <div>
                      <img src={cartItems[key].images[0].url} alt="Product" />
                    </div>
                    <Link to={`/product/${key}`}>
                      {cartItems[key].name}
                    </Link>
                    <span>
                      {'(' + cartItems[key].quantity} x {cartItems[key].price + ')'} 
                    </span>
                    <p>=</p>
                    <b>₹{cartItems[key].price * cartItems[key].quantity}</b>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div>
          <div className="orderSummary">
            <Typography>Order Summery</Typography>
            <div>
              <div>
                <p>Subtotal:</p>
                <span>₹ {subtotal}</span>
              </div>
              <div>
                <p>Shipping Charges:</p>
                <span>₹ {shippingCharges}</span>
              </div>
              <div>
                <p>GST:</p>
                <span>₹ {tax}</span>
              </div>
            </div>

            <div className="orderSummaryTotal">
              <p>
                <b>Total:</b>
              </p>
              <span>₹ {totalPrice}</span>
            </div>

            <button onClick={proceedToPayment}>Proceed To Payment</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmOrder;
