import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/request.interface';
import { SanitizerUtil } from '../utils/sanitizer.util';

@Injectable()
export class SuperUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const url = request.url;

    // Пропускаем callback endpoints от payment-service (они не требуют аутентификации)
    if (
      url.includes('/deposit/callback') ||
      url.includes('/withdraw/callback')
    ) {
      return true;
    }

    // Проверяем что Telegram пользователь существует
    if (!request.telegramUser) {
      throw new ForbiddenException({
        message: 'Telegram user not found',
        errorCode: 'TELEGRAM_USER_NOT_FOUND',
      });
    }

    // Проверяем валидность Telegram ID
    if (!SanitizerUtil.validateTelegramId(request.telegramUser.id.toString())) {
      throw new ForbiddenException({
        message: 'Invalid Telegram ID format',
        errorCode: 'INVALID_TELEGRAM_ID',
      });
    }

    // Проверяем что пользователь существует в БД
    if (!request.user) {
      throw new ForbiddenException({
        message: 'User not found in database',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    // Проверяем соответствие Telegram ID и пользователя в БД
    if (request.telegramUser.id.toString() !== request.user.telegramID) {
      throw new ForbiddenException({
        message: 'Telegram ID mismatch',
        errorCode: 'TELEGRAM_ID_MISMATCH',
      });
    }

    // Проверяем что пользователь является супер-пользователем
    if (!request.superUser) {
      throw new ForbiddenException({
        message: 'Super user privileges required',
        errorCode: 'SUPER_USER_REQUIRED',
      });
    }

    // Проверка isAccepted временно отключена
    // if (!request.superUser.isAccepted) {
    //   throw new ForbiddenException('Super user account not activated');
    // }

    return true;
  }
}
