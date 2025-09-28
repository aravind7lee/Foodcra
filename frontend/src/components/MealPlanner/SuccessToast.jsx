import React, { useEffect, useState } from 'react';
import './SuccessToast.css';

const SuccessToast = ({ message, isVisible, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !show) return null;

  return (
    <div className={`success-toast ${show ? 'show' : 'hide'}`}>
      <div className="toast-content">
        <div className="toast-icon">🎉</div>
        <div className="toast-message">
          <h4>Success!</h4>
          <p>{message}</p>
        </div>
        <button className="toast-close" onClick={() => setShow(false)}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default SuccessToast;