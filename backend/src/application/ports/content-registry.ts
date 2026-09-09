export interface TemplateDto {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  styleCss: string;
}

export interface TemplateRegistry {
  list(): Promise<TemplateDto[]>;
  exists(id: string): Promise<boolean>;
}

export interface MusicTrackDto {
  id: string;
  title: string;
  fileUrl: string;
}

export interface MusicRegistry {
  list(): Promise<MusicTrackDto[]>;
  exists(id: string): Promise<boolean>;
}
