# Database Setup Instructions

Follow these steps to set up your database schema in Supabase:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of each SQL file in order:
   - First: `01_initial_setup.sql`
   - Second: `02_auth_setup.sql`
   - Third: `03_functions.sql`
   - Fourth: `04_seed_data.sql` (modify as needed)
5. Run each query separately

## Important Notes

- In `04_seed_data.sql`, replace `'your-admin-id'` with the actual UUID of your admin user after you've created the user through Supabase Auth.
- You may need to adjust the RLS policies based on your specific security requirements.
- The schema assumes you're using Supabase Auth for authentication.

## Database Structure

The database consists of three main tables:

1. **profiles**: Extends the auth.users table with additional user information

   - Linked to Supabase Auth
   - Stores user roles (admin or regular user)

2. **posts**: Stores blog posts

   - Contains content, metadata, and publishing status
   - Tracks upvotes
   - Links to author profile

3. **comments**: Stores comments on posts
   - Supports nested replies (self-referential)
   - Links to both posts and user profiles

## Row Level Security (RLS)

The schema includes RLS policies to ensure:

- Published posts are visible to everyone
- Only admins can create, edit, or delete posts
- Users can only edit or delete their own comments
- Admins can moderate (delete) any comment

## Custom Functions

- `toggle_post_upvote`: Handles post upvoting
- `get_comments_with_replies`: Efficiently retrieves comments with their replies

## Next Steps

After setting up the database, you'll need to:

1. Create an admin user through Supabase Auth
2. Update the admin user's role in the profiles table
3. Configure your Next.js application to connect to Supabase
