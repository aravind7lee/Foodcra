import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "food",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    review: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// prevent duplicate rating from same user for same food
ratingSchema.index({ foodId: 1, userId: 1 }, { unique: true });

const Rating = mongoose.model("rating", ratingSchema);
export default Rating;
