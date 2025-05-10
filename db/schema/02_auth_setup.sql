-- Set up Row Level Security (RLS) policies
-- This ensures that users can only access data they're authorized to see

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can read all profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- Users can update only their own profile
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Posts policies
-- Published posts are viewable by everyone
CREATE POLICY "Published posts are viewable by everyone" 
ON posts FOR SELECT 
USING (published = true);

-- Admin users can see all posts
CREATE POLICY "Admin users can see all posts" 
ON posts FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Admin users can insert, update, and delete posts
CREATE POLICY "Admin users can insert posts" 
ON posts FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin users can update posts" 
ON posts FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin users can delete posts" 
ON posts FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Comments policies
-- Comments are viewable by everyone
CREATE POLICY "Comments are viewable by everyone" 
ON comments FOR SELECT 
USING (true);

-- Authenticated users can insert comments
CREATE POLICY "Authenticated users can insert comments" 
ON comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" 
ON comments FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own comments, and admins can delete any comment
CREATE POLICY "Users can delete their own comments" 
ON comments FOR DELETE 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
