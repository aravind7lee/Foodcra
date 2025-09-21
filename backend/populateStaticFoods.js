import mongoose from 'mongoose';
import foodModel from './models/foodModel.js';
import dotenv from 'dotenv';

dotenv.config();

const staticFoods = [
  {
    name: "BBQ Chicken",
    image: "food_33.png",
    price: 260,
    description: "Tender BBQ ribs with a smoky flavor.",
    category: "Grill & BBQ",
  },
  {
    name: "Spicy Chicken Wings",
    image: "food_34.png",
    price: 300,
    description: "Spicy grilled chicken wings with BBQ sauce.",
    category: "Grill & BBQ",
  },
  {
    name: "Tandoori Chicken",
    image: "food_35.png",
    price: 290,
    description: "Juicy tandoori chicken with Indian spices.",
    category: "Grill & BBQ",
  },
  {
    name: "Grilled Chicken",
    image: "food_36.png",
    price: 280,
    description: "Perfectly grilled chicken with BBQ sauce.",
    category: "Grill & BBQ",
  },
  {
    name: "Chicken Biryani",
    image: "food_37.png",
    price: 260,
    description: "Aromatic basmati rice with tender chicken pieces.",
    category: "Biryani",
  },
  {
    name: "Mutton Biryani",
    image: "food_38.png",
    price: 360,
    description: "Rich and flavorful mutton biryani with spices.",
    category: "Biryani",
  },
  {
    name: "Veg Biryani",
    image: "food_39.png",
    price: 210,
    description: "Fragrant vegetable biryani with mixed vegetables.",
    category: "Biryani",
  },
  {
    name: "Prawn Biryani",
    image: "food_40.png",
    price: 300,
    description: "Delicious prawn biryani with coastal flavors.",
    category: "Biryani",
  },
];

const populateStaticFoods = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://aravindhhh5:889962@cluster0.bsyy9.mongodb.net/food-del');
    console.log('Connected to MongoDB');

    // Check if items already exist and add only missing ones
    for (const foodData of staticFoods) {
      const existingFood = await foodModel.findOne({ name: foodData.name });
      if (!existingFood) {
        const food = new foodModel(foodData);
        await food.save();
        console.log(`Added: ${foodData.name}`);
      } else {
        console.log(`Already exists: ${foodData.name}`);
      }
    }

    console.log('Static foods populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating static foods:', error);
    process.exit(1);
  }
};

populateStaticFoods();