<a href="https://opensource.newrelic.com/oss-category/#community-project"><picture><source media="(prefers-color-scheme: dark)" srcset="https://github.com/newrelic/opensource-website/raw/main/src/images/categories/dark/Community_Project.png"><source media="(prefers-color-scheme: light)" srcset="https://github.com/newrelic/opensource-website/raw/main/src/images/categories/Community_Project.png"><img alt="New Relic Open Source community project banner." src="https://github.com/newrelic/opensource-website/raw/main/src/images/categories/Community_Project.png"></picture></a>

# New Relic OpenAI Observability for Node.js

## Installation

Use your favorite package manager to install `@newrelic/nr-openai-observability-node`.

    $ npm install newrelic/nr-openai-observability-node#main 

## Getting Started

Just call `monitorOpenAI` with the `openai` instance and use it as usual. It will be patched behind the scenes to send data to New Relic.

```typescript
import { Configuration, OpenAIApi } from 'openai';
import { monitorOpenAI } from '@newrelic/nr-openai-observability-node';

const configuration = new Configuration({
  apiKey: 'OPENAI_API_KEY',
});

const openAIApi = new OpenAIApi(configuration);

monitorOpenAI(openAIApi, {
  applicationName: 'MyApp',
  apiKey: 'NEW_RELIC_LICENSE_KEY',
});

const response = await openAIApi.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: 'user', content: 'What is Observability?' }]
});
```

### Initialization Options

```typescript
export interface MonitorOpenAIOptions {
  /**
   * Your application name in New Relic, must provided.
   */
  applicationName: string;
  /**
   * API key with insert access used to authenticate the request.
   * For more information on creating keys, please see:
   * https://docs.newrelic.com/docs/insights/insights-data-sources/custom-data/introduction-event-api#register
   */
  newRelicApiKey?: string;
  /**
   * Optional host override for event endpoint.
   */
  host?: string;
  /**
   * Optional port override for trace endpoint.
   */
  port?: number;
}
```

### Environment Variables

You can use your configured environment variable for initialization options:

- NEW_RELIC_LICENSE_KEY - API key with insert access used to authenticate the request.

- NEW_RELIC_INSERT_KEY - Same as API key.

- EVENT_CLIENT_HOST - Optional host override for events endpoint.

## Testing

    $ npm run test

> Note: `monitor.integration` test requires `.env.test` file with `OPENAI_API_KEY` configured.

## Support

New Relic hosts and moderates an online forum where you can interact with New Relic employees as well as other customers to get help and share best practices. Like all official New Relic open source projects, there's a related Community topic in the New Relic Explorers Hub. You can find this project's topic/threads here:

- [New Relic Documentation](https://docs.newrelic.com/docs/telemetry-data-platform/get-started/capabilities/telemetry-sdks-send-custom-telemetry-data-new-relic): Comprehensive guidance for using our platform
- [New Relic Community](https://discuss.newrelic.com/tags/nodeagent): The best place to engage in troubleshooting questions
- [New Relic Developer](https://developer.newrelic.com/): Resources for building a custom observability applications
- [New Relic University](https://learn.newrelic.com/): A range of online training for New Relic users of every level

## Privacy

At New Relic we take your privacy and the security of your information seriously, and are committed to protecting your information. We must emphasize the importance of not sharing personal data in public forums, and ask all users to scrub logs and diagnostic information for sensitive information, whether personal, proprietary, or otherwise.

We define “Personal Data” as any information relating to an identified or identifiable individual, including, for example, your name, phone number, post code or zip code, Device ID, IP address, and email address.

For more information, review [New Relic’s General Data Privacy Notice](https://newrelic.com/termsandconditions/privacy).

## Contribute

We encourage your contributions to improve [project name]! Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. You only have to sign the CLA one time per project.

If you have any questions, or to execute our corporate CLA (which is required if your contribution is on behalf of a company), drop us an email at opensource@newrelic.com.

**A note about vulnerabilities**

As noted in our [security policy](../../security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [HackerOne](https://hackerone.com/newrelic).

If you would like to contribute to this project, review [these guidelines](./CONTRIBUTING.md).

To [all contributors](<https://github.com/newrelic/newrelic-telemetry-sdk-node/graphs/contributors), we thank you! Without your contribution, this project would not be what it is today. We also host a community project page dedicated to [New Relic Telemetry SDK (Node)](https://opensource.newrelic.com/projects/newrelic/newrelic-telemetry-sdk-node).

## License

`newrelic-telemetry-sdk-node` is licensed under the [Apache 2.0](http://apache.org/licenses/LICENSE-2.0.txt) License.

> [If applicable: The [project name] also uses source code from third-party libraries. You can find full details on which libraries are used and the terms under which they are licensed in the third-party notices document.]
