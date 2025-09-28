import React, { useContext, useState, useEffect, useMemo } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import PremiumLoader from './PremiumLoader';
import './EnhancedMealPlanner.css';
import './PremiumLoader.css';

const EnhancedMealPlanner = () => {
  const { food_list, addToCart, url, currency } = useContext(StoreContext);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [viewMode, setViewMode] = useState('week');
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [dietaryFilter, setDietaryFilter] = useState('all');
  const [budgetRange, setBudgetRange] = useState([0, 1000]);
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [showNutritionBreakdown, setShowNutritionBreakdown] = useState(false);
  const [mealTimeSlots, setMealTimeSlots] = useState({
    breakfast: {},
    lunch: {},
    dinner: {},
    snacks: {}
  });

  const daysOfWeek = [
    { name: 'Monday', short: 'Mon', icon: '🌅', color: '#FF6B35' },
    { name: 'Tuesday', short: 'Tue', icon: '🔥', color: '#FF8E53' },
    { name: 'Wednesday', short: 'Wed', icon: '⚡', color: '#FFB366' },
    { name: 'Thursday', short: 'Thu', icon: '🌟', color: '#FF6B35' },
    { name: 'Friday', short: 'Fri', icon: '🎉', color: '#FF8E53' },
    { name: 'Saturday', short: 'Sat', icon: '🌈', color: '#FFB366' },
    { name: 'Sunday', short: 'Sun', icon: '☀️', color: '#FF6B35' }
  ];

  const mealTypes = [
    { value: 'all', label: 'All Cuisines', icon: '🌍', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { value: 'Salad', label: 'Fresh & Healthy', icon: '🥗', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { value: 'Pasta', label: 'Italian Comfort', icon: '🍝', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { value: 'Biryani', label: 'Indian Special', icon: '🍛', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { value: 'Grill & BBQ', label: 'High Protein', icon: '🥩', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { value: 'Sandwich', label: 'Quick Bites', icon: '🥪', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { value: 'Pure Veg', label: 'Vegetarian', icon: '🌱', gradient: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%)' }
  ];

  const dietaryFilters = [
    { value: 'all', label: 'All Diets', icon: '🍽️' },
    { value: 'veg', label: 'Vegetarian', icon: '🌱' },
    { value: 'vegan', label: 'Vegan', icon: '🥬' },
    { value: 'keto', label: 'Keto', icon: '🥑' },
    { value: 'protein', label: 'High Protein', icon: '💪' },
    { value: 'lowcarb', label: 'Low Carb', icon: '🥩' }
  ];

  const mealSlots = [
    { key: 'breakfast', label: 'Breakfast', icon: '🌅', time: '7:00 - 10:00 AM', calories: 300 },
    { key: 'lunch', label: 'Lunch', icon: '☀️', time: '12:00 - 2:00 PM', calories: 450 },
    { key: 'snacks', label: 'Snacks', icon: '🍪', time: '4:00 - 6:00 PM', calories: 200 },
    { key: 'dinner', label: 'Dinner', icon: '🌙', time: '7:00 - 9:00 PM', calories: 400 }
  ];

  const handleMealSelect = (day, slot, mealId) => {
    const selectedMeal = food_list.find(food => food._id === mealId);
    setMealTimeSlots(prev => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        [day]: selectedMeal
      }
    }));
  };



  const handleAddToCart = (meal) => {
    if (meal) {
      addToCart(meal._id);
    }
  };

  const handleOrderSubmit = () => {
    const allMeals = [];
    Object.values(mealTimeSlots).forEach(slot => {
      Object.values(slot).forEach(meal => {
        if (meal) allMeals.push(meal);
      });
    });
    
    if (allMeals.length > 0) {
      allMeals.forEach(meal => addToCart(meal._id));
    }
  };

  const clearMealPlan = () => {
    setMealTimeSlots({
      breakfast: {},
      lunch: {},
      dinner: {},
      snacks: {}
    });
  };

  const getFilteredFoods = () => {
    let filtered = food_list;
    
    if (selectedMealType !== 'all') {
      filtered = filtered.filter(food => food.category === selectedMealType);
    }
    
    if (dietaryFilter !== 'all') {
      filtered = filtered.filter(food => {
        switch (dietaryFilter) {
          case 'veg':
            return food.category === 'Pure Veg' || food.category === 'Salad';
          case 'protein':
            return food.category === 'Grill & BBQ' || food.name.toLowerCase().includes('protein');
          default:
            return true;
        }
      });
    }
    
    return filtered;
  };

  const getNutrientValue = (meal, nutrient) => {
    if (!meal) return 0;
    // Get actual nutrient values from meal data
    const value = meal[nutrient] || meal.nutrition?.[nutrient] || 0;
    return parseFloat(value) || 0;
  };

  const weeklyStats = useMemo(() => {
    const allMeals = [];
    Object.values(mealTimeSlots).forEach(slot => {
      Object.values(slot).forEach(meal => {
        if (meal) allMeals.push(meal);
      });
    });
    
    if (allMeals.length === 0) {
      return {
        totalMeals: 0,
        totalCalories: 0,
        totalPrice: 0,
        avgCaloriesPerDay: 0,
        avgPricePerDay: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        proteinPercentage: 0,
        carbsPercentage: 0,
        fatPercentage: 0
      };
    }
    
    const totalCalories = allMeals.reduce((sum, meal) => sum + getNutrientValue(meal, 'calories'), 0);
    const totalPrice = allMeals.reduce((sum, meal) => sum + (parseFloat(meal?.price) || 0), 0);
    const totalProtein = allMeals.reduce((sum, meal) => sum + getNutrientValue(meal, 'protein'), 0);
    const totalCarbs = allMeals.reduce((sum, meal) => sum + getNutrientValue(meal, 'carbs'), 0);
    const totalFat = allMeals.reduce((sum, meal) => sum + getNutrientValue(meal, 'fat'), 0);
    
    const avgCaloriesPerDay = totalCalories > 0 ? Math.round(totalCalories / 7) : 0;
    const avgPricePerDay = totalPrice > 0 ? Math.round(totalPrice / 7) : 0;
    
    // Calculate actual macronutrient percentages
    const totalMacros = totalProtein + totalCarbs + totalFat;
    const proteinPercentage = totalMacros > 0 ? Math.round((totalProtein / totalMacros) * 100) : 0;
    const carbsPercentage = totalMacros > 0 ? Math.round((totalCarbs / totalMacros) * 100) : 0;
    const fatPercentage = totalMacros > 0 ? Math.round((totalFat / totalMacros) * 100) : 0;
    
    return {
      totalMeals: allMeals.length,
      totalCalories,
      totalPrice,
      avgCaloriesPerDay,
      avgPricePerDay,
      totalProtein: Math.round(totalProtein),
      totalCarbs: Math.round(totalCarbs),
      totalFat: Math.round(totalFat),
      proteinPercentage,
      carbsPercentage,
      fatPercentage
    };
  }, [mealTimeSlots]);

  return (
    <>

      <div className="smp-container">
      {/* Premium Hero Section */}
      <div className="smp-hero">
        <div className="smp-hero-bg"></div>
        <div className="smp-hero-content">
          <div className="smp-hero-text">
            <h1 className="smp-hero-title">
              <span className="smp-hero-icon">🍽️</span>
              Smart Meal Planner
              <span className="smp-hero-badge">AI Powered</span>
            </h1>
            <p className="smp-hero-subtitle">
              Experience the future of meal planning with AI-driven nutrition insights, 
              personalized recommendations, and seamless ordering
            </p>
          </div>
          
          <div className="smp-hero-stats">
            <div className="smp-stat-item">
              <span className="smp-stat-number">{weeklyStats.totalMeals}</span>
              <span className="smp-stat-label">Meals Planned</span>
            </div>
            <div className="smp-stat-item">
              <span className="smp-stat-number">{weeklyStats.avgCaloriesPerDay || 0}</span>
              <span className="smp-stat-label">Avg Calories/Day</span>
            </div>
            <div className="smp-stat-item">
              <span className="smp-stat-number">{currency}{weeklyStats.avgPricePerDay || 0}</span>
              <span className="smp-stat-label">Avg Cost/Day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="smp-filters">
        <div className="smp-filter-header">
          <h2 className="smp-filter-title">🎯 Personalize Your Plan</h2>
        </div>
        
        <div className="smp-filter-grid">
          <div className="smp-filter-section">
            <label className="smp-filter-label">🍽️ Cuisine Preference</label>
            <div className="smp-cuisine-grid">
              {mealTypes.map(type => (
                <button
                  key={type.value}
                  className={`smp-cuisine-card ${selectedMealType === type.value ? 'active' : ''}`}
                  onClick={() => setSelectedMealType(type.value)}
                  style={{ background: selectedMealType === type.value ? type.gradient : '' }}
                >
                  <span className="smp-cuisine-icon">{type.icon}</span>
                  <span className="smp-cuisine-label">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="smp-filter-section">
            <label className="smp-filter-label">🥗 Dietary Preferences</label>
            <div className="smp-dietary-grid">
              {dietaryFilters.map(filter => (
                <button
                  key={filter.value}
                  className={`smp-dietary-btn ${dietaryFilter === filter.value ? 'active' : ''}`}
                  onClick={() => setDietaryFilter(filter.value)}
                >
                  <span className="smp-dietary-icon">{filter.icon}</span>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="smp-filter-section">
            <label className="smp-filter-label">💰 Budget Range (per meal)</label>
            <div className="smp-budget-slider">
              <input
                type="range"
                min="0"
                max="1000"
                value={budgetRange[1]}
                onChange={(e) => setBudgetRange([0, parseInt(e.target.value)])}
                className="smp-range"
              />
              <div className="smp-budget-display">
                <span>{currency}0</span>
                <span className="smp-budget-current">{currency}{budgetRange[1]}</span>
              </div>
            </div>
          </div>
          
          <div className="smp-filter-section">
            <label className="smp-filter-label">🔥 Daily Calorie Target</label>
            <div className="smp-calorie-input">
              <input
                type="number"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(parseInt(e.target.value))}
                className="smp-input"
                min="1200"
                max="4000"
                step="100"
              />
              <span className="smp-input-suffix">kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Meal Planning Grid */}
      <div className="smp-planner">
        <div className="smp-planner-header">
          <h2 className="smp-planner-title">📅 Weekly Meal Schedule</h2>
          <div className="smp-view-controls">
            <button 
              className={`smp-view-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              📊 Week View
            </button>
            <button 
              className={`smp-view-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
            >
              📋 Day View
            </button>
          </div>
        </div>
        
        <div className="smp-schedule-grid">
          {/* Time Slots Header */}
          <div className="smp-time-header">
            <div className="smp-time-cell"></div>
            {mealSlots.map(slot => (
              <div key={slot.key} className="smp-time-slot">
                <span className="smp-slot-icon">{slot.icon}</span>
                <div className="smp-slot-info">
                  <span className="smp-slot-name">{slot.label}</span>
                  <span className="smp-slot-time">{slot.time}</span>
                  <span className="smp-slot-calories">{slot.calories} kcal target</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Days and Meals Grid - Mobile Optimized */}
          {daysOfWeek.map(day => (
            <div key={day.name} className="smp-day-row">
              <div className="smp-day-header">
                <div className="smp-day-icon" style={{ background: day.color }}>
                  <span>{day.icon}</span>
                </div>
                <div className="smp-day-info">
                  <h3 className="smp-day-name">{day.name}</h3>
                  <span className="smp-day-short">{day.short}</span>
                </div>
              </div>
              
              {/* Mobile Meal Slots - Horizontal Scroll */}
              <div className="smp-meal-slots">
                {mealSlots.map(slot => {
                  const selectedMeal = mealTimeSlots[slot.key][day.name];
                  return (
                    <div key={`${day.name}-${slot.key}`} className="smp-meal-cell">
                      {/* Mobile Meal Slot Header */}
                      <div className="smp-meal-slot-header">
                        <span className="smp-slot-icon">{slot.icon}</span>
                        <div className="smp-slot-info">
                          <div className="smp-slot-name">{slot.label}</div>
                          <div className="smp-slot-time">{slot.time}</div>
                          <div className="smp-slot-calories">{slot.calories} kcal</div>
                        </div>
                      </div>
                      
                      <div className="smp-meal-selector">
                        <select 
                          className="smp-select"
                          onChange={(e) => handleMealSelect(day.name, slot.key, e.target.value)}
                          value={selectedMeal?._id || ''}
                        >
                          <option value="">Choose {slot.label.toLowerCase()}...</option>
                          {getFilteredFoods().map(food => (
                            <option key={food._id} value={food._id}>
                              {food.name} - {currency}{food.price}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {selectedMeal && (
                        <div className="smp-selected-meal">
                          <div className="smp-meal-image">
                            <img 
                              src={`${url}/images/${selectedMeal.image}`} 
                              alt={selectedMeal.name}
                              onError={(e) => {
                                e.target.src = '/api/placeholder/60/60';
                              }}
                            />
                          </div>
                          <div className="smp-meal-details">
                            <h4 className="smp-meal-name">{selectedMeal.name}</h4>
                            <div className="smp-meal-stats">
                              <span className="smp-stat">
                                <span className="smp-stat-icon">💰</span>
                                {currency}{selectedMeal.price}
                              </span>
                              {getNutrientValue(selectedMeal, 'calories') > 0 && (
                                <span className="smp-stat">
                                  <span className="smp-stat-icon">🔥</span>
                                  {getNutrientValue(selectedMeal, 'calories')} cal
                                </span>
                              )}
                            </div>
                            {(getNutrientValue(selectedMeal, 'protein') > 0 || getNutrientValue(selectedMeal, 'carbs') > 0 || getNutrientValue(selectedMeal, 'fat') > 0) && (
                              <div className="smp-nutrition-mini">
                                {getNutrientValue(selectedMeal, 'protein') > 0 && <span className="smp-mini-stat">P: {getNutrientValue(selectedMeal, 'protein')}g</span>}
                                {getNutrientValue(selectedMeal, 'carbs') > 0 && <span className="smp-mini-stat">C: {getNutrientValue(selectedMeal, 'carbs')}g</span>}
                                {getNutrientValue(selectedMeal, 'fat') > 0 && <span className="smp-mini-stat">F: {getNutrientValue(selectedMeal, 'fat')}g</span>}
                              </div>
                            )}
                          </div>
                          
                          <button 
                            className="smp-add-btn"
                            onClick={() => handleAddToCart(selectedMeal)}
                          >
                            <span className="smp-btn-icon">🛒</span>
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Analytics Dashboard */}
      <div className="smp-analytics">
        <div className="smp-analytics-header">
          <h2 className="smp-analytics-title">📊 Nutrition Analytics</h2>
          <button 
            className="smp-toggle-btn"
            onClick={() => setShowNutritionBreakdown(!showNutritionBreakdown)}
          >
            {showNutritionBreakdown ? '📈 Hide Details' : '📊 Show Details'}
          </button>
        </div>
        
        <div className="smp-stats-dashboard">
          <div className="smp-stat-card premium">
            <div className="smp-stat-icon">🍽️</div>
            <div className="smp-stat-content">
              <div className="smp-stat-value">{weeklyStats.totalMeals}</div>
              <div className="smp-stat-label">Total Meals</div>
              {weeklyStats.totalMeals === 0 ? (
                <div className="smp-stat-sub">No meals selected</div>
              ) : (
                <div className="smp-stat-sub">{(weeklyStats.totalMeals / 7).toFixed(1)} meals/day</div>
              )}
            </div>
          </div>
          
          <div className="smp-stat-card premium">
            <div className="smp-stat-icon">🔥</div>
            <div className="smp-stat-content">
              <div className="smp-stat-value">{Math.round(weeklyStats.totalCalories)}</div>
              <div className="smp-stat-label">Weekly Calories</div>
              <div className="smp-stat-sub">{Math.round(weeklyStats.avgCaloriesPerDay)}/day avg</div>
            </div>
          </div>
          
          <div className="smp-stat-card premium">
            <div className="smp-stat-icon">💰</div>
            <div className="smp-stat-content">
              <div className="smp-stat-value">{currency}{Math.round(weeklyStats.totalPrice)}</div>
              <div className="smp-stat-label">Total Cost</div>
              <div className="smp-stat-sub">{currency}{Math.round(weeklyStats.avgPricePerDay)}/day avg</div>
            </div>
          </div>
          
          <div className="smp-stat-card premium">
            <div className="smp-stat-icon">💪</div>
            <div className="smp-stat-content">
              <div className="smp-stat-value">{Math.round(weeklyStats.totalProtein)}g</div>
              <div className="smp-stat-label">Total Protein</div>
              <div className="smp-stat-sub">{weeklyStats.proteinPercentage}% of macros</div>
            </div>
          </div>
        </div>
        
        {showNutritionBreakdown && weeklyStats.totalMeals > 0 && (
          <div className="smp-nutrition-breakdown">
            <div className="smp-macro-chart">
              <h3>🥗 Real-Time Macronutrient Breakdown</h3>
              <div className="smp-macro-bars">
                <div className="smp-macro-item">
                  <span className="smp-macro-label">Protein ({weeklyStats.proteinPercentage}%)</span>
                  <div className="smp-macro-bar">
                    <div className="smp-macro-fill protein" style={{ width: `${Math.min(weeklyStats.proteinPercentage, 100)}%` }}></div>
                  </div>
                  <span className="smp-macro-value">{Math.round(weeklyStats.totalProtein)}g</span>
                </div>
                <div className="smp-macro-item">
                  <span className="smp-macro-label">Carbs ({weeklyStats.carbsPercentage}%)</span>
                  <div className="smp-macro-bar">
                    <div className="smp-macro-fill carbs" style={{ width: `${Math.min(weeklyStats.carbsPercentage, 100)}%` }}></div>
                  </div>
                  <span className="smp-macro-value">{Math.round(weeklyStats.totalCarbs)}g</span>
                </div>
                <div className="smp-macro-item">
                  <span className="smp-macro-label">Fats ({weeklyStats.fatPercentage}%)</span>
                  <div className="smp-macro-bar">
                    <div className="smp-macro-fill fats" style={{ width: `${Math.min(weeklyStats.fatPercentage, 100)}%` }}></div>
                  </div>
                  <span className="smp-macro-value">{Math.round(weeklyStats.totalFat)}g</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {showNutritionBreakdown && weeklyStats.totalMeals === 0 && (
          <div className="smp-nutrition-breakdown">
            <div className="smp-macro-chart">
              <h3>🥗 Macronutrient Breakdown</h3>
              <div className="smp-empty-state">
                <p>Select meals to see your nutrition breakdown</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="smp-actions">
          <button 
            className="smp-btn secondary" 
            onClick={clearMealPlan}
            disabled={weeklyStats.totalMeals === 0}
          >
            <span className="smp-btn-icon">🗑️</span>
            Clear All Plans
          </button>
          <button 
            className="smp-btn primary"
            onClick={handleOrderSubmit}
            disabled={weeklyStats.totalMeals === 0}
            title={weeklyStats.totalMeals === 0 ? "Please select meals to place an order" : ""}
          >
            <span className="smp-btn-icon">🚀</span>
            {weeklyStats.totalMeals === 0 
              ? "Select Meals to Order" 
              : `Order Complete Plan (${weeklyStats.totalMeals} meals)`
            }
          </button>
        </div>
        
        {weeklyStats.totalMeals === 0 && (
          <div className="smp-empty-message">
            <p>🍽️ Start by selecting meals for each day and time slot to see your personalized nutrition analytics!</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default EnhancedMealPlanner;