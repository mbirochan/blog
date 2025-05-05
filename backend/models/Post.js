const pool = require('../config/db');
const slugify = require('slugify');

class Post {
  static async create({ title, content, excerpt, featuredImage, authorId, status = 'draft' }) {
    const slug = slugify(title, { lower: true, strict: true });
    const query = `
      INSERT INTO posts (title, slug, content, excerpt, featured_image, author_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [title, slug, content, excerpt, featuredImage, authorId, status];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT p.*, 
             u.username as author_name,
             u.avatar_url as author_avatar,
             array_agg(DISTINCT t.name) as tags
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN posts_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.id = $1
      GROUP BY p.id, u.username, u.avatar_url
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findBySlug(slug) {
    const query = `
      SELECT p.*, 
             u.username as author_name,
             u.avatar_url as author_avatar,
             array_agg(DISTINCT t.name) as tags
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN posts_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.slug = $1
      GROUP BY p.id, u.username, u.avatar_url
    `;
    const { rows } = await pool.query(query, [slug]);
    return rows[0];
  }

  static async findAll({ limit = 10, offset = 0, status = 'published' }) {
    const query = `
      SELECT p.*, 
             u.username as author_name,
             u.avatar_url as author_avatar,
             array_agg(DISTINCT t.name) as tags,
             COUNT(*) OVER() as total_count
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN posts_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.status = $1
      GROUP BY p.id, u.username, u.avatar_url
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const { rows } = await pool.query(query, [status, limit, offset]);
    return {
      posts: rows,
      totalCount: rows.length > 0 ? parseInt(rows[0].total_count) : 0
    };
  }

  static async update(id, { title, content, excerpt, featuredImage, status }) {
    const updates = [];
    const values = [id];
    let valueCount = 2;

    if (title) {
      updates.push(`title = $${valueCount}`);
      values.push(title);
      valueCount++;
      
      const slug = slugify(title, { lower: true, strict: true });
      updates.push(`slug = $${valueCount}`);
      values.push(slug);
      valueCount++;
    }

    if (content) {
      updates.push(`content = $${valueCount}`);
      values.push(content);
      valueCount++;
    }

    if (excerpt) {
      updates.push(`excerpt = $${valueCount}`);
      values.push(excerpt);
      valueCount++;
    }

    if (featuredImage) {
      updates.push(`featured_image = $${valueCount}`);
      values.push(featuredImage);
      valueCount++;
    }

    if (status) {
      updates.push(`status = $${valueCount}`);
      values.push(status);
      valueCount++;
    }

    if (status === 'published') {
      updates.push(`published_at = CURRENT_TIMESTAMP`);
    }

    const query = `
      UPDATE posts
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM posts WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = Post; 