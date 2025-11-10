import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class UpdatePortfolioDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;
}

