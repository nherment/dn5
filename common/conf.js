const path = require('path')

const parse =require('pg-connection-string');

let pgConnStringConf;
if (process.env.DATABASE_URL) {
  pgConnStringConf = parse(process.env.DATABASE_URL);
}
const isProduction = process.env.NODE_ENV === 'production'


module.exports = {
  isProduction: isProduction,
  webServer: {
    port: process.env.PORT || 3000
  },
  db: {
    migrationDirectory: path.join(__dirname, '..', 'db', 'schema'),
    schemaTable: 'dn5_schema_version',
    driver: 'pg',
    host: pgConnStringConf.host || process.env.DB_HOST || '127.0.0.1',
    port: pgConnStringConf.port || process.env.DB_PORT || 5432,
    database: pgConnStringConf.database || process.env.DB_NAME || 'dn5',
    user: pgConnStringConf.user || process.env.DB_USER || 'dn5',
    password: pgConnStringConf.password || process.env.DB_PWD || 'dn5',
    queryDirectory: path.join(__dirname, '..', 'db', 'queries'),
    versionNumber: process.env.DB_VERSION_NUMBER || '001',
    ssl: isProduction
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    recipientPhoneNumber: process.env.TWILIO_RECIPIENT,
    originPhoneNumber: process.env.TWILIO_FROM
  },
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    from: process.env.MAILGUN_FROM,
    recipient: process.env.MAILGUN_RECIPIENT
  }
}