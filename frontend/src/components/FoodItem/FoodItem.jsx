import React, { useContext, useMemo, useState } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';

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
    getRatingSummary,
    myRatings,
    rateItem,
    ratingBusyMap,
  } = useContext(StoreContext);

  const currentItemCount = cartItems && cartItems[id] ? cartItems[id] : 0;
  const [hoverStars, setHoverStars] = useState(0);
  const summary = useMemo(() => getRatingSummary(id), [getRatingSummary, id]);
  const my = myRatings?.[id] || 0;
  const displayedFillUpTo = hoverStars || my || Math.round(summary.avg || 0);
  const isBusy = !!ratingBusyMap[id];

  const handleRate = async (stars) => {
    if (isBusy) return;
    await rateItem(id, stars);
  };

  // Smart image handling - check if it's a local asset or server image
  const getImageSrc = () => {
    // If image is a string filename, load from server
    if (typeof image === 'string') {
      // Check if it's one of our local assets (food_33 to food_40)
      const localAssets = {
        'food_33.png': assets.food_33,
        'food_34.png': assets.food_34,
        'food_35.png': assets.food_35,
        'food_36.png': assets.food_36,
        'food_37.png': assets.food_37,
        'food_38.png': assets.food_38,
        'food_39.png': assets.food_39,
        'food_40.png': assets.food_40,
      };
      
      // If it's a local asset, use the imported version
      if (localAssets[image]) {
        return localAssets[image];
      }
      
      // Otherwise, load from server
      return `${url}/images/${image}`;
    }
    
    // If image is already an imported asset, use it directly
    return image;
  };

  return (
    <div className='food-item'>
      <div className='food-item-img-container'>
        <img 
          className='food-item-image' 
          src={getImageSrc()} 
          alt={name}
          onError={(e) => {
            // Fallback to server image if local asset fails
            if (typeof image === 'string' && !e.target.src.includes('/images/')) {
              e.target.src = `${url}/images/${image}`;
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

          <div
            className={`rating-block ${isBusy ? 'rating-busy' : ''}`}
            aria-label={`Rated ${Number(summary.avg || 0).toFixed(1)} out of 5`}
          >
            <div
              className="stars"
              onMouseLeave={() => setHoverStars(0)}
              role="radiogroup"
              aria-label={`Rate ${name}`}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`star ${displayedFillUpTo >= n ? 'filled' : ''}`}
                  onMouseEnter={() => setHoverStars(n)}
                  onClick={() => handleRate(n)}
                  disabled={isBusy}
                  aria-checked={my === n}
                  role="radio"
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  title={`${n} star${n > 1 ? 's' : ''}`}
                >
                  <Star filled={displayedFillUpTo >= n} />
                </button>
              ))}
            </div>

            <span className="rating-text">
              {Number(summary.avg || 0).toFixed(1)} <span className="rating-count">({summary.count || 0})</span>
            </span>
          </div>
        </div>

        <p className="food-item-desc">{desc}</p>
        <p className="food-item-price">{currency}{price}</p>
      </div>
    </div>
  );
};

export default FoodItem;