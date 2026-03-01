import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramEntity } from '../../database/entities/program.entity';
import { EpisodeEntity } from '../../database/entities/episode.entity';
import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProgramEntity, EpisodeEntity])],
  controllers: [DiscoveryController],
  providers: [DiscoveryService],
})
export class DiscoveryModule {}
