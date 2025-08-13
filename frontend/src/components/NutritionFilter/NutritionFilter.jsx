import React, { useState, useContext, useEffect, useRef, useMemo } from "react";
import { StoreContext } from "../../Context/StoreContext";
import "./NutritionFilter.css";

const DEFAULT_FILTERS = {
  maxCalories: "",
  minProtein: "",
  maxCarbs: "",
  maxFat: "",
};

// Nutrition data from your CSV file
const NUTRITION_DATA = [
  { Name: "Greek Salad", Calories: 250, Protein: 5, Carbs: 10, Fat: 18 },
  { Name: "Veg Salad", Calories: 200, Protein: 3, Carbs: 15, Fat: 12 },
  { Name: "Clover Salad", Calories: 220, Protein: 4, Carbs: 12, Fat: 14 },
  { Name: "Chicken Salad", Calories: 300, Protein: 25, Carbs: 6, Fat: 20 },
  { Name: "Lasagna Rolls", Calories: 400, Protein: 15, Carbs: 45, Fat: 18 },
  { Name: "Peri Peri Rolls", Calories: 350, Protein: 12, Carbs: 40, Fat: 15 },
  { Name: "Chicken Rolls", Calories: 450, Protein: 20, Carbs: 40, Fat: 25 },
  { Name: "Veg Rolls", Calories: 350, Protein: 10, Carbs: 45, Fat: 10 },
  { Name: "Ripple Ice Cream", Calories: 200, Protein: 4, Carbs: 25, Fat: 12 },
  { Name: "Fruit Ice Cream", Calories: 180, Protein: 3, Carbs: 22, Fat: 10 },
  { Name: "Jar Ice Cream", Calories: 150, Protein: 3, Carbs: 20, Fat: 8 },
  { Name: "Vanilla Ice Cream", Calories: 200, Protein: 4, Carbs: 24, Fat: 11 },
  { Name: "Chicken Sandwich", Calories: 0, Protein: 0, Carbs: 0, Fat: 0 },
  { Name: "Vegan Sandwich", Calories: 0, Protein: 0, Carbs: 0, Fat: 0 },
  { Name: "Grilled Sandwich", Calories: 0, Protein: 0, Carbs: 0, Fat: 0 },
  { Name: "Bread Sandwich", Calories: 0, Protein: 0, Carbs: 0, Fat: 0 },
  { Name: "Cup Cake", Calories: 250, Protein: 4, Carbs: 30, Fat: 12 },
  { Name: "Vegan Cake", Calories: 200, Protein: 5, Carbs: 35, Fat: 10 },
  { Name: "Butterscotch Cake", Calories: 300, Protein: 5, Carbs: 40, Fat: 15 },
  { Name: "Sliced Cake", Calories: 280, Protein: 4, Carbs: 38, Fat: 12 },
  { Name: "Garlic Mushroom", Calories: 180, Protein: 5, Carbs: 8, Fat: 10 },
  { Name: "Fried Cauliflower", Calories: 250, Protein: 6, Carbs: 15, Fat: 12 },
  { Name: "Mix Veg Pulao", Calories: 220, Protein: 5, Carbs: 35, Fat: 8 },
  { Name: "Rice Zucchini", Calories: 200, Protein: 4, Carbs: 30, Fat: 9 },
  { Name: "Cheese Pasta", Calories: 400, Protein: 12, Carbs: 45, Fat: 20 },
  { Name: "Tomato Pasta", Calories: 350, Protein: 10, Carbs: 50, Fat: 15 },
  { Name: "Creamy Pasta", Calories: 450, Protein: 15, Carbs: 40, Fat: 25 },
  { Name: "Chicken Pasta", Calories: 400, Protein: 10, Carbs: 48, Fat: 18 },
  { Name: "Butter Noodles", Calories: 350, Protein: 8, Carbs: 55, Fat: 10 },
  { Name: "Veg Noodles", Calories: 300, Protein: 7, Carbs: 50, Fat: 8 },
  { Name: "Somen Noodles", Calories: 400, Protein: 10, Carbs: 60, Fat: 12 },
  { Name: "Cooked Noodles", Calories: 320, Protein: 9, Carbs: 58, Fat: 10 },
  { Name: "BBQ Chicken", Calories: 600, Protein: 35, Carbs: 12, Fat: 40 },
  { Name: "Spicy Chicken Wings", Calories: 300, Protein: 20, Carbs: 15, Fat: 12 },
  { Name: "Tandoori Chicken", Calories: 450, Protein: 30, Carbs: 10, Fat: 25 },
  { Name: "Grilled Chicken", Calories: 450, Protein: 30, Carbs: 10, Fat: 25 },
];

