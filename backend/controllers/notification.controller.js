/*

    실제로 DB와 연결하여 데이터를 불러오는곳

*/
import Notification from "../models/notification.model.js";

export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("relatedUser", "name username profilePicture")
      .populate("relatedPost", "content image");

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in getUserNotifications", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Error in getUserNotifications",
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const notificationID = req.params._id;
    const currentUserID = req.user._id;
    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationID,
        recipient: currentUserID,
      },
      { read: true },
      { new: true }
    );
    // Notification 자체가 없는경우
    if (notification == null) {
      return res
        .status(404)
        .json({ success: false, message: "NOT FOUND NOTIFICATION" });
    }
    return res.status(200).json({
      success: true,
      message: "Notification has been updated",
      notification,
    });
  } catch (error) {
    console.error("error in Reading Notification", error.message);
    return res.status(500).json({ message: "Internal Error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user._id,
    });
    return res.status(200).json({
      success: true,
      message: "Notification has been deleted successfully✅",
    });
  } catch (error) {
    console.error("Error in deleting notification", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Error in Deleting Notification",
    });
  }
};
