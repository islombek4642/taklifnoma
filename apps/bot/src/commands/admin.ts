import { InlineKeyboard, Keyboard, type Bot } from "grammy";
import type { TFunction } from "i18next";
import { ADMIN_CALLBACKS } from "../constants/admin.js";
import { ALLOWED_AUDIO_EXTENSIONS, AUDIO_MIME_TO_EXTENSION } from "../constants/audio.js";
import { createBackendAdminClient, type BackendAdminClient } from "../services/backend-admin-client.js";

type AdminSession = { step: "awaiting-title" } | { step: "awaiting-file"; title: string };

export interface RegisterAdminPanelOptions {
  adminTelegramIds: number[];
  backendApiBaseUrl: string;
  botToken: string;
  t: TFunction;
}

export function isAdmin(adminTelegramIds: number[], userId: number | undefined): boolean {
  return userId !== undefined && adminTelegramIds.includes(userId);
}

export function buildAdminPanelKeyboard(t: TFunction): Keyboard {
  return new Keyboard().text(t("admin.panelButton")).resized();
}

export function buildAdminMenuKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard().text(t("admin.addMusicButton"), ADMIN_CALLBACKS.ADD_MUSIC);
}

export function buildCancelKeyboard(t: TFunction): InlineKeyboard {
  return new InlineKeyboard().text(t("admin.cancelButton"), ADMIN_CALLBACKS.CANCEL);
}

interface AudioLikeMedia {
  file_name?: string;
  mime_type?: string;
}

// Telegram audio/document messages carry a file_name and/or mime_type —
// neither is guaranteed, so this tries the (more reliable) extension in
// the name first and falls back to the MIME type.
export function resolveAudioExtension(media: AudioLikeMedia): (typeof ALLOWED_AUDIO_EXTENSIONS)[number] | null {
  const fromName = media.file_name?.split(".").pop()?.toLowerCase();
  if (fromName && (ALLOWED_AUDIO_EXTENSIONS as readonly string[]).includes(fromName)) {
    return fromName as (typeof ALLOWED_AUDIO_EXTENSIONS)[number];
  }

  const fromMime = media.mime_type ? AUDIO_MIME_TO_EXTENSION[media.mime_type] : undefined;
  return fromMime ?? null;
}

export function registerAdminPanel(bot: Bot, options: RegisterAdminPanelOptions): void {
  const { adminTelegramIds, backendApiBaseUrl, botToken, t } = options;
  if (adminTelegramIds.length === 0) return;

  const adminClient: BackendAdminClient = createBackendAdminClient(backendApiBaseUrl, botToken);
  const sessions = new Map<number, AdminSession>();

  // Shown alongside (not instead of) the normal /start reply, and only to
  // allowlisted admins — everyone else's /start is untouched.
  bot.command("start", async (ctx, next) => {
    if (isAdmin(adminTelegramIds, ctx.from?.id)) {
      await ctx.reply(t("admin.panelIntro"), { reply_markup: buildAdminPanelKeyboard(t) });
    }
    await next();
  });

  bot.hears(t("admin.panelButton"), async (ctx, next) => {
    if (!isAdmin(adminTelegramIds, ctx.from?.id)) {
      await next();
      return;
    }
    await ctx.reply(t("admin.menuTitle"), { reply_markup: buildAdminMenuKeyboard(t) });
  });

  bot.callbackQuery(ADMIN_CALLBACKS.ADD_MUSIC, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!isAdmin(adminTelegramIds, ctx.from.id)) return;

    sessions.set(ctx.from.id, { step: "awaiting-title" });
    await ctx.reply(t("admin.askTitle"), { reply_markup: buildCancelKeyboard(t) });
  });

  bot.callbackQuery(ADMIN_CALLBACKS.CANCEL, async (ctx) => {
    sessions.delete(ctx.from.id);
    await ctx.answerCallbackQuery();
    await ctx.reply(t("admin.cancelled"));
  });

  bot.on("message:text", async (ctx, next) => {
    const userId = ctx.from.id;
    const session = sessions.get(userId);
    if (!session || session.step !== "awaiting-title") {
      await next();
      return;
    }

    const title = ctx.message.text.trim();
    if (!title) {
      await ctx.reply(t("admin.titleRequired"));
      return;
    }

    sessions.set(userId, { step: "awaiting-file", title });
    await ctx.reply(t("admin.askFile", { title }), { reply_markup: buildCancelKeyboard(t) });
  });

  bot.on(["message:audio", "message:document"], async (ctx, next) => {
    const userId = ctx.from.id;
    const session = sessions.get(userId);
    if (!session || session.step !== "awaiting-file") {
      await next();
      return;
    }

    const media = ctx.message.audio ?? ctx.message.document;
    if (!media) {
      await next();
      return;
    }

    const extension = resolveAudioExtension(media);
    if (!extension) {
      await ctx.reply(t("admin.unsupportedFile"));
      return;
    }

    await ctx.reply(t("admin.uploading"));
    try {
      const file = await ctx.getFile();
      const fileResponse = await fetch(`https://api.telegram.org/file/bot${botToken}/${file.file_path}`);
      const fileBytes = new Uint8Array(await fileResponse.arrayBuffer());

      const track = await adminClient.createMusicTrack(session.title, fileBytes, extension);
      sessions.delete(userId);
      await ctx.reply(t("admin.uploadSuccess", { title: track.title }));
    } catch {
      await ctx.reply(t("admin.uploadError"));
    }
  });
}
