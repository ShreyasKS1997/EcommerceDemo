import { useEffect, useState } from 'react';
import './UpdatePassword.css';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import Loader from '../layout/loader/loader';
import MetaData from '../layout/MetaData';
import { useLoadUserQuery, useUpdatePasswordMutation } from '../../Services/userApi';

const UpdatePassword = () => {

  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');

  const [newPassword, setNewPassword] = useState('');

  const [newConfirmPassword, setNewConfirmPassword] = useState('');

  const [oldPassVisible, setoldPassVisible] = useState(false);

  const [newPassVisible, setnewPassVisible] = useState(false);

  const [newConfirmPassVisible, setnewConfirmPassVisible] = useState(false);

  const [updatePassword, {isLoading, isError, isSuccess}] = useUpdatePasswordMutation();

  const oldPassVisToggle = () => {
    if (!oldPassVisible) {
      setoldPassVisible(true);
    } else {
      setoldPassVisible(false);
    }
  };

  const newPassVisToggle = () => {
    if (!newPassVisible) {
      setnewPassVisible(true);
    } else {
      setnewPassVisible(false);
    }
  };

  const newConfirmPassVisToggle = () => {
    if (!newConfirmPassVisible) {
      setnewConfirmPassVisible(true);
    } else {
      setnewConfirmPassVisible(false);
    }
  };

  const HandleChangePassword = async(e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.set('oldPassword', oldPassword);
    formData.set('newPassword', newPassword);
    formData.set('newConfirmPassword', newConfirmPassword);

    try {
      await updatePassword(formData).unwrap();
      setTimeout(() => {
        navigate(-1, {replace: true});
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) {
    return <Loader/>
  }

  return (
    <>
      <MetaData title="Change Password" />
      <div className="updatePasswordContainer">
        <div className="updatePasswordBox">
          <h2 className="updatePasswordHeading">Update Password</h2>
          {isSuccess && <div className='successMsg'><h4>Success</h4></div>}
          <form
            className="updatePasswordForm"
            onSubmit={(e) => {HandleChangePassword(e)}}
          >
            <div className="oldPasswordInputWrap">
              <VpnKeyIcon />
              <input
                type={!oldPassVisible ? 'password' : 'text'}
                className="oldPasswordInput"
                name="oldPassword"
                placeholder="Old Password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              {oldPassVisible ? (
                <VisibilityIcon
                  className="visibilityIcon"
                  onClick={oldPassVisToggle}
                />
              ) : (
                <VisibilityOffIcon
                  className="visibilityIcon"
                  onClick={oldPassVisToggle}
                />
              )}
            </div>
            <div className="newPasswordInputWrap">
              <LockOpenIcon />
              <input
                type={!newPassVisible ? 'password' : 'text'}
                className="newPasswordInput"
                placeholder="New Password"
                name="newPassword"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {newPassVisible ? (
                <VisibilityIcon
                  className="visibilityIcon"
                  onClick={newPassVisToggle}
                />
              ) : (
                <VisibilityOffIcon
                  className="visibilityIcon"
                  onClick={newPassVisToggle}
                />
              )}
            </div>
            <div className="newConfirmPasswordInputWrap">
              <LockIcon />
              <input
                type={!newConfirmPassVisible ? 'password' : 'text'}
                className="newConfirmPasswordInput"
                placeholder="Confirm New Password"
                name="newConfirmPassword"
                required
                value={newConfirmPassword}
                onChange={(e) => setNewConfirmPassword(e.target.value)}
              />
              {newConfirmPassVisible ? (
                <VisibilityIcon
                  className="visibilityIcon"
                  onClick={newConfirmPassVisToggle}
                />
              ) : (
                <VisibilityOffIcon
                  className="visibilityIcon"
                  onClick={newConfirmPassVisToggle}
                />
              )}
            </div>
            <input
              type="submit"
              className="changePasswordBtn"
              value='Change Password'
            />
          </form>
        </div>
      </div>
    </>
  );
};

export default UpdatePassword;
