import { IsOptional, IsString } from 'class-validator';

export class CompleteOnboardingDto {
  @IsOptional()
  @IsString()
  initData?: string; // Добавляем initData, так как оно приходит в body

  @IsOptional()
  @IsString()
  tgWebAppStartParam?: string; // Добавляем startParam для реферальной системы

  @IsOptional()
  @IsString()
  fullName?: string; // Добавляем полное имя пользователя
}
