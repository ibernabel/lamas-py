-- Migration: Add occupation_type column to customer_job_info table
-- Date: 2026-07-30
-- Reason: New field to replace/enrich the boolean is_self_employed with a
--         richer occupation classification. Values: employed, independent,
--         business_owner, other. is_self_employed remains for backward compat.
-- Note: No Alembic configured. Run manually before deploying.

ALTER TABLE customer_job_info
    ADD COLUMN IF NOT EXISTS occupation_type VARCHAR(50) NULL;
