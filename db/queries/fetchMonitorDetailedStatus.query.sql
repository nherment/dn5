-- $1: monitor id
SELECT
  m.id,
  m.name,
  m.url,
  m.is_active,
  m.is_public,
  status.created_date AS last_check_date,
  status.succeeded AS last_check_result,
  active_incident.data AS active_incident,
  closed_incidents.list AS closed_incidents,
  month_to_date_incidents.accumulated_downtime,
  100 * (
    1 - (
      EXTRACT(EPOCH FROM COALESCE(month_to_date_incidents.accumulated_downtime, INTERVAL '0 second')) 
      / 
      EXTRACT(EPOCH FROM (NOW() - (NOW() - INTERVAL '1 month')))
    )
  ) AS month_to_date_uptime,
  100 * (
    1 - (
      EXTRACT(EPOCH FROM COALESCE(rolling_month_incidents.accumulated_downtime, INTERVAL '0 second')) 
      / 
      EXTRACT(EPOCH FROM (NOW() - (NOW() - INTERVAL '1 month')))
    )
  ) AS rolling_month_uptime,
  100 * (
    1 - (
      EXTRACT(EPOCH FROM COALESCE(rolling_year_incidents.accumulated_downtime, INTERVAL '0 second')) 
      / 
      EXTRACT(EPOCH FROM (NOW() - (NOW() - INTERVAL '1 year')))
    )
  ) AS rolling_year_uptime
FROM monitors AS m
LEFT JOIN monitor_status_checks AS status ON status.monitor_id = m.id
LEFT JOIN LATERAL (
  SELECT 
    JSON_BUILD_OBJECT(
      'id', i.id,
      'title', i.title,
      'description', i.description,
      'createdDate', i.created_date,
      'acknowledgedDate', i.acknowledged_date,
      'closedDate', i.closed_date,
      'events', event.list
    ) AS data
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
    AND i.closed_date IS NULL
) AS active_incident ON 1=1
LEFT JOIN LATERAL (
  SELECT ARRAY_AGG(JSON_BUILD_OBJECT(
    'id', i.id,
    'title', i.title,
    'description', i.description,
    'createdDate', i.created_date,
    'acknowledgedDate', i.acknowledged_date,
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
  LIMIT 10
) AS closed_incidents ON 1=1
LEFT JOIN LATERAL (
  SELECT 
    i.monitor_id,
    SUM(
      CASE WHEN i.closed_date IS NOT NULL THEN i.closed_date ELSE NOW() END
      -
      CASE WHEN i.created_date > DATE_TRUNC('month', NOW()) THEN i.created_date ELSE DATE_TRUNC('month', NOW()) END 
    ) AS accumulated_downtime
  FROM incidents AS i
  WHERE i.closed_date IS NULL OR i.closed_date > DATE_TRUNC('month', NOW())
    AND i.count_as_downtime = TRUE
  GROUP BY i.monitor_id
) AS month_to_date_incidents ON month_to_date_incidents.monitor_id = m.id
LEFT JOIN LATERAL (
  SELECT 
    i.monitor_id,
    SUM(
      CASE WHEN i.closed_date IS NOT NULL THEN i.closed_date ELSE NOW() END
      -
      CASE WHEN i.created_date > NOW() - INTERVAL '1 month' THEN i.created_date ELSE NOW() - INTERVAL '1 month' END 
    ) AS accumulated_downtime
  FROM incidents AS i
  WHERE i.closed_date IS NULL OR i.closed_date > NOW() - INTERVAL '1 month'
    AND i.count_as_downtime = TRUE
  GROUP BY i.monitor_id
) AS rolling_month_incidents ON rolling_month_incidents.monitor_id = m.id
LEFT JOIN (
  SELECT 
    i.monitor_id,
    SUM(
      CASE WHEN i.closed_date IS NOT NULL THEN i.closed_date ELSE NOW() END
      -
      CASE WHEN i.created_date > NOW() - INTERVAL '1 year' THEN i.created_date ELSE NOW() - INTERVAL '1 year' END
    ) AS accumulated_downtime
  FROM incidents AS i
  WHERE i.closed_date IS NULL OR i.closed_date > NOW() - INTERVAL '1 year'
    AND i.count_as_downtime = TRUE
  GROUP BY i.monitor_id
) AS rolling_year_incidents ON rolling_year_incidents.monitor_id = m.id
WHERE m.id = $1
ORDER BY m.name ASC