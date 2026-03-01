import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DiscoveryService } from './discovery.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { ProgramFilterDto } from './dto/program-filter.dto';
import { EpisodeFilterDto } from './dto/episode-filter.dto';

@ApiTags('Discovery')
@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get('search')
  search(@Query() dto: SearchQueryDto) {
    return this.discoveryService.searchContent(dto);
  }

  @Get('programs')
  listPrograms(@Query() dto: ProgramFilterDto) {
    return this.discoveryService.listPrograms(dto);
  }

  @Get('programs/:id')
  getProgramById(@Param('id', ParseUUIDPipe) id: string) {
    return this.discoveryService.getProgramById(id);
  }

  @Get('episodes')
  listEpisodes(@Query() dto: EpisodeFilterDto) {
    return this.discoveryService.listEpisodes(dto);
  }

  @Get('episodes/:id')
  getEpisodeById(@Param('id', ParseUUIDPipe) id: string) {
    return this.discoveryService.getEpisodeById(id);
  }
}
