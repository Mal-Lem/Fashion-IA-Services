import { IsString, IsOptional, IsArray, IsNumber, IsEnum } from 'class-validator';

export class CreateCouturiereProfileDto {
  @IsString()
  atelierName: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  siret?: string;

  @IsArray()
  specialties: string[];

  @IsOptional()
  @IsNumber()
  experienceYears?: number;

  @IsString()
  locationCity: string;

  @IsString()
  locationRegion: string;

  @IsString()
  locationZip: string;

  @IsOptional()
  @IsNumber()
  pricingMin?: number;

  @IsOptional()
  @IsNumber()
  pricingMax?: number;

  @IsOptional()
  @IsArray()
  languages?: string[];
}

export class UpdateCouturiereProfileDto {
  @IsOptional()
  @IsString()
  atelierName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  specialties?: string[];

  @IsOptional()
  @IsNumber()
  pricingMin?: number;

  @IsOptional()
  @IsNumber()
  pricingMax?: number;

  @IsOptional()
  @IsNumber()
  minPriceEur?: number;

  @IsOptional()
  @IsNumber()
  maxPriceEur?: number;

  @IsOptional()
  @IsNumber()
  deliveryTimeDays?: number;

  @IsOptional()
  @IsString()
  availabilityStatus?: string;

  @IsOptional()
  @IsString()
  locationCity?: string;

  @IsOptional()
  @IsString()
  locationRegion?: string;

  @IsOptional()
  @IsString()
  locationZip?: string;
}

export class SearchCouturieresDto {
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsNumber()
  minRating?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  designId?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsNumber()
  minPrice?: number;
}