export const Environment = {
  newRelicApiKey: process.env.NEW_RELIC_LICENSE_KEY,
  insertKey: process.env.NEW_RELIC_INSERT_KEY,
  host: process.env.EVENT_CLIENT_HOST,
} as const;
