import { registerAs } from '@nestjs/config';

export default registerAs('app', () => {
  const environment = process.env.NODE_ENV || 'development';
  return {
    port: parseInt(process.env.BACKEND_PORT || '8080', 10) || 8080,
    baseUrl: process.env.BACKEND_BASE_URL || 'http://localhost:8080',
    environment,
    isDevelopment: environment === 'development',

    // CORS settings
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],

    // Telegram Bot settings
    botToken: process.env.BOT_TOKEN,
    botUsername: process.env.BOT_USERNAME || 'fabricbotbot',

    // File Service settings
    fileServiceUrl: process.env.FILE_SERVICE_URL || 'http://localhost:3002',
    fileServiceApiKey: process.env.FILE_API_KEY || '',

    // Integration API Service settings
    integrationApiKey: process.env.INTEGRATION_API_KEY || '',
    // Секрет для подписи межсервисных запросов (HMAC-SHA256)
    interServiceSecret:
      process.env.INTER_SERVICE_SECRET || process.env.INTEGRATION_API_KEY || '',

    // Публичный URL для файлов (через nginx/домен)
    // Если не указан, используется относительный путь /files/...
    filePublicUrl: process.env.FILE_PUBLIC_URL || '',
  };
});
