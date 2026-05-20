import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import Loader from '../layout/loader/loader';
import { selectActiveAccount } from '../../SliceThunks/utils';

const ProtectedRouteAdmin = () => {

  const authStatus = useSelector(state => state.auth.status);
  const account = useSelector(selectActiveAccount);

  if (authStatus === 'booting') return <Loader />

  if (authStatus !== 'authenticated') {
    return <Navigate state={'redirected'} to='/login' replace  />
  }

  if (!account || !['test_admin', 'super_admin', 'admin'].includes(account.role)) {
    return <Navigate state={'redirected'} to='/account' replace />
  }

  return <Outlet />
};

export default ProtectedRouteAdmin;
