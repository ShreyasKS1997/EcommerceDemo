import { useLayoutEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './component/Home/Home.jsx';
import Layout from './component/layout/Layout.jsx';
import ProductDetails from './component/Product/ProductDetails.jsx';
import Products from './component/Product/Products.jsx';
import LoginSignUp from './component/User/LoginSignUp.jsx';
import UpdateProfile from './component/User/UpdateProfile.jsx';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import Profile from './component/User/Profile.jsx';
import ProtectedRoute from './component/Route/ProtectedRoute.jsx';
import ProtectedRouteAdmin from './component/Route/ProtectedRouteAdmin.jsx';
import UpdatePassword from './component/User/UpdatePassword.jsx';
import ForgotPassword from './component/User/ForgotPassword.jsx';
import ResetPassword from './component/User/ResetPassword.jsx';
import Cart from './component/Cart/Cart.jsx';
import Shipping from './component/Cart/Shipping.jsx';
import ConfirmOrder from './component/Cart/ConfirmOrder.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { PaymentChild } from './component/Cart/PaymentChild.jsx';
import OrderSuccess from './component/Cart/OrderSuccess.jsx';
import MyOrders from './component/Order/MyOrders.jsx';
import OrderDetails from './component/Order/OrderDetails.jsx';
import Dashboard from './component/Admin/Dashboard.jsx';
import ProductList from './component/Admin/ProductList.jsx';
import Product from './component/Admin/Product.jsx';
import OrderList from './component/Admin/OrderList.jsx';
import ProcessOrder from './component/Admin/ProcessOrder.jsx';
import UsersList from './component/Admin/UsersList.jsx';
import UpdateUser from './component/Admin/UpdateUser.jsx';
import ProductReviews from './component/Admin/ProductReviews.jsx';
import About from './component/layout/About/About.jsx';
import Contact from './component/layout/Contact/Contact.jsx';
import NotFound from './component/layout/NotFound/NotFound.jsx';
import Loader from './component/layout/loader/loader';
import { useInitLoadQuery } from './Services/userApi.jsx';
import { skipToken } from '@reduxjs/toolkit/query';
import { useGetStripeApiKeyQuery } from './Services/api.jsx';
import { NoNetwork } from './NoNetwork.jsx';
import { Wrong } from './Wrong.jsx';

function App() {

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const {status: authStatus} = useSelector((state) => state.auth);

  const {serverError} = useSelector((state) => state.app);

  const {data:initData, isLoading:isRefreshing} = useInitLoadQuery(authStatus === 'unauthenticated' ? skipToken : undefined);

  const {data:stripeKeyData, isLoading: stripeKeyLoading, isSuccess: stripeKeySuccess} = useGetStripeApiKeyQuery(undefined, {skip: isRefreshing || !initData || authStatus === 'unauthenticated'});

  useLayoutEffect(() => {

    //const handleContextMenu = (e) => e.preventDefault();
    const handleNetworkCheck = () => setIsOnline(navigator.onLine);
    //window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('online', handleNetworkCheck);
    window.addEventListener('offline', handleNetworkCheck);

    return () => {
      //window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('online', handleNetworkCheck);
      window.removeEventListener('offline', handleNetworkCheck);
    }
    
  }, []);

  if (!isOnline) {
    return <NoNetwork />
  }

  if (isRefreshing || stripeKeyLoading) {
    return <Loader />
  }

  if (serverError) {
    return <Wrong status={serverError.status}/>
  }

  return (
    <>
      <Router>
          <Routes>
              <Route element={<Layout />}>
                  <Route exact path="/" element={<Home />} />
                  <Route exact path="/product/:id" element={<ProductDetails />} />
                  <Route exact path="/products" element={<Products />} />
                  <Route path="/products/:keyword" element={<Products />} />
                  <Route exact path="/login" element={<LoginSignUp />} />
                  <Route exact path="/password/forgot" element={<ForgotPassword />} />
                  <Route exact path="/cart" element={<Cart />} />
                  <Route
                    exact
                    path="/password/reset/:token"
                    element={<ResetPassword />}
                  />
                  <Route exact path="/about" element={<About />} />
                  <Route exact path="/contact" element={<Contact />} />

                  <Route element={<ProtectedRoute />}>
                      <Route exact path="/account" element={<Profile />} />
                      <Route exact path="/me/update" element={<UpdateProfile />} />
                      <Route
                        exact
                        path="/password/update"
                        element={<UpdatePassword />}
                      />
                      <Route exact path="/shipping" element={<Shipping />} />
                      <Route exact path="/order/confirm" element={<ConfirmOrder />} />

                      <Route
                        exact
                        path="/process/payment"
                        element={<PaymentChild stripeApiKey={stripeKeyData?.stripeApiKey} />}
                      />
                      <Route exact path="/success" element={<OrderSuccess />} />
                      <Route exact path="/orders" element={<MyOrders />} />
                      <Route exact path="/order/:id" element={<OrderDetails />} />
                  </Route>
                  <Route element={<ProtectedRouteAdmin />}>
                      <Route exact path="/admin/dashboard" element={<Dashboard />} />
                      <Route exact path="/admin/products" element={<ProductList />} />
                      <Route exact path="/admin/product/create" element={<Product />} />
                      <Route
                        exact
                        path="/admin/product/:id"
                        element={<Product />}
                      />
                      <Route exact path="/admin/orders" element={<OrderList />} />
                      <Route exact path="/admin/order/:id" element={<ProcessOrder />} />
                      <Route exact path="/admin/users" element={<UsersList />} />
                      <Route exact path="/admin/user/:id" element={<UpdateUser />} />
                      <Route exact path="/admin/reviews" element={<ProductReviews />} />
                  </Route>
                  <Route exact path="*" element={<NotFound />} />
              </Route>
          </Routes>
      </Router>
    </>
  );
}

export default App;
