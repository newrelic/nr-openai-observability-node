import * as dotenv from 'dotenv';

const isAzure = process.env.OPENAI_ENV === 'AZURE';
const isTest = process.env.NODE_ENV === 'test';

dotenv.config({
  path: `.env${isAzure ? `.azure` : isTest ? '.test' : ''}`,
});

export const TestEnvironment = {
  isAzure,
  openaiBasePath: process.env.OPENAI_BASE_PATH as string,
  openaiApiKey: process.env.OPENAI_API_KEY as string,
  newRelicApiKey: process.env.NEW_RELIC_LICENSE_KEY as string,
  newRelicHost: process.env.EVENT_CLIENT_HOST as string,
} as const;
