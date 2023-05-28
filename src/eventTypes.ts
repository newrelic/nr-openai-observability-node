export type EventType =
  | 'OpenAICompletion'
  | 'ChatCompletionSummary'
  | 'ChatCompletionMessage';

export type EventAttributes = Record<string, string | number | boolean>;

export type OpenAICompletionAttributes = Record<string, string | number>;

export interface ChatCompletionMessageAttributes {
  id: string;
  content: string;
  role: string;
  completion_id: string;
  sequence: string;
  model: string;
  vendor: 'openai';
}

export interface ChatCompletionSummaryAttributes {
  id: string;
  response_time: number;
  timestamp: number;
  total_tokens?: number;
  prompt_tokens?: number;
  usage_completion_tokens?: number;
  api_version?: string;
  finish_reason?: string;
  user_id?: string;
  api_type?: 'azure' | 'openai';
  vendor: 'openai';
  number_of_messages: number;
}

export type EventData = { eventType: EventType; attributes: EventAttributes };
