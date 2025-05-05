const Post = require('../models/Post');

const postController = {
  // Create a new post
  async create(req, res) {
    try {
      const { title, content, excerpt, featuredImage, status } = req.body;
      const post = await Post.create({
        title,
        content,
        excerpt,
        featuredImage,
        authorId: req.user.id,
        status
      });

      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get all posts
  async getAllPosts(req, res) {
    try {
      const { page = 1, limit = 10, status = 'published' } = req.query;
      const offset = (page - 1) * limit;

      const { posts, totalCount } = await Post.findAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        status
      });

      res.json({
        posts,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalPosts: totalCount
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get post by slug
  async getPostBySlug(req, res) {
    try {
      const post = await Post.findBySlug(req.params.slug);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Update post
  async updatePost(req, res) {
    try {
      const { title, content, excerpt, featuredImage, status } = req.body;
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Check if user is the author
      if (post.author_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this post' });
      }

      const updatedPost = await Post.update(req.params.id, {
        title,
        content,
        excerpt,
        featuredImage,
        status
      });

      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Delete post
  async deletePost(req, res) {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Check if user is the author
      if (post.author_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this post' });
      }

      await Post.delete(req.params.id);
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = postController; 