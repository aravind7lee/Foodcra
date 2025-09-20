import foodModel from "../models/foodModel.js";
import fs from 'fs'

// all food list
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({})
        res.json({ success: true, data: foods })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// add food
const addFood = async (req, res) => {
    try {
        let image_filename;
        
        // Handle predefined images (food_33 to food_40)
        if (req.body.imageFilename) {
            image_filename = req.body.imageFilename;
        } else if (req.file) {
            image_filename = req.file.filename;
        } else {
            return res.json({ success: false, message: "No image provided" });
        }

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename,
        })

        await food.save();
        res.json({ success: true, message: "Food Added" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// delete food
const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        
        // Only try to delete file if it's not a predefined image
        if (food.image && !food.image.startsWith('food_3') && !food.image.startsWith('food_4')) {
            fs.unlink(`uploads/${food.image}`, () => { })
        }

        await foodModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Food Removed" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

export { listFood, addFood, removeFood }