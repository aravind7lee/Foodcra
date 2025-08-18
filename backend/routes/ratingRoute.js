import express from "express";
import Rating from "../models/ratingModel.js";
import { verifyUser } from "../middleware/auth.js";

const router = express.Router();

// ⭐ Add/Update rating
router.post("/:foodId", verifyUser, async (req, res) => {
  try {
    const { foodId } = req.params;
    const { rating, review } = req.body;

    const updated = await Rating.findOneAndUpdate(
      { foodId, userId: req.user.id },
      { rating, review },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, rating: updated });
  } catch (error) {
    console.error("Rating Post Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ⭐ Get ratings for a food item
router.get("/:foodId", async (req, res) => {
  try {
    const { foodId } = req.params;
    const ratings = await Rating.find({ foodId }).populate("userId", "name");

    res.json({ success: true, ratings });
  } catch (error) {
    console.error("Rating Get Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ⭐ Get average rating for a food
router.get("/:foodId/average", async (req, res) => {
  try {
    const { foodId } = req.params;

    const agg = await Rating.aggregate([
      { $match: { foodId: new mongoose.Types.ObjectId(foodId) } },
      { $group: { _id: "$foodId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    if (agg.length === 0) {
      return res.json({ success: true, avgRating: 0, count: 0 });
    }

    res.json({ success: true, avgRating: agg[0].avgRating, count: agg[0].count });
  } catch (error) {
    console.error("Average Rating Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
