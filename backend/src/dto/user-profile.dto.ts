import { IsOptional, IsString } from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  initData?: string; // Для аутентификации

  @IsOptional()
  @IsString()
  user?: string;
}

export class UserProfileResponseDto {
  id!: string;
  userId!: string;
  name!: string;
  isNew!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
