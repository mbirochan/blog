const pool = require('../config/db');

class Comment {
  static async create({ content, postId, userId, parentCommentId = null }) {
    const query = `
      INSERT INTO comments (content, post_id, user_id, parent_comment_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [content, postId, userId, parentCommentId];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT c.*,
             u.username as author_name,
             u.avatar_url as author_avatar
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findByPostId(postId) {
    const query = `
      WITH RECURSIVE comment_tree AS (
        -- Base case: top-level comments
        SELECT 
          c.*,
          u.username as author_name,
          u.avatar_url as author_avatar,
          0 as level,
          ARRAY[c.created_at] as path
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.post_id = $1 AND c.parent_comment_id IS NULL
        
        UNION ALL
        
        -- Recursive case: replies
        SELECT 
          c.*,
          u.username as author_name,
          u.avatar_url as author_avatar,
          ct.level + 1,
          ct.path || c.created_at
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        INNER JOIN comment_tree ct ON c.parent_comment_id = ct.id
      )
      SELECT *
      FROM comment_tree
      ORDER BY path
    `;
    
    const { rows } = await pool.query(query, [postId]);
    return rows;
  }

  static async update(id, { content }) {
    const query = `
      UPDATE comments
      SET content = $1
      WHERE id = $2
      RETURNING *
    `;

    const values = [content, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM comments WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = Comment; 