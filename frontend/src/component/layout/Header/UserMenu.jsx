import { useDispatch, useSelector } from 'react-redux';
import './UserMenu.css';
import { getActiveAccountDetails } from '../../../authSelectors';
import { useNavigate } from 'react-router-dom';
import { logoutAll } from '../../../actions/userSliceThunks';

export const UserMenu = () => {

    const dispatch = useDispatch();
    const user = useSelector(getActiveAccountDetails);
    const navigate = useNavigate();

    return (
        <div className="userMenuContainer">
            {/*user.role === 'admin' && <a href='/admin/dashboard' className="userMenuContainerElement dashboardMenu">Dashboard</a>*/}
            <a href='/orders' className="userMenuContainerElement ordersMenu">Orders</a>
            <a href='/account' className="userMenuContainerElement profileMenu">Profile</a>
            <a href='/cart' className="userMenuContainerElement cardMenu">Cart</a>
            <a href='/login' onClick={async (e) => { e.preventDefault(); dispatch(logoutAll()); navigate('/login'); }} className="userMenuContainerElement logoutMenu">Logout</a>
        </div>
    )
}