import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { YoutubeSource } from './sources/youtube.source';

@Module({
  controllers: [ImportController],
  providers: [ImportService, YoutubeSource],
})
export class ImportModule {}
