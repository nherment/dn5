-- $1: searchTerm
-- $2: limit
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
ORDER BY (
  similarity(name, $1::TEXT) +
  similarity(url, $1::TEXT)
) DESC, 
name ASC, 
id ASC
LIMIT CAST($2 AS INT)