# Telegram Bot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Taklifnoma Telegram Bot process (`apps/bot`, grammY +
TypeScript) that greets a user with `/start` and opens the Mini App via a
`web_app` inline button, and replace the backend's `ConsoleOwnerNotifier`
stub with a real `TelegramOwnerNotifier` that sends RSVP notifications to
the invitation owner's Telegram chat. This closes the "Out of scope" item
left by `docs/superpowers/plans/2026-09-08-backend-foundation.md`.

**Architecture:** `apps/bot` is a small standalone grammY process — it does
not talk to the backend. Message text and keyboard construction are pure,
unit-tested functions; `bot.command("start", ...)` wiring itself stays a
thin one-line call, mirroring how `backend/src/presentation/routes/*.ts`
keeps controllers thin and pushes logic into tested units. Bot text goes
through `i18next` with per-language JSON files under `src/locales/`, per
`CLAUDE.md`'s i18n rule ("i18next ishlatiladi ... bot xabarlari ... uchun
bir xil yondashuv"). `TelegramOwnerNotifier` lives in the **backend's**
`infrastructure/` layer (it implements the existing `OwnerNotifier` port
from the backend-foundation plan) and calls the Telegram Bot API directly
over HTTP — it does not require the `apps/bot` process to be running, so
RSVP notifications keep working even if the bot process is down. This
matches `docs/superpowers/specs/2026-09-07-taklifnoma-mvp-design.md`
section 6: "`NotifyOwner` porti ... `infrastructure/` qatlamidagi Telegram
Bot client amalga oshiradi."

**Tech Stack:** Node.js 20+, TypeScript (strict), grammY, i18next, Vitest.
Backend additions use the existing backend stack (no new dependencies).

---

## File Structure

```
apps/
  bot/
    package.json
    tsconfig.json
    vitest.config.ts
    .gitignore
    .env.example
    src/
      config/
        env-config.ts        # loadEnvConfig(): { botToken, miniAppUrl }
      locales/
        uz.json               # full MVP text
        ru.json                # skeleton, empty object — falls back to uz
        en.json                # skeleton, empty object — falls back to uz
      i18n/
        i18n.ts               # createI18n(): configured i18next instance
      commands/
        start.ts               # buildStartMessage, buildStartKeyboard, registerStartCommand
      bot.ts                    # createBot(botToken, miniAppUrl, t): Bot
      index.ts                  # entrypoint: loadEnvConfig + createI18n + createBot + bot.start()
    test/
      unit/
        config/
          env-config.test.ts
        i18n/
          i18n.test.ts
        commands/
          start.test.ts

backend/
  src/
    shared/constants/
      rsvp-notification.ts     # RSVP_STATUS_LABELS_UZ, buildRsvpNotificationText
    infrastructure/notifications/
      telegram-owner-notifier.ts   # new: real OwnerNotifier over Telegram Bot API
      console-owner-notifier.ts    # removed — superseded, no longer wired anywhere
    presentation/
      server.ts                 # modified: wires TelegramOwnerNotifier instead of ConsoleOwnerNotifier
  test/
    unit/infrastructure/
      telegram-owner-notifier.test.ts   # new
      console-owner-notifier.test.ts    # removed
```

---

### Task 0: Scaffold the bot project

**Files:**
- Create: `apps/bot/package.json`
- Create: `apps/bot/tsconfig.json`
- Create: `apps/bot/vitest.config.ts`
- Create: `apps/bot/.gitignore`

- [ ] **Step 1: Create `apps/bot/package.json`**

```json
{
  "name": "taklifnoma-bot",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "grammy": "^1.30.0",
    "i18next": "^23.15.1"
  },
  "devDependencies": {
    "typescript": "^5.6.2",
    "tsx": "^4.19.1",
    "vitest": "^2.1.1",
    "@types/node": "^20.16.5"
  }
}
```

- [ ] **Step 2: Create `apps/bot/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": false
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `apps/bot/vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Create `apps/bot/.gitignore`**

```
node_modules/
dist/
.env
```

- [ ] **Step 5: Install dependencies**

