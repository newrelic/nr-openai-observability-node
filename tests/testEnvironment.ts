import * as dotenv from 'dotenv';

const isAzure = process.env.OPENAI_ENV === 'AZURE';

dotenv.config({
  path: `.env${isAzure ? `.azure` : ''}`,
});

export const TestEnvironment = {
  isAzure,
  openaiBasePath: process.env.OPENAI_BASE_PATH as string,
  openaiApiKey: process.env.OPENAI_API_KEY as string,
  nrApiKey: process.env.NEW_RELIC_API_KEY as string,
  nrHost: process.env.EVENT_CLIENT_HOST as string,
} as const;
