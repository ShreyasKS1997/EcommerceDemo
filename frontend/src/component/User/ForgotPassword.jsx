import { useState } from 'react';
import './ForgotPassword.css';
import Loader from '../layout/loader/loader';
import { useForgotPasswordMutation } from '../../Services/userApi';

const ForgotPassword = () => {

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPassword, {isLoading, isError, isSuccess}] = useForgotPasswordMutation();

  const HandleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    forgotPassword({email: forgotPasswordEmail});
  };

  if (isLoading) {
    return <Loader/>
  }

  return (
    <>
      <div className="forgotPassword">
        <form type="email" onSubmit={HandleForgotPasswordSubmit}>
          <h2>Password Reset Assistance</h2>
          <div>
            Enter your registered email address to reset the password.
          </div>
          <h4 style={{ paddingBottom: '6px' }}>Email address</h4>
          <input
            type="email"
            name="email"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
          />
          <input type="submit" value="Submit" />
        </form>
      </div>
    </>
  )
}

export default ForgotPassword;
