import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateProgramDto {
  @ApiProperty({ example: 'Tech Talk Daily' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'A daily podcast covering the latest in technology' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: ['podcast', 'documentary'], example: 'podcast' })
  @IsEnum(['podcast', 'documentary'])
  type!: 'podcast' | 'documentary';

  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ example: 'en', maxLength: 5 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  language!: string;

  @ApiPropertyOptional({ example: 3600 })
  @IsInt()
  @IsPositive()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ format: 'date-time', example: '2025-01-15T10:30:00Z' })
  @IsDateString()
  @IsOptional()
  publishedAt?: string;
}
