import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramEntity } from '../../database/entities/program.entity';
import { EpisodeEntity } from '../../database/entities/episode.entity';
import { CategoryEntity } from '../../database/entities/category.entity';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { ImportModule } from './import/import.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProgramEntity, EpisodeEntity, CategoryEntity]),
    ImportModule,
  ],
  controllers: [CmsController],
  providers: [CmsService],
})
export class CmsModule {}
