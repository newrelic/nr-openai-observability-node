import * as express from 'express';
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
        apiKey: TestEnvironment.openaiApiKey,
      }),
    );

monitorOpenAI(openAIApi, {
  newRelicApiKey: TestEnvironment.nrApiKey,
  host: TestEnvironment.nrHost,
  applicationName: 'Showcase',
});

const app = express();

app.get('/createCompletion/:prompt', async (req, res) => {
  try {
    const { prompt } = req.params;
    const { data } = await openAIApi.createCompletion({
      model: 'text-davinci-003',
      prompt,
    });
    res.send(data.choices.map(({ text }) => text).join(';'));
  } catch (error: any) {
    console.error(error.message);
    res.send(error.response.data.error);
  }
});

app.get('/createChatCompletion/:content', async (req, res) => {
  try {
    const { content } = req.params;
    const messages = [
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content,
      },
    ];
    const { data } = await openAIApi.createChatCompletion({
      model: 'gpt-4',
      messages,
    });
    res.send(data.choices.map(({ message }) => message?.content).join(';'));
  } catch (error: any) {
    console.error(error.message);
    res.send(error.response.data.error);
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
