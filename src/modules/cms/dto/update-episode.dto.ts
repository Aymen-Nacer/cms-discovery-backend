import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateEpisodeDto {
  @ApiPropertyOptional({ example: 'Episode 1 - Getting Started' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'In this episode we explore the basics of the topic' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1800, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ format: 'date-time', example: '2025-01-15T10:30:00Z' })
  @IsDateString()
  @IsOptional()
  publishedAt?: string;
}
