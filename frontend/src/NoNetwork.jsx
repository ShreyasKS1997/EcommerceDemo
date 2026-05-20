import SignalCellularNodataIcon from '@mui/icons-material/SignalCellularNodata';
import './NoNetwork.css';

export const NoNetwork = () => {
    return (
        <div className='noNetwork'>
            <SignalCellularNodataIcon />
            <h2>Something went wrong<br /></h2>
            <h3>Check your internet and refresh the page</h3>
        </div>
    );
};