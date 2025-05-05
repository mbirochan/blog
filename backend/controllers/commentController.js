const Comment = require('../models/Comment');

const commentController = {
  // Create a new comment
  async create(req, res) {
    try {
      const { content, postId, parentCommentId } = req.body;
      const comment = await Comment.create({
        content,
        postId,
        userId: req.user.id,
        parentCommentId
      });

      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get comments for a post
  async getPostComments(req, res) {
    try {
      const comments = await Comment.findByPostId(req.params.postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Update comment
  async updateComment(req, res) {
    try {
      const { content } = req.body;
      const comment = await Comment.findById(req.params.id);

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Check if user is the author
      if (comment.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this comment' });
      }

      const updatedComment = await Comment.update(req.params.id, { content });
      res.json(updatedComment);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Delete comment
  async deleteComment(req, res) {
    try {
      const comment = await Comment.findById(req.params.id);

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Check if user is the author
      if (comment.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this comment' });
      }

      await Comment.delete(req.params.id);
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = commentController; 