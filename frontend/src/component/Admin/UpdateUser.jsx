import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@mui/material';
import MetaData from '../layout/MetaData';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SideBar from './Sidebar';
import Loader from '../layout/loader/loader';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../Services/api.jsx';
import { useTestUserDetailsByIDQuery, useUpdateTestUserProfileMutation } from '../../Services/userApi.jsx';

const UpdateUser = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const params = useParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  const id = params.id;

  const {data, isLoading, refetch} = useTestUserDetailsByIDQuery(id);
  const [updateUser, { isSuccess, isLoading: isL}] = useUpdateTestUserProfileMutation();

  useEffect(() => {
    if (data) {
      setName(data.name);
      setEmail(data.email);
      setRole(data.role);
    }
  }, [dispatch, data]);

  const updateUserSubmitHandler = async(e) => {
    e.preventDefault();

    const myForm = new FormData();

    name && myForm.set('name', name);
    email && myForm.set('email', email);
    role && myForm.set('role', role);

    try {
      await updateUser({id: id, body: myForm}).unwrap();
      await refetch();
      dispatch(api.util.invalidateTags(['refreshTestUsers']));
      setTimeout(() => {
        navigate('/admin/users', {replace: true});
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading || isL) {
    return <Loader/>
  }

  return (
    <>
      <MetaData title="Update User" />
      <div className="dashboard">
        <SideBar />
        <div className="newProductContainer">
            <form
              className="createProductForm"
              onSubmit={updateUserSubmitHandler}
            >
              <h2>Update User</h2>

              {isSuccess && <div className='successMsg'> <h4>Success</h4> </div>}

              <div>
                <PersonIcon />
                <input
                  type="text"
                  placeholder="Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <MailOutlineIcon />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <VerifiedUserIcon />
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="">Choose Role</option>
                  <option value="test_admin">Test Admin</option>
                  <option value="test_user">Test User</option>
                </select>
              </div>

              <Button
                id="createProductBtn"
                type="submit"
                disabled={isLoading || isL || isSuccess ? true : false}
              >
                Update
              </Button>
            </form>
        </div>
      </div>
    </>
  );
};

export default UpdateUser;
