import {
  useEffect,
  useRef,
  useState,
} from 'react';
import './LoginSignUp.css';
import Loader from '../layout/loader/loader';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import FaceIcon from '@mui/icons-material/Face';
import { useDispatch, useSelector } from 'react-redux';
import { storeAndSetActiveAccount } from '../../SliceThunks/userSliceThunks';
import { usePostLoginMutation, usePostRegisterMutation } from '../../Services/userApi';

const LoginSignUp = () => {

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState('');

  const [loginPassword, setLoginPassword] = useState('');

  const registerTab = useRef();

  const switcherTab = useRef('shiftToNeutral');

  const loginTab = useRef();

  const {cartItems} = useSelector((state) => state.cart);

  const [postRegister, {isLoading:registerLoading, error:registerError}] = usePostRegisterMutation();
  const [postLogin, {isLoading:loginLoading , error:loginError}] = usePostLoginMutation();
  const authStatus = useSelector((state) => state.auth.status);

  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = user;

  const [avatar, setAvatar] = useState();
  const [avatarPreview, setAvatarPreview] = useState();

  const registerSubmit = async(e) => {
    e.preventDefault();

    const myForm = new FormData();

    myForm.set('name', name);
    myForm.set('email', email);
    myForm.set('password', password);
    avatar && myForm.set('avatar', avatar);
    try {
      await postRegister(myForm).unwrap();

    } catch (error) {
      console.log(error);
    }
  };

  const registerDataChange = (e) => {
    e.preventDefault();
    if (e.target.name === 'avatar') {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
          setAvatar(reader.result);
        }
      };

      reader.readAsDataURL(e.target.files[0]);
    } else {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  };

  const switchTabs = (e, tab) => {
    if (tab === 'login') {
      switcherTab.current.classList.add('shiftToNeutral');
      switcherTab.current.classList.remove('shiftToRight');

      registerTab.current.classList.remove('shiftToNeutralForm');
      loginTab.current.classList.remove('shiftToLeft');
    }
    if (tab === 'register') {
      switcherTab.current.classList.add('shiftToRight');
      switcherTab.current.classList.remove('shiftToNeutral');

      registerTab.current.classList.add('shiftToNeutralForm');
      loginTab.current.classList.add('shiftToLeft');
    }
  };

  const loginSubmit = async(e) => {
    e.preventDefault();
    try {
      const cartItemsToSend = cartItems ? Object.fromEntries(Object.entries(cartItems).map(([id, data]) => [id, data.quantity])) : {};
      const res = await postLogin({email: loginEmail, password:loginPassword, cartItems: cartItemsToSend}).unwrap();
      dispatch(storeAndSetActiveAccount(res.user));
      navigate('/account', { replace: true });
    } catch (error) {
    }
  };

  if (registerLoading || loginLoading) {
    return <Loader/>
  }

  if (authStatus === 'booting') {
    return <Loader/>
  }

  if (authStatus === 'authenticated') {
    if (queryParams.get('redirect') === 'shipping') {
      return <Navigate to="/shipping" replace />;
    }
    return <Navigate to="/account" replace />;
  } else if (authStatus   ===  'unauthenticated' && queryParams.get('redirect') === 'shipping') {
    return <Navigate to="/login" replace />;
  }

  return (
      <>
        <div className="LoginSignUpContainer">
          <div className="LoginSignUpBox">
            <div>
              <div className="login_signUp_toggle">
                <p onClick={(e) => switchTabs(e, 'login')}>LOGIN</p>
                <p onClick={(e) => switchTabs(e, 'register')}>REGISTER</p>
              </div>
              <button className='shiftToNeutral' ref={switcherTab}></button>
            </div>
            <div className='longinSignUpWrap'>
              <form
                className="loginForm"
                ref={loginTab}
                onSubmit={(e) => loginSubmit(e)}
              >
                <div className="loginEmail">
                  <MailOutlineIcon />
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="loginPassword">
                  <LockOpenIcon />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <Link to="/password/forgot">Forget Password ?</Link>
                <input type="submit" value="Login" className="loginBtn" />
              </form>

              <form
                className="signUpForm"
                ref={registerTab}
                encType="multipart/form-data"
                onSubmit={registerSubmit}
              >
                <div className="signUpName">
                  <FaceIcon />
                  <input
                    type="text"
                    placeholder="Name"
                    required
                    name="name"
                    value={name}
                    onChange={registerDataChange}
                  />
                </div>
                <div className="signUpEmail">
                  <MailOutlineIcon />
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    name="email"
                    value={email}
                    onChange={registerDataChange}
                  />
                </div>
                <div className="signUpPassword">
                  <LockOpenIcon />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    name="password"
                    value={password}
                    onChange={registerDataChange}
                  />
                </div>

                <div id="registerImage">
                  <img src={!avatarPreview ? '/Profile.png' : avatarPreview} alt="Avatar Preview" />
                  <input
                    type="file"
                    name="avatar"
                    accept="image/*"
                    onChange={registerDataChange}
                  />
                </div>
                <input type="submit" value="Register" className="signUpBtn" />
              </form>
            </div>
          </div>
        </div>
      </>
  )
}

export default LoginSignUp;
