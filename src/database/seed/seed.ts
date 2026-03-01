import { DataSource } from 'typeorm';
import { CategoryEntity } from '../entities/category.entity';
import { ProgramEntity } from '../entities/program.entity';
import { EpisodeEntity } from '../entities/episode.entity';
import * as seedData from './data/youtube.seed.json';

async function resolveCategory(manager: DataSource['manager'], name: string): Promise<string> {
  const existing = await manager.findOneBy(CategoryEntity, { name });
  if (existing) return existing.id;

  const created = manager.create(CategoryEntity, { name });
  const saved = await manager.save(created);
  return saved.id;
}

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'cms_discovery',
    entities: [CategoryEntity, ProgramEntity, EpisodeEntity],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Database connection initialized');

  const manager = dataSource.manager;

  for (const program of seedData) {
    console.log(`Processing program: ${program.title}`);

    const categoryId = await resolveCategory(manager, program.category);

    await manager
      .createQueryBuilder()
      .insert()
      .into(ProgramEntity)
      .values({
        title: program.title,
        description: program.description,
        type: program.type as 'podcast' | 'documentary',
        categoryId,
        language: program.language,
        publishedAt: (program as any).publishedAt ? new Date((program as any).publishedAt) : null,
        source: 'youtube',
        externalProgramId: program.externalProgramId,
      })
      .orIgnore()
      .execute();

    const programEntity = await manager.findOneBy(ProgramEntity, {
      source: 'youtube',
      externalProgramId: program.externalProgramId,
    });

    if (!programEntity) {
      console.error(`Failed to find program: ${program.externalProgramId}`);
      continue;
    }

    for (const episode of program.episodes) {
      await manager
        .createQueryBuilder()
        .insert()
        .into(EpisodeEntity)
        .values({
          programId: programEntity.id,
          title: episode.title,
          description: episode.description,
          duration: episode.duration,
          publishedAt: new Date(episode.publishedAt),
          source: 'youtube',
          sourceId: episode.sourceId,
        })
        .orIgnore()
        .execute();
    }

    console.log(`✓ Processed program: ${program.title} with ${program.episodes.length} episodes`);
  }

  await dataSource.destroy();
  console.log('Seed completed successfully!');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
