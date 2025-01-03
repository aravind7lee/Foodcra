import React, { useState } from 'react';
import Home from './pages/Home/Home';
import Footer from './components/Footer/Footer';
import Navbar from './components/Navbar/Navbar';
import { Route, Routes } from 'react-router-dom';
import Cart from './pages/Cart/Cart';
import LoginPopup from './components/LoginPopup/LoginPopup';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import MyOrders from './pages/MyOrders/MyOrders';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify/Verify';
import MealPlanner from './components/MealPlanner/MealPlanner';
import StoreContextProvider from './Context/StoreContext'; // Import StoreContextProvider
import AppDownload from './components/AppDownload/AppDownload';


const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <StoreContextProvider> {/* Wrap the entire app with the StoreContextProvider */}
      <ToastContainer />
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : null} {/* Updated to use `null` */}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/mealplanner" element={<MealPlanner />} />
          <Route path="/app-download" element={<AppDownload/>} />
        </Routes>
      </div>
      <Footer />
    </StoreContextProvider> 
  );
};

export default App;
