import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import "./FoodDisplay.css";
import FoodItem from "../FoodItem/FoodItem";
import FoodItemSkeleton from "../FoodItem/FoodItemSkeleton";
import ImagePreloader from "../FoodItem/ImagePreloader";
import { StoreContext } from "../../Context/StoreContext";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import { preloadCriticalImages } from "../../utils/performanceOptimizer";

const FoodDisplay = ({ category = "All" }) => {
  const { food_list, filteredFoodList, url } = useContext(StoreContext);
  const location = useLocation();
  const navigate = useNavigate();
  const lastScrolledKeyRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if data is loaded - Immediate loading
  useEffect(() => {
    // Always show content immediately, don't wait for loading
    setIsLoading(false);
  }, [food_list]);

  // Choose list to show - prioritize food_list unless there's an active search
  const { lastQuery } = useContext(StoreContext);
  const listToShow = (lastQuery && Array.isArray(filteredFoodList) && filteredFoodList.length > 0) 
    ? filteredFoodList 
    : food_list || [];

  // Prepare image URLs for preloading - memoized for performance
  const imageUrls = useMemo(() => {
    if (!listToShow || !Array.isArray(listToShow)) return [];
    
    const urls = listToShow
      .filter(item => item.image)
      .map(item => `${url}/images/${item.image}`)
      .slice(0, 12); // Preload first 12 images
    
    // Preload immediately
    preloadCriticalImages(urls);
    
    return urls;
  }, [listToShow, url]);

  // Auto-scroll only when the URL contains the hash #food-display and it is a navigation event
  useEffect(() => {
    try {
      const hash = location.hash || "";
      const locKey = location.key || `${location.pathname}${location.search}${location.hash}`;
      if (hash === "#food-display" && lastScrolledKeyRef.current !== locKey) {
        const el = document.getElementById("food-display");
        if (el) {
          setTimeout(() => {
            try {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
            } catch (err) {}
          }, 60);
          lastScrolledKeyRef.current = locKey;
        }
      }
    } catch (err) {
      // ignore
    }
  }, [location]);

  const handleReset = () => {
    navigate("/menu#food-display", { replace: true });
  };

  return (
    <div className="food-display" id="food-display">
      <ImagePreloader imageUrls={imageUrls} />
      <h2>Top dishes near you</h2>

      <div className="food-display-list">
        {useMemo(() => {
          if (!listToShow || !Array.isArray(listToShow) || listToShow.length === 0) {
            return isLoading ? (
              Array.from({ length: 8 }, (_, index) => (
                <FoodItemSkeleton key={`skeleton-${index}`} />
              ))
            ) : (
              <div className="no-results-block" style={{ textAlign: "center", padding: 24 }}>
                <p style={{ marginBottom: 12, fontSize: 16 }}>No dishes found for your search.</p>
                <button className="reset-results-btn" onClick={handleReset} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer" }}>
                  Show all dishes
                </button>
              </div>
            );
          }
          
          return listToShow.map((item) => {
            if (category === "All" || category === item.category) {
              return (
                <FoodItem
                  key={item._id}
                  image={item.image}
                  name={item.name}
                  desc={item.description}
                  price={item.price}
                  id={item._id}
                />
              );
            }
            return null;
          });
        }, [listToShow, category, isLoading, handleReset])}
      </div>
    </div>
  );
};

export default FoodDisplay;
