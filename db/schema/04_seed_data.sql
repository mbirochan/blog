-- Create an admin user
-- Note: You'll need to replace 'your-admin-id' with the actual UUID of your admin user
-- after you've created the user through Supabase Auth
DO $$
DECLARE
  admin_id UUID := 'your-admin-id'; -- Replace with your admin user's UUID
BEGIN
  -- Update the user's role to admin
  UPDATE profiles
  SET role = 'admin'
  WHERE id = admin_id;
  
  -- If the user doesn't exist yet, insert them
  IF NOT FOUND THEN
    INSERT INTO profiles (id, name, email, role)
    VALUES (admin_id, 'Admin User', 'admin@example.com', 'admin');
  END IF;
END $$;

-- Insert sample posts
INSERT INTO posts (title, slug, content, excerpt, category, published, author_id)
VALUES
  (
    'Getting Started with Next.js 14',
    'getting-started-with-nextjs-14',
    '<p>Next.js 14 introduces several new features that make building web applications even easier. In this post, we''ll explore the new App Router, Server Components, and more.</p><h2>App Router</h2><p>The App Router is a new routing system that allows you to define routes using the file system. It''s more intuitive and powerful than the Pages Router.</p><h2>Server Components</h2><p>Server Components allow you to render components on the server, reducing the amount of JavaScript sent to the client. This can lead to faster page loads and better performance.</p>',
    'Learn how to build modern web applications with Next.js 14 and its new features.',
    'Development',
    TRUE,
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
  ),
  (
    'Designing with shadcn/ui',
    'designing-with-shadcn-ui',
    '<p>shadcn/ui is a collection of reusable components that you can copy and paste into your apps. It''s not a component library, but a set of components that you can use as a starting point for your own design system.</p><p>In this post, we''ll explore how to use shadcn/ui to build beautiful and accessible user interfaces.</p>',
    'Explore the benefits of using shadcn/ui for building beautiful and accessible user interfaces.',
    'Design',
    TRUE,
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
  ),
  (
    'Animation Techniques with GSAP and Framer Motion',
    'animation-techniques-with-gsap-and-framer-motion',
    '<p>In this comprehensive guide, we''ll explore how to create smooth animations using GSAP and Framer Motion in your React applications.</p><p>Both libraries offer powerful tools for creating engaging user experiences through animation.</p>',
    'Learn how to create smooth animations using GSAP and Framer Motion in your React applications.',
    'Development',
    TRUE,
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
  );

-- Note: You can add more seed data as needed
