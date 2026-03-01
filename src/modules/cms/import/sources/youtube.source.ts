import { Injectable } from '@nestjs/common';
import { ImportSource } from '../interfaces/import-source.interface';
import { ImportedProgramDto } from '../dto/imported-program.dto';
import seedData from '../../../../database/seed/data/youtube.seed.json';

@Injectable()
export class YoutubeSource implements ImportSource {
  async import(_channelId: string): Promise<ImportedProgramDto[]> {
    return seedData.map((program) => ({
      externalProgramId: program.externalProgramId,
      title: program.title,
      description: program.description,
      type: program.type as 'podcast' | 'documentary',
      category: program.category,
      language: program.language,
      episodes: program.episodes.map((episode) => ({
        title: episode.title,
        description: episode.description,
        duration: episode.duration,
        publishedAt: new Date(episode.publishedAt),
        sourceId: episode.sourceId,
      })),
    }));
  }
}
