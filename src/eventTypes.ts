export type EventType =
  | 'LlmCompletion'
  | 'LlmChatCompletionSummary'
  | 'LlmChatCompletionMessage';

export type EventAttributes = Record<string, string | number | boolean>;

export type OpenAICompletionAttributes = Record<string, string | number>;

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
interface errorResponse {
  status: string;
  data: errorResponseData
}
interface errorResponseData {
  status: string
  error: {
    message: string
    type: string
    code: string
    param: any
  }
}
export interface CreateChatCompletionError {
  response?: errorResponse
  message?: string
}

export interface ChatCompletionSummaryAttributes {
  id: string;
  applicationName: string;
  'request.model': string;
  'response.model'?: string;
  response_time: number;
  timestamp: number;
  total_tokens?: number;
  prompt_tokens?: number;
  usage_completion_tokens?: number;
  api_version?: any;
  organization?: any;
  api_key_last_four_digits?: string;
  finish_reason?: string;
  user_id?: string;
  api_type?: 'azure' | 'openai';
  vendor: 'openAI';
  number_of_messages: number;
  ratelimit_reset_tokens?: string;
  ratelimit_reset_requests?: string;
  ratelimit_limit_requests?: number;
  ratelimit_limit_tokens?: number;
  ratelimit_remaining_tokens?: number;
  ratelimit_remaining_requests?: number;
  error_status?: string
  error_message?: string
  error_type?: string
  error_code?: string
  error_param?: string
}

export type EventData = { eventType: EventType; attributes: EventAttributes };
