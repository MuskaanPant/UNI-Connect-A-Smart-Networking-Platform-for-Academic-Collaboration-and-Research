const Post = require('../models/Posts');

exports.createPost = async (req, res) => {
    try {
        const newPost = new Post({
            content: req.body.content,
            imageURL: req.body.imageURL, // Keep for backward compatibility
            images: req.body.images || [], // Support multiple images
            user: req.user.id
        });

        const post = await newPost.save();
        const populatedPost = await Post.findById(post._id).populate('user', ['fullName', 'role']);
        res.status(201).json(populatedPost);
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ message: 'Failed to create post', error: err.message });
    }
};

exports.getFeed = async (req, res) => {
    const posts = await Post.find()
        .sort({ createdAt: -1 })
        .populate('user', ['fullName', 'role'])
        .populate('comments.user', ['fullName', 'role']);
    res.json(posts);
};

exports.toggleLike = async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLiked = post.likes.some(like => like.user.toString() === req.user.id);
    if (!alreadyLiked) {
        post.likes.unshift({ user: req.user.id });
    } else {
        post.likes = post.likes.filter(like => like.user.toString() !== req.user.id);
    }
    await post.save();
    res.json(post.likes);
};

exports.addComment = async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
        user: req.user.id,
        text: req.body.text,
        date: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    const updatedPost = await Post.findById(req.params.id)
        .populate('user', ['fullName', 'role'])
        .populate('comments.user', ['fullName', 'role']);
    
    res.json(updatedPost.comments);
};

exports.getUserPosts = async (req, res) => {
    try {
        const userId = req.params.userId;
        const posts = await Post.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('user', ['fullName', 'role'])
            .populate('comments.user', ['fullName', 'role']);
        res.json(posts);
    } catch (err) {
        console.error('Error in getUserPosts:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Check if user is the post owner
        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only edit your own posts' });
        }

        const { content, images } = req.body;
        if (content) post.content = content;
        if (images !== undefined) post.images = images;

        await post.save();

        const updatedPost = await Post.findById(req.params.id)
            .populate('user', ['fullName', 'role'])
            .populate('comments.user', ['fullName', 'role']);

        res.json(updatedPost);
    } catch (err) {
        console.error('Error in updatePost:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Check if user is the post owner
        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own posts' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error('Error in deletePost:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};