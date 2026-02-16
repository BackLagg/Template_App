import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { BadRequestException } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { SanitizePipe } from './pipes/sanitize.pipe';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AppConstants } from './constants/app.constants';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Получаем настройки из конфига
  const allowedOrigins = configService.get<string[]>('app.allowedOrigins');
  const isDevelopment = configService.get<boolean>('app.isDevelopment');
  const port = configService.get<number>('app.port') || 8080;

  // Увеличиваем лимит для body-parser для голосовых данных
  app.use(
    json({
      limit: `${AppConstants.FILE_SIZE.LIMITS.JSON_BODY / AppConstants.FILE_SIZE.BYTES.MB}mb`,
    }),
  );
  app.use(
    urlencoded({
      limit: `${AppConstants.FILE_SIZE.LIMITS.JSON_BODY / AppConstants.FILE_SIZE.BYTES.MB}mb`,
      extended: true,
    }),
  );

  // Enable CORS
  // В dev режиме разрешаем все origins, в production - только из конфига
  app.enableCors({
    origin: isDevelopment ? true : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Init-Data',
      'X-API-Key',
    ],
  });

  // Глобальная sanitization (применяется ПЕРЕД валидацией)
  app.useGlobalPipes(new SanitizePipe());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: !isDevelopment,
      exceptionFactory: (errors): BadRequestException => {
        logger.warn('Validation errors:', errors);
        return new BadRequestException(errors);
      },
    }),
  );

  // Глобальный Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Файлы обслуживаются через файловый сервис
  // Файловый сервис работает на отдельном порту и обрабатывает все операции с файлами

  app.setGlobalPrefix('api');

  await app.listen(port);
  logger.log(`🚀 Server is running on http://localhost:${port}`);
  logger.log(`🔒 Security: Sanitization + Validation enabled`);
  logger.log(`🌍 Environment: ${isDevelopment ? 'Development' : 'Production'}`);
}

bootstrap();
