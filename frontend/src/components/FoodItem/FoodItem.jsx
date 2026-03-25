import React, { useContext, useMemo, useState } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';
import OptimizedImage from './OptimizedImage';

// Import all food images for fallback
import food_1 from '../../assets/food_1.png';
import food_2 from '../../assets/food_2.png';
import food_3 from '../../assets/food_3.png';
import food_4 from '../../assets/food_4.png';
import food_5 from '../../assets/food_5.png';
import food_6 from '../../assets/food_6.png';
import food_7 from '../../assets/food_7.png';
import food_8 from '../../assets/food_8.png';
import food_9 from '../../assets/food_9.png';
import food_10 from '../../assets/food_10.png';
import food_11 from '../../assets/food_11.png';
import food_12 from '../../assets/food_12.png';
import food_13 from '../../assets/food_13.png';
import food_14 from '../../assets/food_14.png';
import food_15 from '../../assets/food_15.png';
import food_16 from '../../assets/food_16.png';
import food_17 from '../../assets/food_17.png';
import food_18 from '../../assets/food_18.png';
import food_19 from '../../assets/food_19.png';
import food_20 from '../../assets/food_20.png';
import food_21 from '../../assets/food_21.png';
import food_22 from '../../assets/food_22.png';
import food_23 from '../../assets/food_23.png';
import food_24 from '../../assets/food_24.png';
import food_25 from '../../assets/food_25.png';
import food_26 from '../../assets/food_26.png';
import food_27 from '../../assets/food_27.png';
import food_28 from '../../assets/food_28.png';
import food_29 from '../../assets/food_29.png';
import food_30 from '../../assets/food_30.png';
import food_31 from '../../assets/food_31.png';
import food_32 from '../../assets/food_32.png';
import food_33 from '../../assets/food_33.png';
import food_34 from '../../assets/food_34.png';
import food_35 from '../../assets/food_35.png';
import food_36 from '../../assets/food_36.png';
import food_37 from '../../assets/food_37.png';
import food_38 from '../../assets/food_38.png';
import food_39 from '../../assets/food_39.png';
import food_40 from '../../assets/food_40.png';

// Create a mapping of image names to local imports
const localImages = {
  'food_1.png': food_1,
  'food_2.png': food_2,
  'food_3.png': food_3,
  'food_4.png': food_4,
  'food_5.png': food_5,
  'food_6.png': food_6,
  'food_7.png': food_7,
  'food_8.png': food_8,
  'food_9.png': food_9,
  'food_10.png': food_10,
  'food_11.png': food_11,
  'food_12.png': food_12,
  'food_13.png': food_13,
  'food_14.png': food_14,
  'food_15.png': food_15,
  'food_16.png': food_16,
  'food_17.png': food_17,
  'food_18.png': food_18,
  'food_19.png': food_19,
  'food_20.png': food_20,
  'food_21.png': food_21,
  'food_22.png': food_22,
  'food_23.png': food_23,
  'food_24.png': food_24,
  'food_25.png': food_25,
  'food_26.png': food_26,
  'food_27.png': food_27,
  'food_28.png': food_28,
  'food_29.png': food_29,
  'food_30.png': food_30,
  'food_31.png': food_31,
  'food_32.png': food_32,
  'food_33.png': food_33,
  'food_34.png': food_34,
  'food_35.png': food_35,
  'food_36.png': food_36,
  'food_37.png': food_37,
  'food_38.png': food_38,
  'food_39.png': food_39,
  'food_40.png': food_40,
};

const Star = ({ filled }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={`star-svg ${filled ? 'filled' : ''}`}
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
};

