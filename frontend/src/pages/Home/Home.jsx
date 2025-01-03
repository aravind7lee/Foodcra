import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import NutritionFilter from '../../components/NutritionFilter/NutritionFilter';
import AppDownload from '../../components/AppDownload/AppDownload';
import MealPlanner from '../../components/MealPlanner/MealPlanner';
import StickyCart from '../../components/StickyCart/StickyCart';
import ReviewSlider from '../../components/ReviewSlider/ReviewSlider';
import ReferralLoyalty from '../../components/ReferralLoyalty/ReferralLoyalty'; // Import new component

const Home = () => {
  const [category, setCategory] = useState('All');

  return (
    <>
      <Header />
      <ExploreMenu setCategory={setCategory} category={category} />
      <FoodDisplay category={category} />
      <MealPlanner />
      <NutritionFilter />
      <ReviewSlider />
      <ReferralLoyalty /> 
      <AppDownload />
      <StickyCart />
    </>
  );
};

export default Home;
