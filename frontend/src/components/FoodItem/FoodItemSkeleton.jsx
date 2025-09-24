import React from 'react';
import './FoodItem.css';

const FoodItemSkeleton = () => {
  return (
    <div className='food-item skeleton'>
      <div className='food-item-img-container'>
        <div className='food-item-image skeleton-image'></div>
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <div className="skeleton-text skeleton-title"></div>
          <div className="skeleton-text skeleton-rating"></div>
        </div>
        <div className="skeleton-text skeleton-desc"></div>
        <div className="skeleton-text skeleton-price"></div>
      </div>
    </div>
  );
};

export default FoodItemSkeleton;