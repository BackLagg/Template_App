import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  initData!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  profession?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class ProfileResponseDto {
  userId!: string;
  profession?: string;
  description?: string;
  avatarPath?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
