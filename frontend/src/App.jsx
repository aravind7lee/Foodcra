import React, { useState } from 'react';
import Home from './pages/Home/Home';
import Footer from './components/Footer/Footer';
import Navbar from './components/Navbar/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import Cart from './pages/Cart/Cart';
import LoginPopup from './components/LoginPopup/LoginPopup';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import MyOrders from './pages/MyOrders/MyOrders';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify/Verify';
import MealPlanner from './components/MealPlanner/MealPlanner';
import StoreContextProvider from './Context/StoreContext';
import AppDownload from './components/AppDownload/AppDownload';
import FoodDisplay from './components/FoodDisplay/FoodDisplay';
import StickyCart from './components/StickyCart/StickyCart';


const AppLayout = () => {
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  
  // Don't show StickyCart on Order page
  const showStickyCart = !location.pathname.startsWith('/order');
  
  return (
    <>
      <ToastContainer />
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<FoodDisplay category="All" />} />
          <Route path="/menu/:id" element={<FoodDisplay />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/mealplanner" element={<MealPlanner />} />
          <Route path="/app-download" element={<AppDownload />} />
        </Routes>
        {showStickyCart && <StickyCart />}
      </div>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <StoreContextProvider>
      <Routes>
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </StoreContextProvider>
  );
};

export default App;