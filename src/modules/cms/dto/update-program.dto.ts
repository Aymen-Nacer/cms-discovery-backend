import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateProgramDto {
  @ApiPropertyOptional({ example: 'Tech Talk Daily' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'A daily podcast covering the latest in technology' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ['podcast', 'documentary'], example: 'podcast' })
  @IsEnum(['podcast', 'documentary'])
  @IsOptional()
  type?: 'podcast' | 'documentary';

  @ApiPropertyOptional({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'en', maxLength: 5 })
  @IsString()
  @MaxLength(5)
  @IsOptional()
  language?: string;

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
