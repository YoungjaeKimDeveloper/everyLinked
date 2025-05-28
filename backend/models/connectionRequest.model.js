import mongoose from "mongoose";

// Schema
const connectionRequestSchema = new mongoose.Schema(
  {
    // 보낸사람  - User
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // 받는사람 - User
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // 상태
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    // 만들어진날짜
  },
  { timestamps: true }
);

// Model
const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

export default ConnectionRequest;
