import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.token || req.headers.authorization;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized. Please login again" });
    }

    const cleanToken = token.startsWith("Bearer ") ? token.slice(7).trim() : token;
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    req.body.userId = decoded.id;
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(401).json({ success: false, message: error.message });
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.token || req.headers.authorization;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized. Please login again" });
    }

    const cleanToken = token.startsWith("Bearer ") ? token.slice(7).trim() : token;
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error("VerifyUser Error:", error);
    return res.status(401).json({ success: false, message: error.message });
  }
};

export default authMiddleware;
