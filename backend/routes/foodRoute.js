import express from 'express';
import { addFood, listFood, removeFood } from '../controllers/foodController.js';
import multer from 'multer';
const foodRouter = express.Router();

//Image Storage Engine (Saving Image to uploads folder & rename it)
const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null,`${Date.now()}${file.originalname}`);
    }
})

const upload = multer({ storage: storage})

// Middleware to make image upload optional
const optionalUpload = (req, res, next) => {
    if (req.body.imageFilename) {
        // Skip multer if using predefined image
        next();
    } else {
        // Use multer for file upload
        upload.single('image')(req, res, next);
    }
};

foodRouter.get("/list", listFood);
foodRouter.post("/add", optionalUpload, addFood);
foodRouter.post("/remove", removeFood);

export default foodRouter;