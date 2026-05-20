import { Outlet } from 'react-router-dom';
import Footer from './Footer/Footer';
import Header from './Header/Header';
import './Layout.css';

const Layout = () => {

  return (
    <div className="appShell">
      <Header />
      <main className="appMain">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
