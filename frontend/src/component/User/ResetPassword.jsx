import { useEffect, useState } from 'react';
import './ResetPassword.css';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useParams } from 'react-router-dom';
import Loader from '../layout/loader/loader';
import MetaData from '../layout/MetaData';
import { useResetPasswordMutation } from '../../Services/userApi';

const ResetPassword = () => {

  const params = useParams();

  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [newPassVisible, setnewPassVisible] = useState(false);
  const [newConfirmPassVisible, setnewConfirmPassVisible] = useState(false);

  const [resetPassword, {isLoading}] = useResetPasswordMutation();

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

  const HandleChangePassword = (e) => {
    e.preventDefault();

    const token = params.token;
    resetPassword({token: token, password: newPassword});
  };

  if (isLoading) {
    return <Loader/>
  }

  return (
    <>
      <MetaData title="Change Password" />
      <div className="resetPasswordContainer">
        <div className="resetPasswordBox">
          <h2 className="resetPasswordHeading">Reset Password</h2>
         {isLoading && <div className='successMsg'><h4>Success</h4></div>}
          <form
            className="resetPasswordForm"
            onSubmit={HandleChangePassword}
          >
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
              className="resetPasswordBtn"
              value="Change Password"
            />
          </form>
        </div>
      </div>
    </>
  )};

export default ResetPassword;
