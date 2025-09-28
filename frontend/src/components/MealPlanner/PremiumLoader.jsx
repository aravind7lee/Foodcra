import React from 'react';
import './PremiumLoader.css';

const PremiumLoader = ({ message = "Generating your perfect meal plan..." }) => {
  return (
    <div className="premium-loader">
      <div className="loader-content">
        <div className="loader-animation">
          <div className="food-icons">
            <span className="food-icon">🍽️</span>
            <span className="food-icon">🥗</span>
            <span className="food-icon">🍝</span>
            <span className="food-icon">🍛</span>
            <span className="food-icon">🥩</span>
          </div>
          <div className="loader-circle">
            <div className="loader-inner"></div>
          </div>
        </div>
        <div className="loader-text">
          <h3>{message}</h3>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumLoader;