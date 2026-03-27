-- Create a function to insert a new user into the users table when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    'user' -- Default role is user
  )
  ON CONFLICT (id) DO UPDATE SET
    name = NEW.raw_user_meta_data->>'name',
    email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();