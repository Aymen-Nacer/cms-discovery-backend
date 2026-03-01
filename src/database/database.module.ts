import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { EpisodeEntity } from './entities/episode.entity';
import { ProgramEntity } from './entities/program.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [CategoryEntity, ProgramEntity, EpisodeEntity],
        synchronize: false,
        migrationsRun: false,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
      }),
    }),
  ],
})
export class DatabaseModule {}
