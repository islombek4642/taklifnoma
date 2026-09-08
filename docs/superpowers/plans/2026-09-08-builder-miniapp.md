# Builder Mini App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Taklifnoma Builder Mini App (`apps/miniapp`, React + Vite +
TypeScript, Telegram WebApp SDK) — the tashkilotchi-facing app covering the
3-tab navigation (Bosh sahifa / Mehmonlar / Sozlamalar), the 5-step builder
form, and the result screen (link + QR code), per
`docs/superpowers/specs/2026-09-07-taklifnoma-mvp-design.md` sections 7 and
`CLAUDE.md`'s modular/feature-based frontend structure. Also adds the one
backend piece this app needs that doesn't exist yet: deleting an invitation
(the spec's Settings screen requires it, and no earlier plan built it).

**Architecture:** Modular/feature-based per `CLAUDE.md` — `components/` holds
only generic, prop-driven "dumb" UI; each screen's logic lives under its own
`features/<name>/` folder; `services/` is the single contact point with the
outside world (Telegram WebApp SDK, backend API); all text goes through
`i18next` + `locales/*.json`; all config/lists go through `constants/`.
Business logic that can be expressed as pure functions (form validation,
DTO mapping, date formatting, the API client) is written and unit-tested
that way; the React components and hooks that wire those functions to state
and JSX stay thin. Per the MVP spec section 9 ("Mini App va public sahifa —
MVP bosqichida qo'lda tekshiriladi ... avtomatik UI test talab qilinmaydi"),
screens themselves are **not** automated-tested — only manually, inside a
real Telegram client. Visual styling is intentionally minimal here; per
spec section 3a the real visual design is a separate, later pass.

**Tech Stack:** React 18, TypeScript (strict), Vite, react-router-dom,
i18next + react-i18next, `qrcode.react` for the QR code, Vitest for pure
unit tests (Node environment — no component rendering, so no
`@testing-library/react`/jsdom dependency is needed for this plan). Backend
addition uses the existing backend stack (no new dependencies).

---

## File Structure

```
apps/
  miniapp/
    package.json
    tsconfig.json
    tsconfig.node.json
    vite.config.ts
    vitest.config.ts
    .env.example
    .gitignore
    index.html
    src/
      main.tsx
      App.tsx
      vite-env.d.ts
      components/
        Layout.tsx
        BottomNav.tsx
      features/
        home/
          HomeScreen.tsx
        builder/
          builder-form.ts           # pure: initial state, validation, DTO mapping
          useBuilderForm.ts          # thin hook wiring builder-form.ts to React state
          BuilderScreen.tsx
          ResultScreen.tsx
          steps/
            NamesStep.tsx
            DateTimeStep.tsx
            VenueStep.tsx
            GreetingStep.tsx
            MusicStep.tsx
        guests/
          GuestsScreen.tsx
        settings/
          SettingsScreen.tsx
      services/
        telegram.ts                  # Telegram WebApp SDK wrapper
        api-client.ts                 # typed fetch wrapper (createApiClient factory + apiClient instance)
      constants/
        config.ts                     # API_BASE_URL, PUBLIC_SITE_BASE_URL from import.meta.env
        tabs.ts
        rsvp-status.ts                # mirrors backend's enum (no shared package yet, see Out of scope)
        music-tracks.ts               # mirrors backend's preset list
        month-names.ts
      utils/
        format-date.ts
      locales/
        uz.json
        ru.json
        en.json
      i18n/
        i18n.ts
    test/
      unit/
        services/
          api-client.test.ts
        builder/
          builder-form.test.ts
        utils/
          format-date.test.ts

backend/
  prisma/
    schema.prisma                     # modified: RsvpResponse.invitation relation gets onDelete: Cascade
    migrations/<timestamp>_add_rsvp_cascade_delete/
  src/
    application/
      ports/invitation-repository.ts  # modified: add delete(id)
      use-cases/delete-invitation.ts  # new
    infrastructure/repositories/prisma-invitation-repository.ts  # modified: add delete(id)
    presentation/routes/invitations.ts # modified: add DELETE /api/invitations/me
  test/
    helpers/in-memory-invitation-repository.ts  # modified: add delete(id)
    unit/application/delete-invitation.test.ts   # new
    integration/routes/invitations.test.ts        # modified: add DELETE coverage
```

---

### Task 0: Scaffold the Mini App project

**Files:**
- Create: `apps/miniapp/package.json`
- Create: `apps/miniapp/tsconfig.json`
- Create: `apps/miniapp/tsconfig.node.json`
- Create: `apps/miniapp/vite.config.ts`
- Create: `apps/miniapp/vitest.config.ts`
- Create: `apps/miniapp/.gitignore`
- Create: `apps/miniapp/index.html`
- Create: `apps/miniapp/src/main.tsx`
- Create: `apps/miniapp/src/App.tsx`
- Create: `apps/miniapp/src/vite-env.d.ts`

- [ ] **Step 1: Create `apps/miniapp/package.json`**

```json
{
  "name": "taklifnoma-miniapp",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "i18next": "^23.15.1",
    "react-i18next": "^15.0.2",
    "qrcode.react": "^3.1.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.6.2",
    "vite": "^5.4.6",
    "vitest": "^2.1.1"
  }
}
```

- [ ] **Step 2: Create `apps/miniapp/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create `apps/miniapp/tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 4: Create `apps/miniapp/vite.config.ts`**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 5: Create `apps/miniapp/vitest.config.ts`**

Pure-logic tests only (see Architecture above), so a plain Node environment
is enough — no jsdom / React Testing Library dependency.

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
```

- [ ] **Step 6: Create `apps/miniapp/.gitignore`**

```
node_modules/
dist/
.env
```

- [ ] **Step 7: Create `apps/miniapp/index.html`**

```html
<!doctype html>
<html lang="uz">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Taklifnoma</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create `apps/miniapp/src/vite-env.d.ts`**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_PUBLIC_SITE_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 9: Create placeholder `apps/miniapp/src/App.tsx` and `apps/miniapp/src/main.tsx`**

These are filled in for real in Task 7; for now, enough to install and boot.

```tsx
// apps/miniapp/src/App.tsx
export default function App() {
  return <div>Taklifnoma</div>;
}
```

```tsx
// apps/miniapp/src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 10: Install dependencies and verify the dev server boots**

Run: `cd apps/miniapp && npm install`
Expected: `node_modules/` created, no errors.

Run: `cd apps/miniapp && npm run build`
Expected: `dist/` produced, no TypeScript or build errors.

- [ ] **Step 11: Commit**

```bash
git add apps/miniapp/package.json apps/miniapp/tsconfig.json apps/miniapp/tsconfig.node.json
git add apps/miniapp/vite.config.ts apps/miniapp/vitest.config.ts apps/miniapp/.gitignore
git add apps/miniapp/index.html apps/miniapp/src/main.tsx apps/miniapp/src/App.tsx apps/miniapp/src/vite-env.d.ts
git commit -m "chore: scaffold Mini App project"
```

---

### Task 1: Backend — cascading delete + `DeleteInvitation` use-case + route

The Settings screen (Task 12) needs to delete an invitation. No earlier
plan built this, so it's added here as a small, self-contained addition
using the exact same Clean Architecture pattern as every other backend
use-case.

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/src/application/ports/invitation-repository.ts`
- Create: `backend/src/application/use-cases/delete-invitation.ts`
- Create: `backend/test/unit/application/delete-invitation.test.ts`
- Modify: `backend/test/helpers/in-memory-invitation-repository.ts`
- Modify: `backend/src/infrastructure/repositories/prisma-invitation-repository.ts`
- Modify: `backend/src/presentation/routes/invitations.ts`
- Modify: `backend/test/integration/routes/invitations.test.ts`

- [ ] **Step 1: Add cascading delete to the schema and migrate**

In `backend/prisma/schema.prisma`, change the `RsvpResponse.invitation`
relation field to cascade on delete:

```prisma
model RsvpResponse {
  id            String     @id @default(uuid())
  invitationId  String
  invitation    Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  guestName     String
  status        String
  respondedAt   DateTime   @default(now())

  @@index([invitationId])
}
```

Run: `cd backend && npx prisma migrate dev --name add_rsvp_cascade_delete`
Expected: a new migration under `prisma/migrations/`, "Your database is now
in sync with your schema."

- [ ] **Step 2: Add `delete` to the port and the in-memory fake**

```typescript
// backend/src/application/ports/invitation-repository.ts
export interface InvitationRepository {
  create(input: InvitationInput & { slug: string; ownerTelegramId: bigint; ownerChatId: bigint }): Promise<Invitation>;
  findByOwnerTelegramId(ownerTelegramId: bigint): Promise<Invitation | null>;
  findBySlug(slug: string): Promise<Invitation | null>;
  slugExists(slug: string): Promise<boolean>;
  update(id: string, input: Partial<InvitationInput>): Promise<Invitation>;
  delete(id: string): Promise<void>;
}
```

Add to `backend/test/helpers/in-memory-invitation-repository.ts`:

```typescript
  async delete(id: string): Promise<void> {
    this.invitations.delete(id);
  }
```

- [ ] **Step 3: Write the failing use-case test**

```typescript
// backend/test/unit/application/delete-invitation.test.ts
import { describe, expect, it } from "vitest";
import { DeleteInvitationUseCase } from "../../../src/application/use-cases/delete-invitation.js";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";
import { NotFoundError } from "../../../src/domain/errors.js";

const baseInput = {
  groomName: "Ulug'bek",
  brideName: "Malika",
  eventDateTime: new Date("2026-11-11T17:00:00.000Z"),
  venueName: "Baxtiyor restorani",
  venueAddress: "Toshkent viloyati",
  musicTrackId: "romantic-piano",
  slug: "ulugbek-malika",
  ownerTelegramId: 1n,
  ownerChatId: 1n,
};

describe("DeleteInvitationUseCase", () => {
  it("deletes the invitation owned by the given telegram id", async () => {
    const repo = new InMemoryInvitationRepository();
    await repo.create(baseInput);
    const useCase = new DeleteInvitationUseCase(repo);

    await useCase.execute(1n);

    expect(await repo.findByOwnerTelegramId(1n)).toBeNull();
  });

  it("throws NotFoundError when the owner has no invitation", async () => {
    const repo = new InMemoryInvitationRepository();
    const useCase = new DeleteInvitationUseCase(repo);

    await expect(useCase.execute(999n)).rejects.toBeInstanceOf(NotFoundError);
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `cd backend && npx vitest run test/unit/application/delete-invitation.test.ts`
Expected: FAIL — cannot find module `.../delete-invitation.js`

- [ ] **Step 5: Create `backend/src/application/use-cases/delete-invitation.ts`**

```typescript
import type { InvitationRepository } from "../ports/invitation-repository.js";
import { NotFoundError } from "../../domain/errors.js";

export class DeleteInvitationUseCase {
  constructor(private readonly invitations: InvitationRepository) {}

  async execute(ownerTelegramId: bigint): Promise<void> {
    const existing = await this.invitations.findByOwnerTelegramId(ownerTelegramId);
    if (!existing) throw new NotFoundError("Invitation");

    await this.invitations.delete(existing.id);
  }
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `cd backend && npx vitest run test/unit/application/delete-invitation.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 7: Implement `delete` on `PrismaInvitationRepository`**

The cascade added in Step 1 means only the invitation row needs deleting —
Prisma/SQLite removes its `RsvpResponse` rows automatically.

```typescript
// add to backend/src/infrastructure/repositories/prisma-invitation-repository.ts
  async delete(id: string): Promise<void> {
    await prisma.invitation.delete({ where: { id } });
  }
```

- [ ] **Step 8: Add the `DELETE /api/invitations/me` route**

In `backend/src/presentation/routes/invitations.ts`, add alongside the
other use-case instantiations and routes:

```typescript
import { DeleteInvitationUseCase } from "../../application/use-cases/delete-invitation.js";
// ...
  const deleteInvitation = new DeleteInvitationUseCase(deps.invitationRepository);
// ...
  app.delete(API_ROUTES.MY_INVITATION, { preHandler: auth }, async (request, reply) => {
    await deleteInvitation.execute(request.ownerTelegramId!);
    reply.code(204).send();
  });
```

- [ ] **Step 9: Extend the route integration test**

Add to `backend/test/integration/routes/invitations.test.ts`:

```typescript
describe("DELETE /api/invitations/me", () => {
  it("deletes the invitation and a subsequent GET returns 404", async () => {
    const app = buildTestApp();
    await app.inject({
      method: "POST",
      url: "/api/invitations",
      headers: { authorization: authHeader(4), "content-type": "application/json" },
      payload: validPayload,
    });

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: "/api/invitations/me",
      headers: { authorization: authHeader(4) },
    });
    expect(deleteResponse.statusCode).toBe(204);

    const getResponse = await app.inject({
      method: "GET",
      url: "/api/invitations/me",
      headers: { authorization: authHeader(4) },
    });
    expect(getResponse.statusCode).toBe(404);
  });
});
```

- [ ] **Step 10: Run the full backend suite and typecheck**

Run: `cd backend && npm test && npx tsc --noEmit -p tsconfig.json`
Expected: PASS, zero errors.

- [ ] **Step 11: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations
git add backend/src/application/ports/invitation-repository.ts backend/src/application/use-cases/delete-invitation.ts
git add backend/test/unit/application/delete-invitation.test.ts backend/test/helpers/in-memory-invitation-repository.ts
git add backend/src/infrastructure/repositories/prisma-invitation-repository.ts
git add backend/src/presentation/routes/invitations.ts backend/test/integration/routes/invitations.test.ts
git commit -m "feat: add DeleteInvitation use-case, cascading delete, and DELETE route"
```

---

### Task 2: Frontend constants and config

**Files:**
- Create: `apps/miniapp/src/constants/config.ts`
- Create: `apps/miniapp/src/constants/tabs.ts`
- Create: `apps/miniapp/src/constants/rsvp-status.ts`
- Create: `apps/miniapp/src/constants/music-tracks.ts`
- Create: `apps/miniapp/src/constants/month-names.ts`
- Create: `apps/miniapp/.env.example`

- [ ] **Step 1: Create `apps/miniapp/src/constants/config.ts`**

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const PUBLIC_SITE_BASE_URL = import.meta.env.VITE_PUBLIC_SITE_BASE_URL;
```

- [ ] **Step 2: Create `apps/miniapp/src/constants/tabs.ts`**

```typescript
export interface TabConfig {
  path: string;
  labelKey: string;
}

export const TABS: TabConfig[] = [
  { path: "/", labelKey: "tabs.home" },
  { path: "/guests", labelKey: "tabs.guests" },
  { path: "/settings", labelKey: "tabs.settings" },
];
```

- [ ] **Step 3: Create `apps/miniapp/src/constants/rsvp-status.ts`**

Mirrors `backend/src/shared/constants/rsvp-status.ts` — see "Out of scope"
for why this is duplicated rather than shared.

```typescript
export const RSVP_STATUS = {
  COMING: "COMING",
  NOT_COMING: "NOT_COMING",
} as const;

export type RsvpStatus = (typeof RSVP_STATUS)[keyof typeof RSVP_STATUS];
```

- [ ] **Step 4: Create `apps/miniapp/src/constants/music-tracks.ts`**

Mirrors `backend/src/shared/constants/music-tracks.ts`'s data (id and
`titleKey` must match what the backend accepts as `musicTrackId`).

```typescript
export interface MusicTrack {
  id: string;
  titleKey: string;
  fileUrl: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: "romantic-piano", titleKey: "music.romanticPiano", fileUrl: "/assets/music/romantic-piano.mp3" },
  { id: "gentle-strings", titleKey: "music.gentleStrings", fileUrl: "/assets/music/gentle-strings.mp3" },
];
```

- [ ] **Step 5: Create `apps/miniapp/src/constants/month-names.ts`**

```typescript
export const MONTH_NAMES_UZ = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr",
] as const;
```

- [ ] **Step 6: Create `apps/miniapp/.env.example`**

`VITE_PUBLIC_SITE_BASE_URL` is a placeholder until the public-site plan
exists and is deployed — same pattern as `MINIAPP_URL` was a placeholder
in the bot plan before this app existed.

```
VITE_API_BASE_URL="http://localhost:3000"
VITE_PUBLIC_SITE_BASE_URL="http://localhost:4000"
```

- [ ] **Step 7: Commit**

```bash
git add apps/miniapp/src/constants apps/miniapp/.env.example
git commit -m "feat: add Mini App constants and env config"
```

---

### Task 3: Locale files and i18n setup

**Files:**
- Create: `apps/miniapp/src/locales/uz.json`
- Create: `apps/miniapp/src/locales/ru.json`
- Create: `apps/miniapp/src/locales/en.json`
- Create: `apps/miniapp/src/i18n/i18n.ts`

- [ ] **Step 1: Create `apps/miniapp/src/locales/uz.json`**

```json
{
  "tabs": { "home": "Bosh sahifa", "guests": "Mehmonlar", "settings": "Sozlamalar" },
  "home": {
    "loading": "Yuklanmoqda...",
    "emptyTitle": "Hali taklifnomangiz yo'q",
    "emptySubtitle": "Bir necha daqiqada o'z to'y taklifnomangizni yarating",
    "createButton": "Taklifnoma yaratish",
    "editButton": "Tahrirlash",
    "viewButton": "Ko'rish",
    "shareButton": "Ulashish"
  },
  "builder": {
    "steps": {
      "names": "Ism-familiya",
      "dateTime": "Sana va vaqt",
      "venue": "To'y zali",
      "greeting": "Tabrik matni",
      "music": "Fon musiqasi"
    },
    "fields": {
      "groomName": "Kuyov ismi",
      "brideName": "Kelin ismi",
      "eventDate": "Sana",
      "eventTime": "Vaqt",
      "venueName": "To'y zali nomi",
      "venueAddress": "Manzil",
      "mapUrl": "Xarita havolasi (ixtiyoriy)",
      "greetingText": "Tabrik matni (ixtiyoriy)",
      "musicTrack": "Musiqa tanlang"
    },
    "next": "Keyingi",
    "back": "Orqaga",
    "save": "Saqlash",
    "update": "Yangilash"
  },
  "result": {
    "title": "Taklifnoma tayyor!",
    "copyLink": "Havolani nusxalash",
    "copied": "Nusxalandi",
    "share": "Ulashish",
    "view": "Ko'rish",
    "backHome": "Bosh sahifaga"
  },
  "guests": {
    "loading": "Yuklanmoqda...",
    "summary": "{{coming}} kishi keladi, {{notComing}} kishi kelmaydi",
    "empty": "Hali hech kim javob bermagan",
    "comingLabel": "Keladi",
    "notComingLabel": "Kelmaydi"
  },
  "settings": {
    "help": "Yordam/Aloqa",
    "helpText": "Savol yoki takliflaringiz bo'lsa, @taklifnoma_support bilan bog'laning.",
    "deleteButton": "Taklifnomani o'chirish",
    "deleteConfirm": "Rostdan ham taklifnomangizni o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi.",
    "deleteConfirmYes": "Ha, o'chirish",
    "deleteConfirmNo": "Bekor qilish"
  },
  "music": {
    "romanticPiano": "Romantik pianino",
    "gentleStrings": "Yumshoq torli asboblar"
  },
  "common": {
    "errorGeneric": "Xatolik yuz berdi. Qaytadan urinib ko'ring."
  }
}
```

- [ ] **Step 2: Create `apps/miniapp/src/locales/ru.json`** (structure ready, MVP content deferred)

```json
{}
```

- [ ] **Step 3: Create `apps/miniapp/src/locales/en.json`** (structure ready, MVP content deferred)

```json
{}
```

- [ ] **Step 4: Create `apps/miniapp/src/i18n/i18n.ts`**

Vite loads JSON imports natively, so — unlike the bot's Node-side loader —
no filesystem read is needed here.

```typescript
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import uz from "../locales/uz.json";
import ru from "../locales/ru.json";
import en from "../locales/en.json";

