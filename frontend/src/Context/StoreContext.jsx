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

  // ---------------------------
  // Ratings state
  // ---------------------------
  // ratingsByItem:  { [itemId]: { avg: number, count: number } }
  // myRatings:      { [itemId]: number }
  const [ratingsByItem, setRatingsByItem] = useState({});
  const [myRatings, setMyRatings] = useState({});
  const [ratingBusyMap, setRatingBusyMap] = useState({});
  const socketRef = useRef(null);

  const ensureRaterId = () => {
    let anon = localStorage.getItem("raterId");
    if (!anon) {
      anon = "anon_" + Math.random().toString(36).slice(2);
      localStorage.setItem("raterId", anon);
    }
    return anon;
  };

  const getRatingSummary = useCallback(
    (id) => ratingsByItem[id] || { avg: 0, count: 0 },
    [ratingsByItem]
  );

  const mergeRating = (itemId, obj) => {
    setRatingsByItem((prev) => ({ ...prev, [itemId]: { avg: obj.avg || 0, count: obj.count || 0 } }));
    if (typeof obj.my === "number") {
      setMyRatings((prev) => ({ ...prev, [itemId]: obj.my }));
    }
  };

  const fetchRatingsBulk = useCallback(
    async (items) => {
      const ids = (items || []).map((x) => x._id).filter(Boolean);
      if (!ids.length) return;

      try {
        // Bulk endpoint (provided below in backend section)
        const res = await axios.get(`${url}/api/rating/bulk`, {
          params: { ids: ids.join(",") },
          headers: token ? { token } : {},
        });
        const map = res?.data?.data || {};
        const next = {};
        const mine = {};
        Object.keys(map).forEach((k) => {
          next[k] = { avg: Number(map[k]?.avg || 0), count: Number(map[k]?.count || 0) };
          if (typeof map[k]?.my === "number") mine[k] = map[k].my;
        });
        if (Object.keys(next).length) setRatingsByItem((prev) => ({ ...prev, ...next }));
        if (Object.keys(mine).length) setMyRatings((prev) => ({ ...prev, ...mine }));
      } catch (e) {
        // Fallback: per-id fetch if bulk is not available yet
        const collected = {};
        for (const id of ids) {
          try {
            const r = await axios.get(`${url}/api/rating/${id}`, { headers: token ? { token } : {} });
            const data = r?.data?.data || {};
            collected[id] = { avg: Number(data.avg || 0), count: Number(data.count || 0) };
            if (typeof data.my === "number") {
              setMyRatings((prev) => ({ ...prev, [id]: data.my }));
            }
          } catch {}
        }
        if (Object.keys(collected).length) {
          setRatingsByItem((prev) => ({ ...prev, ...collected }));
        }
      }
    },
    [token, url]
  );

  const rateItem = useCallback(
    async (itemId, rating) => {
      const raterId = ensureRaterId();

      // optimistic update
      setRatingBusyMap((p) => ({ ...p, [itemId]: true }));
      setMyRatings((prev) => ({ ...prev, [itemId]: rating }));
      setRatingsByItem((prev) => {
        const existing = prev[itemId] || { avg: 0, count: 0 };
        const prevMy = myRatings[itemId] || 0;
        let newAvg = existing.avg;
        let newCount = existing.count;

        if (prevMy) {
          // user is updating their rating
          const total = existing.avg * existing.count - prevMy + rating;
          newAvg = existing.count ? total / existing.count : rating;
        } else {
          // first time rating
          const total = existing.avg * existing.count + rating;
          newCount = existing.count + 1;
          newAvg = total / newCount;
        }
        return { ...prev, [itemId]: { avg: newAvg, count: newCount } };
      });

      try {
        const res = await axios.post(
          `${url}/api/rating`,
          { itemId, rating, raterId },
          { headers: token ? { token } : {} }
        );
        const data = res?.data?.data;
        if (data?.avg != null && data?.count != null) {
          mergeRating(itemId, data);
        }
      } catch (err) {
        console.error("Error submitting rating:", err?.message || err);
        // Hard refresh from server on error (to avoid stale optimistic UI)
        try {
          const r = await axios.get(`${url}/api/rating/${itemId}`, { headers: token ? { token } : {} });
          if (r?.data?.data) mergeRating(itemId, r.data.data);
        } catch {}
      } finally {
        setRatingBusyMap((p) => {
          const n = { ...p };
          delete n[itemId];
          return n;
        });
      }
    },
    [token, url, myRatings]
  );

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
      // fetch ratings after items load
      fetchRatingsBulk(list);
    } catch (error) {
      console.error("Error fetching food list:", error);
      const fallback = defaultFoodList || [];
      setFoodList(fallback);
      fetchRatingsBulk(fallback);
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
    (async function loadData() {
      await fetchFoodList();
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        await loadCartData(storedToken);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Optional: live updates via socket.io if backend exposes it.
  // Auto-falls back to periodic refresh if socket.io-client is not installed.
  useEffect(() => {
    let cleanup = () => {};
    (async () => {
      try {
        // dynamic import so build doesn’t break if you haven’t installed it yet
        const { io } = await import(/* webpackIgnore: true */ 'socket.io-client').catch(() => ({}));
        if (io) {
          const s = io(url, { transports: ["websocket", "polling"] });
          socketRef.current = s;
          s.on("connect", () => {});
          s.on("rating:update", (payload) => {
            // payload: { itemId, avg, count }
            if (payload?.itemId) {
              setRatingsByItem((prev) => ({
                ...prev,
                [payload.itemId]: { avg: Number(payload.avg || 0), count: Number(payload.count || 0) },
              }));
            }
          });
          cleanup = () => s.close();
          return;
        }
      } catch {}
    })();
    return () => cleanup();
  }, [url]);

  // Gentle polling keeps numbers fresh even without sockets
  useEffect(() => {
    if (!food_list.length) return;
    const t = setInterval(() => {
      fetchRatingsBulk(food_list);
    }, 20000); // 20s
    return () => clearInterval(t);
  }, [food_list, fetchRatingsBulk]);

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

    // Ratings API for components
    getRatingSummary,
    myRatings,
    rateItem,
    ratingBusyMap,
  };

  return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>;
};

export default StoreContextProvider;
