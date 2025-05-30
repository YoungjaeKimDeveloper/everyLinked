import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// defensive Programming
export const signUp = async (req, res) => {
  console.log("요청받음");
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill up all forms" });
    }
    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUsername = await User.findOne({ name: name });
    if (existingUsername) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least  6 characters" });
    }
    // Hash the password before storing in DataBase
    const salt = await bcrypt.genSalt(10);
    // 123 -> aofkeoakfok
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create new Object
    const user = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });
    // Save the data to DB
    await user.save();
    // Create new token

    // 봉인되어있는 토큰...
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    // 쿠키통 셋팅
    res.cookie("jwt-linkedin", token, {
      httpOnly: true, // prevent XSS attack
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict", // prevent CSRF attacks
      secure: process.env.NODE_ENV === "production", //prevents man-in-the-middle attacks
    });

    res.status(201).json({ message: "User registered successfully" });
    // todo: send welcome email
  } catch (error) {
    console.error("ERROR IN SIGNUP", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  console.log("Login 요청받음");
  try {
    const { username, password } = req.body;
    //  check if user exists - username
    const user = await User.findOne({ username });
    if (!user) {
      console.debug("유저 아이디가맞지않음")
      return res.status(400).json({ message: "유저 아이디가맞지않음" });
    }
    // Check password
    // Matching typed Password and stored database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "비밀번호가 맞지않아요" });
    }

    // 사용자의 정보를 담은 토큰 - 암호화되어있음
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    // 쿠키통에 담아주기
    res.cookie("jwt-linkedin", token, {
      httpOnly: true, // prevent XSS attack
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict", // prevent CSRF attacks
      secure: process.env.NODE_ENV === "production", //prevents man-in-the-middle attacks
    });
    return res
      .send(200)
      .json({ success: true, message: "Logged in successfully" });
  } catch (error) {
    console.log(`Error in login ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal Error in login" });
  }
};

// stateless authentication
// 토큰 자체를 지워줌
export const logout = (req, res) => {
  res.clearCookie("jwt-linkedin");
  res.json({ message: "Logged out successfully" });
};

export const getCurrentUser = (req, res) => {
  try {
    // Send the current user
    return res.json(req.user);
  } catch (error) {
    console.error("Error in getCurrentUser controller:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
