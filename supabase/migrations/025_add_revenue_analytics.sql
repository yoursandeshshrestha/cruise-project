-- =============================================================================
-- REVENUE ANALYTICS FUNCTION
-- =============================================================================
-- Function to get revenue analytics based on completed payments only
-- Excludes pending and cancelled payments
-- =============================================================================

CREATE OR REPLACE FUNCTION get_revenue_analytics()
RETURNS TABLE(
  total_revenue BIGINT,
  year_revenue BIGINT,
  month_revenue BIGINT,
  booking_count BIGINT,
  avg_booking_value NUMERIC
) AS $$
DECLARE
  year_start TIMESTAMP;
  month_start TIMESTAMP;
BEGIN
  year_start := date_trunc('year', CURRENT_DATE);
  month_start := date_trunc('month', CURRENT_DATE);

  RETURN QUERY
  SELECT
    -- Total revenue from completed payments (in pence)
    COALESCE(SUM(b.total) FILTER (WHERE b.payment_status = 'completed'), 0)::BIGINT as total_revenue,

    -- Year revenue from completed payments
    COALESCE(SUM(b.total) FILTER (WHERE b.payment_status = 'completed' AND b.created_at >= year_start), 0)::BIGINT as year_revenue,

    -- Month revenue from completed payments
    COALESCE(SUM(b.total) FILTER (WHERE b.payment_status = 'completed' AND b.created_at >= month_start), 0)::BIGINT as month_revenue,

    -- Count of bookings with completed payments
    COUNT(*) FILTER (WHERE b.payment_status = 'completed') as booking_count,

    -- Average booking value (in pence)
    COALESCE(
      AVG(b.total) FILTER (WHERE b.payment_status = 'completed'),
      0
    )::NUMERIC as avg_booking_value
  FROM bookings b;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_revenue_analytics() IS 'Returns revenue analytics filtered by completed payments only. Revenue values are in pence.';

-- =============================================================================
-- REVENUE BY CRUISE LINE VIEW
-- =============================================================================
-- View to get revenue breakdown by cruise line (completed payments only)
-- =============================================================================

CREATE OR REPLACE VIEW revenue_by_cruise_line AS
SELECT
  cruise_line,
  COUNT(*) FILTER (WHERE payment_status = 'completed') as booking_count,
  COALESCE(SUM(total) FILTER (WHERE payment_status = 'completed'), 0) as total_revenue
FROM bookings
GROUP BY cruise_line
ORDER BY total_revenue DESC;

COMMENT ON VIEW revenue_by_cruise_line IS 'Revenue and booking count by cruise line, including only completed payments. Revenue is in pence.';
