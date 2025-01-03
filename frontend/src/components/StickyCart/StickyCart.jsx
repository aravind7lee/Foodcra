import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import './StickyCart.css';
import axios from 'axios';

const StickyCart = () => {
  const { cartItems = {}, food_list, getTotalCartAmount, currency, setCartItems, token } = useContext(StoreContext);
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate total items in the cart
  const totalItems = Object.keys(cartItems).reduce((acc, itemId) => acc + cartItems[itemId], 0);

  // Calculate total cart amount
  const totalAmount = totalItems > 0 ? getTotalCartAmount() : 0;

  // Toggle cart expansion/collapse
  const toggleCart = () => {
    setIsExpanded(!isExpanded);
  };

  // Clear cart functionality
  const clearCart = async () => {
    setCartItems({}); // Reset cartItems to an empty object
    localStorage.setItem('cartItems', JSON.stringify({})); // Clear the cart in local storage

    // If you have an API to update the cart on the server side
    if (token) {
      try {
        await axios.post("https://foodcra-backend.onrender.com/api/cart/clear", {}, { headers: { token } });
      } catch (error) {
        console.error("Error clearing cart on server:", error);
      }
    }
  };

  // Remove individual item from the cart
  const removeItem = (itemId) => {
    const updatedCart = { ...cartItems };
    delete updatedCart[itemId]; // Remove the specific item
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart)); // Update local storage

    // If you have an API to remove the item from the server side cart
    if (token) {
      try {
        axios.post("https://foodcra-backend.onrender.com/api/cart/remove", { itemId }, { headers: { token } });
      } catch (error) {
        console.error("Error removing item from server:", error);
      }
    }
  };

  // Load cart from local storage or backend on component mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, [setCartItems]);

  // Save cart items to local storage whenever cartItems state changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <div className={`sticky-cart ${isExpanded ? 'expanded' : ''}`}>
      <div className="sticky-cart-header" onClick={toggleCart}>
        {/* Display total items and total amount */}
        <span>{totalItems > 0 ? `${totalItems} items` : '0 items'}</span>
        <span>{currency}{totalAmount}</span>
      </div>

      {/* If cart is expanded and there are items, show the list */}
      {isExpanded && totalItems > 0 && (
        <div className="sticky-cart-body">
          <ul>
            {Object.keys(cartItems).map((itemId) => {
              const item = food_list.find((food) => food._id === itemId);
              if (item && cartItems[itemId] > 0) {
                return (
                  <li key={itemId} className="cart-item">
                    <span>{item.name} x {cartItems[itemId]}</span>
                    <span>{currency}{item.price * cartItems[itemId]}</span>
                    <button className="remove-item-btn" onClick={() => removeItem(itemId)}>Remove</button>
                  </li>
                );
              }
              return null;
            })}
          </ul>
          {/* Button to clear the cart */}
          <button className="clear-cart-btn" onClick={clearCart}>
            Clear Cart
          </button>
        </div>
      )}

      {/* If the cart is expanded but has no items, show empty cart message */}
      {isExpanded && totalItems === 0 && (
        <div className="sticky-cart-body">
          <p>Your cart is empty.</p>
        </div>
      )}
    </div>
  );
};

export default StickyCart;
