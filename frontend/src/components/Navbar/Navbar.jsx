import React, { useContext, useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import nav_dropdown from '../../assets/nav_dropdown.png';
import SearchBar from '../SearchBar/SearchBar';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();

  const [showSearch, setShowSearch] = useState(false);
  const menuRef = useRef(null);
  const navbarRef = useRef(null);

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle('navbar-menu-visible');
    e.target.classList.toggle('open');
  };

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (e) => {
      if (navbarRef.current && !navbarRef.current.contains(e.target)) {
        menuRef.current.classList.remove('navbar-menu-visible');
        const dropdown = document.querySelector('.nav_dropdown');
        if (dropdown) dropdown.classList.remove('open');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate('/');
  };

  // Close search when menu changes
  useEffect(() => {
    setShowSearch(false);
  }, [menu]);

  return (
    <>
      <div className='navbar' ref={navbarRef}>
        <Link to='/' className='logo-container'>
          <img className='logo' src={assets.logo} alt="Cravezy" />
        </Link>
        
        <img 
          className="nav_dropdown" 
          onClick={dropdown_toggle} 
          src={nav_dropdown} 
          alt="dropdown icon" 
        />
        
        <ul className="navbar-menu" ref={menuRef}>
          <Link to="/" onClick={() => setMenu("home")} className={`${menu === "home" ? "active" : ""}`}>HOME</Link>
          <Link to="/menu" onClick={() => setMenu("menu")} className={`${menu === "menu" ? "active" : ""}`}>MENU</Link>
          <Link to="/mealplanner" onClick={() => setMenu("mealplanner")} className={`${menu === "mealplanner" ? "active" : ""}`}>MEAL PLANNER</Link>
          <Link to="/app-download" onClick={() => setMenu("app-download")} className={`${menu === "app-download" ? "active" : ""}`}>APP DOWNLOAD</Link>
          <a href='#footer' onClick={() => setMenu("contact")} className={`${menu === "contact" ? "active" : ""}`}>CONTACT US</a>
        </ul>
        
        <div className="navbar-right">
          <ThemeToggle />
          
          <button 
            className="search-icon-button" 
            onClick={() => setShowSearch(true)}
            aria-label="Open search"
          >
            <img src={assets.search_icon} alt="Search" />
          </button>
          
          <Link to='/cart' className='navbar-search-icon'>
            <img src={assets.basket_icon} alt="Cart" />
            <div className={getTotalCartAmount() > 0 ? "dot" : ""}></div>
          </Link>
          
          {!token ? (
            <button className="sign-in-btn" onClick={() => setShowLogin(true)}>sign in</button>
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


        </div>
      </div>
      
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