import * as express from 'express';
import * as bodyParser from 'body-parser';
import {
  Configuration as AzureConfiguration,
  OpenAIApi as AzureOpenAIApi,
} from 'azure-openai';
import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from 'openai';

import { monitorOpenAI } from '../src';
import { TestEnvironment } from './testEnvironment';

const openAIApi = TestEnvironment.isAzure
  ? (new AzureOpenAIApi(
    new AzureConfiguration({
      azure: {
        apiKey: TestEnvironment.openaiApiKey,
        endpoint: TestEnvironment.openaiBasePath,
      },
    }),
  ) as unknown as OpenAIApi)
  : new OpenAIApi(
    new Configuration({
      apiKey: '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'
    }),
  );

monitorOpenAI(openAIApi, {
  // newRelicApiKey: TestEnvironment.newRelicApiKey,
  // host: TestEnvironment.newRelicHost,
  // applicationName: 'Showcase',
  newRelicApiKey: '1abfbf6d1f401cc0faccf0727387d3cfFFFFNRAL',
  host: 'staging-insights-collector.newrelic.com',
  applicationName: 'Telegram App v3',
});

const PORT = 3000;

const app = express();
app
  .use(bodyParser.json())
  .post('/createCompletion', async (req, res) => {
    try {
      const { prompt } = req.body;
      const { data } = await openAIApi.createCompletion({
        model: 'text-davinci-003',
        prompt,
        temperature: 1,
        max_tokens: 5,
      });
      res.send(data.choices);
    } catch (error: any) {
      console.error(error.message);
      res.send(error.response.data.error);
    }
  })
  .post('/createChatCompletion', async (req, res) => {
    try {
      const { content } = req.body;
      const messages = [
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content,
        },
      ];
      const { data } = await openAIApi.createChatCompletion({
        model: 'gpt-4',
        messages,
        temperature: 1,
        max_tokens: 5,
      });
      res.send(data.choices);
    } catch (error: any) {
      console.error(error.message);
      res.send(error);
    }
  })
  .listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
