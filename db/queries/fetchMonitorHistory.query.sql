-- $1: monitor id
SELECT
  m.name,
  m.is_public,
  incident.list AS incidents,
  NOW() AS max_date,
  NOW() - INTERVAL '1 year' AS min_date
FROM monitors AS m
LEFT JOIN LATERAL (
  SELECT ARRAY_AGG(JSON_BUILD_OBJECT(
    'id', i.id,
    'title', i.title,
    'description', i.description,
    'createdDate', i.created_date,
    'closedDate', i.closed_date,
    'events', event.list
  ) ORDER BY i.created_date DESC) AS list
  FROM incidents AS i
  LEFT JOIN LATERAL (
    SELECT ARRAY_AGG(JSON_BUILD_OBJECT(
      'id', e.id,
      'title', e.title,
      'description', e.description,
      'createdDate', e.created_date
    ) ORDER BY e.created_date DESC) AS list 
    FROM incident_events AS e
    WHERE e.incident_id = i.id
  ) AS event ON 1=1
  WHERE i.monitor_id = m.id
    AND i.closed_date IS NOT NULL
    AND i.closed_date >= NOW() - INTERVAL '1 year'
) AS incident ON 1=1
WHERE m.id = $1