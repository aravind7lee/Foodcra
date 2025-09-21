import React, { useState, useEffect } from 'react';
import './OfflineNotice.css';

const OfflineNotice = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotice(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotice(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show notice if already offline
    if (!navigator.onLine) {
      setShowNotice(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotice) return null;

  return (
    <div className="offline-notice">
      <div className="offline-content">
        <span className="offline-icon">📡</span>
        <span className="offline-text">
          You're offline. Some features may not work properly.
        </span>
        <button 
          className="offline-dismiss"
          onClick={() => setShowNotice(false)}
          aria-label="Dismiss offline notice"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default OfflineNotice;