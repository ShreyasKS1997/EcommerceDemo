import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';
import Loader from '../layout/loader/loader';

const ProtectedRoute = () => {

  const authStatus = useSelector((state) => state.auth.status);

  if (authStatus === 'booting') return <Loader/>;
  if (authStatus !== 'authenticated') return <Navigate state={'redirected'} to='/login' replace />
  return <Outlet />
};

export default ProtectedRoute;
