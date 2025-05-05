const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create({ username, email, password, fullName, bio, avatarUrl }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (username, email, password_hash, full_name, bio, avatar_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, email, full_name, bio, avatar_url, created_at
    `;

    const values = [username, email, hashedPassword, fullName, bio, avatarUrl];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, username, email, full_name, bio, avatar_url, created_at FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async update(id, { fullName, bio, avatarUrl }) {
    const query = `
      UPDATE users
      SET full_name = COALESCE($1, full_name),
          bio = COALESCE($2, bio),
          avatar_url = COALESCE($3, avatar_url)
      WHERE id = $4
      RETURNING id, username, email, full_name, bio, avatar_url, created_at
    `;

    const values = [fullName, bio, avatarUrl, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  }
}

module.exports = User; 