SELECT 
  id, 
  name,
  frequency_seconds,
  url,
  expected_status_code,
  created_date,
  validation_logic,
  is_active,
  is_public
FROM monitors
WHERE is_active = TRUE
ORDER BY name ASC