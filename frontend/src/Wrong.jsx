import ErrorIcon from '@mui/icons-material/Error';
import './Wrong.css';

export const Wrong = ({status}) => {
    return (
        <div className='wrong'>
            <ErrorIcon/>
            <h2>Could not load the page</h2>
            <h3>Reload or try again later</h3>
            <h4>{`Error ${status}`}</h4>
        </div>
    )
}