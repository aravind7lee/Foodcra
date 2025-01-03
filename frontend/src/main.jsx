import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Your existing global styles
import "slick-carousel/slick/slick.css";        // Slick core CSS
import "slick-carousel/slick/slick-theme.css";  // Slick theme CSS
import { BrowserRouter } from 'react-router-dom';
import StoreContextProvider from './Context/StoreContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StoreContextProvider>
      <App />
    </StoreContextProvider>
  </BrowserRouter>,
);
