-- Drop existing tables if they exist
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS post_categories CASCADE;
DROP TABLE IF EXISTS posts_tags CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create tables for the blog system

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category_id UUID REFERENCES categories(id),
    author_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Categories junction table
CREATE TABLE post_categories (
    post_id UUID REFERENCES posts(id),
    category_id UUID REFERENCES categories(id),
    PRIMARY KEY (post_id, category_id)
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id),
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert mock data

-- Insert users
INSERT INTO users (email, username, password_hash, full_name, avatar_url) VALUES
('john@example.com', 'johndoe', '$2a$10$X7z3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3', 'John Doe', 'https://example.com/avatars/john.jpg'),
('jane@example.com', 'janedoe', '$2a$10$X7z3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3', 'Jane Doe', 'https://example.com/avatars/jane.jpg'),
('bob@example.com', 'bobsmith', '$2a$10$X7z3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3tY3', 'Bob Smith', 'https://example.com/avatars/bob.jpg');

-- Insert categories
INSERT INTO categories (name, slug) VALUES
('Technology', 'technology'),
('Lifestyle', 'lifestyle'),
('Travel', 'travel');

-- Insert posts
INSERT INTO posts (title, content, excerpt, slug, category_id, author_id, status, published_at) VALUES
('Getting Started with React', 'This is a comprehensive guide to React...', 'A guide to getting started with React.', 'getting-started-with-react',
 (SELECT id FROM categories WHERE slug = 'technology'),
 (SELECT id FROM users WHERE username = 'johndoe'), 'published', NOW()),
('My Travel Experience in Japan', 'Japan was an amazing experience...', 'Sharing my travel experience in Japan.', 'travel-experience-japan',
 (SELECT id FROM categories WHERE slug = 'travel'),
 (SELECT id FROM users WHERE username = 'janedoe'), 'published', NOW()),
('Healthy Lifestyle Tips', 'Here are some tips for maintaining a healthy lifestyle...', 'Tips for a healthy lifestyle.', 'healthy-lifestyle-tips',
 (SELECT id FROM categories WHERE slug = 'lifestyle'),
 (SELECT id FROM users WHERE username = 'bobsmith'), 'published', NOW());

-- Link posts to categories
INSERT INTO post_categories (post_id, category_id) VALUES
((SELECT id FROM posts WHERE slug = 'getting-started-with-react'),
 (SELECT id FROM categories WHERE slug = 'technology')),
((SELECT id FROM posts WHERE slug = 'travel-experience-japan'),
 (SELECT id FROM categories WHERE slug = 'travel')),
((SELECT id FROM posts WHERE slug = 'healthy-lifestyle-tips'),
 (SELECT id FROM categories WHERE slug = 'lifestyle'));

-- Insert comments
INSERT INTO comments (post_id, user_id, content) VALUES
((SELECT id FROM posts WHERE slug = 'getting-started-with-react'),
 (SELECT id FROM users WHERE username = 'janedoe'),
 'Great article! Very helpful for beginners.'),
((SELECT id FROM posts WHERE slug = 'travel-experience-japan'),
 (SELECT id FROM users WHERE username = 'bobsmith'),
 'I''ve been to Japan too, it''s an amazing country!'),
((SELECT id FROM posts WHERE slug = 'healthy-lifestyle-tips'),
 (SELECT id FROM users WHERE username = 'johndoe'),
 'These tips are really practical. Thanks for sharing!'); 