import { IsString, IsNumber } from 'class-validator';

export class AddBalanceDto {
  @IsString()
  telegramId: string;

  @IsNumber()
  amount: number;
}
