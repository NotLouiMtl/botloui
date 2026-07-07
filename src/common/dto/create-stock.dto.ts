import { IsString, IsNumber, IsOptional, Min, IsArray } from 'class-validator';

export class CreateStockDto {
  @IsNumber()
  serviceId: number;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  pin?: string;

  @IsOptional()
  @IsString()
  type?: string; // "full" o "profile"

  @IsOptional()
  @IsNumber()
  @Min(1)
  profiles?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  profilePins?: string[];
}
