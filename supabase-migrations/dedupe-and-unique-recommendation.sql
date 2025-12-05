-- Migration: remove duplicate demand_shift_recommendations and enforce one recommendation per user/company/original->recommended hour per day

-- 1) Delete exact duplicate rows keeping the earliest created_at
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY user_id, company_id, original_hour, recommended_hour, (created_at::date) ORDER BY created_at) AS rn
  FROM public.demand_shift_recommendations
)
DELETE FROM public.demand_shift_recommendations
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- 2) Add recommendation_date column if not exists and backfill
ALTER TABLE IF EXISTS public.demand_shift_recommendations
  ADD COLUMN IF NOT EXISTS recommendation_date DATE DEFAULT (CURRENT_DATE);

UPDATE public.demand_shift_recommendations
SET recommendation_date = created_at::date
WHERE recommendation_date IS NULL;

-- 3) Create unique index to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS ux_recommendation_per_day
ON public.demand_shift_recommendations (user_id, company_id, original_hour, recommended_hour, recommendation_date);

-- Notes: This migration is idempotent. If the index creation fails due to existing conflicting rows, ensure the duplicate deletion step is rerun.
