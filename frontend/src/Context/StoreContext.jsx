import { createContext, useEffect, useState, useRef } from "react";
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

  // ---------------------------
  // Referral and Loyalty Points
  // ---------------------------
  const addReferralPoints = async (referrerId) => {
    if (!token) return;
    try {
      await axios.post(url + "/api/referral/add", { referrerId }, { headers: { token } });
      setReferralPoints((prev) => prev + 10);
    } catch (err) {
      console.error("Error adding referral points:", err);
    }
  };

  const applyReferralDiscount = () => {
    if (referralPoints >= 50) return 50;
    return 0;
  };

  const addLoyaltyPoints = async () => {
    if (!token) return;
    try {
      await axios.post(url + "/api/loyalty/add", {}, { headers: { token } });
      setLoyaltyPoints((prev) => prev + 5);
    } catch (err) {
      console.error("Error adding loyalty points:", err);
    }
  };

  const applyLoyaltyDiscount = () => {
    if (loyaltyPoints >= 100) return 100;
    return 0;
  };

  // ---------------------------
  // Cart helpers
  // ---------------------------
  const addToCart = async (itemId) => {
    setCartItems((prev) => {
      if (!prev[itemId]) return { ...prev, [itemId]: 1 };
      return { ...prev, [itemId]: prev[itemId] + 1 };
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
      const updated = { ...prev, [itemId]: prev[itemId] - 1 };
      if (updated[itemId] <= 0) delete updated[itemId];
      return updated;
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
      if (itemInfo && cartItems[id] > 0) totalAmount += itemInfo.price * cartItems[id];
    }
    return totalAmount - applyReferralDiscount() - applyLoyaltyDiscount();
  };

  // ---------------------------
  // Data fetching
  // ---------------------------
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      const list = response?.data?.data ?? defaultFoodList ?? [];
      setFoodList(list);
    } catch (error) {
      console.error("Error fetching food list:", error);
      setFoodList(defaultFoodList || []);
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

  // ---------------------------
  // Grocery helpers
  // ---------------------------
  const addIngredientsToGrocery = (ingredients) => {
    setGroceryList((prev) => [...prev, ...ingredients]);
  };

  // ---------------------------
  // Search helpers & index
  // ---------------------------
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
    async function loadData() {
      await fetchFoodList();
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        await loadCartData(storedToken);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------
  // Context value
  // ---------------------------
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

    // Search utilities
    lastQuery,
    setLastQuery,
    applySearch,
    resetSearch,
  };

  return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>;
};

export default StoreContextProvider;