const parseNum = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const NutritionFilter = () => {
  const {
    food_list = [],
    setFilteredFoodList,
    cartItems = {},
    addToCart,
    removeFromCart,
  } = useContext(StoreContext) || {};

  // Dark mode state with localStorage persistence
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nf_dark_mode")) || false;
    } catch {
      return false;
    }
  });
  
  useEffect(() => {
    localStorage.setItem("nf_dark_mode", JSON.stringify(darkMode));
  }, [darkMode]);

  const [filters, setFilters] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("nf_last_filters") || "null");
      return saved || DEFAULT_FILTERS;
    } catch {
      return DEFAULT_FILTERS;
    }
  });
  
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [errors, setErrors] = useState({});
  const [live, setLive] = useState(true);
  const [sortBy, setSortBy] = useState("match");
  const [results, setResults] = useState([]);
  const [topMatches, setTopMatches] = useState([]);
  const [presets, setPresets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nf_presets") || "[]");
    } catch {
      return [];
    }
  });
  const [isApplying, setIsApplying] = useState(false);

  const debounceRef = useRef(null);

  // Create nutrition map from the NUTRITION_DATA array
  const nutritionMap = useMemo(() => {
    const map = {};
    NUTRITION_DATA.forEach(item => {
      map[item.Name] = {
        calories: item.Calories,
        protein: item.Protein,
        carbs: item.Carbs,
        fat: item.Fat
      };
    });
    return map;
  }, []);

  // Enhanced nutrient helper that uses nutritionMap
  const getNutrient = (item, key) => {
    if (!item) return 0;
    
    // First try to get from nutritionMap using item name
    const nutrition = nutritionMap[item.name] || {};
    if (nutrition[key] !== undefined) return nutrition[key];
    
    // Fallback to existing properties
    if (typeof item[key] === "number") return item[key];
    if (item.nutrition?.[key]) return item.nutrition[key];
    if (item.nutrients?.[key]) return item.nutrients[key];
    
    switch(key) {
      case "calories": return item.calories || item.kcal || item.energy || 0;
      case "protein": return item.protein || item.protein_g || 0;
      case "carbs": return item.carbs || item.carbohydrates || item.carbs_g || 0;
      case "fat": return item.fat || item.fat_g || 0;
      default: return 0;
    }
  };

  // Memoized cart totals
  const cartTotals = useMemo(() => {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, items: 0 };
    
    for (const [id, qty] of Object.entries(cartItems)) {
      const quantity = Number(qty) || 0;
      if (quantity <= 0) continue;
      
      const product = food_list.find(p => String(p._id) === String(id));
      if (!product) continue;
      
      totals.calories += getNutrient(product, "calories") * quantity;
      totals.protein += getNutrient(product, "protein") * quantity;
      totals.carbs += getNutrient(product, "carbs") * quantity;
      totals.fat += getNutrient(product, "fat") * quantity;
      totals.items += quantity;
    }
    
    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat),
      items: totals.items
    };
  }, [cartItems, food_list]);

  const validate = (flts) => {
    const e = {};
    for (const [k, v] of Object.entries(flts)) {
      if (v === "") continue;
      const n = Number(v);
      if (!Number.isFinite(n)) e[k] = "Invalid number";
      else if (n < 0) e[k] = "Cannot be negative";
    }
    return e;
  };

  const scoreItem = (item, flts) => {
    let score = 100;
    const cal = getNutrient(item, "calories");
    const prot = getNutrient(item, "protein");
    const carbs = getNutrient(item, "carbs");
    const fat = getNutrient(item, "fat");

    const applyConstraint = (value, limit, penalty, bonus) => {
      if (limit === "" || limit === null) return;
      const numLimit = Number(limit);
      if (value > numLimit) {
        score -= clamp(((value - numLimit) / Math.max(1, numLimit)) * penalty, 0, penalty);
      } else {
        score += clamp(((numLimit - value) / Math.max(1, numLimit)) * bonus, 0, bonus);
      }
    };

    applyConstraint(cal, flts.maxCalories, 60, 5);
    applyConstraint(carbs, flts.maxCarbs, 30, 3);
    applyConstraint(fat, flts.maxFat, 20, 2);
    
    if (flts.minProtein !== "" && flts.minProtein !== null) {
      const minProt = Number(flts.minProtein);
      if (prot < minProt) {
        score -= clamp(((minProt - prot) / Math.max(1, minProt)) * 50, 0, 50);
      } else {
        score += clamp(((prot - minProt) / Math.max(1, minProt)) * 10, 0, 10);
      }
    }
    
    return Math.round(clamp(score, 0, 100));
  };

  const calcFiltered = (flts) => {
    const parsed = {
      maxCalories: parseNum(flts.maxCalories),
      minProtein: parseNum(flts.minProtein),
      maxCarbs: parseNum(flts.maxCarbs),
      maxFat: parseNum(flts.maxFat),
    };

    let list = [...food_list];
    
    if (parsed.maxCalories !== null) {
      list = list.filter(it => getNutrient(it, "calories") <= parsed.maxCalories);
    }
    if (parsed.minProtein !== null) {
      list = list.filter(it => getNutrient(it, "protein") >= parsed.minProtein);
    }
    if (parsed.maxCarbs !== null) {
      list = list.filter(it => getNutrient(it, "carbs") <= parsed.maxCarbs);
    }
    if (parsed.maxFat !== null) {
      list = list.filter(it => getNutrient(it, "fat") <= parsed.maxFat);
    }

    const withScore = list.map(it => ({
      ...it,
      __matchScore: scoreItem(it, flts)
    }));

    switch(sortBy) {
      case "calories": 
        withScore.sort((a, b) => getNutrient(a, "calories") - getNutrient(b, "calories"));
        break;
      case "protein": 
        withScore.sort((a, b) => getNutrient(b, "protein") - getNutrient(a, "protein"));
        break;
      default: 
        withScore.sort((a, b) => b.__matchScore - a.__matchScore);
    }

    return withScore;
  };

  const applyFilters = (flts = filters) => {
    setIsApplying(true);
    const e = validate(flts);
    setErrors(e);
    
    if (Object.keys(e).length === 0) {
      const final = calcFiltered(flts);
      setResults(final);
      setAppliedFilters(flts);
      
      if (typeof setFilteredFoodList === "function") {
        setFilteredFoodList(final);
      }
      
      try {
        localStorage.setItem("nf_last_filters", JSON.stringify(flts));
      } catch {}
      
      const suggestions = food_list
        .map(it => ({ ...it, __matchScore: scoreItem(it, flts) }))
        .sort((a, b) => b.__matchScore - a.__matchScore)
        .slice(0, 8);
      
      setTopMatches(suggestions);
    }
    
    setIsApplying(false);
  };

  useEffect(() => {
    setErrors(validate(filters));
    if (live) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => applyFilters(filters), 320);
      return () => clearTimeout(debounceRef.current);
    }
  }, [filters, sortBy, food_list, live]);

  useEffect(() => {
    applyFilters(filters);
  }, [food_list]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value || "" }));
  };

  const handleRangeChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePreset = (name) => {
    if (!name) return;
    const newPresets = [...presets, { name, filters }];
    setPresets(newPresets);
    localStorage.setItem("nf_presets", JSON.stringify(newPresets));
  };

  const handleLoadPreset = (preset) => {
    if (!preset?.filters) return;
    setFilters(preset.filters);
    applyFilters(preset.filters);
  };

  const handleDeletePreset = (index) => {
    const newPresets = presets.filter((_, i) => i !== index);
    setPresets(newPresets);
    localStorage.setItem("nf_presets", JSON.stringify(newPresets));
  };

  const handleAddToCart = (product) => {
    addToCart?.(String(product._id));
  };

  const handleRemoveFromCart = (product) => {
    removeFromCart?.(String(product._id));
  };

  const exportResultsCSV = () => {
    const headers = ["Name", "Calories", "Protein (g)", "Carbs (g)", "Fat (g)"];
    const rows = results.map(item => [
      `"${(item.name || item.title || "").replace(/"/g, '""')}"`,
      getNutrient(item, "calories"),
      getNutrient(item, "protein"),
      getNutrient(item, "carbs"),
      getNutrient(item, "fat")
    ]);
    
    exportCSV("nutrition_results", headers, rows);
  };

  const exportCartCSV = () => {
    const headers = ["Name", "Quantity", "Calories", "Protein (g)", "Carbs (g)", "Fat (g)"];
    const rows = [];
    
    // Add individual items
    for (const [id, qty] of Object.entries(cartItems)) {
      const product = food_list.find(p => String(p._id) === String(id));
      if (!product) continue;
      
      rows.push([
        `"${(product.name || product.title || "").replace(/"/g, '""')}"`,
        qty,
        getNutrient(product, "calories") * qty,
        getNutrient(product, "protein") * qty,
        getNutrient(product, "carbs") * qty,
        getNutrient(product, "fat") * qty
      ]);
    }
    
    // Add totals row
    rows.push([]); // Empty row
    rows.push(["TOTALS", cartTotals.items, cartTotals.calories, cartTotals.protein, cartTotals.carbs, cartTotals.fat]);
    
    exportCSV("nutrition_cart", headers, rows);
  };

  const exportCSV = (prefix, headers, rows) => {
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prefix}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const Progress = ({ value = 0, max = 100 }) => {
    const pct = max > 0 ? clamp((value / max) * 100, 0, 100) : 0;
    return (
      <div className="nf-progress" aria-hidden>
        <div className="nf-progress-bar" style={{ width: `${pct}%` }} />
      </div>
    );
  };

  return (
    <section className={`nutrition-filter nf-card ${darkMode ? 'dark-mode' : ''}`} aria-live="polite">
      <div className="nf-header">
        <h2>Nutrition Filter — Real-time</h2>

        <div className="nf-top-actions">
          <button 
            className="nf-btn ghost"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle dark mode"
          >
            {darkMode ? '🌞 Light' : '🌙 Dark'}
          </button>
          
          <label className="nf-live-toggle" title="Toggle live filtering">
            <input type="checkbox" checked={live} onChange={() => setLive(s => !s)} /> Live
          </label>

          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="match">Best Match</option>
            <option value="calories">Calories (asc)</option>
            <option value="protein">Protein (desc)</option>
          </select>

          <button className="nf-btn ghost" onClick={exportResultsCSV}>
            Export Results CSV
          </button>
        </div>
      </div>

      <div className="nf-grid">
        <div className="nf-left">
          <div className="nf-section nf-filters">
            <h3>Filter Targets</h3>

            <div className="nf-row">
              <div className="nf-input-group">
                <label>Max Calories</label>
                <input 
                  type="number" 
                  name="maxCalories" 
                  value={filters.maxCalories} 
                  onChange={handleChange} 
                  placeholder="e.g. 600" 
                  min="0" 
                />
                <input 
                  className="nf-range" 
                  type="range" 
                  min="0" 
                  max="2000" 
                  step="10" 
                  value={filters.maxCalories || 600} 
                  onChange={e => handleRangeChange("maxCalories", e.target.value)} 
                />
                <small className="nf-help">Max total calories per item</small>
                {errors.maxCalories && <div className="nf-error">{errors.maxCalories}</div>}
              </div>

              <div className="nf-input-group">
                <label>Min Protein (g)</label>
                <input 
                  type="number" 
                  name="minProtein" 
                  value={filters.minProtein} 
                  onChange={handleChange} 
                  placeholder="e.g. 20" 
                  min="0" 
                />
                <input 
                  className="nf-range" 
                  type="range" 
                  min="0" 
                  max="200" 
                  step="1" 
                  value={filters.minProtein || 20} 
                  onChange={e => handleRangeChange("minProtein", e.target.value)} 
                />
                <small className="nf-help">Minimum protein per item</small>
                {errors.minProtein && <div className="nf-error">{errors.minProtein}</div>}
              </div>
            </div>

            <div className="nf-row">
              <div className="nf-input-group">
                <label>Max Carbs (g)</label>
                <input 
                  type="number" 
                  name="maxCarbs" 
                  value={filters.maxCarbs} 
                  onChange={handleChange} 
                  placeholder="e.g. 40" 
                  min="0" 
                />
                <input 
                  className="nf-range" 
                  type="range" 
                  min="0" 
                  max="400" 
                  step="1" 
                  value={filters.maxCarbs || 40} 
                  onChange={e => handleRangeChange("maxCarbs", e.target.value)} 
                />
                <small className="nf-help">Upper limit for carbs</small>
                {errors.maxCarbs && <div className="nf-error">{errors.maxCarbs}</div>}
              </div>

              <div className="nf-input-group">
                <label>Max Fat (g)</label>
                <input 
                  type="number" 
                  name="maxFat" 
                  value={filters.maxFat} 
                  onChange={handleChange} 
                  placeholder="e.g. 20" 
                  min="0" 
                />
                <input 
                  className="nf-range" 
                  type="range" 
                  min="0" 
                  max="200" 
                  step="1" 
                  value={filters.maxFat || 20} 
                  onChange={e => handleRangeChange("maxFat", e.target.value)} 
                />
                <small className="nf-help">Upper limit for fat</small>
                {errors.maxFat && <div className="nf-error">{errors.maxFat}</div>}
              </div>
            </div>

            <div className="nf-actions">
              <button 
                className="nf-btn primary" 
                onClick={() => applyFilters(filters)} 
                disabled={isApplying}
              >
                {isApplying ? "Applying..." : "Apply Filters"}
              </button>

              <button
                className="nf-btn"
                onClick={() => {
                  const name = prompt("Save preset as (name):");
                  if (name) handleSavePreset(name);
                }}
              >
                Save Preset
              </button>

              <button
                className="nf-btn ghost"
                onClick={() => {
                  setFilters(DEFAULT_FILTERS);
                  applyFilters(DEFAULT_FILTERS);
                  localStorage.removeItem("nf_last_filters");
                }}
              >
                Reset
              </button>
            </div>

            <div className="nf-presets">
              <h4>Presets</h4>
              <div className="nf-preset-list">
                {presets.length === 0 ? (
                  <small className="muted">No presets</small>
                ) : (
                  presets.map((p, i) => (
                    <div className="nf-preset" key={i}>
                      <button className="nf-btn small" onClick={() => handleLoadPreset(p)}>
                        {p.name}
                      </button>
                      <button className="nf-btn small ghost" onClick={() => handleDeletePreset(i)}>
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="nf-section nf-cart">
            <h3>Cart Preview ({cartTotals.items} items)</h3>
            {cartTotals.items === 0 ? (
              <div className="nf-empty">Cart is empty</div>
            ) : (
              <>
                <ul className="nf-cart-list">
                  {Object.entries(cartItems).map(([id, qty]) => {
                    const product = food_list.find(p => String(p._id) === String(id));
                    if (!product) return null;
                    
                    return (
                      <li className="nf-cart-item" key={id}>
                        <div className="nf-cart-meta">
                          <div className="nf-cart-title">{product.name || product.title}</div>
                          <div className="nf-cart-nuts">
                            <span>{getNutrient(product, "calories") * qty} kcal</span>
                            <span>{getNutrient(product, "protein") * qty}g P</span>
                            <span>{getNutrient(product, "carbs") * qty}g C</span>
                            <span>{getNutrient(product, "fat") * qty}g F</span>
                          </div>
                        </div>

                        <div className="nf-cart-controls">
                          <div className="muted small">Qty: {qty}</div>
                          <div className="nf-cart-buttons">
                            <button className="nf-btn small" onClick={() => handleAddToCart(product)}>
                              +
                            </button>
                            <button className="nf-btn small ghost" onClick={() => handleRemoveFromCart(product)}>
                              -
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="nf-cart-totals">
                  <div className="nf-tot-row">
                    <strong>Total Calories</strong>
                    <span>{cartTotals.calories}</span>
                  </div>

                  <div className="nf-macro-grid">
                    <div>
                      <small>Protein</small>
                      <div className="nf-stat">
                        <strong>{cartTotals.protein} g</strong>
                        <small>target {appliedFilters.minProtein || "—"}</small>
                        <Progress 
                          value={cartTotals.protein} 
                          max={parseNum(appliedFilters.minProtein) || Math.max(100, cartTotals.protein)} 
                        />
                      </div>
                    </div>

                    <div>
                      <small>Carbs</small>
                      <div className="nf-stat">
                        <strong>{cartTotals.carbs} g</strong>
                        <small>limit {appliedFilters.maxCarbs || "—"}</small>
                        <Progress 
                          value={cartTotals.carbs} 
                          max={parseNum(appliedFilters.maxCarbs) || Math.max(100, cartTotals.carbs)} 
                        />
                      </div>
                    </div>

                    <div>
                      <small>Fat</small>
                      <div className="nf-stat">
                        <strong>{cartTotals.fat} g</strong>
                        <small>limit {appliedFilters.maxFat || "—"}</small>
                        <Progress 
                          value={cartTotals.fat} 
                          max={parseNum(appliedFilters.maxFat) || Math.max(50, cartTotals.fat)} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="nf-actions" style={{ marginTop: 10 }}>
                    <button className="nf-btn" onClick={exportCartCSV}>
                      Export Cart CSV
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <aside className="nf-right">
          <div className="nf-section nf-summary">
            <h3>Live Summary</h3>
            <p className="muted">{results.length} results</p>

            <div className="nf-target-overview">
              <div className="nf-ov-row">
                <div className="nf-ov-label">Calories</div>
                <div className="nf-ov-value">{appliedFilters.maxCalories || "—"}</div>
                <Progress 
                  value={cartTotals.calories} 
                  max={parseNum(appliedFilters.maxCalories) || Math.max(2000, cartTotals.calories)} 
                />
              </div>

              <div className="nf-ov-row">
                <div className="nf-ov-label">Protein</div>
                <div className="nf-ov-value">{appliedFilters.minProtein || "—"} g</div>
                <Progress 
                  value={cartTotals.protein} 
                  max={parseNum(appliedFilters.minProtein) || Math.max(100, cartTotals.protein)} 
                />
              </div>

              <div className="nf-ov-row">
                <div className="nf-ov-label">Carbs</div>
                <div className="nf-ov-value">{appliedFilters.maxCarbs || "—"} g</div>
                <Progress 
                  value={cartTotals.carbs} 
                  max={parseNum(appliedFilters.maxCarbs) || Math.max(200, cartTotals.carbs)} 
                />
              </div>

              <div className="nf-ov-row">
                <div className="nf-ov-label">Fat</div>
                <div className="nf-ov-value">{appliedFilters.maxFat || "—"} g</div>
                <Progress 
                  value={cartTotals.fat} 
                  max={parseNum(appliedFilters.maxFat) || Math.max(100, cartTotals.fat)} 
                />
              </div>
            </div>
          </div>

          <div className="nf-section nf-suggestions">
            <h3>Top Matches</h3>
            {topMatches.length === 0 ? (
              <div className="nf-empty">No suggestions — tweak filters</div>
            ) : (
              <ul className="nf-suggest-list">
                {topMatches.map(it => (
                  <li key={it._id || it.name} className="nf-suggest-item">
                    <div>
                      <div className="nf-suggest-title">{it.name}</div>
                      <div className="nf-suggest-nut">
                        <span>{getNutrient(it, "calories")} kcal</span>
                        <span>{getNutrient(it, "protein")}g P</span>
                        <span>{getNutrient(it, "carbs")}g C</span>
                        <span>{getNutrient(it, "fat")}g F</span>
                      </div>
                    </div>
                    <div className="nf-suggest-actions">
                      <div className="score-badge">{Math.round(it.__matchScore || 0)}</div>
                      <button className="nf-btn small" onClick={() => handleAddToCart(it)}>
                        + Add
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="nf-section nf-results">
            <h3>Filtered Results</h3>
            <div className="nf-results-list">
              {results.length === 0 ? (
                <div className="nf-empty">No items match</div>
              ) : (
                results.slice(0, 20).map(it => (
                  <div key={it._id || it.name} className="nf-result-card">
                    <div className="nf-result-left">
                      <div className="nf-result-title">{it.name}</div>
                      <div className="nf-result-nuts">
                        <span>{getNutrient(it, "calories")} kcal</span>
                        <span>{getNutrient(it, "protein")}g P</span>
                        <span>{getNutrient(it, "carbs")}g C</span>
                        <span>{getNutrient(it, "fat")}g F</span>
                      </div>
                    </div>
                    <div className="nf-result-right">
                      <div className="score-badge">{it.__matchScore || 0}</div>
                      <button className="nf-btn small" onClick={() => handleAddToCart(it)}>
                        Add
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="muted small" style={{ marginTop: 8 }}>
              Showing top {Math.min(results.length, 20)} of {results.length}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default NutritionFilter;