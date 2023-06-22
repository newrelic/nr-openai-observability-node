import * as dotenv from 'dotenv';

const isAzure = false || process.env.OPENAI_ENV === 'AZURE';
const isTest = process.env.NODE_ENV === 'test';

dotenv.config({
  path: `.env${isAzure ? `.azure` : isTest ? '.test' : ''}`,
});

export const TestEnvironment = {
  isAzure,
  openaiBasePath: process.env.OPENAI_BASE_PATH as string,
  openaiApiKey: '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',
  // newRelicApiKey: process.env.NEW_RELIC_LICENSE_KEY as string,
  // newRelicHost: process.env.EVENT_CLIENT_HOST as string,
  newRelicApiKey: '1abfbf6d1f401cc0faccf0727387d3cfFFFFNRAL',
  newRelicHost: 'staging-insights-collector.newrelic.com',
  applicationName: 'Telegram App v3',
} as const;
