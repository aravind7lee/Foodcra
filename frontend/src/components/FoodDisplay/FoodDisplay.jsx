import React, { useContext, useEffect, useRef, useState } from "react";
import "./FoodDisplay.css";
import FoodItem from "../FoodItem/FoodItem";
import FoodItemSkeleton from "../FoodItem/FoodItemSkeleton";
import { StoreContext } from "../../Context/StoreContext";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

const FoodDisplay = ({ category = "All" }) => {
  const { food_list, filteredFoodList } = useContext(StoreContext);
  const location = useLocation();
  const navigate = useNavigate();
  const lastScrolledKeyRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if data is loaded - Immediate loading
  useEffect(() => {
    if (food_list && food_list.length > 0) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [food_list]);

  // Choose list to show - prioritize food_list unless there's an active search
  const { lastQuery } = useContext(StoreContext);
  const listToShow = (lastQuery && Array.isArray(filteredFoodList) && filteredFoodList.length > 0) 
    ? filteredFoodList 
    : food_list || [];

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
      <h2>Top dishes near you</h2>

      <div className="food-display-list">
        {isLoading ? (
          // Show skeleton items while loading
          Array.from({ length: 8 }, (_, index) => (
            <FoodItemSkeleton key={`skeleton-${index}`} />
          ))
        ) : listToShow && listToShow.length > 0 ? (
          listToShow.map((item) => {
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
          })
        ) : (
          <div className="no-results-block" style={{ textAlign: "center", padding: 24 }}>
            <p style={{ marginBottom: 12, fontSize: 16 }}>No dishes found for your search.</p>
            <button className="reset-results-btn" onClick={handleReset} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer" }}>
              Show all dishes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDisplay;
