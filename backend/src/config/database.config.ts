import { registerAs } from '@nestjs/config';

/**
 * Database Configuration
 *
 * Всегда использует MONGO_URI из переменных окружения
 * Должен быть установлен в docker-compose или .env файле
 */
export default registerAs('database', () => {
  const environment = process.env.NODE_ENV || 'development';
  const isDevelopment = environment === 'development';

  // Всегда используем MONGO_URI из переменных окружения
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI environment variable is required');
  }

  return {
    uri,
    isDevelopment,
  };
});
