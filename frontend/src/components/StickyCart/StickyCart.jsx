import React, { useContext, useState, useEffect, useRef } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import './StickyCart.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StickyCart = () => {
  const { 
    cartItems = {}, 
    food_list, 
    getTotalCartAmount, 
    currency, 
    setCartItems, 
    token
  } = useContext(StoreContext);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const previousTotal = useRef(0);
  
  const DELIVERY_THRESHOLD = 500;
  const totalItems = Object.keys(cartItems).reduce((acc, itemId) => acc + cartItems[itemId], 0);
  const totalAmount = getTotalCartAmount();
  const progressPercentage = Math.min(100, (totalAmount / DELIVERY_THRESHOLD) * 100);
  const loyaltyPoints = Math.floor(totalAmount * 0.15);

  const navigate = useNavigate();
  
  const deliveryStatus = totalAmount >= DELIVERY_THRESHOLD 
    ? 'FREE delivery unlocked! 🎉' 
    : `${currency}${DELIVERY_THRESHOLD - totalAmount} more for FREE delivery!`;

  useEffect(() => {
    if (!isExpanded) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev <= 1 ? 0 : prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isExpanded]);

  useEffect(() => {
    if (totalItems === 0 && previousTotal.current > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    previousTotal.current = totalItems;
  }, [totalItems]);

  const toggleCart = () => setIsExpanded(!isExpanded);

  const clearCart = async () => {
    setCartItems({});
    localStorage.setItem('cartItems', JSON.stringify({}));

    if (token) {
      try {
        await axios.post("https://foodcra-backend.onrender.com/api/cart/clear", {}, { headers: { token } });
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    }
  };

  const removeItem = (itemId) => {
    const updatedCart = { ...cartItems };
    delete updatedCart[itemId];
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));

    if (token) {
      axios.post("https://foodcra-backend.onrender.com/api/cart/remove", { itemId }, { headers: { token } })
        .catch(error => console.error("Error removing item:", error));
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) return removeItem(itemId);
    
    const updatedCart = { ...cartItems, [itemId]: newQuantity };
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`sticky-cart ${isExpanded ? 'expanded' : ''}`}>
      {showConfetti && (
        <div className="confetti-effect">
          {Array.from({ length: 50 }).map((_, i) => (
            <div 
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`
              }}
            />
          ))}
        </div>
      )}
      
      <div 
        className="sticky-cart-header"
        onClick={toggleCart}
      >
        <div className="cart-icon">
          <svg viewBox="0 0 24 24">
            <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z" />
          </svg>
          {totalItems > 0 && (
            <span className={`cart-badge ${totalItems !== previousTotal.current ? 'bounce' : ''}`}>
              {totalItems}
            </span>
          )}
        </div>
        
        <div className="cart-summary">
          <span className={totalItems !== previousTotal.current ? 'pulse' : ''}>
            {totalItems > 0 ? `${totalItems} item${totalItems !== 1 ? 's' : ''}` : 'Cart is empty'}
          </span>
          
          <span className={`total-amount ${totalAmount !== previousTotal.current ? 'pulse' : ''}`}>
            {currency}{totalAmount.toFixed(2)}
          </span>
        </div>
        
        <div className="cart-toggle">
          {isExpanded ? '▲' : '▼'}
        </div>
      </div>
      
      {isExpanded && (
        <div className="sticky-cart-body">
          <div className="cart-header">
            <h3>Your Order</h3>
            <button className="close-cart" onClick={toggleCart}>
              ✕
            </button>
          </div>
          
          <div className="delivery-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {deliveryStatus}
            </div>
          </div>
          
          <div className="loyalty-points">
            <div className="coin-icon">🪙</div>
            Order now to earn <span className="points">{loyaltyPoints}</span> coins!
          </div>
          
          <div className="limited-offer">
            <span className="fire-icon">🔥</span> 
            Limited time offer! 
            <span className="countdown">
              {formatTime(timeLeft)}
            </span>
          </div>
          
          <div className="cart-items-container">
            {totalItems > 0 ? (
              Object.keys(cartItems).map((itemId) => {
                const item = food_list.find(food => food._id === itemId);
                if (!item || cartItems[itemId] <= 0) return null;
                
                return (
                  <div
                    key={itemId}
                    className="cart-item-card"
                  >
                    <div className="item-details">
                      <div className="item-header">
                        <div className="item-name">{item.name}</div>
                      </div>
                      
                      <div className="item-controls">
                        <div className="quantity-controls">
                          <button 
                            onClick={() => updateQuantity(itemId, cartItems[itemId] - 1)}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span>{cartItems[itemId]}</span>
                          <button 
                            onClick={() => updateQuantity(itemId, cartItems[itemId] + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="item-total">
                          {currency}{(item.price * cartItems[itemId]).toFixed(2)}
                        </div>
                      </div>
                      
                      <button 
                        className="remove-item"
                        onClick={() => removeItem(itemId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-cart-message">
                <div className="empty-icon">🛒</div>
                <p>Your cart is empty</p>
                <p>Add delicious items to get started!</p>
              </div>
            )}
          </div>
          
          {totalItems > 0 && (
            <div className="cart-summary-section">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{currency}{totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="summary-row discount">
                <span>Delivery Fee</span>
                <span>{totalAmount >= DELIVERY_THRESHOLD ? 'FREE' : `${currency}50.00`}</span>
              </div>
              
              <div className="summary-row total">
                <span>Total</span>
                <span>
                  {currency}{totalAmount >= DELIVERY_THRESHOLD ? totalAmount.toFixed(2) : (totalAmount + 50).toFixed(2)}
                </span>
              </div>
              
              <div className="action-buttons">
                <button 
                  className="checkout-btn"
                  onClick={() => navigate('/order')}
                >
                  Proceed to Checkout
                </button>
                
                <button 
                  className="clear-cart-btn"
                  onClick={clearCart}
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StickyCart;