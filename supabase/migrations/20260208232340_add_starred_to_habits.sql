/*
  # Add starred column to habits

  1. Modified Tables
    - `habits`
      - Added `starred` (boolean, default true) - controls visibility in today's view when not completed

  2. Notes
    - Existing habits default to starred (true) so they remain visible
    - Users can unstar habits to hide them from today's view when not completed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'starred'
  ) THEN
    ALTER TABLE habits ADD COLUMN starred boolean DEFAULT true;
  END IF;
END $$;