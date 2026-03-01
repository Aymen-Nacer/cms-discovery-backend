import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgramEntity } from '../../database/entities/program.entity';
import { EpisodeEntity } from '../../database/entities/episode.entity';
import { CategoryEntity } from '../../database/entities/category.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CmsService {
  constructor(
    @InjectRepository(ProgramEntity)
    private readonly programRepository: Repository<ProgramEntity>,
    @InjectRepository(EpisodeEntity)
    private readonly episodeRepository: Repository<EpisodeEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async createCategory(dto: CreateCategoryDto): Promise<CategoryEntity> {
    const category = this.categoryRepository.create({ name: dto.name });
    return this.categoryRepository.save(category);
  }

  async listCategories() {
    return this.categoryRepository.find({ order: { name: 'ASC' } });
  }

  async getCategoryById(id: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: string): Promise<void> {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  async createProgram(dto: CreateProgramDto): Promise<ProgramEntity> {
    const categoryExists = await this.categoryRepository.existsBy({ id: dto.categoryId });
    if (!categoryExists) {
      throw new NotFoundException(`Category with ID ${dto.categoryId} not found`);
    }

    const program = this.programRepository.create({
      title: dto.title,
      description: dto.description,
      type: dto.type,
      categoryId: dto.categoryId,
      language: dto.language,
      duration: dto.duration ?? null,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
    });

    return this.programRepository.save(program);
  }

  async listPrograms(page = 1, limit = 20) {
    const [programs, total] = await this.programRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { programs, total, page, limit };
  }

  async getProgramById(id: string): Promise<ProgramEntity> {
    const program = await this.programRepository.findOne({
      where: { id },
      relations: ['episodes', 'category'],
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    return program;
  }

  async updateProgram(
    id: string,
    dto: UpdateProgramDto,
  ): Promise<ProgramEntity> {
    const program = await this.programRepository.findOne({ where: { id } });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    if (dto.categoryId !== undefined) {
      const categoryExists = await this.categoryRepository.existsBy({ id: dto.categoryId });
      if (!categoryExists) {
        throw new NotFoundException(`Category with ID ${dto.categoryId} not found`);
      }
    }

    const { publishedAt, ...rest } = dto;
    Object.assign(program, rest);
    if (publishedAt !== undefined) {
      program.publishedAt = new Date(publishedAt);
    }

    return this.programRepository.save(program);
  }

  async deleteProgram(id: string): Promise<void> {
    const result = await this.programRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
  }

  async createEpisode(
    programId: string,
    dto: CreateEpisodeDto,
  ): Promise<EpisodeEntity> {
    const program = await this.programRepository.findOne({
      where: { id: programId },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${programId} not found`);
    }

    const episode = this.episodeRepository.create({
      programId,
      title: dto.title,
      description: dto.description,
      duration: dto.duration,
      publishedAt: new Date(dto.publishedAt),
    });

    return this.episodeRepository.save(episode);
  }

  async updateEpisode(
    id: string,
    dto: UpdateEpisodeDto,
  ): Promise<EpisodeEntity> {
    const episode = await this.episodeRepository.findOne({ where: { id } });

    if (!episode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }

    if (dto.publishedAt) {
      Object.assign(episode, { ...dto, publishedAt: new Date(dto.publishedAt) });
    } else {
      Object.assign(episode, dto);
    }

    return this.episodeRepository.save(episode);
  }

  async deleteEpisode(id: string): Promise<void> {
    const result = await this.episodeRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }
  }
}
