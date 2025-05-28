/*

    FRONTEND <----> API <---------> DB

    EDGE CASES

*/
import ConnectionRequest from "../models/connectionRequest.model.js";
import User from "../models/user.model.js";
export const sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    // 받는사람
    const { userId } = req.params;

    // 자기자신에게 보내는경우
    if (senderId.toString() == userId) {
      return res
        .status(400)
        .json({ message: "CANNOT SEND THE REQUEST TO YOURSELF" });
    }

    // 이미 User Connection에 들어있는경우
    if (req.user.connections.includes(userId)) {
      return res.status(400).json({ message: "You are already connected" });
    }

    // Request is existed
    const existingRequest = await ConnectionRequest({
      senderId: senderId,
      recipient: userId,
      status: "pending",
    });
    // The previous request existed
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A connection request already exists" });
    }

    // Create new Request
    const newRequest = new ConnectionRequest({
      sender: senderId,
      recipient: userId,
    });

    // Save to database
    await newRequest.save();

    return res
      .status(201)
      .json({ message: "Connection request senf successfully" });
  } catch (error) {
    console.error("Error in sendConnectionRequest", error.message);
    return res
      .status(500)
      .json({ message: "Internal Erro in sending Connection Request" });
  }
};
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;
    // Request불러올때 추가적인정보를 Chaining해서 가져오기
    const request = await ConnectionRequest.findById(requestId)
      .populate("sender", "name email username")
      .populate("recipient", "name username");

    if (!request) {
      return res.status(404).json({ message: "Connection request not found" });
    }
    // 권한 확인하기
    if ((request, recipient._id.toString() !== userId.toString())) {
      return res
        .status(403)
        .json({ message: "NOT AUTHORIZED TO ACCPET THIS REQUEST" });
    }
    // When the Request has been processed
    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This request has already been processed" });
    }
    request.status = "accepted";
    await request.save();
    // 친구추가 같이해주기
    await User.findByIdAndUpdate(request.sender._id, {
      $addToSet: { connections: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $addToSet: { connections: request.sender._id },
    });
    // 알람 새로만들어주기
    const notification = new Notification({
      recipient: request.sender._id,
      relatedUser: userId,
      type: "connectionAcceepted",
    });
    // Save to Database
    await notification.save();
    // todo: send email

    return res.json({ message: "Connection accepted successfully" });
  } catch (error) {
    console.error("Error in acceptConnectionRequest", error.message);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Error in acceptConnectionRequest",
      });
  }
};
export const rejectConnectionRequest = (req, res) => {};
export const getUserConnections = (req, res) => {};
export const getConnectionRequests = (req, res) => {};
export const removeConnection = (req, res) => {};
export const getConnectionStatus = (req, res) => {};
