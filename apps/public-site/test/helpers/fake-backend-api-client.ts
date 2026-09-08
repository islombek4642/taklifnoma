import type {
  BackendApiClient,
  MusicTrackDto,
  PublicInvitationDto,
  RsvpInputDto,
  TemplateDto,
} from "../../src/services/backend-api-client.js";
import { RsvpSubmissionError } from "../../src/services/backend-api-client.js";

const DEFAULT_TEMPLATES: TemplateDto[] = [
  { id: "classic", name: "Klassik", accentColor: "#b45d52", styleCss: "body { font-family: serif; }" },
];

const DEFAULT_MUSIC_TRACKS: MusicTrackDto[] = [
  { id: "romantic-piano", title: "Romantik pianino", fileUrl: "/media/music/romantic-piano/track.wav" },
];

export class FakeBackendApiClient implements BackendApiClient {
  private readonly invitations = new Map<string, PublicInvitationDto>();
  readonly submittedRsvps: Array<{ slug: string; input: RsvpInputDto }> = [];
  rsvpFailure: { status: number; body: unknown } | undefined;
  templates: TemplateDto[] = DEFAULT_TEMPLATES;
  musicTracks: MusicTrackDto[] = DEFAULT_MUSIC_TRACKS;

  seedInvitation(invitation: PublicInvitationDto): void {
    this.invitations.set(invitation.slug, invitation);
  }

  async getInvitationBySlug(slug: string): Promise<PublicInvitationDto | null> {
    return this.invitations.get(slug) ?? null;
  }

  async submitRsvp(slug: string, input: RsvpInputDto): Promise<{ id: string; status: string }> {
    if (this.rsvpFailure) throw new RsvpSubmissionError(this.rsvpFailure.status, this.rsvpFailure.body);
    this.submittedRsvps.push({ slug, input });
    return { id: "rsvp-1", status: input.status };
  }

  async getTemplates(): Promise<TemplateDto[]> {
    return this.templates;
  }

  async getMusicTracks(): Promise<MusicTrackDto[]> {
    return this.musicTracks;
  }

  async fetchMedia(): Promise<{ contentType: string; body: ArrayBuffer } | null> {
    return { contentType: "audio/wav", body: new ArrayBuffer(0) };
  }
}