void i18next.use(initReactI18next).init({
  lng: "uz",
  fallbackLng: "uz",
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
    en: { translation: en },
  },
  interpolation: { escapeValue: false },
});

export default i18next;
```

- [ ] **Step 5: Wire it into the entrypoint**

In `apps/miniapp/src/main.tsx`, add `import "./i18n/i18n.js";` before the
`createRoot(...)` call (Task 7 rewrites this file fully; this import must
survive that rewrite).

- [ ] **Step 6: Verify the project still builds**

Run: `cd apps/miniapp && npx tsc -b`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add apps/miniapp/src/locales apps/miniapp/src/i18n apps/miniapp/src/main.tsx
git commit -m "feat: add Mini App locale files and i18next setup"
```

---

### Task 4: Telegram WebApp service wrapper

**Files:**
- Create: `apps/miniapp/src/services/telegram.ts`

- [ ] **Step 1: Create `apps/miniapp/src/services/telegram.ts`**

This is the single point of contact with `window.Telegram.WebApp`, per
`CLAUDE.md`'s `services/` rule. Only the subset of the SDK this app
actually uses is typed.

```typescript
export interface TelegramWebApp {
  initData: string;
  ready(): void;
  expand(): void;
  openTelegramLink(url: string): void;
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

export function getTelegramWebApp(): TelegramWebApp | undefined {
  return window.Telegram?.WebApp;
}

export function getInitData(): string {
  return getTelegramWebApp()?.initData ?? "";
}

export function initTelegramWebApp(): void {
  const webApp = getTelegramWebApp();
  webApp?.ready();
  webApp?.expand();
}

export function shareInvitationLink(url: string, text: string): void {
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.openTelegramLink(shareUrl);
  } else {
    window.open(shareUrl, "_blank");
  }
}
```

