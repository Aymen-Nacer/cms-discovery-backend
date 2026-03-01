import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ImportService } from './import.service';
import { YoutubeImportDto } from './dto/youtube-import.dto';

@ApiTags('CMS - Import')
@Controller('cms/import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('youtube')
  importFromYoutube(@Body() dto: YoutubeImportDto) {
    return this.importService.importFromYoutube(dto);
  }
}
