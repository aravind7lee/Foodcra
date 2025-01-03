import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../../Context/StoreContext';

import './MealPlanner.css';

const MealPlanner = () => {
  const { food_list, addToCart } = useContext(StoreContext);
  const [mealPlan, setMealPlan] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);  // To track which day's dropdown is active
  const [isDarkMode, setIsDarkMode] = useState(false);  // For Dark Mode

  // Days of the week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Handle meal selection for each day
  const handleMealSelect = (day, mealId) => {
    const selectedMeal = food_list.find(food => food._id === mealId);
    setMealPlan(prev => ({
      ...prev,
      [day]: selectedMeal,
    }));
  };

  const toggleDropdown = (day) => {
    setSelectedDay(selectedDay === day ? null : day);  // Toggle dropdown for the day
  };

  // Handle adding meal to cart by itemId (meal._id)
  const handleAddToCart = (day) => {
    if (mealPlan[day]) {
      addToCart(mealPlan[day]._id);  // Passing only the meal ID
      console.log(`Added ${mealPlan[day].name} for ${day} to the cart`);
    } else {
      console.error(`No meal selected for ${day}`);
    }
  };

  // Render meal options in the dropdown for each day
  const renderMealOptions = (day) => (
    <select onChange={(e) => handleMealSelect(day, e.target.value)}>
      <option value="">Select Meal</option>
      {food_list.map(food => (
        <option key={food._id} value={food._id}>
          {food.name} ({food.cuisine})
        </option>
      ))}
    </select>
  );

  // Handle placing an order for the week
  const handleOrderSubmit = () => {
    const selectedMeals = Object.values(mealPlan);
    if (selectedMeals.length > 0) {
      selectedMeals.forEach(meal => addToCart(meal._id));  // Add all meals to cart by ID
      console.log('Order placed for the week:', mealPlan);
    } else {
      console.error('No meals selected for the week');
    }
  };

  // Toggle between Dark and Light Mode
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');  // Save the preference
  };

  // Set initial theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  return (
    <div className={`meal-planner ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <h2>Meal Planner</h2>
      <button onClick={toggleDarkMode} className="theme-toggle">
        Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
      </button>
      <div className="meal-plan-grid">
        {daysOfWeek.map(day => (
          <div key={day} className="meal-plan-day">
            <h3>{day}</h3>
            {renderMealOptions(day)}
            <button 
              onClick={() => handleAddToCart(day)} 
              disabled={!mealPlan[day]}
              className="order-button"
            >
              Order {mealPlan[day] ? mealPlan[day].name : 'Meal'}
            </button>
          </div>
        ))}
      </div>
      
      <div className={`meal-plan-summary ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <h3>Meal Summary</h3>
        {daysOfWeek.map(day => (
          <div key={day} className={`meal-summary ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            <strong>{day}:</strong> {mealPlan[day] ? mealPlan[day].name : 'No meal selected'}
          </div>
        ))}
        <button onClick={handleOrderSubmit} className="submit-order">
          Place Order for the Week
        </button>
      </div>
    </div>
  );
};

export default MealPlanner;
