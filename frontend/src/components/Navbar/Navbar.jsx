import React, { useContext, useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import nav_dropdown from '../../assets/nav_dropdown.png';
import SearchBar from '../SearchBar/SearchBar';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const menuRef = useRef(null);

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle('navbar-menu-visible');
    e.target.classList.toggle('open');
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate('/');
  };

  // Close search when menu changes
  useEffect(() => {
    setShowSearch(false);
  }, [menu]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSearch && !e.target.closest('.expanded-searchbar-content')) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch]);

  return (
    <>
      <div className='navbar'>
        <Link to='/'><img className='logo' src={assets.logo} alt="" /></Link>
        <img className="nav_dropdown" onClick={dropdown_toggle} src={nav_dropdown} alt="dropdown icon" />
        <ul className="navbar-menu" ref={menuRef}>
          <Link to="/" onClick={() => setMenu("home")} className={`${menu === "home" ? "active" : ""}`}>HOME</Link>
          <Link to="/menu" onClick={() => setMenu("menu")} className={`${menu === "menu" ? "active" : ""}`}>MENU</Link>
          <Link to="/mealplanner" onClick={() => setMenu("mealplanner")} className={`${menu === "mealplanner" ? "active" : ""}`}>MEAL PLANNER</Link>
          <Link to="/app-download" onClick={() => setMenu("app-download")} className={`${menu === "app-download" ? "active" : ""}`}>APP DOWNLOAD</Link>
          <a href='#footer' onClick={() => setMenu("contact")} className={`${menu === "contact" ? "active" : ""}`}>CONTACT US</a>
        </ul>
        <div className="navbar-right">
          {/* Search icon button */}
          <button 
            className="search-icon-button" 
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Open search"
          >
            <img src={assets.search_icon} alt="Search" />
          </button>
          
          <Link to='/cart' className='navbar-search-icon'>
            <img src={assets.basket_icon} alt="Cart" />
            <div className={getTotalCartAmount() > 0 ? "dot" : ""}></div>
          </Link>
          
          {!token ? (
            <button onClick={() => setShowLogin(true)}>sign in</button>
          ) : (
            <div className='navbar-profile'>
              <img src={assets.profile_icon} alt="Profile" />
              <ul className='navbar-profile-dropdown'>
                <li onClick={() => navigate('/myorders')}>
                  <img src={assets.bag_icon} alt="Orders" /> <p>Orders</p>
                </li>
                <hr />
                <li onClick={logout}>
                  <img src={assets.logout_icon} alt="Logout" /> <p>Logout</p>
                </li>
              </ul>
            </div>
          )}

          {/* Dark Mode Toggle Switch */}
          <label className="switch">
            <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
            <span className="slider"></span>
          </label>
        </div>
      </div>
      
      {/* Expanded Search Bar */}
      {showSearch && (
        <SearchBar 
          isExpanded={showSearch} 
          onClose={() => setShowSearch(false)}
          placeholder="Search dishes (e.g., Ice Cream, Pizza...)"
        />
      )}
    </>
  );
};

export default Navbar;