- [ ] **Step 2: Verify the project still builds**

Run: `cd apps/miniapp && npx tsc -b`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/miniapp/src/services/telegram.ts
git commit -m "feat: add Telegram WebApp SDK service wrapper"
```

---

### Task 5: API client

**Files:**
- Create: `apps/miniapp/src/services/api-client.ts`
- Test: `apps/miniapp/test/unit/services/api-client.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// apps/miniapp/test/unit/services/api-client.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApiClient, ApiError } from "../../../src/services/api-client.js";

const BASE_URL = "http://localhost:3000";

describe("createApiClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the tma-prefixed Authorization header on createInvitation", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "inv-1", slug: "a-b" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = createApiClient(BASE_URL);
    await client.createInvitation("raw-init-data", {
      groomName: "A",
      brideName: "B",
      eventDateTime: "2026-11-11T17:00:00.000Z",
      venueName: "V",
      venueAddress: "Addr",
      musicTrackId: "romantic-piano",
    });

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE_URL}/api/invitations`);
    expect((options.headers as Record<string, string>).authorization).toBe("tma raw-init-data");
  });

  it("returns null from getMyInvitation on a 404", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({}) }));

    const client = createApiClient(BASE_URL);

    expect(await client.getMyInvitation("init-data")).toBeNull();
  });

  it("throws ApiError with the response status for other failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: "bad" }) }),
    );

    const client = createApiClient(BASE_URL);

    await expect(
      client.createInvitation("init-data", {
        groomName: "",
        brideName: "B",
        eventDateTime: "2026-11-11T17:00:00.000Z",
        venueName: "V",
        venueAddress: "Addr",
        musicTrackId: "romantic-piano",
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it("lists guests", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: "g-1", guestName: "Aziza", status: "COMING", respondedAt: "2026-01-01T00:00:00.000Z" }] }),
    );

    const client = createApiClient(BASE_URL);
    const guests = await client.listGuests("init-data");

    expect(guests).toHaveLength(1);
    expect(guests[0]?.guestName).toBe("Aziza");
  });

  it("deletes the invitation", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    const client = createApiClient(BASE_URL);
    await client.deleteInvitation("init-data");

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE_URL}/api/invitations/me`);
    expect(options.method).toBe("DELETE");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd apps/miniapp && npx vitest run test/unit/services/api-client.test.ts`
Expected: FAIL — cannot find module `.../services/api-client.js`

- [ ] **Step 3: Create `apps/miniapp/src/services/api-client.ts`**

```typescript
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
  musicTrackId: string;
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

    async listGuests(initData: string): Promise<GuestDto[]> {
      const response = await fetch(`${baseUrl}/api/invitations/me/guests`, { headers: authHeaders(initData) });
      return parseJsonOrThrow<GuestDto[]>(response);
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

export const apiClient = createApiClient(API_BASE_URL);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd apps/miniapp && npx vitest run test/unit/services/api-client.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/miniapp/src/services/api-client.ts apps/miniapp/test/unit/services/api-client.test.ts
git commit -m "feat: add typed API client for the backend"
```

---

### Task 6: Date formatting utility

**Files:**
- Create: `apps/miniapp/src/utils/format-date.ts`
- Test: `apps/miniapp/test/unit/utils/format-date.test.ts`

`eventDateTime` is stored and transmitted as an ISO instant; formatting
uses UTC getters rather than local-timezone getters so the displayed date
is deterministic regardless of the viewer's machine timezone (venue-local
timezone handling is out of MVP scope, matching the spec).

- [ ] **Step 1: Write the failing test**

```typescript
// apps/miniapp/test/unit/utils/format-date.test.ts
import { describe, expect, it } from "vitest";
import { formatEventDateUz } from "../../../src/utils/format-date.js";

describe("formatEventDateUz", () => {
  it("formats an ISO instant as '<day>-<month>, <year>-yil'", () => {
    expect(formatEventDateUz("2026-11-11T17:00:00.000Z")).toBe("11-noyabr, 2026-yil");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/miniapp && npx vitest run test/unit/utils/format-date.test.ts`
Expected: FAIL — cannot find module `.../utils/format-date.js`

- [ ] **Step 3: Create `apps/miniapp/src/utils/format-date.ts`**

```typescript
import { MONTH_NAMES_UZ } from "../constants/month-names.js";

export function formatEventDateUz(iso: string): string {
  const date = new Date(iso);
  const day = date.getUTCDate();
  const month = MONTH_NAMES_UZ[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day}-${month}, ${year}-yil`;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd apps/miniapp && npx vitest run test/unit/utils/format-date.test.ts`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add apps/miniapp/src/utils/format-date.ts apps/miniapp/test/unit/utils/format-date.test.ts
git commit -m "feat: add Uzbek event date formatter"
```

---

### Task 7: App shell — routing, layout, bottom navigation

Builder and Result are full-screen flows without the bottom nav (per spec:
"Builder forma (Bosh sahifadan ochiladi, tab emas)"), so they sit outside
the `Layout` route group. No automated test for this task — verify
manually per the Architecture note above.

**Files:**
- Create: `apps/miniapp/src/components/Layout.tsx`
- Create: `apps/miniapp/src/components/BottomNav.tsx`
- Modify: `apps/miniapp/src/App.tsx`
- Modify: `apps/miniapp/src/main.tsx`

- [ ] **Step 1: Create `apps/miniapp/src/components/BottomNav.tsx`**

```tsx
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TABS } from "../constants/tabs.js";

export function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          end={tab.path === "/"}
          className={({ isActive }) => (isActive ? "bottom-nav__item bottom-nav__item--active" : "bottom-nav__item")}
        >
          {t(tab.labelKey)}
        </NavLink>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: Create `apps/miniapp/src/components/Layout.tsx`**

```tsx
import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav.js";

export function Layout() {
  return (
    <div className="app-layout">
      <main className="app-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `apps/miniapp/src/App.tsx`**

Screens referenced here are built in Tasks 8-12; this file is complete
only once those exist, matching how the backend-foundation plan's
`app.ts` wasn't fully runnable until its route files landed.

```tsx
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout.js";
import { HomeScreen } from "./features/home/HomeScreen.js";
import { BuilderScreen } from "./features/builder/BuilderScreen.js";
import { ResultScreen } from "./features/builder/ResultScreen.js";
import { GuestsScreen } from "./features/guests/GuestsScreen.js";
import { SettingsScreen } from "./features/settings/SettingsScreen.js";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/guests" element={<GuestsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Route>
      <Route path="/builder" element={<BuilderScreen />} />
      <Route path="/builder/result" element={<ResultScreen />} />
    </Routes>
  );
}
```

- [ ] **Step 4: Rewrite `apps/miniapp/src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./i18n/i18n.js";
import { initTelegramWebApp } from "./services/telegram.js";
import App from "./App.js";

initTelegramWebApp();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

- [ ] **Step 5: Commit**

This will not yet build — the screen modules land in Tasks 8-12. Continue
to Task 8 before checking `tsc -b`/`npm run build` again.

```bash
git add apps/miniapp/src/components apps/miniapp/src/App.tsx apps/miniapp/src/main.tsx
git commit -m "feat: add app shell with routing, layout, and bottom navigation"
```

---

### Task 8: Home screen

**Files:**
- Create: `apps/miniapp/src/features/home/HomeScreen.tsx`

- [ ] **Step 1: Create `apps/miniapp/src/features/home/HomeScreen.tsx`**

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiClient, type InvitationDto } from "../../services/api-client.js";
import { getInitData, shareInvitationLink } from "../../services/telegram.js";
import { formatEventDateUz } from "../../utils/format-date.js";
import { PUBLIC_SITE_BASE_URL } from "../../constants/config.js";

type LoadState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "ready"; invitation: InvitationDto }
  | { status: "error" };

export function HomeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    apiClient
      .getMyInvitation(getInitData())
      .then((invitation) => {
        if (cancelled) return;
        setState(invitation ? { status: "ready", invitation } : { status: "empty" });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") return <p>{t("home.loading")}</p>;
  if (state.status === "error") return <p>{t("common.errorGeneric")}</p>;

  if (state.status === "empty") {
    return (
      <div>
        <h1>{t("home.emptyTitle")}</h1>
        <p>{t("home.emptySubtitle")}</p>
        <button onClick={() => navigate("/builder")}>{t("home.createButton")}</button>
      </div>
    );
  }

  const { invitation } = state;
  const publicUrl = `${PUBLIC_SITE_BASE_URL}/${invitation.slug}`;

  return (
    <div>
      <h1>
        {invitation.groomName} &amp; {invitation.brideName}
      </h1>
      <p>{formatEventDateUz(invitation.eventDateTime)}</p>
      <button onClick={() => navigate("/builder")}>{t("home.editButton")}</button>
      <a href={publicUrl} target="_blank" rel="noreferrer">
        {t("home.viewButton")}
      </a>
      <button onClick={() => shareInvitationLink(publicUrl, `${invitation.groomName} & ${invitation.brideName}`)}>
        {t("home.shareButton")}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/miniapp/src/features/home
git commit -m "feat: add Home screen (empty state and invitation preview)"
```

---

### Task 9: Builder — form logic, steps, and screen

**Files:**
- Create: `apps/miniapp/src/features/builder/builder-form.ts`
- Test: `apps/miniapp/test/unit/builder/builder-form.test.ts`
- Create: `apps/miniapp/src/features/builder/useBuilderForm.ts`
- Create: `apps/miniapp/src/features/builder/steps/NamesStep.tsx`
- Create: `apps/miniapp/src/features/builder/steps/DateTimeStep.tsx`
- Create: `apps/miniapp/src/features/builder/steps/VenueStep.tsx`
- Create: `apps/miniapp/src/features/builder/steps/GreetingStep.tsx`
- Create: `apps/miniapp/src/features/builder/steps/MusicStep.tsx`
- Create: `apps/miniapp/src/features/builder/BuilderScreen.tsx`

- [ ] **Step 1: Write the failing tests for the pure form logic**

```typescript
// apps/miniapp/test/unit/builder/builder-form.test.ts
import { describe, expect, it } from "vitest";
import {
  INITIAL_BUILDER_FORM_STATE,
  isStepValid,
  toInvitationInput,
  fromInvitation,
  type BuilderFormState,
} from "../../../src/features/builder/builder-form.js";
import type { InvitationDto } from "../../../src/services/api-client.js";

describe("isStepValid", () => {
  it("requires both names on step 0", () => {
    expect(isStepValid(0, INITIAL_BUILDER_FORM_STATE)).toBe(false);
    expect(isStepValid(0, { ...INITIAL_BUILDER_FORM_STATE, groomName: "A", brideName: "B" })).toBe(true);
  });

  it("requires date and time on step 1", () => {
    expect(isStepValid(1, INITIAL_BUILDER_FORM_STATE)).toBe(false);
    expect(isStepValid(1, { ...INITIAL_BUILDER_FORM_STATE, eventDate: "2026-11-11", eventTime: "17:00" })).toBe(true);
  });

  it("treats the greeting step as always valid (optional field)", () => {
    expect(isStepValid(3, INITIAL_BUILDER_FORM_STATE)).toBe(true);
  });

  it("requires a music track on step 4", () => {
    expect(isStepValid(4, INITIAL_BUILDER_FORM_STATE)).toBe(false);
    expect(isStepValid(4, { ...INITIAL_BUILDER_FORM_STATE, musicTrackId: "romantic-piano" })).toBe(true);
  });
});

describe("toInvitationInput", () => {
  it("combines date and time into a single ISO eventDateTime", () => {
    const state: BuilderFormState = {
      ...INITIAL_BUILDER_FORM_STATE,
      groomName: " Ulug'bek ",
      brideName: "Malika",
      eventDate: "2026-11-11",
      eventTime: "17:00",
      venueName: "Baxtiyor restorani",
      venueAddress: "Toshkent",
      musicTrackId: "romantic-piano",
    };

    const input = toInvitationInput(state);

    expect(input.groomName).toBe("Ulug'bek");
    expect(input.eventDateTime).toBe(new Date("2026-11-11T17:00:00").toISOString());
  });

  it("omits optional fields when blank", () => {
    const state: BuilderFormState = {
      ...INITIAL_BUILDER_FORM_STATE,
      groomName: "A",
      brideName: "B",
      eventDate: "2026-11-11",
      eventTime: "17:00",
      venueName: "V",
      venueAddress: "Addr",
      musicTrackId: "romantic-piano",
      mapUrl: "  ",
      greetingText: "  ",
    };

    const input = toInvitationInput(state);

    expect(input.mapUrl).toBeUndefined();
    expect(input.greetingText).toBeUndefined();
  });
});

describe("fromInvitation", () => {
  it("splits eventDateTime back into separate date and time fields", () => {
    const invitation = {
      groomName: "A",
      brideName: "B",
      eventDateTime: "2026-11-11T17:00:00.000Z",
      venueName: "V",
      venueAddress: "Addr",
      mapUrl: null,
      greetingText: null,
      musicTrackId: "romantic-piano",
    } as InvitationDto;

    const state = fromInvitation(invitation);

    expect(state.eventDate).toBe("2026-11-11");
    expect(state.eventTime).toBe("17:00");
    expect(state.mapUrl).toBe("");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd apps/miniapp && npx vitest run test/unit/builder/builder-form.test.ts`
Expected: FAIL — cannot find module `.../features/builder/builder-form.js`

- [ ] **Step 3: Create `apps/miniapp/src/features/builder/builder-form.ts`**

```typescript
import type { InvitationDto, InvitationInputDto } from "../../services/api-client.js";

export interface BuilderFormState {
  groomName: string;
  brideName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  mapUrl: string;
  greetingText: string;
  musicTrackId: string;
}

export const INITIAL_BUILDER_FORM_STATE: BuilderFormState = {
  groomName: "",
  brideName: "",
  eventDate: "",
  eventTime: "",
  venueName: "",
  venueAddress: "",
  mapUrl: "",
  greetingText: "",
  musicTrackId: "",
};

export const BUILDER_STEP_COUNT = 5;

export function isStepValid(step: number, state: BuilderFormState): boolean {
  switch (step) {
    case 0:
      return state.groomName.trim().length > 0 && state.brideName.trim().length > 0;
    case 1:
      return state.eventDate.length > 0 && state.eventTime.length > 0;
    case 2:
      return state.venueName.trim().length > 0 && state.venueAddress.trim().length > 0;
    case 3:
      return true;
    case 4:
      return state.musicTrackId.length > 0;
    default:
      return false;
  }
}

export function toInvitationInput(state: BuilderFormState): InvitationInputDto {
  const mapUrl = state.mapUrl.trim();
  const greetingText = state.greetingText.trim();

  return {
    groomName: state.groomName.trim(),
    brideName: state.brideName.trim(),
    eventDateTime: new Date(`${state.eventDate}T${state.eventTime}:00`).toISOString(),
    venueName: state.venueName.trim(),
    venueAddress: state.venueAddress.trim(),
    mapUrl: mapUrl.length > 0 ? mapUrl : undefined,
    greetingText: greetingText.length > 0 ? greetingText : undefined,
    musicTrackId: state.musicTrackId,
  };
}

export function fromInvitation(invitation: InvitationDto): BuilderFormState {
  const date = new Date(invitation.eventDateTime);
  return {
    groomName: invitation.groomName,
    brideName: invitation.brideName,
    eventDate: date.toISOString().slice(0, 10),
    eventTime: date.toISOString().slice(11, 16),
    venueName: invitation.venueName,
    venueAddress: invitation.venueAddress,
    mapUrl: invitation.mapUrl ?? "",
    greetingText: invitation.greetingText ?? "",
    musicTrackId: invitation.musicTrackId,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd apps/miniapp && npx vitest run test/unit/builder/builder-form.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Create `apps/miniapp/src/features/builder/useBuilderForm.ts`**

Thin React wiring over the pure functions above — not unit tested, per
the Architecture note (manual verification covers it).

```typescript
import { useEffect, useState } from "react";
import { apiClient, type InvitationDto } from "../../services/api-client.js";
import { getInitData } from "../../services/telegram.js";
import {
  BUILDER_STEP_COUNT,
  INITIAL_BUILDER_FORM_STATE,
  fromInvitation,
  isStepValid,
  toInvitationInput,
  type BuilderFormState,
} from "./builder-form.js";

export function useBuilderForm() {
  const [mode, setMode] = useState<"loading" | "create" | "edit">("loading");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BuilderFormState>(INITIAL_BUILDER_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiClient.getMyInvitation(getInitData()).then((invitation) => {
      if (invitation) {
        setForm(fromInvitation(invitation));
        setMode("edit");
      } else {
        setMode("create");
      }
    });
  }, []);

  function updateField<K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const canGoNext = isStepValid(step, form);
  const isLastStep = step === BUILDER_STEP_COUNT - 1;

  function goNext(): void {
    if (canGoNext && step < BUILDER_STEP_COUNT - 1) setStep(step + 1);
  }

  function goBack(): void {
    if (step > 0) setStep(step - 1);
  }

  async function submit(): Promise<InvitationDto | undefined> {
    setSubmitting(true);
    setError(false);
    try {
      const input = toInvitationInput(form);
      const initData = getInitData();
      return mode === "edit" ? await apiClient.updateInvitation(initData, input) : await apiClient.createInvitation(initData, input);
    } catch {
      setError(true);
      return undefined;
    } finally {
      setSubmitting(false);
    }
  }

  return { mode, step, form, updateField, canGoNext, isLastStep, goNext, goBack, submit, submitting, error };
}
```

- [ ] **Step 6: Create the step components**

```tsx
// apps/miniapp/src/features/builder/steps/NamesStep.tsx
import { useTranslation } from "react-i18next";
import type { BuilderFormState } from "../builder-form.js";

interface Props {
  form: BuilderFormState;
  onChange: <K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]) => void;
}

export function NamesStep({ form, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <label>
        {t("builder.fields.groomName")}
        <input value={form.groomName} onChange={(e) => onChange("groomName", e.target.value)} />
      </label>
      <label>
        {t("builder.fields.brideName")}
        <input value={form.brideName} onChange={(e) => onChange("brideName", e.target.value)} />
      </label>
    </div>
  );
}
```

```tsx
// apps/miniapp/src/features/builder/steps/DateTimeStep.tsx
import { useTranslation } from "react-i18next";
import type { BuilderFormState } from "../builder-form.js";

interface Props {
  form: BuilderFormState;
  onChange: <K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]) => void;
}

export function DateTimeStep({ form, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <label>
        {t("builder.fields.eventDate")}
        <input type="date" value={form.eventDate} onChange={(e) => onChange("eventDate", e.target.value)} />
      </label>
      <label>
        {t("builder.fields.eventTime")}
        <input type="time" value={form.eventTime} onChange={(e) => onChange("eventTime", e.target.value)} />
      </label>
    </div>
  );
}
```

```tsx
// apps/miniapp/src/features/builder/steps/VenueStep.tsx
import { useTranslation } from "react-i18next";
import type { BuilderFormState } from "../builder-form.js";

interface Props {
  form: BuilderFormState;
  onChange: <K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]) => void;
}

export function VenueStep({ form, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <label>
        {t("builder.fields.venueName")}
        <input value={form.venueName} onChange={(e) => onChange("venueName", e.target.value)} />
      </label>
      <label>
        {t("builder.fields.venueAddress")}
        <input value={form.venueAddress} onChange={(e) => onChange("venueAddress", e.target.value)} />
      </label>
      <label>
        {t("builder.fields.mapUrl")}
        <input value={form.mapUrl} onChange={(e) => onChange("mapUrl", e.target.value)} />
      </label>
    </div>
  );
}
```

```tsx
// apps/miniapp/src/features/builder/steps/GreetingStep.tsx
import { useTranslation } from "react-i18next";
import type { BuilderFormState } from "../builder-form.js";

interface Props {
  form: BuilderFormState;
  onChange: <K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]) => void;
}

export function GreetingStep({ form, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <label>
      {t("builder.fields.greetingText")}
      <textarea value={form.greetingText} onChange={(e) => onChange("greetingText", e.target.value)} />
    </label>
  );
}
```

```tsx
// apps/miniapp/src/features/builder/steps/MusicStep.tsx
import { useTranslation } from "react-i18next";
import { MUSIC_TRACKS } from "../../../constants/music-tracks.js";
import type { BuilderFormState } from "../builder-form.js";

interface Props {
  form: BuilderFormState;
  onChange: <K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]) => void;
}

export function MusicStep({ form, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <p>{t("builder.fields.musicTrack")}</p>
      {MUSIC_TRACKS.map((track) => (
        <div key={track.id}>
          <label>
            <input
              type="radio"
              name="musicTrack"
              checked={form.musicTrackId === track.id}
              onChange={() => onChange("musicTrackId", track.id)}
            />
            {t(track.titleKey)}
          </label>
          <audio controls src={track.fileUrl} />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Create `apps/miniapp/src/features/builder/BuilderScreen.tsx`**

```tsx
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBuilderForm } from "./useBuilderForm.js";
import { NamesStep } from "./steps/NamesStep.js";
import { DateTimeStep } from "./steps/DateTimeStep.js";
import { VenueStep } from "./steps/VenueStep.js";
import { GreetingStep } from "./steps/GreetingStep.js";
import { MusicStep } from "./steps/MusicStep.js";

const STEP_COMPONENTS = [NamesStep, DateTimeStep, VenueStep, GreetingStep, MusicStep];

export function BuilderScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mode, step, form, updateField, canGoNext, isLastStep, goNext, goBack, submit, submitting, error } =
    useBuilderForm();

  if (mode === "loading") return <p>{t("home.loading")}</p>;

  const StepComponent = STEP_COMPONENTS[step];

  async function handlePrimaryAction() {
    if (!isLastStep) {
      goNext();
      return;
    }
    const invitation = await submit();
    if (invitation) navigate("/builder/result", { state: invitation });
  }

  return (
    <div>
      <h2>{t(`builder.steps.${["names", "dateTime", "venue", "greeting", "music"][step]}`)}</h2>
      {StepComponent ? <StepComponent form={form} onChange={updateField} /> : null}
      {error ? <p>{t("common.errorGeneric")}</p> : null}
      <div>
        {step > 0 ? <button onClick={goBack}>{t("builder.back")}</button> : null}
        <button onClick={handlePrimaryAction} disabled={!canGoNext || submitting}>
          {isLastStep ? t(mode === "edit" ? "builder.update" : "builder.save") : t("builder.next")}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add apps/miniapp/src/features/builder apps/miniapp/test/unit/builder
git commit -m "feat: add Builder form (5-step wizard) with create/edit support"
```

---

### Task 10: Result screen

**Files:**
- Create: `apps/miniapp/src/features/builder/ResultScreen.tsx`

- [ ] **Step 1: Create `apps/miniapp/src/features/builder/ResultScreen.tsx`**

```tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { PUBLIC_SITE_BASE_URL } from "../../constants/config.js";
import { shareInvitationLink } from "../../services/telegram.js";
import type { InvitationDto } from "../../services/api-client.js";

export function ResultScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const invitation = location.state as InvitationDto | undefined;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!invitation) navigate("/", { replace: true });
  }, [invitation, navigate]);

  if (!invitation) return null;

  const publicUrl = `${PUBLIC_SITE_BASE_URL}/${invitation.slug}`;

  async function copyLink(): Promise<void> {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
  }

  return (
    <div>
      <h1>{t("result.title")}</h1>
      <QRCodeSVG value={publicUrl} size={200} />
      <p>{publicUrl}</p>
      <button onClick={copyLink}>{t(copied ? "result.copied" : "result.copyLink")}</button>
      <button onClick={() => shareInvitationLink(publicUrl, `${invitation.groomName} & ${invitation.brideName}`)}>
        {t("result.share")}
      </button>
      <a href={publicUrl} target="_blank" rel="noreferrer">
        {t("result.view")}
      </a>
      <button onClick={() => navigate("/")}>{t("result.backHome")}</button>
    </div>
  );
}
```

- [ ] **Step 2: Verify the whole app now builds**

Run: `cd apps/miniapp && npx tsc -b`
Expected: no errors — this is the first point since Task 7 where every
module `App.tsx` imports actually exists.

- [ ] **Step 3: Commit**

```bash
git add apps/miniapp/src/features/builder/ResultScreen.tsx
git commit -m "feat: add Result screen with QR code, copy, and share"
```

---

### Task 11: Guests screen

**Files:**
- Create: `apps/miniapp/src/features/guests/GuestsScreen.tsx`

- [ ] **Step 1: Create `apps/miniapp/src/features/guests/GuestsScreen.tsx`**

```tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RSVP_STATUS } from "../../constants/rsvp-status.js";
import { apiClient, type GuestDto } from "../../services/api-client.js";
import { getInitData } from "../../services/telegram.js";

type LoadState = { status: "loading" } | { status: "ready"; guests: GuestDto[] } | { status: "error" };

export function GuestsScreen() {
  const { t } = useTranslation();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    apiClient
      .listGuests(getInitData())
      .then((guests) => {
        if (!cancelled) setState({ status: "ready", guests });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") return <p>{t("guests.loading")}</p>;
  if (state.status === "error") return <p>{t("common.errorGeneric")}</p>;

  const { guests } = state;
  if (guests.length === 0) return <p>{t("guests.empty")}</p>;

  const coming = guests.filter((guest) => guest.status === RSVP_STATUS.COMING).length;
  const notComing = guests.filter((guest) => guest.status === RSVP_STATUS.NOT_COMING).length;

  return (
    <div>
      <p>{t("guests.summary", { coming, notComing })}</p>
      <ul>
        {guests.map((guest) => (
          <li key={guest.id}>
            {guest.guestName} — {t(guest.status === RSVP_STATUS.COMING ? "guests.comingLabel" : "guests.notComingLabel")}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/miniapp/src/features/guests
git commit -m "feat: add Guests screen with RSVP summary and list"
```

---

### Task 12: Settings screen

**Files:**
- Create: `apps/miniapp/src/features/settings/SettingsScreen.tsx`

- [ ] **Step 1: Create `apps/miniapp/src/features/settings/SettingsScreen.tsx`**

```tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiClient } from "../../services/api-client.js";
import { getInitData } from "../../services/telegram.js";

export function SettingsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(): Promise<void> {
    setDeleting(true);
    try {
      await apiClient.deleteInvitation(getInitData());
      navigate("/", { replace: true });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <h2>{t("settings.help")}</h2>
      <p>{t("settings.helpText")}</p>

      {!confirming ? (
        <button onClick={() => setConfirming(true)}>{t("settings.deleteButton")}</button>
      ) : (
        <div>
          <p>{t("settings.deleteConfirm")}</p>
          <button onClick={handleDelete} disabled={deleting}>
            {t("settings.deleteConfirmYes")}
          </button>
          <button onClick={() => setConfirming(false)}>{t("settings.deleteConfirmNo")}</button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run every Mini App test and build the app**

Run: `cd apps/miniapp && npm test && npx tsc -b && npm run build`
Expected: all unit tests pass, zero type errors, `dist/` produced.

- [ ] **Step 3: Commit**

```bash
git add apps/miniapp/src/features/settings
git commit -m "feat: add Settings screen with help text and delete invitation"
```

---

## Definition of Done

- [ ] `cd apps/miniapp && npm test` passes with zero failures (API client, builder form logic, date formatter).
- [ ] `cd apps/miniapp && npx tsc -b` passes with zero errors (strict mode, no `any`).
- [ ] `cd apps/miniapp && npm run build` succeeds and produces `dist/`.
- [ ] `cd backend && npm test` and `npx tsc --noEmit` still pass, including the new `DeleteInvitation` coverage.
- [ ] Manual, inside a real Telegram client (cannot be automated in this environment, same as the bot plan's `/start` verification): open the Mini App via Telegram's WebApp debug mode, walk through empty Home → 5-step Builder → Result screen (QR renders, copy/share work) → Guests tab (empty state, then after a test RSVP from the public API) → Settings tab (delete confirms and returns to empty Home).
- [ ] No hardcoded user-facing text outside `apps/miniapp/src/locales/*.json`.
- [ ] No hardcoded config values (API/public-site base URLs, music track list, tab list, RSVP status strings) outside `apps/miniapp/src/constants/`.

## Out of scope for this plan (covered by later plans)

- Public invitation site (`apps/public-site`) — until it exists, "Ko'rish"
  links and `VITE_PUBLIC_SITE_BASE_URL` point at a URL that doesn't serve
  anything yet.
- Language switching UI (`ru`/`en` locale content stays an empty,
  structurally ready skeleton).
- Image/gallery upload, payment integration, additional templates/event
  types — all explicitly out of MVP per the spec.
- Extracting duplicated types/constants (`RsvpStatus`, the music track
  list) into a `packages/shared` workspace package — the bot plan deferred
  this for the same reason (YAGNI); now three apps duplicate small pieces
  of it. Revisit once that duplication actually causes a bug or real
  maintenance pain, not preemptively.
- Automated component/UI tests — explicitly waived by the MVP spec in
  favor of manual verification inside Telegram.
