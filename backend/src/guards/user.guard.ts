import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/request.interface';
import { SanitizerUtil } from '../utils/sanitizer.util';

@Injectable()
export class UserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Проверяем что Telegram пользователь существует
    if (!request.telegramUser) {
      throw new UnauthorizedException({
        message: 'Telegram user not found',
        errorCode: 'TELEGRAM_USER_NOT_FOUND',
      });
    }

    // Проверяем валидность Telegram ID
    if (!SanitizerUtil.validateTelegramId(request.telegramUser.id.toString())) {
      throw new UnauthorizedException({
        message: 'Invalid Telegram ID format',
        errorCode: 'INVALID_TELEGRAM_ID',
      });
    }

    // Проверяем что пользователь существует в БД
    if (!request.user) {
      throw new UnauthorizedException({
        message: 'User not found in database',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    // Проверяем соответствие Telegram ID и пользователя в БД
    if (request.telegramUser.id.toString() !== request.user.telegramID) {
      throw new UnauthorizedException({
        message: 'Telegram ID mismatch',
        errorCode: 'TELEGRAM_ID_MISMATCH',
      });
    }

    return true;
  }
}
