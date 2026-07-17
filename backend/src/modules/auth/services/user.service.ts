import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../../schemas/user.schema';
import {
  UserProfile,
  UserProfileDocument,
} from '../../../schemas/user-profile.schema';
import { TelegramUserData } from '../../../middleware/telegram-auth.middleware';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(UserProfile.name)
    private userProfileModel: Model<UserProfileDocument>,
  ) {}

  getUserDisplayName(telegramUser: TelegramUserData): string {
    if (telegramUser.first_name && telegramUser.first_name.trim()) {
      return telegramUser.first_name.trim();
    }
    if (telegramUser.username && telegramUser.username.trim()) {
      return telegramUser.username.trim();
    }
    return 'Anonymous';
  }

  async createBasicUser(): Promise<UserDocument | null> {
    return this.userModel.create({
      lastLoginAt: new Date(),
    });
  }

  async findById(
    userId: Types.ObjectId | string,
  ): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
  }

  async findOrCreateUser(
    telegramUser: TelegramUserData,
  ): Promise<UserDocument> {
    const telegramID = telegramUser.id.toString();

    const profile = await this.userProfileModel
      .findOne({ telegramID })
      .exec();

    if (profile) {
      const existingUser = await this.findById(profile.userId);
      if (existingUser) {
        return existingUser;
      }
    }

    const createdUser = await this.createBasicUser();
    if (!createdUser) {
      throw new Error('Failed to create user');
    }

    return createdUser;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      { lastLoginAt: new Date() },
      { new: true },
    );
  }
}
