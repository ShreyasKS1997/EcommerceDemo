import './sidebar.css';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PostAddIcon from '@mui/icons-material/PostAdd';
import {Add} from '@mui/icons-material';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';

const Sidebar = () => {

  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split('/');
  const currentRouteName = pathnames[pathnames.length - 1];

  return (
    <div className="sidebar">

      <Link className={`sideBarButton ${currentRouteName === 'dashboard' ? 'sidebarActive' : 'sidebarInactive'}`} to="/admin/dashboard">
          <DashboardIcon /> Dashboard
      </Link>


        <SimpleTreeView
        defaultExpandedItems={currentRouteName === 'products' || currentRouteName === 'create' || (pathnames[pathnames.length - 2] === 'product' && params.id) ? ['1'] : []}
          slots={{
            expandIcon: ExpandMoreIcon,
            collapseIcon: ImportExportIcon,
            endIcon: ExpandMoreIcon,
          }}
        >
          <TreeItem itemId="1" label="Products" slotProps={{
            content: {sx: {padding: '25px'}}, iconContainer: {sx: {marginLeft: '10px'}}
            }}
            sx={{
            backgroundColor: `${(currentRouteName === 'products' || currentRouteName === 'create' || (pathnames[pathnames.length - 2] === 'product' && params.id)) ? 'rgb(67, 84, 179)' : 'white'}`,
            color: `${(currentRouteName === 'products' || currentRouteName === 'create' || (pathnames[pathnames.length - 2] === 'product' && params.id)) ? 'white' : 'black'}`
          }}
          >
              <TreeItem itemId="2" sx={{
                backgroundColor: `${(currentRouteName === 'products' || (pathnames[pathnames.length - 2] === 'product' && params.id)) ? 'rgb(133, 111, 255)' : 'white'}`,
                color: `${(currentRouteName === 'products' || (pathnames[pathnames.length - 2] === 'product' && params.id)) ? 'white' : 'black'}`
              }} onClick={() => navigate('/admin/products')} label="All" slots={{icon: PostAddIcon}}
              slotProps={{content: {sx: {padding: '10px 50px'}}}}/>
              <TreeItem itemId="3" sx={{
                backgroundColor: `${(currentRouteName === 'create') ? 'rgb(133, 111, 255)' : 'white'}`,
                color: `${(currentRouteName === 'create') ? 'white' : 'black'}`
              }}  onClick={() => navigate('/admin/product/create')} label="Create" slots={{
                icon: Add
              }} slotProps={{content: {sx: {padding: '10px 50px'}}}}/>
          </TreeItem>
        </SimpleTreeView>


      <Link className={`sideBarButton ${currentRouteName === 'orders' || (pathnames[pathnames.length - 2] === 'order' && params.id) ? 'sidebarActive' : 'sidebarInactive'}`} to="/admin/orders">
          <ListAltIcon />
          Orders
      </Link>

      <Link className={`sideBarButton ${currentRouteName === 'users' || (pathnames[pathnames.length - 2] === 'user' && params.id) ? 'sidebarActive' : 'sidebarInactive'}`} to="/admin/users">
          <PeopleIcon /> Users
      </Link>

      <Link className={`sideBarButton ${currentRouteName === 'reviews' ? 'sidebarActive' : 'sidebarInactive'}`} to="/admin/reviews">
          <RateReviewIcon />
          Reviews
      </Link>
    </div>
  );
};

export default Sidebar;
