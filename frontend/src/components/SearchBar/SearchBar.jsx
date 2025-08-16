import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import "./SearchBar.css";
import { StoreContext } from "../../Context/StoreContext";
import { useLocation, useNavigate } from "react-router-dom";

const MAX_SUGGESTIONS = 6;
const DEBOUNCE_MS = 180;

const SearchBar = ({ 
  placeholder = "Search dishes (e.g., Ice Cream, Pizza...)",
  isExpanded = false,
  onClose = () => {}
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    food_list = [],
    applySearch,
    resetSearch,
    setFilteredFoodList,
  } = useContext(StoreContext);

  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  // Build local index for suggestions (names + normalized)
  const localIndex = useMemo(() => {
    return (food_list || []).map((item) => {
      const name = (item.name || "").toString().toLowerCase();
      const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return { id: item._id, name: item.name || "", key: normalized, item };
    });
  }, [food_list]);

  // compute suggestions for current query (unique names)
  const suggestions = useMemo(() => {
    const q = (query || "").toString().trim().toLowerCase();
    if (!q) return [];
    const normalizedQ = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const seen = new Set();
    const out = [];
    for (const entry of localIndex) {
      if (entry.key.includes(normalizedQ)) {
        const name = entry.name;
        if (!seen.has(name)) {
          seen.add(name);
          out.push(name);
          if (out.length >= MAX_SUGGESTIONS) break;
        }
      }
    }
    return out;
  }, [localIndex, query]);

  // sync with URL param on mount/route change (do not auto-scroll here)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search") || "";
    setQuery(q);
    // set filtered list to match query if present
    if (q) {
      if (typeof applySearch === "function") applySearch(q);
      else if (typeof setFilteredFoodList === "function") {
        // fallback filter
        const normalizedQ = q.toString().toLowerCase();
        const results = (food_list || []).filter((it) =>
          `${it.name || ""} ${it.category || ""} ${it.description || ""}`
            .toLowerCase()
            .includes(normalizedQ)
        );
        setFilteredFoodList(results);
      }
    } else {
      if (typeof resetSearch === "function") resetSearch();
      else if (typeof setFilteredFoodList === "function") setFilteredFoodList(food_list);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, food_list]);

  // Close suggestions on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Debounced live search when user types while on /menu (no hash — avoid auto-scroll)
  useEffect(() => {
    const isOnMenu = location.pathname.startsWith("/menu");

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (isOnMenu) {
      debounceRef.current = setTimeout(() => {
        const trimmed = (query || "").toString().trim();
        if (trimmed) {
          if (typeof applySearch === "function") applySearch(trimmed);
          else if (typeof setFilteredFoodList === "function") {
            const normalized = trimmed.toLowerCase();
            const results = (food_list || []).filter((it) =>
              `${it.name || ""} ${it.category || ""} ${it.description || ""}`
                .toLowerCase()
                .includes(normalized)
            );
            setFilteredFoodList(results);
          }
          // update URL search param without hash to avoid FoodDisplay auto-scroll
          navigate(`/menu?search=${encodeURIComponent(trimmed)}`, { replace: true });
        } else {
          if (typeof resetSearch === "function") resetSearch();
          else if (typeof setFilteredFoodList === "function") setFilteredFoodList(food_list);
          navigate("/menu", { replace: true });
        }
      }, DEBOUNCE_MS);

      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = null;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, location.pathname]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const runLocalFilterImmediate = (raw) => {
    const q = (raw || "").toString().trim().toLowerCase();
    if (!q) {
      if (typeof setFilteredFoodList === "function") setFilteredFoodList(food_list);
      return;
    }
    const normalized = q.toLowerCase();
    const results = (food_list || []).filter((it) =>
      `${it.name || ""} ${it.category || ""} ${it.description || ""}`
        .toLowerCase()
        .includes(normalized)
    );
    if (typeof setFilteredFoodList === "function") setFilteredFoodList(results);
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const trimmed = (query || "").toString().trim();
    if (trimmed) {
      if (typeof applySearch === "function") applySearch(trimmed);
      else runLocalFilterImmediate(trimmed);
      // navigate with hash to ensure FoodDisplay scrolls once
      navigate(`/menu?search=${encodeURIComponent(trimmed)}#food-display`);
      onClose();
    } else {
      // empty -> reset
      if (typeof resetSearch === "function") resetSearch();
      else if (typeof setFilteredFoodList === "function") setFilteredFoodList(food_list);
      navigate("/menu#food-display");
    }
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  const clearSearch = () => {
    setQuery("");
    if (typeof resetSearch === "function") resetSearch();
    else if (typeof setFilteredFoodList === "function") setFilteredFoodList(food_list);
    setShowSuggestions(false);
    setActiveIndex(-1);

    // keep user where they are but remove search param if on menu (no hash)
    if (location.pathname.startsWith("/menu")) {
      navigate("/menu#food-display", { replace: true });
    }
  };

  const onSuggestionSelect = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setActiveIndex(-1);

    // run search + navigate with hash to scroll to results
    if (typeof applySearch === "function") applySearch(suggestion);
    else runLocalFilterImmediate(suggestion);

    navigate(`/menu?search=${encodeURIComponent(suggestion)}#food-display`);
    onClose();
  };

  // keyboard navigation
  const onInputKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
      onClose();
      return;
    }
    
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        // regular submit
        handleSubmit(e);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      setShowSuggestions(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      setShowSuggestions(true);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        onSuggestionSelect(suggestions[activeIndex]);
      } else {
        handleSubmit(e);
      }
    }
  };

  if (!isExpanded) return null;

  return (
    <div className="expanded-searchbar-root">
      <div className="expanded-searchbar-backdrop" onClick={onClose} />
      <div className="expanded-searchbar-content">
        <div className="searchbar-root" ref={rootRef}>
          <form className="searchbar" role="search" aria-label="Food search" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="search"
              className="searchbar-input"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(-1);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (query && suggestions.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={onInputKeyDown}
              placeholder={placeholder}
              aria-label="Search for food"
              autoComplete="off"
            />

            {query && (
              <button 
                type="button" 
                className="searchbar-clear" 
                onClick={clearSearch}
                aria-label="Clear search"
              >
                ×
              </button>
            )}

            <button type="submit" className="searchbar-submit" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="search-suggestions" role="listbox" aria-label="Search suggestions">
              {suggestions.map((s, idx) => (
                <li
                  key={s + idx}
                  role="option"
                  aria-selected={activeIndex === idx}
                  className={`search-suggestion-item ${activeIndex === idx ? "active" : ""}`}
                  onMouseDown={(ev) => {
                    // use onMouseDown to avoid input blur before click
                    ev.preventDefault();
                    onSuggestionSelect(s);
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;