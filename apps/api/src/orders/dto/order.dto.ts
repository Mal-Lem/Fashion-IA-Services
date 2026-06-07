import { IsString, IsOptional, IsUUID, IsEnum, IsNumber } from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  designId?: string;

  @IsUUID()
  couturiereId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  clientMessage?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(['accepted', 'refused', 'in_progress', 'completed', 'cancelled'])
  status: string;

  @IsOptional()
  @IsString()
  couturiereMessage?: string;

  @IsOptional()
  @IsString()
  refusalReason?: string;

  @IsOptional()
  @IsNumber()
  agreedAmount?: number;
}