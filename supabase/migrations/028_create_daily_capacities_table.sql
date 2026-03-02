-- Create daily_capacities table for day-specific capacity overrides
CREATE TABLE IF NOT EXISTS public.daily_capacities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  capacity INTEGER NOT NULL CHECK (capacity >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on date for fast lookups
CREATE INDEX IF NOT EXISTS idx_daily_capacities_date ON public.daily_capacities(date);

-- Enable RLS
ALTER TABLE public.daily_capacities ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.daily_capacities;
CREATE POLICY "Allow authenticated read access"
  ON public.daily_capacities
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert/update/delete
DROP POLICY IF EXISTS "Allow authenticated write access" ON public.daily_capacities;
CREATE POLICY "Allow authenticated write access"
  ON public.daily_capacities
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
