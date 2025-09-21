/**
 * Theme Management System
 * Handles theme switching, persistence, and cross-tab sync
 */

const THEME_KEY = 'site:theme';
const CHANNEL_NAME = 'site-theme';

class ThemeManager {
  constructor() {
    this.callbacks = new Set();
    this.channel = null;
    this.init();
  }

  init() {
    // Initialize BroadcastChannel with fallback
    try {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.addEventListener('message', this.handleBroadcast.bind(this));
    } catch (e) {
      // Fallback to storage events for older browsers
      window.addEventListener('storage', this.handleStorageChange.bind(this));
    }
  }

  getTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
    return 'system';
  }

  getEffectiveTheme() {
    const theme = this.getTheme();
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }

  setTheme(theme) {
    if (!['light', 'dark', 'system'].includes(theme)) return;
    
    localStorage.setItem(THEME_KEY, theme);
    this.applyTheme(theme);
    this.notifyCallbacks(theme);
    this.broadcast(theme);
  }

  applyTheme(theme) {
    const effectiveTheme = theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }

  onThemeChange(callback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  notifyCallbacks(theme) {
    this.callbacks.forEach(callback => callback(theme));
  }

  broadcast(theme) {
    if (this.channel) {
      this.channel.postMessage({ theme });
    }
  }

  handleBroadcast(event) {
    if (event.data?.theme) {
      this.applyTheme(event.data.theme);
      this.notifyCallbacks(event.data.theme);
    }
  }

  handleStorageChange(event) {
    if (event.key === THEME_KEY && event.newValue) {
      this.applyTheme(event.newValue);
      this.notifyCallbacks(event.newValue);
    }
  }

  initSystemListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (this.getTheme() === 'system') {
        this.applyTheme('system');
        this.notifyCallbacks('system');
      }
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }
  }

  destroy() {
    if (this.channel) {
      this.channel.close();
    }
    this.callbacks.clear();
  }
}

// Create singleton instance
const themeManager = new ThemeManager();

// Initialize system preference listener
themeManager.initSystemListener();

export default themeManager;