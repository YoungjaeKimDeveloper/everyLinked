// Needs to create notification model
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // 받는사람
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["like", "comment", "connectionAcceepted"],
    },
    // 관련된 유저
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // 관련되어있는 포스트
    relatedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    // 읽음표시
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
