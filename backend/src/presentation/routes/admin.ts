import type { FastifyInstance } from "fastify";
import { API_ROUTES } from "../../shared/constants/routes.js";
import { ALLOWED_AUDIO_EXTENSIONS, MUSIC_UPLOAD_MAX_BYTES } from "../../shared/constants/music-upload.js";
import { DomainValidationError } from "../../domain/errors.js";
import { createAdminAuthPreHandler } from "../plugins/admin-auth-plugin.js";
import type { AppDependencies } from "../types.js";

export async function registerAdminRoutes(app: FastifyInstance, deps: AppDependencies): Promise<void> {
  const adminAuth = createAdminAuthPreHandler(deps.botToken);

  app.post(API_ROUTES.ADMIN_MUSIC_TRACKS, { preHandler: adminAuth }, async (request, reply) => {
    const body = request.body as Record<string, unknown>;

    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      throw new DomainValidationError("title", "Sarlavha talab qilinadi");
    }

    const fileExtension = typeof body.fileExtension === "string" ? body.fileExtension.toLowerCase() : "";
    if (!ALLOWED_AUDIO_EXTENSIONS.includes(fileExtension as (typeof ALLOWED_AUDIO_EXTENSIONS)[number])) {
      throw new DomainValidationError("fileExtension", "Ruxsat etilmagan audio fayl turi");
    }

    const fileBase64 = typeof body.fileBase64 === "string" ? body.fileBase64 : "";
    if (!fileBase64) {
      throw new DomainValidationError("fileBase64", "Audio fayl talab qilinadi");
    }

    const fileBuffer = Buffer.from(fileBase64, "base64");
    if (fileBuffer.byteLength === 0 || fileBuffer.byteLength > MUSIC_UPLOAD_MAX_BYTES) {
      throw new DomainValidationError("fileBase64", "Audio fayl hajmi ruxsat etilgan chegaradan katta yoki bo'sh");
    }

    const track = await deps.musicRegistry.create({ title, fileBuffer, fileExtension });
    reply.code(201).send(track);
  });
}
