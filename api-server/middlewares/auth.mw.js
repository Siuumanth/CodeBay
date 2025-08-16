// AUTH middleware
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyJWT = (req, res, next) => {
  const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", ""); // read from cookie

  if (!token) return res.status(401).json({ message: "Access denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};
