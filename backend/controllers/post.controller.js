import Post from "../models/post.model.js";
import cloudinary from "../lib/cloudinary.js";
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
