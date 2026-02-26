-- Add VAT rate column to pricing_rules table
-- VAT stored as decimal (e.g., 0.20 for 20%)

ALTER TABLE pricing_rules
ADD COLUMN vat_rate DECIMAL(5,4) NOT NULL DEFAULT 0.20;

-- Update existing records to have 20% VAT
UPDATE pricing_rules SET vat_rate = 0.20 WHERE vat_rate IS NULL;

-- Add comment
COMMENT ON COLUMN pricing_rules.vat_rate IS 'VAT rate as decimal (e.g., 0.20 for 20%, 0.15 for 15%)';