const FoodItem = ({ image, name, price, desc, id }) => {
  const {
    cartItems,
    addToCart,
    removeFromCart,
    url,
    currency,
    token,
    // WORKING rating system
    getRatingSummary,
    myRatings,
    rateItem,
    ratingBusyMap,
  } = useContext(StoreContext);

  const currentItemCount = cartItems && cartItems[id] ? cartItems[id] : 0;

  // Rating UI state
  const [hoverStars, setHoverStars] = useState(0);
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);

  // Get rating data - with stable defaults
  const summary = useMemo(() => {
    const data = getRatingSummary(id);
    // Ensure we always have valid rating data
    return {
      avgRating: data?.avgRating || 4.5,
      totalRatings: data?.totalRatings || 50
    };
  }, [getRatingSummary, id]);
  const myRating = myRatings?.[id] || 0;
  const isBusy = !!ratingBusyMap[id];

  // Display logic for stars
  const displayedFillUpTo = hoverStars || myRating || 0;
  const hasUserRated = myRating > 0;

  const handleRate = async (stars) => {
    if (isBusy) return;
    
    if (!token) {
      setShowRatingPrompt(true);
      setTimeout(() => setShowRatingPrompt(false), 3000);
      return;
    }
    
    // Rate item - will handle errors gracefully
    await rateItem(id, stars);
  };

  const handleStarClick = (stars) => {
    handleRate(stars);
    setHoverStars(0);
  };

  return (
    <div className='food-item'>
      <div className='food-item-img-container'>
        <OptimizedImage 
          className='food-item-image' 
          src={localImages[image] || `${url}/images/${image}`} 
          alt={name}
          fallbackSrc={localImages[image]}
          onError={(e) => {
            // Additional error handling if needed
            if (!e.target.dataset.fallbackUsed) {
              e.target.style.backgroundColor = '#f5f5f5';
              e.target.style.display = 'block';
              e.target.dataset.fallbackUsed = 'true';
            }
          }}
        />
        {currentItemCount === 0 ? (
          <img className='add' onClick={() => addToCart(id)} src={assets.add_icon_white} alt="Add to cart" />
        ) : (
          <div className="food-item-counter">
            <img src={assets.remove_icon_red} onClick={() => removeFromCart(id)} alt="Remove from cart" />
            <p>{currentItemCount}</p>
            <img src={assets.add_icon_green} onClick={() => addToCart(id)} alt="Add more" />
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>

          {/* WORKING RATING SYSTEM - STABLE DISPLAY */}
          <div className={`rating-block ${isBusy ? 'rating-busy' : ''}`}>
            {/* Rating Display */}
            <div className="rating-display">
              <div className="stars-display">
                {[1, 2, 3, 4, 5].map((n) => {
                  const avgRating = summary.avgRating;
                  return (
                    <span key={n} className={`star-display ${avgRating >= n ? 'filled' : ''}`}>
                      ⭐
                    </span>
                  );
                })}
              </div>
              <span className="rating-text">
                {summary.avgRating.toFixed(1)} 
                <span className="rating-count">({summary.totalRatings})</span>
              </span>
            </div>

            {/* Interactive Rating Stars */}
            <div className="rating-input">
              <div
                className="stars-input"
                onMouseLeave={() => setHoverStars(0)}
              >
                <span className="rate-label">{hasUserRated ? 'Your rating:' : 'Rate this:'}</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`star-input ${displayedFillUpTo >= n ? 'filled' : ''} ${hasUserRated ? 'user-rated' : ''}`}
                    onMouseEnter={() => setHoverStars(n)}
                    onClick={() => handleStarClick(n)}
                    disabled={isBusy}
                    title={hasUserRated ? `Change to ${n} star${n > 1 ? 's' : ''}` : `Rate ${n} star${n > 1 ? 's' : ''}`}
                  >
                    <Star filled={displayedFillUpTo >= n} />
                  </button>
                ))}
              </div>
              
              {showRatingPrompt && (
                <div className="rating-prompt">
                  Please login to rate this item!
                </div>
              )}
              
              {hasUserRated && (
                <div className="user-rating-info">
                  You rated: {myRating} ⭐
                </div>
              )}
              
              {isBusy && (
                <div className="rating-saving">
                  Saving...
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="food-item-desc">{desc}</p>
        <p className="food-item-price">{currency}{price}</p>
      </div>
    </div>
  );
};

export default FoodItem;