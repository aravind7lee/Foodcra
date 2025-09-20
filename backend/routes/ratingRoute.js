import express from "express";
import mongoose from "mongoose";
import Rating from "../models/ratingModel.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Add/Update rating (Database storage for all users)
router.post("/rate", authMiddleware, async (req, res) => {
  try {
    const { foodId, rating } = req.body;
    const userId = req.body.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.json({ success: false, message: "Rating must be between 1 and 5" });
    }

    // Check if user already rated this food
    const existingRating = await Rating.findOne({ foodId, userId });
    
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      await existingRating.save();
    } else {
      // Create new rating
      const newRating = new Rating({ foodId, userId, rating });
      await newRating.save();
    }

    res.json({ success: true, message: "Rating saved successfully" });
  } catch (error) {
    console.error("Rating Error:", error);
    res.status(500).json({ success: false, message: "Error saving rating" });
  }
});

// Get average rating for ALL USERS (Public endpoint - NO AUTH REQUIRED)
router.get("/summary/:foodId", async (req, res) => {
  try {
    const { foodId } = req.params;
    
    const result = await Rating.aggregate([
      { $match: { foodId: new mongoose.Types.ObjectId(foodId) } },
      { 
        $group: { 
          _id: "$foodId", 
          avgRating: { $avg: "$rating" }, 
          totalRatings: { $sum: 1 }
        } 
      }
    ]);

    if (result.length === 0) {
      return res.json({ success: true, avgRating: 0, totalRatings: 0 });
    }

    const { avgRating, totalRatings } = result[0];
    res.json({ 
      success: true, 
      avgRating: Math.round(avgRating * 10) / 10,
      totalRatings 
    });
  } catch (error) {
    console.error("Rating Summary Error:", error);
    res.status(500).json({ success: false, message: "Error fetching rating summary" });
  }
});

// Get user's personal rating
router.get("/user/:foodId", authMiddleware, async (req, res) => {
  try {
    const { foodId } = req.params;
    const userId = req.body.userId;
    
    const userRating = await Rating.findOne({ foodId, userId });
    res.json({ success: true, rating: userRating ? userRating.rating : 0 });
  } catch (error) {
    console.error("Get User Rating Error:", error);
    res.status(500).json({ success: false, message: "Error fetching user rating" });
  }
});

// Get ratings for multiple food items (Public - NO AUTH REQUIRED)
router.post("/bulk", async (req, res) => {
  try {
    const { foodIds } = req.body;
    
    if (!Array.isArray(foodIds)) {
      return res.json({ success: false, message: "foodIds must be an array" });
    }

    const results = await Rating.aggregate([
      { $match: { foodId: { $in: foodIds.map(id => new mongoose.Types.ObjectId(id)) } } },
      { 
        $group: { 
          _id: "$foodId", 
          avgRating: { $avg: "$rating" }, 
          totalRatings: { $sum: 1 }
        } 
      }
    ]);

    const ratingsMap = {};
    results.forEach(result => {
      ratingsMap[result._id.toString()] = {
        avgRating: Math.round(result.avgRating * 10) / 10,
        totalRatings: result.totalRatings
      };
    });

    // Fill missing items with default values
    foodIds.forEach(foodId => {
      if (!ratingsMap[foodId]) {
        ratingsMap[foodId] = { avgRating: 0, totalRatings: 0 };
      }
    });

    res.json({ success: true, ratings: ratingsMap });
  } catch (error) {
    console.error("Bulk Rating Error:", error);
    res.status(500).json({ success: false, message: "Error fetching bulk ratings" });
  }
});

// Get user's ratings for multiple items
router.post("/user-bulk", authMiddleware, async (req, res) => {
  try {
    const { foodIds } = req.body;
    const userId = req.body.userId;
    
    if (!Array.isArray(foodIds)) {
      return res.json({ success: false, message: "foodIds must be an array" });
    }

    const userRatings = await Rating.find({ 
      foodId: { $in: foodIds.map(id => new mongoose.Types.ObjectId(id)) },
      userId: userId
    });

    const ratingsMap = {};
    userRatings.forEach(rating => {
      ratingsMap[rating.foodId.toString()] = rating.rating;
    });

    // Fill missing items with 0
    foodIds.forEach(foodId => {
      if (!ratingsMap[foodId]) {
        ratingsMap[foodId] = 0;
      }
    });

    res.json({ success: true, ratings: ratingsMap });
  } catch (error) {
    console.error("User Bulk Rating Error:", error);
    res.status(500).json({ success: false, message: "Error fetching user ratings" });
  }
});

export default router;