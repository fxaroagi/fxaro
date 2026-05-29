export declare const CONFIG: {
    PORT: number;
    NODE_ENV: string;
    JWT_SECRET: string;
    DATABASE_URL: string;
    APIS: {
        OPENROUTER_API_KEY: string | undefined;
        GROQ_API_KEY: string | undefined;
        HUGGINGFACE_API_KEY: string | undefined;
        REPLICATE_API_KEY: string | undefined;
    };
    TELEGRAM_BOT_TOKEN: string | undefined;
    TELEGRAM_WEBHOOK_URL: string | undefined;
    WHATSAPP_API_TOKEN: string | undefined;
    WHATSAPP_PHONE_ID: string | undefined;
    PROXY_LIST: string[];
    LOG_LEVEL: string;
};
export declare const AGENT_TYPES: {
    TASK_PLANNER: string;
    WEB_NAVIGATOR: string;
    DATA_ANALYST: string;
    CONTENT_CREATOR: string;
    CODE_EXECUTOR: string;
    MEDIA_GENERATOR: string;
    RESULT_FORMATTER: string;
};
export declare const API_MODELS: {
    OPENROUTER: string[];
    GROQ: string[];
    HUGGINGFACE: string[];
};
export declare const RATE_LIMITS: {
    OPENROUTER: {
        requests: number;
        window: number;
    };
    GROQ: {
        requests: number;
        window: number;
    };
    HUGGINGFACE: {
        requests: number;
        window: number;
    };
};
//# sourceMappingURL=constants.d.ts.map