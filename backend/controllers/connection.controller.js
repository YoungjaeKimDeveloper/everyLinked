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
    return res.status(500).json({
      success: false,
      message: "Internal Error in acceptConnectionRequest",
    });
  }
};
export const rejectConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await ConnectionRequest.findById(requestId);

    if (request.recipient.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to reject this request" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This request has already been processed" });
    }

    // DB 저장하기전에 바꿔주기
    request.status = "rejected";
    await request.save();

    return res.status(200).json({ message: "Connection request rejected" });
  } catch (error) {
    console.error("Error in rejectConnectionRequest", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Error in rejectConnectionRequest",
    });
  }
};
// Need to be implemented
export const getConnectionRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const request = await ConnectionRequest.find({
      recipient: userId,
      status: "pending",
    }).populate("sender", "name username profilePicture headline connections");

    return res.status(200).json(request);
  } catch (error) {
    console.error("Error in getConnectionRequests", error.message);
    return res
      .status(500)
      .json({ message: "Internal Error in getConnection Requests" });
  }
};
//
export const getUserConnections = async (req, res) => {
  try {
    const userId = req.user._id;
    // Connection user Chaining해서 가져오기
    // 가져와서 정보 rendering할것을 생각해야함........
    const user = await User.findById(userId).populate(
      "connections",
      "name username profilePicture headline connections"
    );
    return res.json(user.connections);
  } catch (error) {
    console.error("Error in getUserConnections", error.message);
    return res
      .status(500)
      .json({ message: "Internal Error in getUserConnections" });
  }
};
export const removeConnection = async (req, res) => {
  try {
    const myID = req.user._id;
    const { userId } = req.params;

    // 서로 목록에서 지워주기
    await User.findByIdAndUpdate(myID, { $pull: { connections: userId } }),
      await User.findByIdAndUpdate(userId, { $pull: { connections: myID } });

    return res.json({ message: "Connection removed successfully" });
  } catch (error) {
    console.error("Error in removeConnection", error.message);
    return res
      .status(500)
      .json({ message: "Internal Error in removeConnection Requests" });
  }
};
export const getConnectionStatus = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    const currentUser = req.user;

    // They are already connected
    if (currentUser.connections.includes(targetUserId)) {
      return res.json({ status: "connected" });
    }

    const pendingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: currentUserId, recipient: targetUserId },
        { sender: targetUserId, recipient: currentUserId },
      ],
      status: "pending",
    });

    if (pendingRequest) {
      if (pendingRequest.sender.toString() === currentUserId.toString()) {
        return res.json({ status: "pending" });
      } else {
        return res.json({ status: "received", requestId: pendingRequest._id });
      }
    }
    // if no connection or pending req found
    return res.json({ status: "not connected" });
  } catch (error) {
    console.error("Error in getConnectionStatus", error.message);
    return res
      .status(500)
      .json({ message: "Internal Error in getConnectionStatus " });
  }
};
