import { OpenAI } from 'langchain/llms/openai';
import { monitorOpenAI } from '../src';
import { TestEnvironment } from './testEnvironment';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

const model = new OpenAI({
  modelName: 'gpt-3.5-turbo',
  openAIApiKey: TestEnvironment.openaiApiKey,
  temperature: 0.8,
});

monitorOpenAI(model, {
  newRelicApiKey: TestEnvironment.newRelicApiKey,
  host: TestEnvironment.newRelicHost,
  applicationName: 'Showcase',
});

const run = async () => {
  /* Create instance */
  const embeddings = new OpenAIEmbeddings();

  /* Embed queries */
  const resEmbeddings = await embeddings.embedQuery('Hello world');
  console.log(resEmbeddings);

  const res = await model.call(
    'What would be a good company name a company that makes colorful socks?',
  );
  console.log(res);
};

run();
