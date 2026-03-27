-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample products
INSERT INTO products (name, price, description, image) VALUES
('Barber Apron', '$25.00', 'Professional barber apron with multiple pockets', 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300&h=300&fit=crop'),
('Hair Clippers', '$120.00', 'Professional grade hair clippers', 'https://images.unsplash.com/photo-1591370874394-168492a94f59?w=300&h=300&fit=crop'),
('Beard Oil', '$15.00', 'Premium beard oil for a healthy beard', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop'),
('Pomade', '$18.00', 'Strong hold pomade for styling', 'https://images.unsplash.com/photo-1581044777550-6928f5b7be1a?w=300&h=300&fit=crop');