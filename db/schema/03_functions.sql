-- Create a function to handle upvotes
-- This will be used by the upvote server action
CREATE OR REPLACE FUNCTION toggle_post_upvote(post_id UUID)
RETURNS TABLE (
  upvotes INTEGER,
  success BOOLEAN
) AS $$
DECLARE
  current_upvotes INTEGER;
BEGIN
  -- Get the current upvote count
  SELECT posts.upvotes INTO current_upvotes
  FROM posts
  WHERE posts.id = post_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0::INTEGER, FALSE;
    RETURN;
  END IF;
  
  -- Update the post with the new upvote count
  -- Note: In a real application, you would track which users have upvoted
  -- For this example, we're just incrementing the count
  UPDATE posts
  SET upvotes = current_upvotes + 1
  WHERE id = post_id;
  
  RETURN QUERY SELECT (current_upvotes + 1)::INTEGER, TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get comments with replies
-- This simplifies fetching nested comments
CREATE OR REPLACE FUNCTION get_comments_with_replies(post_id_param UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  post_id UUID,
  user_id UUID,
  parent_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  user_name TEXT,
  user_email TEXT,
  replies JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.content,
    c.post_id,
    c.user_id,
    c.parent_id,
    c.created_at,
    p.name AS user_name,
    p.email AS user_email,
    (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'content', r.content,
          'user_id', r.user_id,
          'created_at', r.created_at,
          'user_name', rp.name,
          'user_email', rp.email
        )
      ), '[]'::jsonb)
      FROM comments r
      JOIN profiles rp ON r.user_id = rp.id
      WHERE r.parent_id = c.id
    ) AS replies
  FROM comments c
  JOIN profiles p ON c.user_id = p.id
  WHERE c.post_id = post_id_param AND c.parent_id IS NULL
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
