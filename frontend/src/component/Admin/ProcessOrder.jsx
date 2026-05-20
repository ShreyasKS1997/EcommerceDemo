import React, { useState } from 'react';
import MetaData from '../layout/MetaData';
import { Link, replace, useNavigate, useParams } from 'react-router-dom';
import { Typography, Button } from '@mui/material';
import SideBar from './Sidebar';
import { useDispatch } from 'react-redux';
import Loader from '../layout/loader/loader';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import './processOrder.css';
import { useGetOrderDetailsQuery, useUpdateOrderAdminMutation } from '../../Services/orderApi';
import { api } from '../../Services/api';

const ProcessOrder = (match) => {

  const dispatch = useDispatch();
  
  const params = useParams();

  const navigate = useNavigate();

  const {data: {order} = {}, isLoading, refetch} = useGetOrderDetailsQuery(params.id);

  const [updateOrder, {isLoading:updateOrderLoading, isSuccess, isError}] = useUpdateOrderAdminMutation();

  const updateOrderSubmitHandler = async(e) => {
    e.preventDefault();

    const myForm = new FormData();

    myForm.set('status', status);

    try {
      await updateOrder({id: params.id, data: myForm}).unwrap();
      refetch();
      dispatch(api.util.invalidateTags(['allOrdersAdmin']));
      setTimeout(() => {
        navigate('/admin/orders', replace);
      }, 5000);
    } catch(error) {
      console.log(error);
    }
  };

  const [status, setStatus] = useState('');

  if (isLoading) {
    return <Loader/>
  }

  return (
    <>
      <MetaData title="Process Order" />
      <div className="dashboard">
        <SideBar />
        <div className="newProductContainer">
            <div
              className="confirmOrderPage"
              style={{
                display: order.orderStatus === 'Delivered' ? 'block' : 'grid',
              }}
            >
              <div>
                <div className="confirmshippingArea">
                  {isSuccess && <div className='successMsg'><h4>Success</h4></div>}
                  <Typography>Shipping Info</Typography>
                  <div className="orderDetailsContainerBox">
                    <div>
                      <p>Name:</p>
                      <span>{order.user && order.user.name}</span>
                    </div>
                    <div>
                      <p>Phone:</p>
                      <span>
                        {order.shippingInfo && order.shippingInfo.phoneNo}
                      </span>
                    </div>
                    <div>
                      <p>Address:</p>
                      <span>
                        {order.shippingInfo &&
                          `${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.state}, ${order.shippingInfo.pinCode}, ${order.shippingInfo.country}`}
                      </span>
                    </div>
                  </div>

                  <Typography>Payment</Typography>
                  <div className="orderDetailsContainerBox">
                    <div>
                      <p
                        className={
                          order.paymentInfo &&
                          order.paymentInfo.status === 'succeeded'
                            ? 'greenColor'
                            : 'redColor'
                        }
                      >
                        {order.paymentInfo &&
                        order.paymentInfo.status === 'succeeded'
                          ? 'PAID'
                          : 'NOT PAID'}
                      </p>
                    </div>

                    <div>
                      <p>Amount:</p>
                      <span>{order.totalPrice && order.totalPrice}</span>
                    </div>
                  </div>

                  <Typography>Order Status</Typography>
                  <div className="orderDetailsContainerBox">
                    <div>
                      <p
                        className={
                          order.orderStatus && order.orderStatus === 'Delivered'
                            ? 'greenColor'
                            : 'redColor'
                        }
                      >
                        {order.orderStatus && order.orderStatus}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="confirmCartItems">
                  <Typography>Your Cart Items:</Typography>
                  <div className="confirmCartItemsContainer">
                    {order.orderItems &&
                      order.orderItems.map((item) => (
                        <div key={item.product}>
                          <img src={item.images[0].url} alt="Product" />
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>{' '}
                          <span>
                            {item.quantity} x ₹{item.price} =
                            <b>₹{item.price * item.quantity}</b>
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              {/*  */}
              <div
                style={{
                  display: order.orderStatus === 'Delivered' ? 'none' : 'block',
                }}
              >
                <form
                  className="updateOrderForm"
                  onSubmit={updateOrderSubmitHandler}
                >
                  <h1>Process Order</h1>

                  <div>
                    <AccountTreeIcon />
                    <select onChange={(e) => setStatus(e.target.value)}>
                      <option value="">Choose Category</option>
                      {order.orderStatus === 'Processing' && (
                        <option value="Shipped">Shipped</option>
                      )}

                      {order.orderStatus === 'Shipped' && (
                        <option value="Delivered">Delivered</option>
                      )}
                    </select>
                  </div>

                  <Button
                    id="createProductBtn"
                    type="submit"
                    disabled={
                      isLoading ? true : false || status === '' ? true : false
                    }
                  >
                    Process
                  </Button>
                </form>
              </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default ProcessOrder;
