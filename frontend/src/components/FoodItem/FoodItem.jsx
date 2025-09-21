import React, { useContext, useMemo, useState } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';

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

  // Get rating data
  const summary = useMemo(() => getRatingSummary(id), [getRatingSummary, id]);
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
        <img 
          className='food-item-image' 
          src={getImageUrl(image, name)} 
          alt={name}
          onError={(e) => handleImageError(e, name)}
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

          {/* WORKING RATING SYSTEM - NO ERRORS */}
          <div className={`rating-block ${isBusy ? 'rating-busy' : ''}`}>
            {/* Rating Display */}
            <div className="rating-display">
              <div className="stars-display">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={`star-display ${summary.avgRating >= n ? 'filled' : ''}`}>
                    ⭐
                  </span>
                ))}
              </div>
              <span className="rating-text">
                {summary.avgRating > 0 ? summary.avgRating.toFixed(1) : '0.0'} 
                <span className="rating-count">({summary.totalRatings || 0})</span>
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