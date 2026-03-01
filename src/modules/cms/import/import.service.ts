import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ProgramEntity } from '../../../database/entities/program.entity';
import { EpisodeEntity } from '../../../database/entities/episode.entity';
import { CategoryEntity } from '../../../database/entities/category.entity';
import { YoutubeSource } from './sources/youtube.source';
import { YoutubeImportDto } from './dto/youtube-import.dto';
import { ImportResultDto } from './dto/import-result.dto';

@Injectable()
export class ImportService {
  constructor(
    private readonly youtubeSource: YoutubeSource,
    private readonly dataSource: DataSource,
  ) {}

  async importFromYoutube(dto: YoutubeImportDto): Promise<ImportResultDto> {
    const programs = await this.youtubeSource.import(dto.externalId);

    const result: ImportResultDto = {
      total: 0,
      imported: 0,
      skipped: 0,
      errors: [],
    };

    await this.dataSource.transaction(async (manager) => {
      for (const program of programs) {
        const categoryId = await this.resolveCategory(manager, program.category);

        const insertProgramResult = await manager
          .createQueryBuilder()
          .insert()
          .into(ProgramEntity)
          .values({
            title: program.title,
            description: program.description,
            type: program.type,
            categoryId,
            language: program.language,
            source: 'youtube',
            externalProgramId: program.externalProgramId,
          })
          .orIgnore()
          .returning(['id'])
          .execute();

        let programId: string;

        if (insertProgramResult.identifiers.length > 0) {
          programId = insertProgramResult.identifiers[0].id;
        } else {
          const existing = await manager
            .createQueryBuilder(ProgramEntity, 'p')
            .select('p.id')
            .where('p.source = :source', { source: 'youtube' })
            .andWhere('p.externalProgramId = :externalId', {
              externalId: program.externalProgramId,
            })
            .getOne();

          if (!existing) {
            throw new Error('Program lookup failed after insert ignore');
          }

          programId = existing.id;
        }

        for (const episode of program.episodes) {
          result.total++;

          const insertEpisodeResult = await manager
            .createQueryBuilder()
            .insert()
            .into(EpisodeEntity)
            .values({
              programId,
              title: episode.title,
              description: episode.description,
              duration: episode.duration,
              publishedAt: episode.publishedAt,
              source: 'youtube',
              sourceId: episode.sourceId,
            })
            .orIgnore()
            .execute();

          if (insertEpisodeResult.identifiers.length > 0) {
            result.imported++;
          } else {
            result.skipped++;
          }
        }
      }
    });

    return result;
  }

  private async resolveCategory(
    manager: EntityManager,
    categoryName: string,
  ): Promise<string> {
    const existing = await manager.findOneBy(CategoryEntity, { name: categoryName });
    if (existing) {
      return existing.id;
    }

    const created = manager.create(CategoryEntity, { name: categoryName });
    const saved = await manager.save(created);
    return saved.id;
  }
}
