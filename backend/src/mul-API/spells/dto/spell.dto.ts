import {
  IsString,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  ArrayNotEmpty,
  ArrayMinSize,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSpellDto {
  @IsString()
  index: string;

  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  desc: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  higher_level?: string[];

  @IsString()
  range: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  components: string[];

  @IsString()
  @IsOptional()
  material?: string;

  @IsBoolean()
  @IsOptional()
  ritual?: boolean;

  @IsString()
  duration: string;

  @IsBoolean()
  @IsOptional()
  concentration?: boolean;

  @IsString()
  casting_time: string;

  @IsNumber()
  level: number;

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  classes: string[];

  @IsOptional()
  @IsBoolean()
  favorite?: boolean;
}

export class UpdateSpellDto extends PartialType(CreateSpellDto) {}