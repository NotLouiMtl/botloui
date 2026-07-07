import { IsString, MinLength, IsOptional } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsString()
  telegramId?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsString()
  @MinLength(4)
  password: string;
}
