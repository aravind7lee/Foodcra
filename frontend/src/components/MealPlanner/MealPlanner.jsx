import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import './MealPlanner.css';

const MealPlanner = () => {
  const { food_list, addToCart, url, currency } = useContext(StoreContext);
  const [mealPlan, setMealPlan] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);

  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const daysOfWeek = [
    { name: 'Monday', short: 'Mon', icon: 'M' },
    { name: 'Tuesday', short: 'Tue', icon: 'T' },
    { name: 'Wednesday', short: 'Wed', icon: 'W' },
    { name: 'Thursday', short: 'Thu', icon: 'T' },
    { name: 'Friday', short: 'Fri', icon: 'F' },
    { name: 'Saturday', short: 'Sat', icon: 'S' },
    { name: 'Sunday', short: 'Sun', icon: 'S' }
  ];

  const mealTypes = [
    { value: 'all', label: 'All Meals', icon: '🍽️' },
    { value: 'Salad', label: 'Healthy', icon: '🥗' },
    { value: 'Pasta', label: 'Comfort', icon: '🍝' },
    { value: 'Biryani', label: 'Special', icon: '🍛' },
    { value: 'Grill & BBQ', label: 'Protein', icon: '🥩' }
  ];

  const handleMealSelect = (day, mealId) => {
    setIsAnimating(true);
    const selectedMeal = food_list.find(food => food._id === mealId);
    setMealPlan(prev => ({
      ...prev,
      [day]: selectedMeal,
    }));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleAddToCart = (day) => {
    if (mealPlan[day]) {
      addToCart(mealPlan[day]._id);
    }
  };

  const handleOrderSubmit = () => {
    const selectedMeals = Object.values(mealPlan);
    if (selectedMeals.length > 0) {
      selectedMeals.forEach(meal => addToCart(meal._id));
    }
  };

  const clearMealPlan = () => {
    setMealPlan({});
  };

  const getFilteredFoods = () => {
    if (selectedMealType === 'all') return food_list;
    return food_list.filter(food => food.category === selectedMealType);
  };

  // Helper function to get calories with fallback
  const getCaloriesForMeal = (meal) => {
    if (meal?.calories) return parseInt(meal.calories);
    
    // Fallback calories based on category
    const categoryCalories = {
      'Sandwich': 350,
      'Salad': 250,
      'Rolls': 400,
      'Deserts': 200,
      'Cake': 280,
      'Pure Veg': 220,
      'Pasta': 400,
      'Noodles': 350,
      'Grill & BBQ': 500,
      'Biryani': 480
    };
    
    return categoryCalories[meal?.category] || 300; // Default 300 calories
  };

  useEffect(() => {
    const meals = Object.values(mealPlan).filter(meal => meal); // Filter out null/undefined
    const calories = meals.reduce((sum, meal) => {
      return sum + getCaloriesForMeal(meal);
    }, 0);
    const price = meals.reduce((sum, meal) => {
      const mealPrice = parseFloat(meal?.price) || 0;
      return sum + mealPrice;
    }, 0);
    setTotalCalories(calories);
    setTotalPrice(price);
  }, [mealPlan]);



  return (
    <div className="mp-container mp-light">
      {/* Header Section */}
      <div className="mp-header">
        <div className="mp-title-section">
          <h1 className="mp-title">
            <span className="mp-icon">🍽️</span>
            Smart Meal Planner
            <span className="mp-badge">Premium</span>
          </h1>
          <p className="mp-subtitle">Plan your perfect week with AI-powered nutrition insights</p>
        </div>
        
        <div className="mp-controls">
          <div className="mp-view-toggle">
            <button 
              className={`mp-toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              📅 Week View
            </button>
            <button 
              className={`mp-toggle-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
            >
              📋 Day View
            </button>
          </div>
          

        </div>
      </div>

      {/* Filter Section */}
      <div className="mp-filters">
        <div className="mp-filter-group">
          <label className="mp-filter-label">Meal Category</label>
          <div className="mp-meal-types">
            {mealTypes.map(type => (
              <button
                key={type.value}
                className={`mp-meal-type ${selectedMealType === type.value ? 'active' : ''}`}
                onClick={() => setSelectedMealType(type.value)}
              >
                <span className="mp-meal-icon">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mp-main">
        <div className="mp-planner-section">
          <div className={`mp-days-grid ${viewMode}`}>
            {daysOfWeek.map(day => {
              const selectedMeal = mealPlan[day.name];
              return (
                <div key={day.name} className="mp-day-card">
                  <div className="mp-day-header">
                    <div className="mp-day-icon">
                      <span className="mp-day-letter">{day.icon}</span>
                    </div>
                    <div className="mp-day-info">
                      <h3 className="mp-day-name">{day.name}</h3>
                      <span className="mp-day-short">{day.short}</span>
                    </div>
                  </div>
                  
                  <div className="mp-meal-selector">
                    <select 
                      className="mp-select"
                      onChange={(e) => handleMealSelect(day.name, e.target.value)}
                      value={selectedMeal?._id || ''}
                    >
                      <option value="">Choose your meal...</option>
                      {getFilteredFoods().map(food => (
                        <option key={food._id} value={food._id}>
                          {food.name} - {currency}{food.price}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedMeal && (
                    <div className="mp-selected-meal">
                      <div className="mp-meal-image">
                        <img 
                          src={`${url}/images/${selectedMeal.image}`} 
                          alt={selectedMeal.name}
                          onError={(e) => {
                            e.target.src = '/api/placeholder/80/80';
                          }}
                        />
                      </div>
                      <div className="mp-meal-details">
                        <h4 className="mp-meal-name">{selectedMeal.name}</h4>
                        <div className="mp-meal-stats">
                          <span className="mp-stat">
                            <span className="mp-stat-icon">💰</span>
                            {currency}{selectedMeal.price}
                          </span>
                          <span className="mp-stat">
                            <span className="mp-stat-icon">🔥</span>
                            {getCaloriesForMeal(selectedMeal)} cal
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        className="mp-add-btn"
                        onClick={() => handleAddToCart(day.name)}
                      >
                        <span className="mp-btn-icon">🛒</span>
                        Add
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Section */}
        <div className="mp-summary-section">
          <div className="mp-summary-card">
            <h3 className="mp-summary-title">
              <span className="mp-summary-icon">📊</span>
              Weekly Summary
            </h3>
            
            <div className="mp-stats-grid">
              <div className="mp-stat-card">
                <div className="mp-stat-value">{Object.keys(mealPlan).length}</div>
                <div className="mp-stat-label">Meals Planned</div>
              </div>
              <div className="mp-stat-card">
                <div className="mp-stat-value">{totalCalories}</div>
                <div className="mp-stat-label">Total Calories</div>
              </div>
              <div className="mp-stat-card">
                <div className="mp-stat-value">{currency}{totalPrice}</div>
                <div className="mp-stat-label">Total Cost</div>
              </div>
            </div>
            
            <div className="mp-meal-list">
              {daysOfWeek.map(day => {
                const meal = mealPlan[day.name];
                return (
                  <div key={day.name} className={`mp-summary-item ${meal ? 'has-meal' : ''}`}>
                    <span className="mp-summary-day">
                      <span className="mp-summary-icon">{day.icon}</span>
                      {day.short}
                    </span>
                    <span className="mp-summary-meal">
                      {meal ? meal.name : 'No meal selected'}
                    </span>
                    {meal && (
                      <span className="mp-summary-price">{currency}{meal.price}</span>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mp-actions">
              <button className="mp-btn mp-btn-secondary" onClick={clearMealPlan}>
                <span className="mp-btn-icon">🗑️</span>
                Clear All
              </button>
              <button 
                className="mp-btn mp-btn-primary"
                onClick={handleOrderSubmit}
                disabled={Object.keys(mealPlan).length === 0}
              >
                <span className="mp-btn-icon">🚀</span>
                Order Week ({Object.keys(mealPlan).length} meals)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlanner;
