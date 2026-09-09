import { describe, expect, it, vi } from "vitest";
import { resetMenuButtonToDefault } from "../../../src/commands/menu-button.js";

describe("resetMenuButtonToDefault", () => {
  it("calls setChatMenuButton with the default menu button", async () => {
    const setChatMenuButton = vi.fn().mockResolvedValue(true);
    const bot = { api: { setChatMenuButton } } as unknown as Parameters<typeof resetMenuButtonToDefault>[0];

    await resetMenuButtonToDefault(bot);

    expect(setChatMenuButton).toHaveBeenCalledWith({ menu_button: { type: "default" } });
  });
});
