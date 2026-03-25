import React, { useContext, useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import SearchBar from '../SearchBar/SearchBar';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const navbarRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navbarRef.current && !navbarRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleMenuClick = (menuItem) => {
    setMenu(menuItem);
    setMobileMenuOpen(false);
    setShowSearch(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <nav className={`modern-navbar ${scrolled ? 'scrolled' : ''}`} ref={navbarRef}>
        <div className="navbar-container">
          {/* Logo */}
          <Link to='/' className='navbar-brand' onClick={() => handleMenuClick("home")}>
            <img className='navbar-logo' src={assets.logo} alt="Cravezy" />
          </Link>

          {/* Desktop Navigation */}
          <ul className="navbar-nav">
            <li>
              <Link 
                to="/" 
                onClick={() => handleMenuClick("home")} 
                className={`nav-link ${menu === "home" ? "active" : ""}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/menu" 
                onClick={() => handleMenuClick("menu")} 
                className={`nav-link ${menu === "menu" ? "active" : ""}`}
              >
                Menu
              </Link>
            </li>
            <li>
              <Link 
                to="/mealplanner" 
                onClick={() => handleMenuClick("mealplanner")} 
                className={`nav-link ${menu === "mealplanner" ? "active" : ""}`}
              >
                Meal Planner
              </Link>
            </li>
            <li>
              <Link 
                to="/app-download" 
                onClick={() => handleMenuClick("app-download")} 
                className={`nav-link ${menu === "app-download" ? "active" : ""}`}
              >
                App
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                onClick={() => handleMenuClick("contact")} 
                className={`nav-link ${menu === "contact" ? "active" : ""}`}
              >
                Contact
              </Link>
            </li>
          </ul>

          {/* Right Actions */}
          <div className="navbar-actions">
            <ThemeToggle />
            
            <button 
              className="action-btn search-btn" 
              onClick={() => setShowSearch(true)}
              aria-label="Search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            
            <Link to='/cart' className='action-btn cart-btn'>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {getTotalCartAmount() > 0 && <span className="cart-badge">{getTotalCartAmount() > 0 ? '•' : ''}</span>}
            </Link>
            
            {!token ? (
              <button className="btn-primary" onClick={() => setShowLogin(true)}>
                Sign In
              </button>
            ) : (
              <div className='navbar-profile'>
                <button className="profile-btn" aria-label="Profile">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </button>
                <div className='profile-dropdown'>
                  <button className="dropdown-item" onClick={() => { navigate('/myorders'); setMobileMenuOpen(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                    <span>My Orders</span>
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={logout}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <div className="mobile-menu-header">
            <Link to='/' className='mobile-logo' onClick={() => setMobileMenuOpen(false)}>
              <img src={assets.logo} alt="Cravezy" />
            </Link>
            <button 
              className="mobile-menu-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          <div className="mobile-menu-content">
            <Link to="/" onClick={() => handleMenuClick("home")} className={`mobile-nav-link ${menu === "home" ? "active" : ""}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>Home</span>
            </Link>
            <Link to="/menu" onClick={() => handleMenuClick("menu")} className={`mobile-nav-link ${menu === "menu" ? "active" : ""}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span>Menu</span>
            </Link>
            <Link to="/mealplanner" onClick={() => handleMenuClick("mealplanner")} className={`mobile-nav-link ${menu === "mealplanner" ? "active" : ""}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Meal Planner</span>
            </Link>
            <Link to="/app-download" onClick={() => handleMenuClick("app-download")} className={`mobile-nav-link ${menu === "app-download" ? "active" : ""}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
              <span>App Download</span>
            </Link>
            <Link to="/contact" onClick={() => handleMenuClick("contact")} className={`mobile-nav-link ${menu === "contact" ? "active" : ""}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Contact Us</span>
            </Link>
            
            {token && (
              <>
                <div className="mobile-menu-divider"></div>
                <button className="mobile-nav-link" onClick={() => { navigate('/myorders'); setMobileMenuOpen(false); }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  <span>My Orders</span>
                </button>
                <button className="mobile-nav-link logout-link" onClick={logout}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="mobile-menu-overlay" 
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}
      </nav>
      
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