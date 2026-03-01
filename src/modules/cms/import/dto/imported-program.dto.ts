export class ImportedEpisodeDto {
  title!: string;
  description!: string;
  duration!: number;
  publishedAt!: Date;
  sourceId!: string;
}

export class ImportedProgramDto {
  externalProgramId!: string;
  title!: string;
  description!: string;
  type!: 'podcast' | 'documentary';
  category!: string;
  language!: string;
  episodes!: ImportedEpisodeDto[];
}
