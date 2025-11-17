import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

/* ---------- Nested DTOs ---------- */

export class ArmorClassDto {
  @IsString()
  type: string;

  @IsNumber()
  value: number;
}

export class SpeedDto {
  @IsOptional()
  @IsString()
  walk?: string;

  @IsOptional()
  @IsString()
  fly?: string;

  @IsOptional()
  @IsString()
  swim?: string;
}

export class SensesDto {
  @IsOptional()
  @IsString()
  blindsight?: string;

  @IsOptional()
  @IsString()
  darkvision?: string;

  @IsNumber()
  passive_perception: number;
}

/* ---------- Base DTO ---------- */

export class MonsterDto {
  @IsString()
  index: string;

  @IsBoolean()
  favorite: boolean;

  @IsString()
  name: string;

  @IsString()
  size: string;

  @IsString()
  type: string;

  @IsString()
  alignment: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArmorClassDto)
  armor_class: ArmorClassDto[];

  @IsOptional()
  @IsNumber()
  hit_points?: number;

  @ValidateNested()
  @Type(() => SpeedDto)
  speed: SpeedDto;

  @IsNumber()
  strength: number;

  @IsNumber()
  dexterity: number;

  @IsNumber()
  constitution: number;

  @IsNumber()
  intelligence: number;

  @IsNumber()
  wisdom: number;

  @IsNumber()
  charisma: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => SensesDto)
  senses?: SensesDto;

  @IsOptional()
  @IsNumber()
  challenge_rating?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsString()
  url: string;
}

/* ---------- Derived DTOs ---------- */

// POST (create)
export class CreateMonsterDto extends MonsterDto {}

// PATCH (update)
export class UpdateMonsterDto extends PartialType(MonsterDto) {}
