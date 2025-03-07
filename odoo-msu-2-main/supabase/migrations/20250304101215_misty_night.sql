/*
  # Update profiles table and policies

  1. Changes
    - Add INSERT policy for profiles table
    - Ensure trigger function exists for automatic profile creation
  
  2. Security
    - Allow users to insert their own profiles
*/

-- Check if policies exist before creating them
DO $$
BEGIN
    -- Check if the "Users can insert their own profile" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert their own profile'
    ) THEN
        -- Create the insert policy if it doesn't exist
        CREATE POLICY "Users can insert their own profile"
          ON profiles
          FOR INSERT
          TO authenticated
          WITH CHECK (auth.uid() = id);
    END IF;
END
$$;

-- Ensure the trigger function exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if trigger exists before creating it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        -- Create the trigger if it doesn't exist
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END
$$;