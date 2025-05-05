// Placeholder for commentRoutes.js

const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/post/:postId', commentController.getPostComments);

// Protected routes
router.post('/', authMiddleware, commentController.create);
router.put('/:id', authMiddleware, commentController.updateComment);
router.delete('/:id', authMiddleware, commentController.deleteComment);

module.exports = router; 