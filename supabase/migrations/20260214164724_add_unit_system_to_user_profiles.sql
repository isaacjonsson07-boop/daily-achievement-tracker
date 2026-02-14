/*
  # Add Unit System preference to User Profiles

  1. Modified Tables
    - `user_profiles`
      - Add `unit_system` (text) - User's preferred unit system: "metric" or "imperial"
      - Default: "metric"

  2. Notes
    - Metric is the default unit system
    - Values constrained to "metric" or "imperial" via CHECK constraint
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'unit_system'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN unit_system text NOT NULL DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial'));
  END IF;
END $$;