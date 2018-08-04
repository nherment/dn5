
SELECT 
  id, 
  name,
  frequency_seconds,
  url,
  expected_status_code,
  created_date,
  validation_logic
FROM monitors
ORDER BY name ASC;