import React, { useContext, useEffect, useRef } from "react";
import "./FoodDisplay.css";
import FoodItem from "../FoodItem/FoodItem";
import { StoreContext } from "../../Context/StoreContext";
import { useLocation, useNavigate } from "react-router-dom";

const FoodDisplay = ({ category = "All" }) => {
  const { food_list, filteredFoodList } = useContext(StoreContext);
  const location = useLocation();
  const navigate = useNavigate();
  const lastScrolledKeyRef = useRef(null);

  // Choose list to show
  const listToShow = Array.isArray(filteredFoodList) && filteredFoodList.length > 0 ? filteredFoodList : food_list || [];

  // Auto-scroll only when the URL contains the hash #food-display and it is a navigation event
  useEffect(() => {
    try {
      const hash = location.hash || "";
      // location.key changes for new navigation events in react-router; guard to run once per navigation
      const locKey = location.key || `${location.pathname}${location.search}${location.hash}`;
      if (hash === "#food-display" && lastScrolledKeyRef.current !== locKey) {
        const el = document.getElementById("food-display");
        if (el) {
          // slight delay to ensure rendering
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
    // remove search query and go to menu anchor — this will show all items (StoreContext.resetSearch should be wired)
    navigate("/menu#food-display", { replace: true });
    // Note: the search reset logic should also be triggered by the URL change (see StoreContext.applySearch/resetSearch)
  };

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes near you</h2>

      <div className="food-display-list">
        {listToShow && listToShow.length > 0 ? (
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
