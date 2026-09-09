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

export interface CreateMusicTrackInput {
  title: string;
  fileBuffer: Buffer;
  fileExtension: string;
}

export interface MusicRegistry {
  list(): Promise<MusicTrackDto[]>;
  exists(id: string): Promise<boolean>;
  // Used by the admin-upload flow (bot admin panel → backend) — writes a
  // new CONTENT_DIR/music/<id>/ folder, the same shape seedContentDir and
  // any future admin tooling would produce, so it shows up for list()
  // immediately with no restart needed.
  create(input: CreateMusicTrackInput): Promise<MusicTrackDto>;
}
