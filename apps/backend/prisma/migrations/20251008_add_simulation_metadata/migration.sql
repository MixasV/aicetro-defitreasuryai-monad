DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'aisimulationlog'
      AND column_name = 'model'
  ) THEN
    ALTER TABLE "AISimulationLog" ADD COLUMN "model" TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'aisimulationlog'
      AND column_name = 'provider'
  ) THEN
    ALTER TABLE "AISimulationLog" ADD COLUMN "provider" TEXT;
  END IF;
END $$;
