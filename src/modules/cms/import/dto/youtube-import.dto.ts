import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class YoutubeImportDto {
  @ApiProperty({ example: 'UC_x5XG1OV2P6uZZ5FSM9Ttw', description: 'YouTube channel or playlist ID' })
  @IsString()
  @IsNotEmpty()
  externalId!: string;
}
