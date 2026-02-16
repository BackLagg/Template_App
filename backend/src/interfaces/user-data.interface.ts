import { UserProfileDocument } from '../schemas/user-profile.schema';
import { SuperUserDocument } from '../schemas/superuser.schema';

export interface UserFullData {
  _id: string;
  id?: string;
  telegramID: string;
  isAccepted: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  updatedAt: Date;
  profile: UserProfileDocument | null;
  superUser: SuperUserDocument | null;
}
