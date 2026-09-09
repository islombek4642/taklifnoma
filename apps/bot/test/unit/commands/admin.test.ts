import { describe, expect, it } from "vitest";
import { createI18n } from "../../../src/i18n/i18n.js";
import {
  buildAdminMenuKeyboard,
  buildAdminOnlyKeyboard,
  buildCancelKeyboard,
  isAdmin,
  resolveAudioExtension,
} from "../../../src/commands/admin.js";

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

describe("buildAdminOnlyKeyboard", () => {
  it("has a single reply-keyboard button with the panel label", () => {
    const keyboard = buildAdminOnlyKeyboard(t);

    expect(keyboard.keyboard[0]).toEqual([{ text: "🛠 Admin panel" }]);
  });
});

describe("buildAdminMenuKeyboard", () => {
  it("puts the add-music and add-template buttons on one row, and back on its own", () => {
    const keyboard = buildAdminMenuKeyboard(t);

    expect(keyboard.keyboard[0]).toEqual([{ text: "🎵 Musiqa qo'shish" }, { text: "🖼 Shablon qo'shish" }]);
    expect(keyboard.keyboard[1]).toEqual([{ text: "⬅️ Orqaga" }]);
  });
});

describe("buildCancelKeyboard", () => {
  it("has a single reply-keyboard button with the cancel label", () => {
    const keyboard = buildCancelKeyboard(t);

    expect(keyboard.keyboard[0]).toEqual([{ text: "Bekor qilish" }]);
  });
});
