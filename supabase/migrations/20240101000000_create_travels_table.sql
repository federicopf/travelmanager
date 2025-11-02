-- Create travels table
CREATE TABLE IF NOT EXISTS public.travels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'ongoing', 'completed')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_travels_status ON public.travels(status);

-- Add index on dates for range queries
CREATE INDEX IF NOT EXISTS idx_travels_dates ON public.travels(start_date, end_date);

-- Enable Row Level Security
ALTER TABLE public.travels ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own travels only
CREATE POLICY "Users can manage their own travels"
ON public.travels
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_travels_user_id ON public.travels(user_id);

COMMENT ON TABLE public.travels IS 'Stores travel information including destination, dates, and optional coordinates';
COMMENT ON COLUMN public.travels.status IS 'Travel status: planned, ongoing, or completed';
COMMENT ON COLUMN public.travels.latitude IS 'Destination latitude coordinate (from geocoding)';
COMMENT ON COLUMN public.travels.longitude IS 'Destination longitude coordinate (from geocoding)';

