import { useState } from 'react';
import './ForgotPassword.css';
import Loader from '../layout/loader/loader';
import { useForgotPasswordMutation } from '../../Services/userApi';

const ForgotPassword = () => {

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPassword, {isLoading, isError, isSuccess, reset}] = useForgotPasswordMutation();

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
          <div className='testAccountResetLinkNote' style={{marginBottom: `${isSuccess ? '2rem' : '0'}`}}>{isSuccess && (forgotPasswordEmail === "someone@example.com" ? [<div>Password reset link can be accessed here - </div>, <a>https://www.mailinator.com/v4/public/inboxes.jsp?vfpshow=true&to=someonedemcom</a>] : <p>If you have account with us, you should receive password reset link in your email.</p>)}</div>
          <h2>Password Reset Assistance</h2>
          <div>
            Enter your registered email address to reset the password.
          </div>
          <h4 style={{ paddingBottom: '6px' }}>Email address</h4>
          <input
            type="email"
            name="email"
            value={forgotPasswordEmail}
            onChange={(e) => {setForgotPasswordEmail(e.target.value), reset()}}
          />
          <input type="submit" value="Submit" />
        </form>
      </div>
    </>
  )
}

export default ForgotPassword;
