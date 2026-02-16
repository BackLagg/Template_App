import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/request.interface';

export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthenticatedRequest | undefined,
    ctx: ExecutionContext,
  ): unknown => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    if (data) {
      return request[data];
    }

    // Возвращаем объект со всеми данными пользователя
    return {
      telegramUser: request.telegramUser,
      user: request.user,
      profile: request.profile,
      superUser: request.superUser,
    };
  },
);
