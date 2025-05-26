import User from "../models/user.model.js";

// exclude myself + not in friend list
export const getSuggestedConnections = async (req, res) => {
  try {
    // MongoDB By Default _id
    const currentUser = await User.findById(req.user_id).select("connections");
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
    console.debug("Error in suggestedUser");
    return res.status(500).json({ message: "Server Error" });
  }
};
