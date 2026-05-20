import React, { Fragment, useState, useEffect } from 'react';
import './UpdateProfile.css';
import Loader from '../layout/loader/loader';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import FaceIcon from '@mui/icons-material/Face';
import MetaData from '../layout/MetaData';
import { useNavigate } from 'react-router-dom';
import { useLoadUserQuery, useUpdateProfileMutation } from '../../Services/userApi';

const UpdateProfile = () => {
  const navigate = useNavigate();

  const [updateProfile, {data, isLoading, isError, isSuccess}] = useUpdateProfileMutation();
  const {data: userData, isLoading:isUserLoading, isError:isUserError, refetch} = useLoadUserQuery();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState();
  const [avatarPreview, setAvatarPreview] = useState('/Profile.png');

  const updateProfileSubmit = async(e) => {
    e.preventDefault();

    const myForm = new FormData();

    name && myForm.set('name', name);
    email && myForm.set('email', email);
    avatar && myForm.set('avatar', avatar);

    try {
      await updateProfile(myForm).unwrap();
      await refetch();
      setTimeout(() => {
        navigate(-1, {replace: true});
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };


  const updateProfileDataChange = (e) => {
    
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
        setAvatar(reader.result);
      }
    };

    reader.readAsDataURL(e.target.files[0]);
  };

  useEffect(() => {
    if (userData) {
      setName(userData.name);
      setEmail(userData.email);
      setAvatarPreview(userData.avatar.url);
    }
  }, [userData]);

  if (isLoading || isUserLoading) {
    return <Loader/>
  }
  
  return (
    <Fragment>
      <MetaData title="Update Profile" />
      <div className="updateProfileContainer">
        <div className="updateProfileBox">
          <h2 className="updateProfileHeading">Update Profile</h2>
          {isSuccess && <div className='successMsg'><h4>Success</h4></div>}
          <form
            className="updateProfileForm"
            encType="multipart/form-data"
            onSubmit={updateProfileSubmit}
          >
            <div className="updateProfileName">
              <FaceIcon />
              <input
                type="text"
                placeholder="Name"
                required
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="updateProfileEmail">
              <MailOutlineIcon />
              <input
                type="email"
                placeholder="Email"
                required
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div id="updateProfileImage">
              <img src={avatarPreview} alt="Avatar Preview" />
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={updateProfileDataChange}
              />
            </div>
            <input
              type="submit"
              value="Update"
              className="updateProfileBtn"
            />
          </form>
        </div>
      </div>
    </Fragment>
  )
};

export default UpdateProfile;
