export type EventType =
  | 'LlmCompletion'
  | 'LlmChatCompletionSummary'
  | 'LlmChatCompletionMessage'
  | 'LlmEmbedding';

export type EventAttributes = Record<string, string | number | boolean>;

export interface ChatCompletionMessageAttributes {
  id: string;
  applicationName: string;
  content: string;
  role: string;
  completion_id: string;
  sequence: string;
  model: string;
  vendor: 'openAI';
}

export interface OpenAIError {
  response?: OpenAIErrorResponse;
  message?: string;
  data: OpenAIErrorResponseData;
}

export interface OpenAIErrorResponse {
  status: string;
  data: OpenAIErrorResponseData;
}

interface OpenAIErrorResponseData {
  status: string;
  error: {
    message: string;
    type: string;
    code: string;
    param: any;
  };
}

export interface ChatCompletionSummaryAttributes
  extends CommonSummaryAttributes {
  finish_reason?: string;
  number_of_messages: number;
}

export interface EmbeddingAttributes extends CommonSummaryAttributes {
  input: string;
}

export interface CommonSummaryAttributes {
  id: string;
  applicationName: string;
  'request.model': string;
  'response.model'?: string;
  response_time: number;
  timestamp: number;
  api_version?: any;
  organization?: any;
  api_key_last_four_digits?: string;
  user_id?: string;
  api_type?: 'azure' | 'openai';
  vendor: 'openAI';
  ratelimit_reset_tokens?: string;
  ratelimit_reset_requests?: string;
  ratelimit_limit_requests?: number;
  ratelimit_limit_tokens?: number;
  ratelimit_remaining_tokens?: number;
  ratelimit_remaining_requests?: number;
  error_status?: string;
  error_message?: string;
  error_type?: string;
  error_code?: string;
  error_param?: string;
  ingestion_source?: string;
}

export type EventData = { eventType: EventType; attributes: EventAttributes };
