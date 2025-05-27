import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import cloudinary from "../lib/cloudinary.js";
import { compareSync } from "bcryptjs";
// get All Posts
export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      author: { $in: req.user.connections },
    })
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 });
    return res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getFeedPosts controller: ", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    // 이미지가 있는경우
    let newPost;
    if (image) {
      const imgResult = await cloudinary.uploader.upload(image);
      newPost = new Post({
        author: req.user._id,
        content,
        image: imgResult.secure_url,
      });
    } else {
      newPost = new Post({
        author: req.user._id,
        content,
      });
    }
    await newPost.save();
    return res.status(201).json(newPost);
  } catch (error) {
    console.error("Error in createPost controller: ", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    // 항상 비교할때 타입비교해줄 것
    // check if the current user is the author of the post
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    // Optimization - 이미지 있으면 이미지도 지워주기
    // delete the image from cloudinary as well
    if (post.image) {
      // extract the image - image format
      await cloudinary.uploader.destroy(
        post.image.split("/").pop().split(".")[0]
      );
    }
    // delete teh post
    await Post.findByIdAndDelete(postId);
    return res
      .status(201)
      .json({ success: false, message: "Post has been deleted Successfully" });
  } catch (error) {
    console.log("Error in delete post controller", error.message);
    return res.status(500).json({ message: "Internal Error in deleting post" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    // Q - 왜 populate할때 전부 String으로 가져와서 사용할까?
    // Path 기반으로 데이터를 찾아오기때문에 String으로 넣어주게된다
    const post = await Post.findById(postId)
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture username headline");
    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: "PostId is required" });
    }
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "POST NOT FOUND" });
    }
    return res.status(200).json({ success: true, post: post });
  } catch (error) {
    console.error("Error in postController: ", error.message);
    return res.status(500).json({ message: "Internal Error" });
  }
};

export const createComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        // Push to comment array
        $push: { comments: { user: req.user._id, content } },
      },
      { new: true }
    ).populate("author", "name email username headline profilePicture");

    // create a notification if the comment owner is not the post owner
    // Create new Object
    if (post.author.toString() !== req.user._id.toString()) {
      const newNotification = new Notification({
        recipient: post.author._id,
        type: "comment",
        relatedUser: req.user._id,
        relatedPost: postId,
      });
      // Save new object to Database
      await newNotification.save();
    }
    return res.status(200).json({ newNotification });
  } catch (error) {
    console.error("Error in createComment: ", error.message);
    return res.status(500).json({ message: "Internal Error" });
  }
};
