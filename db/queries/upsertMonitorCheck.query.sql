-- $1: monitor_id
-- $2: errorMessage
WITH args AS (
  SELECT 
    $1::INTEGER AS monitor_id, 
    $2::TEXT AS error_message
), existing_active_incident AS (
  SELECT m.id AS monitor_id, i.id, ie.id AS existing_incident_event
  FROM monitors AS m
  INNER JOIN incidents AS i ON i.monitor_id = m.id
  INNER JOIN args AS args ON args.monitor_id = m.id
  LEFT JOIN incident_events AS ie ON ie.incident_id = i.id
  WHERE i.closed_date IS NULL
    AND i.count_as_downtime = TRUE
  ORDER BY ie.created_date DESC
  LIMIT 1
), new_incident AS (
  INSERT INTO incidents (monitor_id, title, description, count_as_downtime)
  (
    SELECT monitor_id, 'System created incident', '', TRUE
    FROM args 
    WHERE args.error_message IS NOT NULL
      AND NOT EXISTS (
        SELECT * FROM existing_active_incident 
      )
  )
  returning id, title, description
), new_incident_event AS (
  INSERT INTO incident_events (incident_id, title, description)
  (
    SELECT i.id, '', args.error_message 
    FROM new_incident AS i
    INNER JOIN args ON 1=1
    UNION
    SELECT incident.monitor_id, '', args.error_message
    FROM existing_active_incident AS incident
    INNER JOIN args AS args ON 1=1
    WHERE args.error_message IS NOT NULL
      AND incident.existing_incident_event IS NULL
  )
), insert_initial_status_check AS (
  INSERT INTO monitor_status_checks (monitor_id, succeeded)
  SELECT monitor_id, CASE WHEN error_message IS NULL THEN TRUE ELSE FALSE END FROM args
  ON CONFLICT(monitor_id) DO NOTHING
), close_active_incident AS (
  UPDATE incidents AS i
  SET 
    closed_date = NOW()
  FROM existing_active_incident AS existing_incident, args AS args
  WHERE i.id = existing_incident.id
    AND args.error_message IS NULL
)
UPDATE monitor_status_checks AS msc
SET 
  succeeded = CASE WHEN args.error_message IS NULL THEN TRUE ELSE FALSE END,
  created_date = NOW()
FROM args AS args
WHERE msc.monitor_id = args.monitor_id
