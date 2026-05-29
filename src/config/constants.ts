export const CONFIG = {
  // Server
  PORT: parseInt(process.env.PORT || '3000'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'sqlite:///./openclaw.db',

  // API Keys
  APIS: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
    REPLICATE_API_KEY: process.env.REPLICATE_API_KEY,
  },

  // Telegram
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_WEBHOOK_URL: process.env.TELEGRAM_WEBHOOK_URL,

  // WhatsApp
  WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN,
  WHATSAPP_PHONE_ID: process.env.WHATSAPP_PHONE_ID,

  // Proxy
  PROXY_LIST: process.env.PROXY_LIST?.split(',') || [],

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

export const AGENT_TYPES = {
  TASK_PLANNER: 'task-planner',
  WEB_NAVIGATOR: 'web-navigator',
  DATA_ANALYST: 'data-analyst',
  CONTENT_CREATOR: 'content-creator',
  CODE_EXECUTOR: 'code-executor',
  MEDIA_GENERATOR: 'media-generator',
  RESULT_FORMATTER: 'result-formatter',
};

export const API_MODELS = {
  OPENROUTER: [
    'openrouter/auto',
    'anthropic/claude-3-opus',
    'openai/gpt-4-turbo-preview',
  ],
  GROQ: [
    'mixtral-8x7b-32768',
    'llama2-70b-4096',
  ],
  HUGGINGFACE: [
    'meta-llama/Llama-2-70b-chat-hf',
  ],
};

export const RATE_LIMITS = {
  OPENROUTER: { requests: 100, window: 60000 },
  GROQ: { requests: 30, window: 60000 },
  HUGGINGFACE: { requests: 20, window: 60000 },
};