Run: `cd apps/bot && npm install`
Expected: `node_modules/` created, no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/bot/package.json apps/bot/tsconfig.json apps/bot/vitest.config.ts apps/bot/.gitignore
git commit -m "chore: scaffold bot project"
```

---

### Task 1: Env config loader

**Files:**
- Create: `apps/bot/src/config/env-config.ts`
- Test: `apps/bot/test/unit/config/env-config.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// apps/bot/test/unit/config/env-config.test.ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadEnvConfig } from "../../../src/config/env-config.js";

const ORIGINAL_ENV = { ...process.env };

describe("loadEnvConfig", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("throws when TELEGRAM_BOT_TOKEN is missing", () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    process.env.MINIAPP_URL = "https://example.com/app";

    expect(() => loadEnvConfig()).toThrow("TELEGRAM_BOT_TOKEN");
  });

  it("throws when MINIAPP_URL is missing", () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    delete process.env.MINIAPP_URL;

    expect(() => loadEnvConfig()).toThrow("MINIAPP_URL");
  });

  it("returns both values when set", () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.MINIAPP_URL = "https://example.com/app";

    expect(loadEnvConfig()).toEqual({ botToken: "test-token", miniAppUrl: "https://example.com/app" });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd apps/bot && npx vitest run test/unit/config/env-config.test.ts`
Expected: FAIL — cannot find module `.../config/env-config.js`

- [ ] **Step 3: Create `apps/bot/src/config/env-config.ts`**

```typescript
export interface BotEnvConfig {
  botToken: string;
  miniAppUrl: string;
}

export function loadEnvConfig(): BotEnvConfig {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN environment variable is required");
  }

  const miniAppUrl = process.env.MINIAPP_URL;
  if (!miniAppUrl) {
    throw new Error("MINIAPP_URL environment variable is required");
  }

  return { botToken, miniAppUrl };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd apps/bot && npx vitest run test/unit/config/env-config.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/bot/src/config/env-config.ts apps/bot/test/unit/config/env-config.test.ts
git commit -m "feat: add bot env config loader"
```

---

### Task 2: Locale files and i18n setup

**Files:**
- Create: `apps/bot/src/locales/uz.json`
- Create: `apps/bot/src/locales/ru.json`
- Create: `apps/bot/src/locales/en.json`
- Create: `apps/bot/src/i18n/i18n.ts`
- Test: `apps/bot/test/unit/i18n/i18n.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// apps/bot/test/unit/i18n/i18n.test.ts
import { describe, expect, it } from "vitest";
import { createI18n } from "../../../src/i18n/i18n.js";

describe("createI18n", () => {
  it("resolves uz start messages", () => {
    const i18n = createI18n();

    expect(i18n.t("start.welcome")).toContain("Assalomu alaykum");
    expect(i18n.t("start.openApp")).toBe("Taklifnoma yaratish");
  });

  it("falls back to uz for languages with an empty resource file", () => {
    const i18n = createI18n();

    expect(i18n.t("start.welcome", { lng: "ru" })).toBe(i18n.t("start.welcome", { lng: "uz" }));
    expect(i18n.t("start.welcome", { lng: "en" })).toBe(i18n.t("start.welcome", { lng: "uz" }));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd apps/bot && npx vitest run test/unit/i18n/i18n.test.ts`
Expected: FAIL — cannot find module `.../i18n/i18n.js`

- [ ] **Step 3: Create `apps/bot/src/locales/uz.json`**

```json
{
  "start": {
    "welcome": "Assalomu alaykum! Taklifnoma botiga xush kelibsiz. Quyidagi tugma orqali o'zingizning to'y taklifnomangizni yarating.",
    "openApp": "Taklifnoma yaratish"
  }
}
```

- [ ] **Step 4: Create `apps/bot/src/locales/ru.json`** (structure ready, MVP content deferred)

```json
{}
```

- [ ] **Step 5: Create `apps/bot/src/locales/en.json`** (structure ready, MVP content deferred)

```json
{}
```

- [ ] **Step 6: Create `apps/bot/src/i18n/i18n.ts`**

Locale JSON is read from disk relative to this file's own URL (works
identically whether the module runs from `src/` via `tsx` or is executed
from another location) rather than via a bundler-specific JSON import, so
no bundler-specific import syntax is required.

```typescript
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import i18next, { type i18n as I18nInstance } from "i18next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, "..", "locales");

function loadLocale(code: string): Record<string, unknown> {
  const filePath = path.join(LOCALES_DIR, `${code}.json`);
  return JSON.parse(readFileSync(filePath, "utf-8")) as Record<string, unknown>;
}

export function createI18n(): I18nInstance {
  const instance = i18next.createInstance();
  void instance.init({
    lng: "uz",
    fallbackLng: "uz",
    resources: {
      uz: { translation: loadLocale("uz") },
      ru: { translation: loadLocale("ru") },
      en: { translation: loadLocale("en") },
    },
    interpolation: { escapeValue: false },
  });
  return instance;
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `cd apps/bot && npx vitest run test/unit/i18n/i18n.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 8: Commit**

```bash
git add apps/bot/src/locales apps/bot/src/i18n apps/bot/test/unit/i18n
git commit -m "feat: add bot locale files and i18next setup"
```

---

### Task 3: `/start` command — message, keyboard, and wiring

**Files:**
- Create: `apps/bot/src/commands/start.ts`
- Test: `apps/bot/test/unit/commands/start.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// apps/bot/test/unit/commands/start.test.ts
import { describe, expect, it } from "vitest";
import { createI18n } from "../../../src/i18n/i18n.js";
import { buildStartMessage, buildStartKeyboard } from "../../../src/commands/start.js";

describe("buildStartMessage", () => {
  it("returns the welcome text for the given translator", () => {
    const i18n = createI18n();

    expect(buildStartMessage(i18n.t.bind(i18n))).toContain("Assalomu alaykum");
  });
});

describe("buildStartKeyboard", () => {
  it("builds a single web_app button pointing at the Mini App URL", () => {
    const i18n = createI18n();

    const keyboard = buildStartKeyboard("https://example.com/app", i18n.t.bind(i18n));

    const button = keyboard.inline_keyboard[0]?.[0];
    expect(button?.text).toBe("Taklifnoma yaratish");
    expect(button && "web_app" in button ? button.web_app.url : undefined).toBe("https://example.com/app");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd apps/bot && npx vitest run test/unit/commands/start.test.ts`
Expected: FAIL — cannot find module `.../commands/start.js`

- [ ] **Step 3: Create `apps/bot/src/commands/start.ts`**

```typescript
import { InlineKeyboard, type Bot } from "grammy";
import type { TFunction } from "i18next";

export function buildStartMessage(t: TFunction): string {
  return t("start.welcome");
}

export function buildStartKeyboard(miniAppUrl: string, t: TFunction): InlineKeyboard {
  return new InlineKeyboard().webApp(t("start.openApp"), miniAppUrl);
}

export function registerStartCommand(bot: Bot, miniAppUrl: string, t: TFunction): void {
  bot.command("start", async (ctx) => {
    await ctx.reply(buildStartMessage(t), { reply_markup: buildStartKeyboard(miniAppUrl, t) });
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd apps/bot && npx vitest run test/unit/commands/start.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/bot/src/commands/start.ts apps/bot/test/unit/commands/start.test.ts
git commit -m "feat: add /start command with Mini App web_app button"
```

---

### Task 4: Bot factory and entrypoint

**Files:**
- Create: `apps/bot/src/bot.ts`
- Create: `apps/bot/src/index.ts`
- Create: `apps/bot/.env.example`

- [ ] **Step 1: Create `apps/bot/src/bot.ts`**

```typescript
import { Bot } from "grammy";
import type { TFunction } from "i18next";
import { registerStartCommand } from "./commands/start.js";

export function createBot(botToken: string, miniAppUrl: string, t: TFunction): Bot {
  const bot = new Bot(botToken);
  registerStartCommand(bot, miniAppUrl, t);
  return bot;
}
```

- [ ] **Step 2: Create `apps/bot/src/index.ts`**

```typescript
import { loadEnvConfig } from "./config/env-config.js";
import { createI18n } from "./i18n/i18n.js";
import { createBot } from "./bot.js";

const config = loadEnvConfig();
const i18n = createI18n();
const bot = createBot(config.botToken, config.miniAppUrl, i18n.t.bind(i18n));

bot
  .start({ onStart: () => console.log("Bot started (long polling)") })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());
```

- [ ] **Step 3: Create `apps/bot/.env.example`**

```
TELEGRAM_BOT_TOKEN="replace-with-a-real-bot-token-from-BotFather"
MINIAPP_URL="https://replace-with-the-deployed-miniapp-url.example.com"
```

- [ ] **Step 4: Verify the project type-checks**

Run: `cd apps/bot && npx tsc --noEmit -p tsconfig.json`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/bot/src/bot.ts apps/bot/src/index.ts apps/bot/.env.example
git commit -m "feat: add bot factory and entrypoint"
```

---

### Task 5: Backend — real `TelegramOwnerNotifier`, replacing the console stub

`MINIAPP_URL` does not point at a real deployed Mini App yet (that is built
in a later plan), so `/start` cannot be exercised fully end-to-end until
then. RSVP notifications, however, do not depend on the Mini App at all —
this task makes them real.

**Files:**
- Create: `backend/src/shared/constants/rsvp-notification.ts`
- Create: `backend/src/infrastructure/notifications/telegram-owner-notifier.ts`
- Create: `backend/test/unit/infrastructure/telegram-owner-notifier.test.ts`
- Modify: `backend/src/presentation/server.ts`
- Delete: `backend/src/infrastructure/notifications/console-owner-notifier.ts`
- Delete: `backend/test/unit/infrastructure/console-owner-notifier.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// backend/test/unit/infrastructure/telegram-owner-notifier.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { TelegramOwnerNotifier } from "../../../src/infrastructure/notifications/telegram-owner-notifier.js";

describe("TelegramOwnerNotifier", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls the Telegram sendMessage API with the chat id and RSVP details", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const notifier = new TelegramOwnerNotifier("test-bot-token");
    await notifier.notifyNewRsvp(42n, {
      id: "rsvp-1",
      invitationId: "inv-1",
      guestName: "Aziza",
      status: "COMING",
      respondedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.telegram.org/bottest-bot-token/sendMessage");
    const body = JSON.parse(options.body as string) as { chat_id: string; text: string };
    expect(body.chat_id).toBe("42");
    expect(body.text).toContain("Aziza");
  });

  it("does not throw when the Telegram API call fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const notifier = new TelegramOwnerNotifier("test-bot-token");

    await expect(
      notifier.notifyNewRsvp(1n, {
        id: "rsvp-2",
        invitationId: "inv-1",
        guestName: "Bek",
        status: "NOT_COMING",
        respondedAt: new Date("2026-01-01T00:00:00.000Z"),
      }),
    ).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx vitest run test/unit/infrastructure/telegram-owner-notifier.test.ts`
Expected: FAIL — cannot find module `.../telegram-owner-notifier.js`

- [ ] **Step 3: Create `backend/src/shared/constants/rsvp-notification.ts`**

The backend has no i18n system of its own (per `CLAUDE.md`, `i18next` is
scoped to the bot/frontend/public-site); to still honor the "no hardcoded
text" rule, the RSVP status label and message template live in `shared/constants/` rather than inline in the notifier class.

```typescript
import { RSVP_STATUS, type RsvpStatus } from "./rsvp-status.js";

export const RSVP_STATUS_LABELS_UZ: Record<RsvpStatus, string> = {
  [RSVP_STATUS.COMING]: "Keladi",
  [RSVP_STATUS.NOT_COMING]: "Kelmaydi",
};

export function buildRsvpNotificationText(guestName: string, status: RsvpStatus): string {
  return `Yangi RSVP: ${guestName} — ${RSVP_STATUS_LABELS_UZ[status]}`;
}
```

- [ ] **Step 4: Create `backend/src/infrastructure/notifications/telegram-owner-notifier.ts`**

```typescript
import type { OwnerNotifier } from "../../application/ports/owner-notifier.js";
import type { RsvpResponse } from "../../domain/rsvp-response.js";
import { buildRsvpNotificationText } from "../../shared/constants/rsvp-notification.js";

const TELEGRAM_API_BASE = "https://api.telegram.org";

export class TelegramOwnerNotifier implements OwnerNotifier {
  constructor(private readonly botToken: string) {}

  async notifyNewRsvp(ownerChatId: bigint, rsvp: RsvpResponse): Promise<void> {
    const text = buildRsvpNotificationText(rsvp.guestName, rsvp.status);

    try {
      const response = await fetch(`${TELEGRAM_API_BASE}/bot${this.botToken}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: ownerChatId.toString(), text }),
      });

      if (!response.ok) {
        console.error(`[TelegramOwnerNotifier] Telegram API returned ${response.status}`);
      }
    } catch (error) {
      // A guest's RSVP must still succeed even if the owner notification
      // fails (e.g. the owner blocked the bot) — log and move on.
      console.error("[TelegramOwnerNotifier] Failed to send RSVP notification", error);
    }
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd backend && npx vitest run test/unit/infrastructure/telegram-owner-notifier.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 6: Wire it into `backend/src/presentation/server.ts`, and delete the console stub**

`ConsoleOwnerNotifier` was an explicit temporary stand-in (see its original
task in the backend-foundation plan); now that a real implementation
exists and is wired in, delete it and its test rather than leaving unused
code behind.

```typescript
// backend/src/presentation/server.ts
import { buildApp } from "./app.js";
import { loadEnvConfig } from "./env-config.js";
import { PrismaInvitationRepository } from "../infrastructure/repositories/prisma-invitation-repository.js";
import { PrismaRsvpRepository } from "../infrastructure/repositories/prisma-rsvp-repository.js";
import { TelegramOwnerNotifier } from "../infrastructure/notifications/telegram-owner-notifier.js";

const config = loadEnvConfig();

const app = buildApp({
  invitationRepository: new PrismaInvitationRepository(),
  rsvpRepository: new PrismaRsvpRepository(),
  ownerNotifier: new TelegramOwnerNotifier(config.botToken),
  botToken: config.botToken,
});

app
  .listen({ port: config.port, host: "0.0.0.0" })
  .then(() => console.log(`Backend listening on port ${config.port}`))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
```

Run: `rm backend/src/infrastructure/notifications/console-owner-notifier.ts backend/test/unit/infrastructure/console-owner-notifier.test.ts`

- [ ] **Step 7: Run the full backend suite and typecheck**

Run: `cd backend && npm test && npx tsc --noEmit -p tsconfig.json`
Expected: PASS, zero errors. (One test file fewer than before — the
deleted console notifier test — plus the two new notifier tests.)

- [ ] **Step 8: Commit**

```bash
git add backend/src/shared/constants/rsvp-notification.ts backend/src/infrastructure/notifications/telegram-owner-notifier.ts
git add backend/test/unit/infrastructure/telegram-owner-notifier.test.ts backend/src/presentation/server.ts
git add backend/src/infrastructure/notifications/console-owner-notifier.ts backend/test/unit/infrastructure/console-owner-notifier.test.ts
git commit -m "feat: send RSVP notifications through the real Telegram Bot API"
```

(The `console-owner-notifier.*` paths above are staged as deletions.)

---

## Definition of Done

- [ ] `cd apps/bot && npm test` passes with zero failures.
- [ ] `cd apps/bot && npx tsc --noEmit` passes with zero errors (strict mode, no `any`).
- [ ] `cd backend && npm test` passes with zero failures (including the new `TelegramOwnerNotifier` tests, with the console notifier test removed).
- [ ] `cd backend && npx tsc --noEmit` passes with zero errors.
- [ ] Manual, with a real bot token (cannot be automated in this environment): set `TELEGRAM_BOT_TOKEN` and a placeholder `MINIAPP_URL` in `apps/bot/.env`, run `cd apps/bot && npm run dev`, send `/start` to the bot in Telegram, and confirm a welcome message with an "open Mini App" button arrives.
- [ ] No hardcoded bot-facing text outside `apps/bot/src/locales/*.json`; no hardcoded RSVP notification text outside `backend/src/shared/constants/`.

## Out of scope for this plan (covered by later plans)

- Builder Mini App (`apps/miniapp`) — once it exists and is deployed,
  `MINIAPP_URL` gets a real value and `/start` becomes fully testable
  end-to-end.
- Public invitation site rendering (`apps/public-site`).
- Language switching (`ru`/`en` locale content stays an empty, structurally
  ready skeleton until a later plan populates it).
- Webhook mode / production process management for the bot — MVP runs long
  polling locally only, per the MVP spec's "faqat lokal ishlab chiqish
  muhiti" constraint.
- Extracting shared types/constants (e.g. `RsvpStatus`) into a
  `packages/shared` workspace package — each app still keeps its own copy;
  revisit only once duplication actually causes a maintenance problem.
- `/start` deep-linking directly into a specific invitation.
