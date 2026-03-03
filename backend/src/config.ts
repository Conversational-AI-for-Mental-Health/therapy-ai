import dotenv from 'dotenv';
dotenv.config();
interface AppConfig {
    PORT : number;
    NODE_ENV : string;
    CORS_ORIGIN : string;
    MONGODB_URI : string;
    PYTHON_AI_URL : string;
    PYTHON_AI_TIMEOUT_MS: number;
    JWT_SECRET: string;
}
const config : AppConfig = {
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:8080',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/therapy-ai',
    PYTHON_AI_URL: process.env.AI_SERVICE_URL || 'http://localhost:5000',
    PYTHON_AI_TIMEOUT_MS: parseInt(process.env.PYTHON_AI_TIMEOUT_MS || '120000', 10),
    JWT_SECRET: process.env.JWT_SECRET || 'needs key'
};

//check port
if (isNaN(config.PORT)) {
  throw new Error('Invalid PORT defined in environment variables.');
}

if (isNaN(config.PYTHON_AI_TIMEOUT_MS)) {
  throw new Error('Invalid PYTHON_AI_TIMEOUT_MS defined in environment variables.');
}

if (!config.MONGODB_URI) {
  throw new Error('MONGODB_URI must be defined in environment variables.');
}

export default config;
