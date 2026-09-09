export interface MusicTrackDto {
  id: string;
  title: string;
  fileUrl: string;
}

export class BackendAdminError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`Backend admin request failed with status ${status}`);
  }
}

export function createBackendAdminClient(baseUrl: string, botToken: string) {
  return {
    async createMusicTrack(title: string, fileBytes: Uint8Array, fileExtension: string): Promise<MusicTrackDto> {
      const response = await fetch(`${baseUrl}/api/admin/music-tracks`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${botToken}` },
        body: JSON.stringify({
          title,
          fileExtension,
          fileBase64: Buffer.from(fileBytes).toString("base64"),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => undefined);
        throw new BackendAdminError(response.status, body);
      }

      return (await response.json()) as MusicTrackDto;
    },
  };
}

export type BackendAdminClient = ReturnType<typeof createBackendAdminClient>;
