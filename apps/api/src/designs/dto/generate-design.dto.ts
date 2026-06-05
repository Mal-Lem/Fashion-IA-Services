import { IsString, IsOptional, IsArray, IsEnum, IsObject, IsNumber, IsHexColor } from 'class-validator';

export class ColorDto {
  @IsString()
  hex: string; // ex: #FF5733

  @IsOptional()
  @IsString()
  name?: string; // ex: "Rouge corail"
}

export class MorphologyDto {
  @IsOptional()
  @IsString()
  standardSize?: string;

  @IsOptional()
  @IsString()
  euSize?: string;

  @IsOptional()
  @IsNumber()
  bust?: number;

  @IsOptional()
  @IsNumber()
  waist?: number;

  @IsOptional()
  @IsNumber()
  hips?: number;

  @IsOptional()
  @IsNumber()
  shoulders?: number;

  @IsOptional()
  @IsNumber()
  backLength?: number;

  @IsOptional()
  @IsNumber()
  inseam?: number;

  @IsOptional()
  @IsNumber()
  thigh?: number;

  @IsOptional()
  @IsNumber()
  armLength?: number;

  @IsOptional()
  @IsNumber()
  neck?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;
}

export class GenerateDesignDto {
  @IsEnum(['guided', 'free_prompt'])
  mode: 'guided' | 'free_prompt';

  // Genre
  @IsOptional()
  @IsEnum(['femme', 'homme', 'non-binaire'])
  gender?: string;

  // Type de vêtement
  @IsOptional()
  @IsString()
  type?: string;

  // Style général
  @IsOptional()
  @IsString()
  style?: string;

  // Couleurs avec codes hex
  @IsOptional()
  @IsArray()
  colors?: ColorDto[];

  // Tissu
  @IsOptional()
  @IsString()
  fabric?: string;

  // Coupe
  @IsOptional()
  @IsString()
  cut?: string;

  // Occasion
  @IsOptional()
  @IsString()
  occasion?: string;

  // Nouveaux paramètres détaillés
  @IsOptional()
  @IsString()
  length?: string; // mini, midi, maxi, au genou

  @IsOptional()
  @IsString()
  sleeves?: string; // sans manches, courtes, longues, 3/4

  @IsOptional()
  @IsString()
  neckline?: string; // col rond, col V, bustier...

  @IsOptional()
  @IsString()
  closure?: string; // boutons, zip, laçage...

  @IsOptional()
  @IsString()
  pattern?: string; // uni, rayures, fleurs...

  @IsOptional()
  @IsArray()
  ornaments?: string[]; // broderie, dentelle, sequins...

  @IsOptional()
  @IsString()
  finishing?: string; // ourlet, franges, volants...

  @IsOptional()
  @IsString()
  season?: string; // printemps, été, automne, hiver

  @IsOptional()
  @IsString()
  inspiration?: string; // française, africaine, asiatique...

  @IsOptional()
  @IsString()
  silhouette?: string; // décontracté, sophistiqué...

  @IsOptional()
  @IsString()
  freePrompt?: string;

  @IsOptional()
  @IsObject()
  morphology?: MorphologyDto;
}