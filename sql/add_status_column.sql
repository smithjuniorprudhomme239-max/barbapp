-- Add status column to bookings table
ALTER TABLE bookings ADD COLUMN status BOOLEAN DEFAULT FALSE;

-- Update existing bookings to have status FALSE (not done)
UPDATE bookings SET status = FALSE WHERE status IS NULL;