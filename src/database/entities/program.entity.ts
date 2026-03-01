import { ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { EpisodeEntity } from './episode.entity';
import { CategoryEntity } from './category.entity';

@Entity({ name: 'programs' })
@Unique(['source', 'externalProgramId'])
export class ProgramEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: ['podcast', 'documentary'],
  })
  type!: 'podcast' | 'documentary';

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId!: string;

  @ApiHideProperty()
  @ManyToOne(() => CategoryEntity, (category) => category.programs, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category!: CategoryEntity;

  @Column({ type: 'varchar', length: 5 })
  language!: string;

  @Column({ type: 'int', nullable: true })
  duration!: number | null;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  source!: string | null;

  @Column({ name: 'external_program_id', type: 'text', nullable: true })
  externalProgramId!: string | null;

  @ApiHideProperty()
  @Column({ name: 'search_vector', type: 'tsvector', select: false, nullable: true })
  searchVector!: string | null;

  @ApiHideProperty()
  @OneToMany(() => EpisodeEntity, (episode) => episode.program)
  episodes!: EpisodeEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
