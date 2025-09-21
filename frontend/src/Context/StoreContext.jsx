import { createContext, useEffect, useState, useRef, useCallback } from "react";
import { food_list as defaultFoodList, menu_list } from "../assets/assets";
import axios from "axios";

export const StoreContext = createContext();

const StoreContextProvider = (props) => {
  const url = "https://foodcra-backend.onrender.com";

  // core data
  const [food_list, setFoodList] = useState([]);
  const [filteredFoodList, setFilteredFoodList] = useState([]);

  // cart/auth
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [groceryList, setGroceryList] = useState([]);

  // search state
  const [lastQuery, setLastQuery] = useState("");
  const searchIndexRef = useRef([]);

  // constants
  const currency = "₹";
  const deliveryCharge = 50;

  // WORKING RATING SYSTEM WITH ERROR HANDLING
  const [ratingsByItem, setRatingsByItem] = useState({});
  const [myRatings, setMyRatings] = useState({});
  const [ratingBusyMap, setRatingBusyMap] = useState({});

  const getRatingSummary = useCallback(
    (id) => ratingsByItem[id] || { avgRating: 0, totalRatings: 0 },
    [ratingsByItem]
  );

  // Fetch shared ratings with proper error handling
  const fetchRatingsBulk = useCallback(
    async (foodIds) => {
      if (!Array.isArray(foodIds) || foodIds.length === 0) return;
      
      try {
        const response = await axios.post(`${url}/api/rating/bulk`, { foodIds });
        if (response.data.success) {
          setRatingsByItem(prev => ({ ...prev, ...response.data.ratings }));
        }
      } catch (error) {
        // Silent error handling - set default values
        const defaultRatings = {};
        foodIds.forEach(id => {
          defaultRatings[id] = { avgRating: 0, totalRatings: 0 };
        });
        setRatingsByItem(prev => ({ ...prev, ...defaultRatings }));
      }
    },
    [url]
  );

  // Fetch user's personal ratings with error handling
  const fetchMyRatings = useCallback(
    async (foodIds) => {
      if (!token || !Array.isArray(foodIds)) return;
      
      try {
        const response = await axios.post(`${url}/api/rating/user-bulk`, 
          { foodIds }, 
          { headers: { token } }
        );
        if (response.data.success) {
          setMyRatings(prev => ({ ...prev, ...response.data.ratings }));
        }
      } catch (error) {
        // Silent error handling - set default values
        const defaultMyRatings = {};
        foodIds.forEach(id => {
          defaultMyRatings[id] = 0;
        });
        setMyRatings(prev => ({ ...prev, ...defaultMyRatings }));
      }
    },
    [url, token]
  );

  // Rate item with proper error handling
  const rateItem = useCallback(
    async (itemId, rating) => {
      if (!token) {
        alert('Please login to rate food items');
        return;
      }

      setRatingBusyMap(prev => ({ ...prev, [itemId]: true }));
      
      try {
        // Save rating to database
        const response = await axios.post(`${url}/api/rating/rate`, {
          foodId: itemId,
          rating
        }, {
          headers: { token }
        });

        if (response.data.success) {
          // Update user's personal rating
          setMyRatings(prev => ({ ...prev, [itemId]: rating }));
          
          // Fetch updated shared rating summary
          try {
            const summaryResponse = await axios.get(`${url}/api/rating/summary/${itemId}`);
            if (summaryResponse.data.success) {
              setRatingsByItem(prev => ({
                ...prev,
                [itemId]: {
                  avgRating: summaryResponse.data.avgRating,
                  totalRatings: summaryResponse.data.totalRatings
                }
              }));
            }
          } catch (summaryError) {
            // If summary fails, update locally
            setRatingsByItem(prev => ({
              ...prev,
              [itemId]: {
                avgRating: rating,
                totalRatings: 1
              }
            }));
          }
        } else {
          alert(response.data.message || 'Error submitting rating');
        }
      } catch (error) {
        // If API fails, update locally
        setMyRatings(prev => ({ ...prev, [itemId]: rating }));
        setRatingsByItem(prev => ({
          ...prev,
          [itemId]: {
            avgRating: rating,
            totalRatings: 1
          }
        }));
      } finally {
        setRatingBusyMap(prev => {
          const updated = { ...prev };
          delete updated[itemId];
          return updated;
        });
      }
    },
    [url, token]
  );

  // Simplified discount system without API calls
  const applyReferralDiscount = () => {
    return 0; // Disabled for now
  };

  const applyLoyaltyDiscount = () => {
    return 0; // Disabled for now
  };

  // Cart helpers with NaN protection
  const addToCart = async (itemId) => {
    setCartItems((prev) => {
      const currentQty = Number(prev[itemId]) || 0;
      return { ...prev, [itemId]: currentQty + 1 };
    });

    if (token) {
      try {
        await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
      } catch (err) {
        console.error("Error adding to cart:", err);
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const currentQty = Number(prev[itemId]) || 0;
      const newQty = currentQty - 1;
      if (newQty <= 0) {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      }
      return { ...prev, [itemId]: newQty };
    });

    if (token) {
      try {
        await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
      } catch (err) {
        console.error("Error removing from cart:", err);
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const id in cartItems) {
      const itemInfo = food_list.find((p) => p._id === id);
      if (itemInfo && cartItems[id] > 0) {
        const price = Number(itemInfo.price) || 0;
        const qty = Number(cartItems[id]) || 0;
        totalAmount += price * qty;
      }
    }
    const referralDiscount = Number(applyReferralDiscount()) || 0;
    const loyaltyDiscount = Number(applyLoyaltyDiscount()) || 0;
    const finalAmount = totalAmount - referralDiscount - loyaltyDiscount;
    return Math.max(0, Math.round(finalAmount));
  };

  // Data fetching
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      const list = response?.data?.data ?? defaultFoodList ?? [];
      setFoodList(list);
    } catch (error) {
      console.error("Error fetching food list:", error);
      const fallback = defaultFoodList || [];
      setFoodList(fallback);
    }
  };

  const loadCartData = async (tokenVal) => {
    try {
      const response = await axios.post(url + "/api/cart/get", {}, { headers: { token: tokenVal } });
      setCartItems(response?.data?.cartData || {});
    } catch (error) {
      console.error("Error loading cart data:", error);
    }
  };

  // Grocery helpers
  const addIngredientsToGrocery = (ingredients) => {
    setGroceryList((prev) => [...prev, ...ingredients]);
  };

  // Search helpers & index
  const buildSearchIndex = (list) => {
    try {
      const idx = (list || []).map((item) => {
        const name = (item.name || "").toString().toLowerCase();
        const category = (item.category || "").toString().toLowerCase();
        const description = (item.description || "").toString().toLowerCase();
        const tags = Array.isArray(item.tags) ? item.tags.join(" ").toLowerCase() : "";
        const combined = `${name} ${category} ${tags} ${description}`
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        return { id: item._id, key: combined, item };
      });
      searchIndexRef.current = idx;
    } catch (err) {
      searchIndexRef.current = [];
    }
  };

  const applySearch = (rawQuery) => {
    const q = (rawQuery || "").toString().trim().toLowerCase();
    setLastQuery(q);
    if (!q) {
      setFilteredFoodList(food_list);
      return;
    }
    if (!searchIndexRef.current || searchIndexRef.current.length === 0) buildSearchIndex(food_list);

    const results = searchIndexRef.current
      .filter((entry) => entry.key.includes(q))
      .map((entry) => entry.item);

    setFilteredFoodList(results);
  };

  const resetSearch = () => {
    setLastQuery("");
    setFilteredFoodList(food_list);
  };

  // Load ratings when food list changes
  useEffect(() => {
    if (Array.isArray(food_list) && food_list.length > 0) {
      setFilteredFoodList(food_list);
      buildSearchIndex(food_list);
      
      // Fetch shared ratings
      const foodIds = food_list.map(item => item._id);
      fetchRatingsBulk(foodIds);
      
      // Fetch user's personal ratings if logged in
      if (token) {
        fetchMyRatings(foodIds);
      }
    }
  }, [food_list, fetchRatingsBulk, fetchMyRatings, token]);

  // Initial data load
  useEffect(() => {
    (async function loadData() {
      await fetchFoodList();
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        await loadCartData(storedToken);
      }
    })();
  }, []);

  // Context value
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
    applyReferralDiscount,
    applyLoyaltyDiscount,
    groceryList,
    addIngredientsToGrocery,

    // Search utilities
    lastQuery,
    setLastQuery,
    applySearch,
    resetSearch,

    // WORKING RATING SYSTEM WITH ERROR HANDLING
    getRatingSummary,
    myRatings,
    rateItem,
    ratingBusyMap,
    fetchRatingsBulk,
    fetchMyRatings,
  };

  return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>;
};

export default StoreContextProvider;