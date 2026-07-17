import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserProfileDocument = UserProfile &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

@Schema({ timestamps: true })
export class UserProfile {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  telegramID!: string;

  @Prop({ required: false })
  name!: string;

  @Prop({ required: false })
  username!: string;

  @Prop({ default: true })
  isNew!: boolean;

  @Prop({ required: false })
  avatarPath!: string;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
