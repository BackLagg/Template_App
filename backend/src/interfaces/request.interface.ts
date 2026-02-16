import { Request } from 'express';
import { UserDocument } from '../schemas/user.schema';
import { SuperUserDocument } from '../schemas/superuser.schema';
import { UserProfileDocument } from '../schemas/user-profile.schema';
import { TelegramUserData } from '../middleware/telegram-auth.middleware';

import { UserFullData } from './user-data.interface';

export interface AuthenticatedRequest extends Request {
  telegramUser?: TelegramUserData;
  user?: UserDocument | UserFullData;
  profile?: UserProfileDocument;
  superUser?: SuperUserDocument;
  startappParam?: string; // Реферальный код из startapp параметра
}
