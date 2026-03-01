import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateEpisodeDto {
  @ApiProperty({ example: 'Episode 1 - Getting Started' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'In this episode we explore the basics of the topic' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 1800, minimum: 1 })
  @IsInt()
  @Min(1)
  duration!: number;

  @ApiProperty({ format: 'date-time', example: '2025-01-15T10:30:00Z' })
  @IsDateString()
  publishedAt!: string;
}
