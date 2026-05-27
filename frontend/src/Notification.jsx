import { useEffect } from 'react';
import './Notification.css';
import { GridCloseIcon } from '@mui/x-data-grid';
import {InfoOutlined, CheckCircleOutline, ErrorOutline} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { removeNotification } from './SliceThunks/utils';

export const Notification = ({id, message, errorType = 'info'}) => {

    const dispatch = useDispatch();

    const handleCloseButtonClick = () => dispatch(removeNotification(id));

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            dispatch(removeNotification(id));
        }, 5000);
        return () => {
            clearTimeout(timeoutId);
        }
    },[]);

    return (
        <>
            <div className={`${errorType === 'info' && 'notificationBodyInfo'} 
                                ${errorType === 'error' && 'notificationBodyError'} 
                                ${errorType === 'success' && 'notificationBodySuccess'}
                                notificationBody`}>
                {errorType === 'success' && <CheckCircleOutline/>}
                {errorType === 'error' && <ErrorOutline/>}
                {errorType === 'info' && <InfoOutlined/>}
                <div className='notificationText'>{message}</div>
                <GridCloseIcon onClick={handleCloseButtonClick} />
            </div>
        </>
    );
}