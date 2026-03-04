import dotenv from 'dotenv';
dotenv.config();

const normalizePythonAiUrl = (rawUrl: string): string => {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.pathname === '/' || parsed.pathname === '') {
      parsed.pathname = '/chat';
    }
    return parsed.toString().replace(/\/$/, '');
  } catch {
    const trimmed = rawUrl.replace(/\/$/, '');
    return trimmed.endsWith('/chat') ? trimmed : `${trimmed}/chat`;
  }
};

interface AppConfig {
    PORT : number;
    NODE_ENV : string;
    CORS_ORIGIN : string;
    CORS_ORIGINS: string[];
    MONGODB_URI : string;
    PYTHON_AI_URL : string;
    PYTHON_AI_TIMEOUT_MS: number;
    JWT_SECRET: string;
    ACCESS_TOKEN_EXPIRES_IN: string;
    REFRESH_TOKEN_EXPIRES_DAYS: number;
    GOOGLE_CLIENT_ID?: string;
    APPLE_CLIENT_ID?: string;
}

const DEFAULT_JWT_SECRET = 'needs key';

const config : AppConfig = {
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:8080',
    CORS_ORIGINS: (process.env.CORS_ORIGIN || 'http://localhost:8080')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/therapy-ai',
    PYTHON_AI_URL: normalizePythonAiUrl(process.env.AI_SERVICE_URL || 'http://localhost:5000'),
    PYTHON_AI_TIMEOUT_MS: parseInt(process.env.PYTHON_AI_TIMEOUT_MS || '120000', 10),
    JWT_SECRET: process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '60m',
    REFRESH_TOKEN_EXPIRES_DAYS: parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10),
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID,
};

//check port
if (isNaN(config.PORT)) {
  throw new Error('Invalid PORT defined in environment variables.');
}

if (isNaN(config.PYTHON_AI_TIMEOUT_MS)) {
  throw new Error('Invalid PYTHON_AI_TIMEOUT_MS defined in environment variables.');
}

if (isNaN(config.REFRESH_TOKEN_EXPIRES_DAYS) || config.REFRESH_TOKEN_EXPIRES_DAYS <= 0) {
  throw new Error('Invalid REFRESH_TOKEN_EXPIRES_DAYS defined in environment variables.');
}

if (!config.MONGODB_URI) {
  throw new Error('MONGODB_URI must be defined in environment variables.');
}

const isTestEnv = config.NODE_ENV === 'test' || Boolean(process.env.JEST_WORKER_ID);
if (!isTestEnv && (!config.JWT_SECRET || config.JWT_SECRET === DEFAULT_JWT_SECRET)) {
  throw new Error('JWT_SECRET must be defined with a strong value.');
}

export default config;
