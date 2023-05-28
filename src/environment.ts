export const Environment = {
  apiKey: process.env.NEW_RELIC_API_KEY,
  licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
  insertKey: process.env.NEW_RELIC_INSERT_KEY,
  host: process.env.EVENT_CLIENT_HOST,
} as const;
