# Theme Implementation Guide

## Overview
This Food Website features a comprehensive dark/light theme system with real-time switching, cross-tab synchronization, and smooth animations. The theme system uses CSS custom properties and is designed for premium food UI aesthetics.

## 🎨 Theme Features
- **Instant Theme Switching**: Toggle between light and dark themes with a single click
- **System Preference Detection**: Automatically follows OS theme preference on first load
- **Cross-Tab Synchronization**: Theme changes sync across all open tabs in real-time
- **Persistent Storage**: Theme preference saved in localStorage
- **Smooth Animations**: Buttery 200ms transitions with bounce effects
- **Accessibility Compliant**: Full keyboard navigation and screen reader support
- **Mobile Responsive**: Optimized toggle design for all screen sizes

## 📁 File Structure
```
src/
├── styles/
│   └── theme.css              # Main theme variables and styles
├── utils/
│   └── themeManager.js        # Theme management utility
├── components/
│   └── ThemeToggle/
│       ├── ThemeToggle.jsx    # Theme toggle component
│       └── ThemeToggle.css    # Toggle-specific styles
└── index.css                  # Global styles with theme imports
```

## 🎯 CSS Variables System

### Color Tokens
```css
--bg                # Page background
--surface           # Primary card/panel background  
--surface-2         # Secondary panels/nav background
--text              # Primary text color
--muted             # Secondary text/meta color
--accent            # Primary accent (orange for CTAs)
--accent-2          # Secondary accent (lighter orange)
--danger            # Red for errors
--success           # Green for success states
--border            # Default border color
--glass             # Translucent overlay color
--card-shadow       # Shadow definition for cards
```

### UI Tokens
```css
--radius-sm         # Small border radius (8px)
--radius-md         # Medium border radius (12px) 
--radius-lg         # Large border radius (16px)
--space-1..4        # Spacing scale (0.25rem to 2rem)
--control-bg        # Form control background
--control-border    # Form control border
--control-text      # Form control text
--focus-ring        # Keyboard focus outline
--transition-fast   # 200ms smooth transition
--transition-slow   # 300ms transition for larger elements
```

### Food Theme Specific
```css
--food-primary      # Primary food brand color
--food-secondary    # Secondary food accent
--food-warm         # Warm background tint
--navbar-bg         # Navbar gradient background
--header-gradient   # Header button gradient
```

## 🔧 Usage Instructions

### Adding Theme Support to Components
1. Replace hardcoded colors with CSS variables:
```css
/* Before */
background-color: #ffffff;
color: #333333;

/* After */
background-color: var(--surface);
color: var(--text);
```

2. Add transitions for smooth theme switching:
```css
.component {
  transition: color var(--transition-fast), 
              background-color var(--transition-fast),
              border-color var(--transition-fast);
}
```

### Using the Theme Manager
```javascript
import themeManager from '../utils/themeManager';

// Get current theme
const theme = themeManager.getTheme(); // 'light' | 'dark' | 'system'

// Set theme
themeManager.setTheme('dark');

// Listen for theme changes
const unsubscribe = themeManager.onThemeChange((newTheme) => {
  console.log('Theme changed to:', newTheme);
});

// Clean up listener
unsubscribe();
```

## 🖼️ Image Handling

### Dark Mode Image Guidelines
- **Food Images**: Use `no-invert` class for product photos that should maintain original colors
- **Icons**: Prefer SVG icons that adapt to `currentColor`
- **Logos**: Provide separate dark/light variants when possible

```jsx
// Image that should not be affected by dark mode
<img src="food.jpg" className="no-invert" alt="Food" />

// Image that can be slightly adjusted for dark mode
<img src="icon.png" className="theme-image" alt="Icon" />
```

## ⚡ Performance Optimizations
- Only `transform`, `opacity`, `color`, `background-color`, and `box-shadow` are animated
- No layout-affecting properties are transitioned
- Reduced motion support for accessibility
- Efficient BroadcastChannel with storage event fallback

## 🎛️ Theme Toggle Component
The toggle appears in the navbar with:
- **Visual**: Pill-shaped with sun/moon icons and sliding knob
- **Interaction**: Click or keyboard (Enter/Space) to toggle
- **Animation**: Subtle bounce effect on activation
- **Accessibility**: Proper ARIA attributes and focus management

## 🔄 Cross-Tab Synchronization
Theme changes are synchronized across tabs using:
1. **BroadcastChannel API** (modern browsers)
2. **Storage Events** (fallback for older browsers)
3. **Real-time updates** within 100-300ms

## 🧪 Testing Checklist

### Functional Tests
- [ ] Theme toggle switches site instantly
- [ ] Theme persists after page reload
- [ ] Cross-tab sync works within 300ms
- [ ] System preference detection works
- [ ] Keyboard navigation (Tab, Enter, Space)
- [ ] Reduced motion respects user preference

### Visual Tests
- [ ] All pages display consistent theming
- [ ] Food images maintain proper colors
- [ ] Form controls are properly themed
- [ ] Modals and overlays use correct colors
- [ ] Focus rings are visible and accessible

### Accessibility Tests
- [ ] Toggle has proper ARIA attributes
- [ ] Screen reader announces theme changes
- [ ] Keyboard focus is clearly visible
- [ ] Color contrast meets WCAG 2.1 AA standards

## 🐛 Troubleshooting

### Common Issues
1. **FOUC (Flash of Unstyled Content)**
   - Ensure inline script in `index.html` runs before CSS loads
   - Check that `data-theme` attribute is set on `<html>` element

2. **Theme not persisting**
   - Verify localStorage is available
   - Check that `site:theme` key is being saved

3. **Cross-tab sync not working**
   - Test BroadcastChannel support
   - Ensure storage event listeners are active

4. **Images not theming properly**
   - Add `no-invert` class to images that shouldn't change
   - Use `theme-image` class for images that can be adjusted

## 🎨 Customization

### Adding New Color Tokens
1. Add to `:root` in `theme.css`:
```css
:root {
  --new-color: #value;
}

[data-theme="dark"] {
  --new-color: #dark-value;
}
```

2. Use in components:
```css
.component {
  color: var(--new-color);
}
```

### Creating Theme Variants
To add a new theme (e.g., "blue"):
1. Add theme option to `themeManager.js`
2. Create `[data-theme="blue"]` selector in `theme.css`
3. Update theme toggle component logic

## 📱 Mobile Considerations
- Toggle size adapts to screen size (88px → 76px → 68px)
- Touch targets meet minimum 44px requirement
- Animations respect reduced motion preferences
- Navbar layout adjusts for theme toggle placement

## 🔒 Browser Support
- **Modern browsers**: Full BroadcastChannel support
- **Legacy browsers**: Storage event fallback
- **CSS Variables**: IE11+ (with PostCSS fallbacks if needed)
- **Animations**: All modern browsers with graceful degradation

---

**Note**: This theme system is specifically designed for the Cravezy Food Website with warm, food-friendly colors and premium UI aesthetics. All components should use the provided CSS variables for consistent theming across the application.