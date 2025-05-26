import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Set the middleware to validate the requested user
export const protectRoute = async (req, res, next) => {
  try {
    // 쿠키통에서 디지털 신분증 JWT를 꺼내줌
    const token = req.cookies["jwt-linkedin"];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - No Token Provided" });
    }
    // 토큰을 열어서 해독함
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded the token
    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - Invalid Token" });
    }
    // Set the Token <--> Decoded
    // 저장할때 넣는 변수를 뭐라고부르지? - payload
    // 해독한 유저가 실제로 있는지확인함
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - Invalid User" });
    }
    // 다음 Request에 실어서 같이 보내줌
    // 검증된 유저를 다음 req.user = user request에 담아서보내줌
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute: middleware", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
