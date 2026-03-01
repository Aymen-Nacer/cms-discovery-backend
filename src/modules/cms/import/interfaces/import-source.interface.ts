import { ImportedProgramDto } from '../dto/imported-program.dto';

export interface ImportSource {
  import(channelId: string): Promise<ImportedProgramDto[]>;
}
