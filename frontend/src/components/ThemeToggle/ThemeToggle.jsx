import React, { useState, useEffect } from 'react';
import themeManager from '../../utils/themeManager';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(themeManager.getTheme());

  useEffect(() => {
    themeManager.applyTheme(theme);
    const unsubscribe = themeManager.onThemeChange((newTheme) => {
      setTheme(newTheme);
    });
    return unsubscribe;
  }, []);

  const handleToggle = (e) => {
    e.preventDefault();
    const currentEffective = themeManager.getEffectiveTheme();
    const newTheme = currentEffective === 'light' ? 'dark' : 'light';
    themeManager.setTheme(newTheme);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle(e);
    }
  };

  const effectiveTheme = themeManager.getEffectiveTheme();
  const isDark = effectiveTheme === 'dark';

  return (
    <button
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle theme"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        color: '#ffffff',
        minWidth: '40px',
        transition: 'all 0.2s ease',
        opacity: 0.9
      }}
      onMouseEnter={(e) => {
        e.target.style.opacity = '1';
        e.target.style.transform = 'scale(1.05)';
        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.opacity = '0.9';
        e.target.style.transform = 'scale(1)';
        e.target.style.backgroundColor = 'transparent';
      }}
    >
      {isDark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
          <path d="M19 3v4M21 5h-4"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;