import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';
import { EpisodeEntity } from './entities/episode.entity';
import { ProgramEntity } from './entities/program.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [CategoryEntity, ProgramEntity, EpisodeEntity],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
