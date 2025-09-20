import logo from './logo.png'
import add_icon from './add_icon.png'
import order_icon from './order_icon.png'
import profile_image from './profile_image.png'
import upload_area from './upload_area.png'
import parcel_icon from './parcel_icon.png'

export const url = 'https://foodcra-backend.onrender.com'
export const currency = '₹'

export const assets ={
    logo,
    add_icon,
    order_icon,
    profile_image,
    upload_area,
    parcel_icon
}

// Food categories for admin panel
export const foodCategories = [
    "Salad",
    "Rolls", 
    "Deserts",
    "Sandwich",
    "Cake",
    "Pure Veg",
    "Pasta",
    "Noodles",
    "Grill & BBQ",
    "Biryani"
];

// Predefined food items with local images (food_33 to food_40)
export const predefinedFoodItems = [
    {
        name: "BBQ Chicken",
        category: "Grill & BBQ",
        price: 260,
        description: "Tender BBQ ribs with a smoky flavor.",
        localImage: "food_33.png"
    },
    {
        name: "Spicy Chicken Wings", 
        category: "Grill & BBQ",
        price: 300,
        description: "Spicy grilled chicken wings with BBQ sauce.",
        localImage: "food_34.png"
    },
    {
        name: "Tandoori Chicken",
        category: "Grill & BBQ", 
        price: 290,
        description: "Juicy tandoori chicken with Indian spices.",
        localImage: "food_35.png"
    },
    {
        name: "Grilled Chicken",
        category: "Grill & BBQ",
        price: 280, 
        description: "Perfectly grilled chicken with BBQ sauce.",
        localImage: "food_36.png"
    },
    {
        name: "Chicken Biryani",
        category: "Biryani",
        price: 260,
        description: "Aromatic basmati rice with tender chicken pieces.",
        localImage: "food_37.png"
    },
    {
        name: "Mutton Biryani",
        category: "Biryani",
        price: 360,
        description: "Rich and flavorful mutton biryani with spices.",
        localImage: "food_38.png"
    },
    {
        name: "Veg Biryani", 
        category: "Biryani",
        price: 210,
        description: "Fragrant vegetable biryani with mixed vegetables.",
        localImage: "food_39.png"
    },
    {
        name: "Prawn Biryani",
        category: "Biryani",
        price: 300,
        description: "Delicious prawn biryani with coastal flavors.",
        localImage: "food_40.png"
    }
];