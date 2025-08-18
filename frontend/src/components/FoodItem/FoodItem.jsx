import React, { useContext, useMemo, useState } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';

const Star = ({ filled }) => {
  // Inline SVG so we don’t depend on extra images for interactive stars
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

    // ratings
    getRatingSummary,
    myRatings,
    rateItem,
    ratingBusyMap,
  } = useContext(StoreContext);

  const currentItemCount = cartItems && cartItems[id] ? cartItems[id] : 0;

  // local UI state for hover/preview
  const [hoverStars, setHoverStars] = useState(0);

  // current aggregated summary & my rating
  const summary = useMemo(() => getRatingSummary(id), [getRatingSummary, id]);
  const my = myRatings?.[id] || 0;

  const displayedFillUpTo = hoverStars || my || Math.round(summary.avg || 0);
  const isBusy = !!ratingBusyMap[id];

  const handleRate = async (stars) => {
    if (isBusy) return;
    // optimistic UI is handled in StoreContext; we just call it
    await rateItem(id, stars);
  };

  return (
    <div className='food-item'>
      <div className='food-item-img-container'>
        <img className='food-item-image' src={`${url}/images/${image}`} alt={name} />
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

          {/* INTERACTIVE RATING */}
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
