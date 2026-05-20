import { NotificationDispatcher } from '../../../NotificationDispatcher.jsx';
import {Navbar} from './Navbar.jsx';

const Header = () => {
  return (
    <div className='NavNotiWrap'>
      <Navbar />
      <NotificationDispatcher/>
    </div>
  );
};

export default Header;
