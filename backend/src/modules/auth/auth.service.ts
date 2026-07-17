import { Injectable } from '@nestjs/common';
import { AuthResponseDto } from '../../dto/auth.dto';
import { UpdateUserProfileDto } from '../../dto/user-profile.dto';
import { TelegramUserData } from '../../middleware/telegram-auth.middleware';
import { UserDocument } from '../../schemas/user.schema';
import { SuperUserDocument } from '../../schemas/superuser.schema';
import { UserProfileDocument } from '../../schemas/user-profile.schema';
import { UserFullData } from '../../interfaces/user-data.interface';
import { CacheService } from '../cache/cache.service';
import { UserService } from './services/user.service';
import { UserProfileService } from './services/user-profile.service';
import { OnboardingService } from './services/onboarding.service';

interface CompleteOnboardingData {
  fullName?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private cacheService: CacheService,
    private userService: UserService,
    private userProfileService: UserProfileService,
    private onboardingService: OnboardingService,
  ) {}

  private resolveUserId(
    user: UserDocument | UserFullData | null,
    profile: UserProfileDocument | null,
  ): string {
    if (user) {
      const docId = (user as UserDocument)._id;
      if (docId) {
        return docId.toString();
      }
      return (user as UserFullData).id ?? (user as UserFullData)._id ?? '';
    }
    return profile?.userId?.toString() ?? '';
  }

  async buildAuthResponse(
    telegramUser: TelegramUserData,
    user: UserDocument | UserFullData | null,
    profile: UserProfileDocument | null,
    superUser: SuperUserDocument | null,
  ): Promise<AuthResponseDto> {
    let needsCacheInvalidation = false;

    if (!profile) {
      profile = await this.userProfileService.findOrCreateProfile(telegramUser);
      needsCacheInvalidation = true;
    }

    if (!user) {
      user = await this.userService.findOrCreateUser(telegramUser);
      needsCacheInvalidation = true;
    }

    const userId = this.resolveUserId(user, profile);

    if (needsCacheInvalidation && userId) {
      await this.cacheService.invalidateByTags([
        `user:${userId}`,
        'new_users',
        'recent_registrations',
      ]);
    }

    return {
      success: true,
      user: {
        id: userId,
        telegramId: Number(profile?.telegramID ?? telegramUser.id),
        username: profile?.username || '',
        name: profile?.name || '',
        role: superUser ? 'superuser' : 'user',
        isNew: profile?.isNew || false,
        isAccepted: user?.isAccepted || false,
        createdAt: this.formatDate(profile?.createdAt),
        updatedAt: this.formatDate(profile?.updatedAt),
      },
    };
  }

  async completeOnboarding(
    telegramUser: TelegramUserData,
    user: UserDocument | UserFullData | null,
    profile: UserProfileDocument | null,
    superUser: SuperUserDocument | null,
    onboardingData: CompleteOnboardingData & { initData?: string },
  ): Promise<AuthResponseDto> {
    profile = await this.onboardingService.completeOnboarding(
      telegramUser,
      user,
      profile,
      onboardingData,
    );

    if (!user) {
      user = await this.userService.findOrCreateUser(telegramUser);
    }

    const userId = this.resolveUserId(user, profile);

    return {
      success: true,
      user: {
        id: userId,
        telegramId: Number(profile?.telegramID ?? telegramUser.id),
        username: profile?.username || '',
        name: profile?.name || '',
        role: superUser ? 'superuser' : 'user',
        isNew: false,
        isAccepted: user?.isAccepted || false,
        createdAt: this.formatDate(profile?.createdAt),
        updatedAt: this.formatDate(profile?.updatedAt),
      },
    };
  }

  async updateLastLogin(
    user: UserDocument | UserFullData | null,
    profile: UserProfileDocument | null,
  ): Promise<void> {
    const userId = this.resolveUserId(user, profile);
    if (userId) {
      await this.userService.updateLastLogin(userId);
    }
  }

  async updateUserProfile(
    telegramUser: TelegramUserData,
    updateProfileDto: UpdateUserProfileDto,
    existingProfile?: UserProfileDocument | null,
  ): Promise<void> {
    await this.userProfileService.updateUserProfile(
      telegramUser,
      updateProfileDto,
      existingProfile,
    );
  }

  private formatDate(
    date: Date | string | number | undefined | unknown,
  ): string {
    try {
      if (!date) {
        return new Date().toISOString();
      }

      if (date instanceof Date) {
        const result = isNaN(date.getTime())
          ? new Date().toISOString()
          : date.toISOString();
        return result;
      }

      if (typeof date === 'string') {
        const parsed = new Date(date);
        const result = isNaN(parsed.getTime())
          ? new Date().toISOString()
          : parsed.toISOString();
        return result;
      }

      if (typeof date === 'number') {
        const parsed = new Date(date);
        const result = isNaN(parsed.getTime())
          ? new Date().toISOString()
          : parsed.toISOString();
        return result;
      }

      if (date && typeof date === 'object') {
        try {
          const d = date as { toISOString?: () => string };
          if (typeof d.toISOString === 'function') {
            const result = d.toISOString();
            if (typeof result === 'string') {
              return result;
            }
          }
        } catch {
          // ignore
        }

        try {
          const parsed = new Date(date as string | number | Date);
          if (!isNaN(parsed.getTime())) {
            return parsed.toISOString();
          }
        } catch {
          // ignore
        }
      }

      return new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
}
