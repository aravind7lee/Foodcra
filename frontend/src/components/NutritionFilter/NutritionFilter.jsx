import React, { useState, useContext, useEffect, useRef, useMemo } from "react";
import { StoreContext } from "../../Context/StoreContext";
import "./NutritionFilter.css";

const DEFAULT_FILTERS = {
  minCalories: 100,
  minProtein: 5,
  maxCarbs: 100,
  maxFat: 50,
};

const parseNum = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
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
  const [filteredCount, setFilteredCount] = useState(0);
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

  // Enhanced nutrient helper with proper fallbacks
  const getNutrient = (item, key) => {
    if (!item) return 0;
    
    // Direct property access with fallbacks
    switch(key) {
      case "calories": 
        return Number(item.calories || item.kcal || item.energy || 0) || 0;
      case "protein": 
        return Number(item.protein || item.protein_g || 0) || 0;
      case "carbs": 
        return Number(item.carbs || item.carbohydrates || item.carbs_g || 0) || 0;
      case "fat": 
        return Number(item.fat || item.fat_g || 0) || 0;
      default: 
        return 0;
    }
  };

  // Memoized cart totals with NaN protection
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
      calories: Math.round(totals.calories) || 0,
      protein: Math.round(totals.protein) || 0,
      carbs: Math.round(totals.carbs) || 0,
      fat: Math.round(totals.fat) || 0,
      items: totals.items || 0
    };
  }, [cartItems, food_list]);

  const validate = (flts) => {
    const e = {};
    for (const [k, v] of Object.entries(flts)) {
      if (v === "") continue;
      const n = Number(v);
      if (!Number.isFinite(n)) {
        e[k] = "Invalid number";
      } else if (n < 0) {
        e[k] = "Cannot be negative";
      }
    }
    return e;
  };

  const filterItems = (items, flts) => {
    return items.filter(item => {
      const cal = getNutrient(item, "calories");
      const prot = getNutrient(item, "protein");
      const carbs = getNutrient(item, "carbs");
      const fat = getNutrient(item, "fat");
      
      const minCal = parseNum(flts.minCalories);
      const minProt = parseNum(flts.minProtein);
      const maxCarbs = parseNum(flts.maxCarbs);
      const maxFat = parseNum(flts.maxFat);
      
      return (
        (minCal === null || cal >= minCal) &&
        (minProt === null || prot >= minProt) &&
        (maxCarbs === null || carbs <= maxCarbs) &&
        (maxFat === null || fat <= maxFat)
      );
    });
  };

  const scoreItem = (item, flts) => {
    let score = 100;
    const cal = getNutrient(item, "calories");
    const prot = getNutrient(item, "protein");
    const carbs = getNutrient(item, "carbs");
    const fat = getNutrient(item, "fat");

    // Simple scoring based on meeting criteria
    const minCal = parseNum(flts.minCalories);
    const minProt = parseNum(flts.minProtein);
    const maxCarbs = parseNum(flts.maxCarbs);
    const maxFat = parseNum(flts.maxFat);

    if (minCal && cal < minCal) score -= 20;
    if (minProt && prot < minProt) score -= 20;
    if (maxCarbs && carbs > maxCarbs) score -= 20;
    if (maxFat && fat > maxFat) score -= 20;
    
    return Math.max(0, score);
  };

  const calcFiltered = (flts) => {
    let list = [...food_list];
    
    list = filterItems(list, flts);

    const withScore = list.map(it => ({
      ...it,
      __matchScore: scoreItem(it, flts)
    }));

    withScore.sort((a, b) => b.__matchScore - a.__matchScore);

    return withScore;
  };

  const applyFilters = (flts = filters) => {
    setIsApplying(true);
    const e = validate(flts);
    setErrors(e);
    
    if (Object.keys(e).length === 0) {
      try {
        const final = calcFiltered(flts);
        setFilteredCount(final.length);
        
        if (typeof setFilteredFoodList === "function") {
          setFilteredFoodList(final);
        }
        
        localStorage.setItem("nf_last_filters", JSON.stringify(flts));
        
        setTopMatches(final.slice(0, 8));
        setAppliedFilters(flts);
      } catch (error) {
        console.error("Filtering error:", error);
      }
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
  }, [filters, food_list, live]);

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
        </div>
      </div>

      <div className="nf-grid">
        <div className="nf-left">
          <div className="nf-section nf-filters">
            <h3>Filter Targets</h3>

            <div className="nf-row">
              <div className="nf-input-group">
                <label>Min Calories</label>
                <input 
                  type="number" 
                  name="minCalories" 
                  value={filters.minCalories} 
                  onChange={handleChange} 
                  placeholder="e.g. 100" 
                  min="0" 
                />
                <input 
                  className="nf-range" 
                  type="range" 
                  min="0" 
                  max="1000" 
                  step="10" 
                  value={filters.minCalories || 100} 
                  onChange={e => handleRangeChange("minCalories", e.target.value)} 
                />
                <small className="nf-help">Minimum calories per item</small>
                {errors.minCalories && <div className="nf-error">{errors.minCalories}</div>}
              </div>

              <div className="nf-input-group">
                <label>Min Protein (g)</label>
                <input 
                  type="number" 
                  name="minProtein" 
                  value={filters.minProtein} 
                  onChange={handleChange} 
                  placeholder="e.g. 5" 
                  min="0" 
                />
                <input 
                  className="nf-range" 
                  type="range" 
                  min="0" 
                  max="50" 
                  step="1" 
                  value={filters.minProtein || 5} 
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
                  placeholder="e.g. 100" 
                  min="0" 
                />
                <input 
                  className="nf-range" 
                  type="range" 
                  min="0" 
                  max="200" 
                  step="1" 
                  value={filters.maxCarbs || 100} 
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
                  placeholder="e.g. 50" 
                  min="0" 
                />
                <input 
                  className="nf-range" 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1" 
                  value={filters.maxFat || 50} 
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
                {isApplying ? (
                  <span className="nf-loading">
                    <span className="nf-spinner"></span> Applying...
                  </span>
                ) : "Apply Filters"}
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
                            <span>{(getNutrient(product, "calories") * qty) || 0} kcal</span>
                            <span>{(getNutrient(product, "protein") * qty) || 0}g P</span>
                            <span>{(getNutrient(product, "carbs") * qty) || 0}g C</span>
                            <span>{(getNutrient(product, "fat") * qty) || 0}g F</span>
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
                </div>
              </>
            )}
          </div>
        </div>

        <aside className="nf-right">
          <div className="nf-section nf-summary">
            <h3>Live Summary</h3>
            <p className="muted">{filteredCount} results</p>

            <div className="nf-target-overview">
              <div className="nf-ov-row">
                <div className="nf-ov-label">Min Calories</div>
                <div className="nf-ov-value">{appliedFilters.minCalories || "—"}</div>
              </div>

              <div className="nf-ov-row">
                <div className="nf-ov-label">Min Protein (g)</div>
                <div className="nf-ov-value">{appliedFilters.minProtein || "—"}</div>
              </div>

              <div className="nf-ov-row">
                <div className="nf-ov-label">Max Carbs (g)</div>
                <div className="nf-ov-value">{appliedFilters.maxCarbs || "—"}</div>
              </div>

              <div className="nf-ov-row">
                <div className="nf-ov-label">Max Fat (g)</div>
                <div className="nf-ov-value">{appliedFilters.maxFat || "—"}</div>
              </div>
            </div>
          </div>

          <div className="nf-section nf-results">
            <h3>Real-time Calculation Results</h3>
            <div className="nf-results-summary">
              <div className="nf-result-stat">
                <div className="nf-stat-number">{filteredCount}</div>
                <div className="nf-stat-label">Total Food Items</div>
              </div>
              
              {(() => {
                const filtered = calcFiltered(appliedFilters);
                const totals = {
                  calories: filtered.reduce((sum, item) => sum + (getNutrient(item, "calories") || 0), 0),
                  protein: filtered.reduce((sum, item) => sum + (getNutrient(item, "protein") || 0), 0),
                  carbs: filtered.reduce((sum, item) => sum + (getNutrient(item, "carbs") || 0), 0),
                  fat: filtered.reduce((sum, item) => sum + (getNutrient(item, "fat") || 0), 0)
                };
                
                return (
                  <>
                    <div className="nf-result-stat">
                      <div className="nf-stat-number">{Math.round(totals.calories) || 0}</div>
                      <div className="nf-stat-label">Total Calories</div>
                    </div>
                    
                    <div className="nf-result-stat">
                      <div className="nf-stat-number">{Math.round(totals.protein) || 0}g</div>
                      <div className="nf-stat-label">Total Protein</div>
                    </div>
                    
                    <div className="nf-result-stat">
                      <div className="nf-stat-number">{Math.round(totals.carbs) || 0}g</div>
                      <div className="nf-stat-label">Total Carbs</div>
                    </div>
                    
                    <div className="nf-result-stat">
                      <div className="nf-stat-number">{Math.round(totals.fat) || 0}g</div>
                      <div className="nf-stat-label">Total Fat</div>
                    </div>
                  </>
                );
              })()}
            </div>
            
            {filteredCount > 0 && (
              <div className="nf-top-matches">
                <h4>Top Matches</h4>
                <div className="nf-match-list">
                  {topMatches.slice(0, 5).map((item, idx) => (
                    <div key={item._id || idx} className="nf-match-item">
                      <div className="nf-match-name">{item.name}</div>
                      <div className="nf-match-nutrients">
                        <span>{getNutrient(item, "calories") || 0} cal</span>
                        <span>{getNutrient(item, "protein") || 0}g P</span>
                        <span>{getNutrient(item, "carbs") || 0}g C</span>
                        <span>{getNutrient(item, "fat") || 0}g F</span>
                        <span className="nf-match-score">{item.__matchScore || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
};

export default NutritionFilter;