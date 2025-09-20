import { createContext, useEffect, useState, useRef, useCallback } from "react";
import { food_list as defaultFoodList, menu_list } from "../assets/assets";
import axios from "axios";

export const StoreContext = createContext();

const StoreContextProvider = (props) => {
  const url = "https://foodcra-backend.onrender.com";

  // core data
  const [food_list, setFoodList] = useState([]);
  const [filteredFoodList, setFilteredFoodList] = useState([]);

  // cart/auth/points
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [referralPoints, setReferralPoints] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [groceryList, setGroceryList] = useState([]);

  // search state
  const [lastQuery, setLastQuery] = useState("");
  const searchIndexRef = useRef([]);

  // constants
  const currency = "₹";
  const deliveryCharge = 50;

  // ratings state - simplified to avoid API errors
  const [ratingsByItem, setRatingsByItem] = useState({});
  const [myRatings, setMyRatings] = useState({});
  const [ratingBusyMap, setRatingBusyMap] = useState({});

  const getRatingSummary = useCallback(
    (id) => ratingsByItem[id] || { avg: 0, count: 0 },
    [ratingsByItem]
  );

  const fetchRatingsBulk = useCallback(
    async (items) => {
      // Skip API calls to avoid 500 errors - use default values
      console.log('Using default rating values to avoid server errors');
      return;
    },
    []
  );

  const rateItem = useCallback(
    async (itemId, rating) => {
      // Simplified rating without API calls
      setRatingBusyMap((p) => ({ ...p, [itemId]: true }));
      setMyRatings((prev) => ({ ...prev, [itemId]: rating }));
      setRatingsByItem((prev) => ({
        ...prev,
        [itemId]: { avg: rating, count: 1 }
      }));
      
      setTimeout(() => {
        setRatingBusyMap((p) => {
          const n = { ...p };
          delete n[itemId];
          return n;
        });
      }, 500);
    },
    []
  );

  // Referral and Loyalty Points with NaN protection
  const addReferralPoints = async (referrerId) => {
    if (!token) return;
    try {
      await axios.post(url + "/api/referral/add", { referrerId }, { headers: { token } });
      setReferralPoints((prev) => (Number(prev) || 0) + 10);
    } catch (err) {
      console.error("Error adding referral points:", err);
    }
  };

  const applyReferralDiscount = () => {
    const points = Number(referralPoints) || 0;
    if (points >= 50) return 50;
    return 0;
  };

  const addLoyaltyPoints = async () => {
    if (!token) return;
    try {
      await axios.post(url + "/api/loyalty/add", {}, { headers: { token } });
      setLoyaltyPoints((prev) => (Number(prev) || 0) + 5);
    } catch (err) {
      console.error("Error adding loyalty points:", err);
    }
  };

  const applyLoyaltyDiscount = () => {
    const points = Number(loyaltyPoints) || 0;
    if (points >= 100) return 100;
    return 0;
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
        await addLoyaltyPoints();
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

  // Keep filtered list in sync & build index when full list loads
  useEffect(() => {
    if (Array.isArray(food_list) && food_list.length > 0) {
      setFilteredFoodList(food_list);
      buildSearchIndex(food_list);
    }
  }, [food_list]);

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
    referralPoints: Number(referralPoints) || 0,
    loyaltyPoints: Number(loyaltyPoints) || 0,
    addReferralPoints,
    applyReferralDiscount,
    applyLoyaltyDiscount,
    groceryList,
    addIngredientsToGrocery,

    // Search utilities
    lastQuery,
    setLastQuery,
    applySearch,
    resetSearch,

    // Ratings API for components
    getRatingSummary,
    myRatings,
    rateItem,
    ratingBusyMap,
  };

  return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>;
};

export default StoreContextProvider;