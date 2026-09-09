import { API_BASE_URL } from "../constants/config.js";

export interface InvitationDto {
  id: string;
  slug: string;
  ownerTelegramId: string;
  ownerChatId: string;
  groomName: string;
  brideName: string;
  eventDateTime: string;
  venueName: string;
  venueAddress: string;
  mapUrl: string | null;
  greetingText: string | null;
  templateId: string;
  musicTrackId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestDto {
  id: string;
  guestName: string;
  status: string;
  respondedAt: string;
}

export interface InvitationInputDto {
  groomName: string;
  brideName: string;
  eventDateTime: string;
  venueName: string;
  venueAddress: string;
  mapUrl?: string;
  greetingText?: string;
  templateId: string;
  musicTrackId: string;
}

export interface TemplateDto {
  id: string;
  name: string;
  description: string;
  accentColor: string;
}

export interface MusicTrackDto {
  id: string;
  title: string;
  fileUrl: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API request failed with status ${status}`);
  }
}

function authHeaders(initData: string): HeadersInit {
  return { authorization: `tma ${initData}`, "content-type": "application/json" };
}

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => undefined);
  if (!response.ok) throw new ApiError(response.status, body);
  return body as T;
}

export function createApiClient(baseUrl: string) {
  return {
    async createInvitation(initData: string, input: InvitationInputDto): Promise<InvitationDto> {
      const response = await fetch(`${baseUrl}/api/invitations`, {
        method: "POST",
        headers: authHeaders(initData),
        body: JSON.stringify(input),
      });
      return parseJsonOrThrow<InvitationDto>(response);
    },

    async getMyInvitation(initData: string): Promise<InvitationDto | null> {
      const response = await fetch(`${baseUrl}/api/invitations/me`, { headers: authHeaders(initData) });
      if (response.status === 404) return null;
      return parseJsonOrThrow<InvitationDto>(response);
    },

    async updateInvitation(initData: string, input: Partial<InvitationInputDto>): Promise<InvitationDto> {
      const response = await fetch(`${baseUrl}/api/invitations/me`, {
        method: "PUT",
        headers: authHeaders(initData),
        body: JSON.stringify(input),
      });
      return parseJsonOrThrow<InvitationDto>(response);
    },

    async deleteInvitation(initData: string): Promise<void> {
      const response = await fetch(`${baseUrl}/api/invitations/me`, {
        method: "DELETE",
        headers: authHeaders(initData),
      });
      if (!response.ok) throw new ApiError(response.status, await response.json().catch(() => undefined));
    },

    async listGuests(initData: string): Promise<GuestDto[] | null> {
      const response = await fetch(`${baseUrl}/api/invitations/me/guests`, { headers: authHeaders(initData) });
      if (response.status === 404) return null;
      return parseJsonOrThrow<GuestDto[]>(response);
    },

    async getTemplates(): Promise<TemplateDto[]> {
      const response = await fetch(`${baseUrl}/api/templates`);
      return parseJsonOrThrow<TemplateDto[]>(response);
    },

    async getMusicTracks(): Promise<MusicTrackDto[]> {
      const response = await fetch(`${baseUrl}/api/music-tracks`);
      return parseJsonOrThrow<MusicTrackDto[]>(response);
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

export const apiClient = createApiClient(API_BASE_URL);
