import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';

@ApiTags('CMS')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.cmsService.createCategory(dto);
  }

  @Get('categories')
  listCategories() {
    return this.cmsService.listCategories();
  }

  @Get('categories/:id')
  getCategoryById(@Param('id', ParseUUIDPipe) id: string) {
    return this.cmsService.getCategoryById(id);
  }

  @Put('categories/:id')
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.cmsService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.cmsService.deleteCategory(id);
  }

  @Get('programs')
  listPrograms(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.cmsService.listPrograms(page, limit);
  }

  @Get('programs/:id')
  getProgramById(@Param('id', ParseUUIDPipe) id: string) {
    return this.cmsService.getProgramById(id);
  }

  @Post('programs')
  createProgram(@Body() dto: CreateProgramDto) {
    return this.cmsService.createProgram(dto);
  }

  @Put('programs/:id')
  updateProgram(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProgramDto,
  ) {
    return this.cmsService.updateProgram(id, dto);
  }

  @Delete('programs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProgram(@Param('id', ParseUUIDPipe) id: string) {
    return this.cmsService.deleteProgram(id);
  }

  @Post('programs/:id/episodes')
  createEpisode(
    @Param('id', ParseUUIDPipe) programId: string,
    @Body() dto: CreateEpisodeDto,
  ) {
    return this.cmsService.createEpisode(programId, dto);
  }

  @Put('episodes/:id')
  updateEpisode(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEpisodeDto,
  ) {
    return this.cmsService.updateEpisode(id, dto);
  }

  @Delete('episodes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteEpisode(@Param('id', ParseUUIDPipe) id: string) {
    return this.cmsService.deleteEpisode(id);
  }
}
