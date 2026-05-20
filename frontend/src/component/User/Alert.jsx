import './Alert.css';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import AlertContainer from '../Alert/AlertElement';

function Alert({ message, icon, autoHide, closeMessage }) {
  const [transform, setTransform] = useState(-200);

  const [buttonClicked, setButtonClicked] = useState(false);

  const [messagedepcpy, setMessagedepcpy] = useState('');

  const alertDig = useRef();

  useEffect(() => {
    if (buttonClicked === false) {
      setTransform(0);
    }

    if (message) {
      setMessagedepcpy(message);
      AlertContainer({ alertDig });
    }
    if (autoHide > 0) {
      const timeout = setTimeout(() => {
        setTransform(-200);
      }, autoHide);
      return () => {
        clearTimeout(timeout);
        setButtonClicked(false);
        closeMessage();
      };
    }
  }, [message]);

  return (
    <div
      style={{ transform: `translateY(${transform}%) translateX(-50%)` }}
      className="alertDialog"
      ref={alertDig}
    >
      <div className="errorIcon">{icon}</div>
      <div className="alertMessage">{messagedepcpy}</div>

      <div className="closeIcon">
        <Button
          onClick={() => {
            closeMessage();
            setTransform(-200);
            setButtonClicked(true);
          }}
          style={{ color: 'white' }}
        >
          <CloseIcon />
        </Button>
      </div>
    </div>
  );
}

export default Alert;
