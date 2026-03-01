import { ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ProgramEntity } from './program.entity';

@Entity({ name: 'episodes' })
@Unique(['source', 'sourceId'])
export class EpisodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'program_id', type: 'uuid' })
  programId!: string;

  @ApiHideProperty()
  @ManyToOne(() => ProgramEntity, (program) => program.episodes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'program_id' })
  program!: ProgramEntity;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'int' })
  duration!: number;

  @Column({ name: 'published_at', type: 'timestamptz' })
  publishedAt!: Date;

  @Column({ type: 'text', nullable: true })
  source!: string | null;

  @Column({ name: 'source_id', type: 'text', nullable: true })
  sourceId!: string | null;

  @ApiHideProperty()
  @Column({ name: 'search_vector', type: 'tsvector', select: false, nullable: true })
  searchVector!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
