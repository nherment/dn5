-- $1: should fetch private monitors

SELECT
  m.id,
  m.name,
  m.url,
  m.is_active,
  m.is_public,
  status.created_date AS last_check_date,
  status.succeeded AS last_check_result,
  CASE WHEN active_incident.id IS NOT NULL THEN JSON_BUILD_OBJECT(
    'id', active_incident.id,
    'createdDate', active_incident.created_date,
    'acknowledgedDate', active_incident.acknowledged_date,
    'title', active_incident.title,
    'description', active_incident.description
  ) ELSE NULL END AS active_incident,
  COALESCE(incidents.accumulated_downtime, INTERVAL '0 second') AS accumulated_downtime,
  100 * (
    1 - EXTRACT(EPOCH FROM COALESCE(incidents.accumulated_downtime, INTERVAL '0 second')) / EXTRACT(EPOCH FROM (NOW() - INTERVAL '30 DAYS'))
  ) AS rolling_month_uptime
FROM monitors AS m
LEFT JOIN monitor_status_checks AS status ON status.monitor_id = m.id
LEFT JOIN incidents AS active_incident ON active_incident.monitor_id = m.id AND active_incident.closed_date IS NULL
LEFT JOIN LATERAL (
  SELECT SUM(
    CASE WHEN i.created_date > NOW() - INTERVAL '30 days' THEN i.created_date ELSE NOW() - INTERVAL '30 days' END 
    -
    CASE WHEN i.closed_date IS NOT NULL THEN i.closed_date ELSE NOW() END
  ) AS accumulated_downtime
  FROM incidents AS i
  WHERE i.monitor_id = m.id
    AND i.closed_date IS NULL OR i.closed_date > NOW() - INTERVAL '30 days'
    AND i.count_as_downtime = TRUE
) AS incidents ON 1=1
WHERE (m.is_public = TRUE OR $1::BOOLEAN = TRUE)
ORDER BY m.name ASC
