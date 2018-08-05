
CREATE TABLE monitors (
  id SERIAL PRIMARY KEY, 
  name CHARACTER VARYING NOT NULL UNIQUE,
  frequency_seconds INTEGER,
  url CHARACTER VARYING NOT NULL,
  expected_status_code INTEGER NOT NULL,
  validation_logic TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO monitors (name, is_public, frequency_seconds, url, expected_status_code)
VALUES  ('Website', TRUE, 60, 'https://www.portchain.com/', 200);

CREATE TABLE monitor_status_checks (
  monitor_id INTEGER UNIQUE NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
  succeeded BOOLEAN NOT NULL,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE incidents (
  id SERIAL PRIMARY KEY,
  monitor_id INTEGER NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  acknowledged_date TIMESTAMP WITH TIME ZONE,
  closed_date TIMESTAMP WITH TIME ZONE,
  count_as_downtime BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX incidents_open_unique_idx ON incidents (monitor_id) WHERE closed_date IS NULL;
CREATE INDEX incidents_monitor_id_idx ON incidents (monitor_id);
CREATE INDEX incidents_created_date_idx ON incidents (created_date);
CREATE INDEX incidents_monitor_id_created_date_idx ON incidents (monitor_id, created_date);
CREATE INDEX incidents_monitor_id_closed_date_idx ON incidents (monitor_id, closed_date);

CREATE TABLE incident_events (
  id SERIAL PRIMARY KEY NOT NULL,
  incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE alerts (
  id SERIAL PRIMARY KEY, 
  name CHARACTER VARYING NOT NULL UNIQUE,
  created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE alert_monitors (
  alert_id INTEGER NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  monitor_id INTEGER NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
  created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX alert_monitors_unique_idx ON alert_monitors(alert_id, monitor_id);

CREATE TABLE alert_endpoints (
  id SERIAL PRIMARY KEY,
  alert_id INTEGER NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  endpoint_type CHARACTER VARYING NOT NULL,
  endpoint CHARACTER VARYING NOT NULL,
  created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX alert_endpoints_unique_idx ON alert_endpoints(alert_id, endpoint_type, endpoint);


CREATE TABLE sent_alerts (
  alert_endpoint_id INTEGER NOT NULL REFERENCES alert_endpoints(id) ON DELETE CASCADE,
  incident_event_id INTEGER NOT NULL REFERENCES incident_events(id) ON DELETE CASCADE,
  endpoint_type CHARACTER VARYING NOT NULL,
  endpoint CHARACTER VARYING NOT NULL,
  created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
