
-- $1: id
-- $2: name
-- $3: url
-- $4: expectedStatusCode
-- $5: frequency
-- $6: validationLogic
-- $7: is_public
UPDATE monitors
SET
  name = $2,
  url = $3,
  expected_status_code = $4,
  frequency_seconds = $5,
  validation_logic = $6,
  is_public = $7
WHERE id = $1