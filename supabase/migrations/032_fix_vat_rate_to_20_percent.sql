-- Fix VAT rate: correct any pricing rules incorrectly set to 30% (0.30)
-- UK standard VAT rate is 20% (0.20)

UPDATE pricing_rules
SET vat_rate = 0.20
WHERE vat_rate = 0.30;

-- Also correct the column default to ensure future rows default to 20%
ALTER TABLE pricing_rules
ALTER COLUMN vat_rate SET DEFAULT 0.20;
