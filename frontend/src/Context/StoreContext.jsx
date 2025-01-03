import { createContext, useEffect, useState } from "react";
import { food_list as defaultFoodList, menu_list } from "../assets/assets"; // Assuming default food list from assets
import axios from "axios";

export const StoreContext = createContext();

const StoreContextProvider = (props) => {
  const url = "https://foodcra-backend.onrender.com"; // Backend API base URL
  const [food_list, setFoodList] = useState([]); // Food list state from the API
  const [filteredFoodList, setFilteredFoodList] = useState([]); // Filtered food list for search or category
  const [cartItems, setCartItems] = useState({}); // Stores items added to the cart
  const [token, setToken] = useState(""); // Authentication token for API calls
  const [referralPoints, setReferralPoints] = useState(0); // User's referral points
  const [loyaltyPoints, setLoyaltyPoints] = useState(0); // User's loyalty points
  const [groceryList, setGroceryList] = useState([]); // List of ingredients added to the grocery section
  const currency = "₹"; // Currency symbol
  const deliveryCharge = 50; // Flat delivery charge

  // Referral and Loyalty Points Management
  const addReferralPoints = async (referrerId) => {
    if (token) {
      await axios.post(
        url + "/api/referral/add",
        { referrerId },
        { headers: { token } }
      );
      setReferralPoints((prevPoints) => prevPoints + 10); // Example: add 10 points per referral
    }
  };

  const applyReferralDiscount = () => {
    if (referralPoints >= 50) {
      // Discount applied when referral points reach 50 or more
      return 50; // Apply ₹50 discount
    }
    return 0;
  };

  const addLoyaltyPoints = async () => {
    if (token) {
      await axios.post(url + "/api/loyalty/add", {}, { headers: { token } });
      setLoyaltyPoints((prevPoints) => prevPoints + 5); // Example: 5 points per order
    }
  };

  const applyLoyaltyDiscount = () => {
    if (loyaltyPoints >= 100) {
      // Discount when loyalty points reach 100 or more
      return 100; // Apply ₹100 discount
    }
    return 0;
  };

  // Add item to the cart
  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    if (token) {
      await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
      await addLoyaltyPoints(); // Add loyalty points for each order
    }
  };

  // Remove item from the cart
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const updatedCart = { ...prev, [itemId]: prev[itemId] - 1 };
      if (updatedCart[itemId] <= 0) {
        delete updatedCart[itemId]; // Remove item if the count becomes zero
      }
      return updatedCart;
    });
    if (token) {
      await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
    }
  };

  // Calculate total cart amount
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      const itemInfo = food_list.find((product) => product._id === item);
      if (itemInfo && cartItems[item] > 0) {
        totalAmount += itemInfo.price * cartItems[item];
      }
    }
    return totalAmount - applyReferralDiscount() - applyLoyaltyDiscount(); // Subtract discounts
  };

  // Fetch the food list from the backend API
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      setFoodList(response.data.data);
    } catch (error) {
      console.error("Error fetching food list:", error);
    }
  };

  // Load cart data for authenticated users
  const loadCartData = async (token) => {
    try {
      const response = await axios.post(url + "/api/cart/get", {}, { headers: { token } });
      setCartItems(response.data.cartData || {});
    } catch (error) {
      console.error("Error loading cart data:", error);
    }
  };

  // Load initial data when the component mounts
  useEffect(() => {
    async function loadData() {
      await fetchFoodList(); // Fetch the food list when the component mounts
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        await loadCartData(storedToken);
      }
    }
    loadData();
  }, []);

  // Add ingredients to grocery list
  const addIngredientsToGrocery = (ingredients) => {
    setGroceryList((prev) => [...prev, ...ingredients]);
  };

  // Context value to provide to child components
  const contextValue = {
    url,
    food_list,
    filteredFoodList,
    setFilteredFoodList,
    menu_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    token,
    setToken,
    loadCartData,
    setCartItems,
    currency,
    deliveryCharge,
    referralPoints,
    loyaltyPoints,
    addReferralPoints,
    applyReferralDiscount,
    applyLoyaltyDiscount,
    groceryList,
    addIngredientsToGrocery,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
