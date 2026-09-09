import { Keyboard, type Bot } from "grammy";
import type { TFunction } from "i18next";
import { ALLOWED_AUDIO_EXTENSIONS, AUDIO_MIME_TO_EXTENSION } from "../constants/audio.js";
import { createBackendAdminClient, type BackendAdminClient } from "../services/backend-admin-client.js";

type AdminSession = { step: "awaiting-title" } | { step: "awaiting-file"; title: string };

export interface RegisterAdminPanelOptions {
  adminTelegramIds: number[];
  backendApiBaseUrl: string;
  botToken: string;
  miniAppUrl: string;
  t: TFunction;
}

export function isAdmin(adminTelegramIds: number[], userId: number | undefined): boolean {
  return userId !== undefined && adminTelegramIds.includes(userId);
}

// The admin's /start reply fully replaces the normal one (rather than
// adding a second message) — it carries the same "open app" action as a
// reply-keyboard web_app button, alongside the admin panel entry point.
export function buildAdminStartKeyboard(t: TFunction, miniAppUrl: string): Keyboard {
  return new Keyboard().webApp(t("start.openApp"), miniAppUrl).row().text(t("admin.panelButton")).resized();
}

export function buildAdminMenuKeyboard(t: TFunction): Keyboard {
  return new Keyboard()
    .text(t("admin.addMusicButton"))
    .text(t("admin.addTemplateButton"))
    .row()
    .text(t("admin.backButton"))
    .resized();
}

export function buildCancelKeyboard(t: TFunction): Keyboard {
  return new Keyboard().text(t("admin.cancelButton")).resized();
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
  const { adminTelegramIds, backendApiBaseUrl, botToken, miniAppUrl, t } = options;
  if (adminTelegramIds.length === 0) return;

  const adminClient: BackendAdminClient = createBackendAdminClient(backendApiBaseUrl, botToken);
  const sessions = new Map<number, AdminSession>();

  // Fully replaces the normal /start reply for admins (does not call
  // next()) so they get one message carrying both the "open app" action
  // and the admin panel entry point, both as reply-keyboard buttons.
  bot.command("start", async (ctx, next) => {
    if (!isAdmin(adminTelegramIds, ctx.from?.id)) {
      await next();
      return;
    }
    await ctx.reply(t("start.welcome"), { reply_markup: buildAdminStartKeyboard(t, miniAppUrl) });
  });

  bot.hears(t("admin.panelButton"), async (ctx, next) => {
    if (!isAdmin(adminTelegramIds, ctx.from?.id)) {
      await next();
      return;
    }
    await ctx.reply(t("admin.menuTitle"), { reply_markup: buildAdminMenuKeyboard(t) });
  });

  bot.hears(t("admin.backButton"), async (ctx, next) => {
    if (!ctx.from || !isAdmin(adminTelegramIds, ctx.from.id)) {
      await next();
      return;
    }
    sessions.delete(ctx.from.id);
    await ctx.reply(t("start.welcome"), { reply_markup: buildAdminStartKeyboard(t, miniAppUrl) });
  });

  bot.hears(t("admin.addMusicButton"), async (ctx, next) => {
    if (!ctx.from || !isAdmin(adminTelegramIds, ctx.from.id)) {
      await next();
      return;
    }
    sessions.set(ctx.from.id, { step: "awaiting-title" });
    await ctx.reply(t("admin.askTitle"), { reply_markup: buildCancelKeyboard(t) });
  });

  bot.hears(t("admin.addTemplateButton"), async (ctx, next) => {
    if (!ctx.from || !isAdmin(adminTelegramIds, ctx.from.id)) {
      await next();
      return;
    }
    await ctx.reply(t("admin.templateComingSoon"), { reply_markup: buildAdminMenuKeyboard(t) });
  });

  bot.hears(t("admin.cancelButton"), async (ctx, next) => {
    if (!ctx.from || !isAdmin(adminTelegramIds, ctx.from.id)) {
      await next();
      return;
    }
    sessions.delete(ctx.from.id);
    await ctx.reply(t("admin.cancelled"), { reply_markup: buildAdminMenuKeyboard(t) });
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

    // Edited in place rather than followed by a separate result message,
    // so the "Yuklanmoqda..." bubble turns into the outcome instead of
    // lingering alongside it (Telegram can't attach a reply keyboard to an
    // edited message, so the submenu keyboard from the previous step stays
    // as-is until the admin's next tap).
    const statusMessage = await ctx.reply(t("admin.uploading"));
    try {
      const file = await ctx.getFile();
      const fileResponse = await fetch(`https://api.telegram.org/file/bot${botToken}/${file.file_path}`);
      const fileBytes = new Uint8Array(await fileResponse.arrayBuffer());

      const track = await adminClient.createMusicTrack(session.title, fileBytes, extension);
      sessions.delete(userId);
      await ctx.api.editMessageText(
        statusMessage.chat.id,
        statusMessage.message_id,
        t("admin.uploadSuccess", { title: track.title }),
      );
    } catch {
      await ctx.api.editMessageText(statusMessage.chat.id, statusMessage.message_id, t("admin.uploadError"));
    }
  });
}
