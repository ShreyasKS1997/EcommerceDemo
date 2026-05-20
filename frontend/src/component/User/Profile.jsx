import MetaData from '../layout/MetaData';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../layout/loader/loader';
import { Link } from 'react-router-dom';
import './Profile.css';
import {Skeleton} from '../layout/Header/Skeleton'
import { storeAndSetActiveAccount } from '../../SliceThunks/userSliceThunks';
import { useDeleteAllDataMutation, useGenerateTestAdminMutation, useLazyLoadTestAdminQuery, useLoadUserQuery } from '../../Services/userApi';
import { useEffect, useState } from 'react';


const Profile = () => {

  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);

  const {data:user, isLoading, isFetching, error, refetch} = useLoadUserQuery();
  const [fetchData, {isLoading:testAdminLoading, error:testAdminError}] = useLazyLoadTestAdminQuery();
  const [generateTestAdmin, {isLoading:generateTestAdminLoading, error:generateTestAdminError}] = useGenerateTestAdminMutation();
  const [deleteAllData, {isLoading: isAllDataDeleting, isError:allDatatDeleteError}] = useDeleteAllDataMutation();

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);

  const deleteAllDataHandler = async(e) => {
    e.preventDefault();
    try {
      await deleteAllData().unwrap();
      window.location.reload();
    } catch(error) {
      console.log(error);
    }
  }

  const handleTestAdminClick = async(e, testAdmin) => {
    e.preventDefault();
    if (testAdmin) {
      try {
        const res = await fetchData().unwrap();
        dispatch(storeAndSetActiveAccount(res));
        refetch();
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        await generateTestAdmin().unwrap();
        refetch();
      } catch (error) {
        console.log(error);
      }
    }
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if(isOpen) setIsOpen(false);
      }
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen])

  if (isLoading || isFetching || testAdminLoading) {
    return <Loader/>
  }

  if (error || testAdminError) {
    return <div>Something went wrong</div>
  }

  return (
      <>
        <MetaData title={`${user.name}'s Profile`} />
        <div className={`deleteAccountConfirmDialog ${isOpen ? 'open' : 'close'}`}>
          <div className={`dialogInner ${isOpen ? 'open' : 'close'}`}>
            <p>Are you sure you want to delete your account and all your data?</p>
            <div>
              <button onClick={closeDialog}>No</button>
              <button onClick={deleteAllDataHandler}>Yes</button>
            </div>
          </div>
        </div>
        <div className="profileContainer">
          <div>
            <h1>My Profile</h1>
            <img src={user.avatar.url} alt={user.name} />
            <Link to="/me/update">Edit Profile</Link>
            {user.role === 'user' && <button onClick={openDialog} className='deleteAccount'>Delete my Account and all my data</button>}
          </div>
          <div>
            <div className='nameEmailJoined'>
              <div>
                <h4>Full Name :</h4>
                <p>{user.name}</p>
              </div>
              <div>
                <h4>Email :</h4>
                <p>{user.email}</p>
              </div>
              <div>
                <h4>Joined On :</h4>
                <p>{String(user.createdAt).slice(0, 10)}</p>
              </div>
            </div>

            <div>
              {(user.role === 'test_admin' || user.role === 'super_admin') ? <Link to='/admin/dashboard'>Dashboard</Link> : ''}
              {
                  user.role === 'user' && 
                    <Link onClick={(e) => {handleTestAdminClick(e, user.testAdmin)}}> 
                      {generateTestAdminLoading ? <Skeleton/> : (`${!user.testAdmin ? 'Generate' : ''} Test Admin`)}
                    </Link>
              }
              <Link to="/orders">My Orders</Link>
              {user.role === 'user' && <Link to="/password/update">Change Password</Link>}
            </div>
          </div>
        </div>
      </>
  );
};

export default Profile;
