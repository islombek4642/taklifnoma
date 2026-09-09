import { describe, expect, it } from "vitest";
import { createI18n } from "../../../src/i18n/i18n.js";
import { buildAdminMenuKeyboard, buildAdminPanelKeyboard, buildCancelKeyboard, isAdmin, resolveAudioExtension } from "../../../src/commands/admin.js";
import { ADMIN_CALLBACKS } from "../../../src/constants/admin.js";

const i18n = createI18n();
const t = i18n.t.bind(i18n);

describe("isAdmin", () => {
  it("returns true only for an id in the allowlist", () => {
    expect(isAdmin([111, 222], 111)).toBe(true);
    expect(isAdmin([111, 222], 333)).toBe(false);
  });

  it("returns false for an undefined user id", () => {
    expect(isAdmin([111], undefined)).toBe(false);
  });

  it("returns false when the allowlist is empty", () => {
    expect(isAdmin([], 111)).toBe(false);
  });
});

describe("resolveAudioExtension", () => {
  it("prefers the extension in file_name when it's a supported type", () => {
    expect(resolveAudioExtension({ file_name: "song.mp3", mime_type: "application/octet-stream" })).toBe("mp3");
  });

  it("falls back to the mime type when file_name is missing or unsupported", () => {
    expect(resolveAudioExtension({ mime_type: "audio/wav" })).toBe("wav");
    expect(resolveAudioExtension({ file_name: "song.exe", mime_type: "audio/ogg" })).toBe("ogg");
  });

  it("returns null for an unsupported file entirely", () => {
    expect(resolveAudioExtension({ file_name: "malware.exe", mime_type: "application/x-msdownload" })).toBeNull();
  });

  it("returns null when neither file_name nor mime_type is present", () => {
    expect(resolveAudioExtension({})).toBeNull();
  });
});

describe("buildAdminPanelKeyboard", () => {
  it("has a single reply-keyboard button with the panel label", () => {
    const keyboard = buildAdminPanelKeyboard(t);

    expect(keyboard.keyboard[0]?.[0]).toEqual({ text: "🛠 Admin panel" });
  });
});

describe("buildAdminMenuKeyboard", () => {
  it("has an inline button wired to the add-music callback", () => {
    const keyboard = buildAdminMenuKeyboard(t);
    const button = keyboard.inline_keyboard[0]?.[0];

    expect(button?.text).toBe("🎵 Musiqa qo'shish");
    expect(button && "callback_data" in button ? button.callback_data : undefined).toBe(ADMIN_CALLBACKS.ADD_MUSIC);
  });
});

describe("buildCancelKeyboard", () => {
  it("has an inline button wired to the cancel callback", () => {
    const keyboard = buildCancelKeyboard(t);
    const button = keyboard.inline_keyboard[0]?.[0];

    expect(button && "callback_data" in button ? button.callback_data : undefined).toBe(ADMIN_CALLBACKS.CANCEL);
  });
});
