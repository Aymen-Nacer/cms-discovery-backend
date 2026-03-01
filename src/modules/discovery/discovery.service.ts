import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgramEntity } from '../../database/entities/program.entity';
import { EpisodeEntity } from '../../database/entities/episode.entity';
import { SearchQueryDto } from './dto/search-query.dto';
import { ProgramFilterDto } from './dto/program-filter.dto';
import { EpisodeFilterDto } from './dto/episode-filter.dto';

@Injectable()
export class DiscoveryService {
  constructor(
    @InjectRepository(ProgramEntity)
    private readonly programRepository: Repository<ProgramEntity>,
    @InjectRepository(EpisodeEntity)
    private readonly episodeRepository: Repository<EpisodeEntity>,
  ) {}

  async searchContent(dto: SearchQueryDto) {
    const { q, limit = 20, page = 1 } = dto;
    const offset = (page - 1) * limit;

    if (!q || q.trim() === '') {
      return {
        programs: [],
        episodes: [],
        total: 0,
        page,
        limit,
      };
    }

    const programsQuery = this.programRepository
      .createQueryBuilder('p')
      .select([
        'p.id',
        'p.title',
        'p.description',
        'p.type',
        'p.categoryId',
        'p.language',
        'p.createdAt',
      ])
      .addSelect(
        `ts_rank(p.search_vector, plainto_tsquery('simple', :query))`,
        'rank',
      )
      .where(`p.search_vector @@ plainto_tsquery('simple', :query)`)
      .setParameter('query', q)
      .orderBy('rank', 'DESC')
      .addOrderBy('p.created_at', 'DESC')
      .limit(limit)
      .offset(offset);

    const episodesQuery = this.episodeRepository
      .createQueryBuilder('e')
      .select([
        'e.id',
        'e.programId',
        'e.title',
        'e.description',
        'e.duration',
        'e.publishedAt',
        'e.createdAt',
      ])
      .addSelect(
        `ts_rank(e.search_vector, plainto_tsquery('simple', :query))`,
        'rank',
      )
      .where(`e.search_vector @@ plainto_tsquery('simple', :query)`)
      .setParameter('query', q)
      .orderBy('rank', 'DESC')
      .addOrderBy('e.created_at', 'DESC')
      .limit(limit)
      .offset(offset);

    const [programs, episodes] = await Promise.all([
      programsQuery.getRawAndEntities(),
      episodesQuery.getRawAndEntities(),
    ]);

    return {
      programs: programs.entities,
      episodes: episodes.entities,
      total: programs.entities.length + episodes.entities.length,
      page,
      limit,
    };
  }

  async listPrograms(dto: ProgramFilterDto) {
    const { type, categoryId, language, limit = 20, page = 1 } = dto;
    const offset = (page - 1) * limit;

    const query = this.programRepository
      .createQueryBuilder('p')
      .select([
        'p.id',
        'p.title',
        'p.description',
        'p.type',
        'p.categoryId',
        'p.language',
        'p.createdAt',
      ]);

    if (type) {
      query.andWhere('p.type = :type', { type });
    }

    if (categoryId) {
      query.andWhere('p.categoryId = :categoryId', { categoryId });
    }

    if (language) {
      query.andWhere('p.language = :language', { language });
    }

    const [programs, total] = await query
      .orderBy('p.created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .getManyAndCount();

    return {
      programs,
      total,
      page,
      limit,
    };
  }

  async getProgramById(id: string) {
    const program = await this.programRepository.findOne({
      where: { id },
      relations: ['episodes', 'category'],
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    return program;
  }

  async getEpisodeById(id: string) {
    const episode = await this.episodeRepository.findOne({
      where: { id },
      relations: ['program'],
    });

    if (!episode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }

    return episode;
  }

  async listEpisodes(dto: EpisodeFilterDto) {
    const { programId, limit = 20, page = 1 } = dto;
    const offset = (page - 1) * limit;

    const query = this.episodeRepository
      .createQueryBuilder('e')
      .select([
        'e.id',
        'e.programId',
        'e.title',
        'e.description',
        'e.duration',
        'e.publishedAt',
        'e.createdAt',
      ]);

    if (programId) {
      query.andWhere('e.programId = :programId', { programId });
    }

    const [episodes, total] = await query
      .orderBy('e.published_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .getManyAndCount();

    return {
      episodes,
      total,
      page,
      limit,
    };
  }
}
