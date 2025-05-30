import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";

// exclude myself + not in friend list
export const getSuggestedConnections = async (req, res) => {
  try {
    // MongoDB By Default _id
    const currentUser = await User.findById(req.user._id).select("connections");
    // find users who are not already conntected, and also do not recommend our own profile
    const suggestedUser = await User.find({
      _id: {
        $ne: req.user_id,
        $nin: currentUser.connections,
      },
      // What Kind of filed I will grab
    })
      .select("name username profilePicture headline")
      .limit(3);
    return res.json(suggestedUser);
  } catch (error) {
    console.debug("Error in suggestedUser", error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    // req,params = 요청받은 Params
    const user = await User.findOne({ username: req.params.username }).select(
      "-password"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // 나중에 Typescript넘어갈때 DTO생각하고있어야함
    return res.json(user);
  } catch (error) {
    console.error("Error in getPublicProfile controller: ", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    // 허용되는 필드 설정
    const allowedFields = [
      "name",
      "username",
      "headline",
      "about",
      "location",
      "profilePicture",
      "bannerImg",
      "skills",
      "experience",
      "education",
    ];

    // Collect all updated Data
    const updatedData = {};

    for (const field of allowedFields) {
      // 속성 접근하기
      if (req.body[field]) {
        // 정보 업데이트 해주기
        updatedData[field] = req.body[field];
      }
    }

    if (req.body.profilePicture) {
      const result = await cloudinary.uploader.upload(req.body.profilePicture);
      // Update the URL - Q Later
      updatedData.profilePicture = result.secure_url;
    }

    if (req.body.bannerImg) {
      const result = await cloudinary.uploader.upload(req.body.bannerImg);
      // Update the URL - Q Later
      updatedData.bannerImg = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedData },
      { new: true }
    ).select("-password");

    return res.json(user);
  } catch (error) {
    console.error("Error in updateProfiles controllers", error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};
