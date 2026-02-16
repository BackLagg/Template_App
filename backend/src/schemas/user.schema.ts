import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  telegramID!: string;

  @Prop({ default: false })
  isAccepted!: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;

  @Prop({ type: Date, default: Date.now })
  lastLoginAt!: Date;

  @Prop({ required: false })
  tonAddress?: string; // Адрес TON кошелька пользователя (сохраняется при пополнении/выводе)
}

export const UserSchema = SchemaFactory.createForClass(User);
