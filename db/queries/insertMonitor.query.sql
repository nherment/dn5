-- $1: name
-- $2: url
-- $3: expectedStatusCode
-- $4: frequency
-- $5: validationLogic
-- $6: is public
INSERT INTO monitors (name, url, expected_status_code, frequency_seconds, validation_logic, is_public)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id