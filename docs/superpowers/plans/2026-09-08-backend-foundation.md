# Backend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Taklifnoma backend API (Clean Architecture, Fastify + Prisma + SQLite) covering invitation CRUD, RSVP submission, and guest listing — fully unit/integration tested, with no UI or bot yet.

**Architecture:** Four-layer Clean Architecture (`domain` → `application` → `infrastructure`/`presentation`), per `CLAUDE.md`. Domain has zero framework imports. Application use-cases depend only on port interfaces. Infrastructure implements those ports with Prisma/SQLite and a stub owner-notifier (real Telegram sending comes in the later Bot plan). Presentation is thin Fastify routes that validate input and call use-cases.

**Tech Stack:** Node.js 20+, TypeScript (strict), Fastify, Prisma + SQLite, Vitest.

---

## File Structure

```
backend/
  package.json
  tsconfig.json
  vitest.config.ts
  prisma/
    schema.prisma
  src/
    domain/
      invitation.ts            # Invitation entity + validation
      rsvp-response.ts         # RsvpResponse entity + RsvpStatus enum
      errors.ts                # Domain error classes
    application/
      ports/
        invitation-repository.ts
        rsvp-repository.ts
        owner-notifier.ts
      use-cases/
        create-invitation.ts
        get-my-invitation.ts
        update-invitation.ts
        get-invitation-by-slug.ts
        submit-rsvp.ts
        list-guests.ts
    infrastructure/
      db/
        prisma-client.ts
      repositories/
        prisma-invitation-repository.ts
        prisma-rsvp-repository.ts
      notifications/
        console-owner-notifier.ts
      auth/
        telegram-init-data-validator.ts
    presentation/
      app.ts                   # buildApp(): registers plugins + routes
      server.ts                # entrypoint: buildApp().listen(...)
      plugins/
        auth-plugin.ts          # decorates request with ownerTelegramId
      routes/
        invitations.ts          # /api/invitations, /api/invitations/me*
        public-invitations.ts   # /api/public/invitations/:slug*
    shared/
      constants/
        rsvp-status.ts
        music-tracks.ts
        limits.ts
        routes.ts
  test/
    unit/
      domain/
      application/
    integration/
      routes/
    helpers/
      in-memory-invitation-repository.ts
      in-memory-rsvp-repository.ts
      test-app.ts
```

---

### Task 0: Project scaffolding

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/vitest.config.ts`
- Create: `backend/.gitignore`

- [ ] **Step 1: Create `backend/package.json`**

```json
{
  "name": "taklifnoma-backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/presentation/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/presentation/server.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  },
  "dependencies": {
    "fastify": "^4.28.1",
    "@prisma/client": "^5.19.1"
  },
  "devDependencies": {
    "typescript": "^5.6.2",
    "tsx": "^4.19.1",
    "vitest": "^2.1.1",
    "prisma": "^5.19.1",
    "@types/node": "^20.16.5"
  }
}
```

- [ ] **Step 2: Create `backend/tsconfig.json`**

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

- [ ] **Step 3: Create `backend/vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Create `backend/.gitignore`**

```
node_modules/
dist/
.env
prisma/dev.db
prisma/dev.db-journal
```

- [ ] **Step 5: Install dependencies**

Run: `cd backend && npm install`
Expected: `node_modules/` created, no errors.

- [ ] **Step 6: Commit**

```bash
git add backend/package.json backend/tsconfig.json backend/vitest.config.ts backend/.gitignore
git commit -m "chore: scaffold backend project"
```

---

### Task 1: Prisma schema and migration

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/.env`

- [ ] **Step 1: Create `backend/.env`**

```
DATABASE_URL="file:./dev.db"
```

- [ ] **Step 2: Create `backend/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Invitation {
  id               String         @id @default(uuid())
  slug             String         @unique
  ownerTelegramId  BigInt         @unique
  ownerChatId      BigInt
  groomName        String
  brideName        String
  eventDateTime    DateTime
  venueName        String
  venueAddress     String
  mapUrl           String?
  greetingText     String?
  musicTrackId     String
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  rsvpResponses    RsvpResponse[]
}

model RsvpResponse {
  id            String     @id @default(uuid())
  invitationId  String
  invitation    Invitation @relation(fields: [invitationId], references: [id])
  guestName     String
  status        String
  respondedAt   DateTime   @default(now())

  @@index([invitationId])
}
```

- [ ] **Step 3: Run the initial migration**

Run: `cd backend && npx prisma migrate dev --name init`
Expected: `prisma/migrations/<timestamp>_init/migration.sql` created, `dev.db` created, output ends with "Your database is now in sync with your schema."

- [ ] **Step 4: Generate the Prisma client**

Run: `cd backend && npm run prisma:generate`
Expected: "Generated Prisma Client" message, no errors.

- [ ] **Step 5: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations
git commit -m "feat: add Prisma schema for Invitation and RsvpResponse"
```

---

### Task 2: Shared constants

**Files:**
- Create: `backend/src/shared/constants/rsvp-status.ts`
- Create: `backend/src/shared/constants/music-tracks.ts`
- Create: `backend/src/shared/constants/limits.ts`
- Create: `backend/src/shared/constants/routes.ts`
- Test: `backend/test/unit/domain/rsvp-status.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// backend/test/unit/domain/rsvp-status.test.ts
import { describe, expect, it } from "vitest";
import { RSVP_STATUS, isRsvpStatus } from "../../../src/shared/constants/rsvp-status.js";

describe("RSVP_STATUS", () => {
  it("accepts COMING and NOT_COMING as valid statuses", () => {
    expect(isRsvpStatus(RSVP_STATUS.COMING)).toBe(true);
    expect(isRsvpStatus(RSVP_STATUS.NOT_COMING)).toBe(true);
  });

  it("rejects any other string", () => {
    expect(isRsvpStatus("MAYBE")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npx vitest run test/unit/domain/rsvp-status.test.ts`
Expected: FAIL — cannot find module `../../../src/shared/constants/rsvp-status.js`

- [ ] **Step 3: Create `backend/src/shared/constants/rsvp-status.ts`**

```typescript
export const RSVP_STATUS = {
  COMING: "COMING",
  NOT_COMING: "NOT_COMING",
} as const;

export type RsvpStatus = (typeof RSVP_STATUS)[keyof typeof RSVP_STATUS];

export function isRsvpStatus(value: string): value is RsvpStatus {
  return Object.values(RSVP_STATUS).includes(value as RsvpStatus);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npx vitest run test/unit/domain/rsvp-status.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Create `backend/src/shared/constants/music-tracks.ts`**

```typescript
export interface MusicTrack {
  id: string;
  titleKey: string;
  fileUrl: string;
  licenseUrl: string;
  source: string;
}

// Royalty-free tracks only. Add licenseUrl/source for every entry — see
// docs/superpowers/specs/2026-09-07-taklifnoma-mvp-design.md section 3a.
export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "romantic-piano",
    titleKey: "music.romanticPiano",
    fileUrl: "/assets/music/romantic-piano.mp3",
    licenseUrl: "https://pixabay.com/service/license-summary/",
    source: "Pixabay Music",
  },
  {
    id: "gentle-strings",
    titleKey: "music.gentleStrings",
    fileUrl: "/assets/music/gentle-strings.mp3",
    licenseUrl: "https://pixabay.com/service/license-summary/",
    source: "Pixabay Music",
  },
];

export function findMusicTrackById(id: string): MusicTrack | undefined {
  return MUSIC_TRACKS.find((track) => track.id === id);
}
```

- [ ] **Step 6: Create `backend/src/shared/constants/limits.ts`**

```typescript
export const LIMITS = {
  GUEST_NAME_MAX_LENGTH: 100,
  GREETING_TEXT_MAX_LENGTH: 500,
  RSVP_SUBMISSIONS_PER_MINUTE_PER_IP: 5,
  TELEGRAM_INIT_DATA_MAX_AGE_SECONDS: 86400,
} as const;
```

- [ ] **Step 7: Create `backend/src/shared/constants/routes.ts`**

```typescript
export const API_ROUTES = {
  CREATE_INVITATION: "/api/invitations",
  MY_INVITATION: "/api/invitations/me",
  MY_GUESTS: "/api/invitations/me/guests",
  PUBLIC_INVITATION_BY_SLUG: "/api/public/invitations/:slug",
  PUBLIC_RSVP: "/api/public/invitations/:slug/rsvp",
} as const;
```

- [ ] **Step 8: Commit**

```bash
git add backend/src/shared backend/test/unit/domain/rsvp-status.test.ts
git commit -m "feat: add shared constants for rsvp status, music, limits, routes"
```

---

### Task 3: Domain errors

**Files:**
- Create: `backend/src/domain/errors.ts`
- Test: `backend/test/unit/domain/errors.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// backend/test/unit/domain/errors.test.ts
import { describe, expect, it } from "vitest";
import { DomainValidationError, NotFoundError } from "../../../src/domain/errors.js";

describe("domain errors", () => {
  it("DomainValidationError carries a field and message", () => {
    const error = new DomainValidationError("groomName", "groomName is required");
    expect(error.field).toBe("groomName");
    expect(error.message).toBe("groomName is required");
    expect(error).toBeInstanceOf(Error);
  });

  it("NotFoundError carries a resource name", () => {
    const error = new NotFoundError("Invitation");
    expect(error.message).toBe("Invitation not found");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npx vitest run test/unit/domain/errors.test.ts`
Expected: FAIL — cannot find module `../../../src/domain/errors.js`

- [ ] **Step 3: Create `backend/src/domain/errors.ts`**

```typescript
export class DomainValidationError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "DomainValidationError";
    this.field = field;
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npx vitest run test/unit/domain/errors.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/src/domain/errors.ts backend/test/unit/domain/errors.test.ts
git commit -m "feat: add domain error types"
```

---

### Task 4: Domain Invitation entity — validation and slug generation

**Files:**
- Create: `backend/src/domain/invitation.ts`
- Test: `backend/test/unit/domain/invitation.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// backend/test/unit/domain/invitation.test.ts
import { describe, expect, it } from "vitest";
import { DomainValidationError } from "../../../src/domain/errors.js";
import { validateInvitationInput, slugify, type InvitationInput } from "../../../src/domain/invitation.js";

const validInput: InvitationInput = {
  groomName: "Ulug'bek",
  brideName: "Malika",
  eventDateTime: new Date("2026-11-11T17:00:00.000Z"),
  venueName: "Baxtiyor restorani",
  venueAddress: "Toshkent viloyati, Qibray tumani",
  mapUrl: "https://maps.google.com/?q=41.0,69.0",
  greetingText: "Aziz mehmonlar!",
  musicTrackId: "romantic-piano",
};

describe("validateInvitationInput", () => {
  it("accepts a fully valid input", () => {
    expect(() => validateInvitationInput(validInput)).not.toThrow();
  });

  it.each([
    ["groomName", { ...validInput, groomName: "" }],
    ["brideName", { ...validInput, brideName: "  " }],
    ["venueName", { ...validInput, venueName: "" }],
    ["venueAddress", { ...validInput, venueAddress: "" }],
    ["musicTrackId", { ...validInput, musicTrackId: "" }],
  ])("rejects empty %s", (field, input) => {
    try {
      validateInvitationInput(input as InvitationInput);
      throw new Error("expected validateInvitationInput to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainValidationError);
      expect((error as DomainValidationError).field).toBe(field);
    }
  });

  it("rejects an invalid eventDateTime", () => {
    try {
      validateInvitationInput({ ...validInput, eventDateTime: new Date("not-a-date") });
      throw new Error("expected validateInvitationInput to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainValidationError);
      expect((error as DomainValidationError).field).toBe("eventDateTime");
    }
  });
});

describe("slugify", () => {
  it("builds a lowercase hyphenated slug from both names", () => {
    expect(slugify("Ulug'bek", "Malika")) .toBe("ulugbek-malika");
  });

  it("strips characters that are not letters, digits or hyphens", () => {
    expect(slugify("Anna!!", "John Doe")).toBe("anna-john-doe");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx vitest run test/unit/domain/invitation.test.ts`
Expected: FAIL — cannot find module `../../../src/domain/invitation.js`

- [ ] **Step 3: Create `backend/src/domain/invitation.ts`**

```typescript
import { DomainValidationError } from "./errors.js";

export interface InvitationInput {
  groomName: string;
  brideName: string;
  eventDateTime: Date;
  venueName: string;
  venueAddress: string;
  mapUrl?: string;
  greetingText?: string;
  musicTrackId: string;
}

export interface Invitation extends InvitationInput {
  id: string;
  slug: string;
  ownerTelegramId: bigint;
  ownerChatId: bigint;
  createdAt: Date;
  updatedAt: Date;
}

const REQUIRED_STRING_FIELDS: Array<keyof InvitationInput> = [
  "groomName",
  "brideName",
  "venueName",
  "venueAddress",
  "musicTrackId",
];

export function validateInvitationInput(input: InvitationInput): void {
  for (const field of REQUIRED_STRING_FIELDS) {
    const value = input[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new DomainValidationError(field, `${field} is required`);
    }
  }

  if (Number.isNaN(input.eventDateTime.getTime())) {
    throw new DomainValidationError("eventDateTime", "eventDateTime must be a valid date");
  }
}

export function slugify(groomName: string, brideName: string): string {
  const clean = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  return `${clean(groomName)}-${clean(brideName)}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && npx vitest run test/unit/domain/invitation.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/src/domain/invitation.ts backend/test/unit/domain/invitation.test.ts
git commit -m "feat: add Invitation domain entity with validation and slugify"
```

---

### Task 5: Domain RsvpResponse entity — validation

**Files:**
- Create: `backend/src/domain/rsvp-response.ts`
- Test: `backend/test/unit/domain/rsvp-response.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// backend/test/unit/domain/rsvp-response.test.ts
import { describe, expect, it } from "vitest";
import { DomainValidationError } from "../../../src/domain/errors.js";
import { validateRsvpInput, type RsvpInput } from "../../../src/domain/rsvp-response.js";

describe("validateRsvpInput", () => {
  it("accepts a valid COMING response", () => {
    const input: RsvpInput = { guestName: "Aziza", status: "COMING" };
    expect(() => validateRsvpInput(input)).not.toThrow();
  });

  it("rejects an empty guest name", () => {
    try {
      validateRsvpInput({ guestName: "  ", status: "COMING" });
      throw new Error("expected validateRsvpInput to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainValidationError);
      expect((error as DomainValidationError).field).toBe("guestName");
    }
  });

  it("rejects a guest name longer than the configured limit", () => {
    const tooLong = "a".repeat(101);
    try {
      validateRsvpInput({ guestName: tooLong, status: "COMING" });
      throw new Error("expected validateRsvpInput to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainValidationError);
      expect((error as DomainValidationError).field).toBe("guestName");
    }
  });

  it("rejects an invalid status", () => {
    try {
      validateRsvpInput({ guestName: "Aziza", status: "MAYBE" });
      throw new Error("expected validateRsvpInput to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainValidationError);
      expect((error as DomainValidationError).field).toBe("status");
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx vitest run test/unit/domain/rsvp-response.test.ts`
Expected: FAIL — cannot find module `../../../src/domain/rsvp-response.js`

- [ ] **Step 3: Create `backend/src/domain/rsvp-response.ts`**

```typescript
import { DomainValidationError } from "./errors.js";
import { isRsvpStatus, type RsvpStatus } from "../shared/constants/rsvp-status.js";
import { LIMITS } from "../shared/constants/limits.js";

export interface RsvpInput {
  guestName: string;
  status: string;
}

export interface RsvpResponse {
  id: string;
  invitationId: string;
  guestName: string;
  status: RsvpStatus;
  respondedAt: Date;
}

export function validateRsvpInput(input: RsvpInput): void {
  const name = input.guestName.trim();

  if (name.length === 0) {
    throw new DomainValidationError("guestName", "guestName is required");
  }

  if (name.length > LIMITS.GUEST_NAME_MAX_LENGTH) {
    throw new DomainValidationError(
      "guestName",
      `guestName must be at most ${LIMITS.GUEST_NAME_MAX_LENGTH} characters`,
    );
  }

  if (!isRsvpStatus(input.status)) {
    throw new DomainValidationError("status", "status must be COMING or NOT_COMING");
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && npx vitest run test/unit/domain/rsvp-response.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/src/domain/rsvp-response.ts backend/test/unit/domain/rsvp-response.test.ts
git commit -m "feat: add RsvpResponse domain entity with validation"
```

---

### Task 6: Application ports

Pure interfaces — no behavior to unit test here; correctness is verified when
the fakes (Task 7) and Prisma implementations (Tasks 12-13) are checked
against them by the TypeScript compiler.

**Files:**
- Create: `backend/src/application/ports/invitation-repository.ts`
- Create: `backend/src/application/ports/rsvp-repository.ts`
- Create: `backend/src/application/ports/owner-notifier.ts`

- [ ] **Step 1: Create `backend/src/application/ports/invitation-repository.ts`**

```typescript
import type { Invitation, InvitationInput } from "../../domain/invitation.js";

export interface InvitationRepository {
  create(input: InvitationInput & { slug: string; ownerTelegramId: bigint; ownerChatId: bigint }): Promise<Invitation>;
  findByOwnerTelegramId(ownerTelegramId: bigint): Promise<Invitation | null>;
  findBySlug(slug: string): Promise<Invitation | null>;
  slugExists(slug: string): Promise<boolean>;
  update(id: string, input: Partial<InvitationInput>): Promise<Invitation>;
}
```

- [ ] **Step 2: Create `backend/src/application/ports/rsvp-repository.ts`**

```typescript
import type { RsvpInput } from "../../domain/rsvp-response.js";
import type { RsvpResponse } from "../../domain/rsvp-response.js";

export interface RsvpRepository {
  create(invitationId: string, input: RsvpInput): Promise<RsvpResponse>;
  listByInvitationId(invitationId: string): Promise<RsvpResponse[]>;
}
```

- [ ] **Step 3: Create `backend/src/application/ports/owner-notifier.ts`**

```typescript
import type { RsvpResponse } from "../../domain/rsvp-response.js";

export interface OwnerNotifier {
  notifyNewRsvp(ownerChatId: bigint, rsvp: RsvpResponse): Promise<void>;
}
```

- [ ] **Step 4: Verify the project still type-checks**

Run: `cd backend && npx tsc --noEmit -p tsconfig.json`
Expected: no errors (these files only reference domain types that already compile).

- [ ] **Step 5: Commit**

```bash
git add backend/src/application/ports
git commit -m "feat: define application ports for repositories and notifier"
```

---

### Task 7: In-memory test fakes for the repositories and notifier

**Files:**
- Create: `backend/test/helpers/in-memory-invitation-repository.ts`
- Create: `backend/test/helpers/in-memory-rsvp-repository.ts`
- Create: `backend/test/helpers/fake-owner-notifier.ts`
- Test: `backend/test/unit/application/in-memory-invitation-repository.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// backend/test/unit/application/in-memory-invitation-repository.test.ts
import { describe, expect, it } from "vitest";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";

const baseInput = {
  groomName: "Ulug'bek",
  brideName: "Malika",
  eventDateTime: new Date("2026-11-11T17:00:00.000Z"),
  venueName: "Baxtiyor restorani",
  venueAddress: "Toshkent viloyati",
  musicTrackId: "romantic-piano",
  slug: "ulugbek-malika",
  ownerTelegramId: 111n,
  ownerChatId: 111n,
};

describe("InMemoryInvitationRepository", () => {
  it("creates and finds an invitation by owner telegram id", async () => {
    const repo = new InMemoryInvitationRepository();
    const created = await repo.create(baseInput);

    const found = await repo.findByOwnerTelegramId(111n);

    expect(found?.id).toBe(created.id);
  });

  it("reports slugExists correctly", async () => {
    const repo = new InMemoryInvitationRepository();
    await repo.create(baseInput);

    expect(await repo.slugExists("ulugbek-malika")).toBe(true);
    expect(await repo.slugExists("someone-else")).toBe(false);
  });

  it("updates only the provided fields", async () => {
    const repo = new InMemoryInvitationRepository();
    const created = await repo.create(baseInput);

    const updated = await repo.update(created.id, { venueName: "New Hall" });

    expect(updated.venueName).toBe("New Hall");
    expect(updated.brideName).toBe("Malika");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npx vitest run test/unit/application/in-memory-invitation-repository.test.ts`
Expected: FAIL — cannot find module `../../helpers/in-memory-invitation-repository.js`

- [ ] **Step 3: Create `backend/test/helpers/in-memory-invitation-repository.ts`**

```typescript
import { randomUUID } from "node:crypto";
import type { InvitationRepository } from "../../src/application/ports/invitation-repository.js";
import type { Invitation, InvitationInput } from "../../src/domain/invitation.js";

type CreateArgs = InvitationInput & { slug: string; ownerTelegramId: bigint; ownerChatId: bigint };

export class InMemoryInvitationRepository implements InvitationRepository {
  private readonly invitations = new Map<string, Invitation>();

  async create(input: CreateArgs): Promise<Invitation> {
    const now = new Date();
    const invitation: Invitation = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
    this.invitations.set(invitation.id, invitation);
    return invitation;
  }

  async findByOwnerTelegramId(ownerTelegramId: bigint): Promise<Invitation | null> {
    for (const invitation of this.invitations.values()) {
      if (invitation.ownerTelegramId === ownerTelegramId) return invitation;
    }
    return null;
  }

  async findBySlug(slug: string): Promise<Invitation | null> {
    for (const invitation of this.invitations.values()) {
      if (invitation.slug === slug) return invitation;
    }
    return null;
  }

  async slugExists(slug: string): Promise<boolean> {
    return (await this.findBySlug(slug)) !== null;
  }

  async update(id: string, input: Partial<InvitationInput>): Promise<Invitation> {
    const existing = this.invitations.get(id);
    if (!existing) throw new Error(`Invitation ${id} not found in fake repository`);

    const updated: Invitation = { ...existing, ...input, updatedAt: new Date() };
    this.invitations.set(id, updated);
    return updated;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npx vitest run test/unit/application/in-memory-invitation-repository.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Create `backend/test/helpers/in-memory-rsvp-repository.ts`**

```typescript
import { randomUUID } from "node:crypto";
import type { RsvpRepository } from "../../src/application/ports/rsvp-repository.js";
import type { RsvpInput, RsvpResponse } from "../../src/domain/rsvp-response.js";
import { RSVP_STATUS, type RsvpStatus } from "../../src/shared/constants/rsvp-status.js";

export class InMemoryRsvpRepository implements RsvpRepository {
  private readonly responses: RsvpResponse[] = [];

  async create(invitationId: string, input: RsvpInput): Promise<RsvpResponse> {
    const response: RsvpResponse = {
      id: randomUUID(),
      invitationId,
      guestName: input.guestName.trim(),
      status: (input.status as RsvpStatus) ?? RSVP_STATUS.COMING,
      respondedAt: new Date(),
    };
    this.responses.push(response);
    return response;
  }

  async listByInvitationId(invitationId: string): Promise<RsvpResponse[]> {
    return this.responses.filter((response) => response.invitationId === invitationId);
  }
}
```

- [ ] **Step 6: Create `backend/test/helpers/fake-owner-notifier.ts`**

```typescript
import type { OwnerNotifier } from "../../src/application/ports/owner-notifier.js";
import type { RsvpResponse } from "../../src/domain/rsvp-response.js";

export class FakeOwnerNotifier implements OwnerNotifier {
  readonly notifications: Array<{ ownerChatId: bigint; rsvp: RsvpResponse }> = [];

  async notifyNewRsvp(ownerChatId: bigint, rsvp: RsvpResponse): Promise<void> {
    this.notifications.push({ ownerChatId, rsvp });
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add backend/test/helpers backend/test/unit/application/in-memory-invitation-repository.test.ts
git commit -m "test: add in-memory fakes for repositories and owner notifier"
```

---

### Task 8: CreateInvitation use-case

**Files:**
- Create: `backend/src/application/use-cases/create-invitation.ts`
- Test: `backend/test/unit/application/create-invitation.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// backend/test/unit/application/create-invitation.test.ts
import { describe, expect, it } from "vitest";
import { CreateInvitationUseCase } from "../../../src/application/use-cases/create-invitation.js";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";
import { DomainValidationError, ConflictError } from "../../../src/domain/errors.js";

const validInput = {
  groomName: "Ulug'bek",
  brideName: "Malika",
  eventDateTime: new Date("2026-11-11T17:00:00.000Z"),
  venueName: "Baxtiyor restorani",
  venueAddress: "Toshkent viloyati",
  musicTrackId: "romantic-piano",
};

describe("CreateInvitationUseCase", () => {
  it("creates an invitation with a slug derived from both names", async () => {
    const repo = new InMemoryInvitationRepository();
    const useCase = new CreateInvitationUseCase(repo);

    const invitation = await useCase.execute({
      ownerTelegramId: 1n,
      ownerChatId: 1n,
      input: validInput,
    });

    expect(invitation.slug).toBe("ulugbek-malika");
    expect(invitation.ownerTelegramId).toBe(1n);
  });

  it("appends a numeric suffix when the slug is already taken", async () => {
    const repo = new InMemoryInvitationRepository();
    const useCase = new CreateInvitationUseCase(repo);

    await useCase.execute({ ownerTelegramId: 1n, ownerChatId: 1n, input: validInput });
    const second = await useCase.execute({ ownerTelegramId: 2n, ownerChatId: 2n, input: validInput });

    expect(second.slug).toBe("ulugbek-malika-2");
  });

  it("throws ConflictError when the owner already has an invitation", async () => {
    const repo = new InMemoryInvitationRepository();
    const useCase = new CreateInvitationUseCase(repo);

    await useCase.execute({ ownerTelegramId: 1n, ownerChatId: 1n, input: validInput });

    await expect(
      useCase.execute({ ownerTelegramId: 1n, ownerChatId: 1n, input: validInput }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("throws DomainValidationError for invalid input without touching the repository", async () => {
    const repo = new InMemoryInvitationRepository();
    const useCase = new CreateInvitationUseCase(repo);

    await expect(
      useCase.execute({
        ownerTelegramId: 1n,
        ownerChatId: 1n,
        input: { ...validInput, groomName: "" },
      }),
    ).rejects.toBeInstanceOf(DomainValidationError);

    expect(await repo.findByOwnerTelegramId(1n)).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx vitest run test/unit/application/create-invitation.test.ts`
Expected: FAIL — cannot find module `../../../src/application/use-cases/create-invitation.js`

- [ ] **Step 3: Create `backend/src/application/use-cases/create-invitation.ts`**

```typescript
import type { InvitationRepository } from "../ports/invitation-repository.js";
import type { Invitation, InvitationInput } from "../../domain/invitation.js";
import { validateInvitationInput, slugify } from "../../domain/invitation.js";
import { ConflictError } from "../../domain/errors.js";

export interface CreateInvitationRequest {
  ownerTelegramId: bigint;
  ownerChatId: bigint;
  input: InvitationInput;
}

export class CreateInvitationUseCase {
  constructor(private readonly invitations: InvitationRepository) {}

  async execute(request: CreateInvitationRequest): Promise<Invitation> {
    validateInvitationInput(request.input);

    const existing = await this.invitations.findByOwnerTelegramId(request.ownerTelegramId);
    if (existing) {
      throw new ConflictError("This Telegram account already has an invitation");
    }

    const slug = await this.generateUniqueSlug(request.input.groomName, request.input.brideName);

    return this.invitations.create({
      ...request.input,
      slug,
      ownerTelegramId: request.ownerTelegramId,
      ownerChatId: request.ownerChatId,
    });
  }

  private async generateUniqueSlug(groomName: string, brideName: string): Promise<string> {
    const base = slugify(groomName, brideName);
    let candidate = base;
    let suffix = 1;

    while (await this.invitations.slugExists(candidate)) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }

    return candidate;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && npx vitest run test/unit/application/create-invitation.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/src/application/use-cases/create-invitation.ts backend/test/unit/application/create-invitation.test.ts
git commit -m "feat: add CreateInvitation use-case"
```

---

### Task 9: GetMyInvitation and GetInvitationBySlug use-cases

**Files:**
- Create: `backend/src/application/use-cases/get-my-invitation.ts`
- Create: `backend/src/application/use-cases/get-invitation-by-slug.ts`
- Test: `backend/test/unit/application/get-invitation.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// backend/test/unit/application/get-invitation.test.ts
import { describe, expect, it } from "vitest";
import { GetMyInvitationUseCase } from "../../../src/application/use-cases/get-my-invitation.js";
import { GetInvitationBySlugUseCase } from "../../../src/application/use-cases/get-invitation-by-slug.js";
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

describe("GetMyInvitationUseCase", () => {
  it("returns the invitation owned by the given telegram id", async () => {
    const repo = new InMemoryInvitationRepository();
    await repo.create(baseInput);
    const useCase = new GetMyInvitationUseCase(repo);

    const invitation = await useCase.execute(1n);

    expect(invitation.slug).toBe("ulugbek-malika");
  });

  it("throws NotFoundError when the owner has no invitation", async () => {
    const repo = new InMemoryInvitationRepository();
    const useCase = new GetMyInvitationUseCase(repo);

    await expect(useCase.execute(999n)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("GetInvitationBySlugUseCase", () => {
  it("returns the invitation matching the slug", async () => {
    const repo = new InMemoryInvitationRepository();
    await repo.create(baseInput);
    const useCase = new GetInvitationBySlugUseCase(repo);

    const invitation = await useCase.execute("ulugbek-malika");

    expect(invitation.ownerTelegramId).toBe(1n);
  });

  it("throws NotFoundError for an unknown slug", async () => {
    const repo = new InMemoryInvitationRepository();
    const useCase = new GetInvitationBySlugUseCase(repo);

    await expect(useCase.execute("unknown-slug")).rejects.toBeInstanceOf(NotFoundError);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx vitest run test/unit/application/get-invitation.test.ts`
Expected: FAIL — cannot find modules for `get-my-invitation.js` / `get-invitation-by-slug.js`

- [ ] **Step 3: Create `backend/src/application/use-cases/get-my-invitation.ts`**

```typescript
import type { InvitationRepository } from "../ports/invitation-repository.js";
import type { Invitation } from "../../domain/invitation.js";
import { NotFoundError } from "../../domain/errors.js";

export class GetMyInvitationUseCase {
  constructor(private readonly invitations: InvitationRepository) {}

  async execute(ownerTelegramId: bigint): Promise<Invitation> {
    const invitation = await this.invitations.findByOwnerTelegramId(ownerTelegramId);
    if (!invitation) throw new NotFoundError("Invitation");
    return invitation;
  }
}
```

- [ ] **Step 4: Create `backend/src/application/use-cases/get-invitation-by-slug.ts`**

```typescript
import type { InvitationRepository } from "../ports/invitation-repository.js";
import type { Invitation } from "../../domain/invitation.js";
import { NotFoundError } from "../../domain/errors.js";

export class GetInvitationBySlugUseCase {
  constructor(private readonly invitations: InvitationRepository) {}

  async execute(slug: string): Promise<Invitation> {
    const invitation = await this.invitations.findBySlug(slug);
    if (!invitation) throw new NotFoundError("Invitation");
    return invitation;
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd backend && npx vitest run test/unit/application/get-invitation.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add backend/src/application/use-cases/get-my-invitation.ts backend/src/application/use-cases/get-invitation-by-slug.ts backend/test/unit/application/get-invitation.test.ts
git commit -m "feat: add GetMyInvitation and GetInvitationBySlug use-cases"
```

---

### Task 10: UpdateInvitation use-case

**Files:**
- Create: `backend/src/application/use-cases/update-invitation.ts`
- Test: `backend/test/unit/application/update-invitation.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// backend/test/unit/application/update-invitation.test.ts
import { describe, expect, it } from "vitest";
import { UpdateInvitationUseCase } from "../../../src/application/use-cases/update-invitation.js";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";
import { NotFoundError, DomainValidationError } from "../../../src/domain/errors.js";

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

describe("UpdateInvitationUseCase", () => {
  it("updates the invitation owned by the given telegram id", async () => {
    const repo = new InMemoryInvitationRepository();
    await repo.create(baseInput);
    const useCase = new UpdateInvitationUseCase(repo);

    const updated = await useCase.execute({
      ownerTelegramId: 1n,
      input: { venueName: "New Hall" },
    });

    expect(updated.venueName).toBe("New Hall");
    expect(updated.brideName).toBe("Malika");
  });

  it("throws NotFoundError when the owner has no invitation", async () => {
    const repo = new InMemoryInvitationRepository();
    const useCase = new UpdateInvitationUseCase(repo);

    await expect(
      useCase.execute({ ownerTelegramId: 999n, input: { venueName: "New Hall" } }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws DomainValidationError when the merged result is invalid", async () => {
    const repo = new InMemoryInvitationRepository();
    await repo.create(baseInput);
    const useCase = new UpdateInvitationUseCase(repo);

    await expect(
      useCase.execute({ ownerTelegramId: 1n, input: { venueName: "" } }),
    ).rejects.toBeInstanceOf(DomainValidationError);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx vitest run test/unit/application/update-invitation.test.ts`
Expected: FAIL — cannot find module `../../../src/application/use-cases/update-invitation.js`

- [ ] **Step 3: Create `backend/src/application/use-cases/update-invitation.ts`**

```typescript
import type { InvitationRepository } from "../ports/invitation-repository.js";
import type { Invitation, InvitationInput } from "../../domain/invitation.js";
import { validateInvitationInput } from "../../domain/invitation.js";
import { NotFoundError } from "../../domain/errors.js";

export interface UpdateInvitationRequest {
  ownerTelegramId: bigint;
  input: Partial<InvitationInput>;
}

export class UpdateInvitationUseCase {
  constructor(private readonly invitations: InvitationRepository) {}

  async execute(request: UpdateInvitationRequest): Promise<Invitation> {
    const existing = await this.invitations.findByOwnerTelegramId(request.ownerTelegramId);
    if (!existing) throw new NotFoundError("Invitation");

    const merged: InvitationInput = { ...existing, ...request.input };
    validateInvitationInput(merged);

    return this.invitations.update(existing.id, request.input);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && npx vitest run test/unit/application/update-invitation.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/src/application/use-cases/update-invitation.ts backend/test/unit/application/update-invitation.test.ts
git commit -m "feat: add UpdateInvitation use-case"
```

---

### Task 11: SubmitRsvp use-case

**Files:**
- Create: `backend/src/application/use-cases/submit-rsvp.ts`
- Test: `backend/test/unit/application/submit-rsvp.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// backend/test/unit/application/submit-rsvp.test.ts
import { describe, expect, it } from "vitest";
import { SubmitRsvpUseCase } from "../../../src/application/use-cases/submit-rsvp.js";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";
import { InMemoryRsvpRepository } from "../../helpers/in-memory-rsvp-repository.js";
import { FakeOwnerNotifier } from "../../helpers/fake-owner-notifier.js";
import { NotFoundError, DomainValidationError } from "../../../src/domain/errors.js";

const baseInvitation = {
  groomName: "Ulug'bek",
  brideName: "Malika",
  eventDateTime: new Date("2026-11-11T17:00:00.000Z"),
  venueName: "Baxtiyor restorani",
  venueAddress: "Toshkent viloyati",
  musicTrackId: "romantic-piano",
  slug: "ulugbek-malika",
  ownerTelegramId: 1n,
  ownerChatId: 42n,
};

function buildUseCase() {
  const invitations = new InMemoryInvitationRepository();
  const rsvps = new InMemoryRsvpRepository();
  const notifier = new FakeOwnerNotifier();
  const useCase = new SubmitRsvpUseCase(invitations, rsvps, notifier);
  return { invitations, rsvps, notifier, useCase };
}

describe("SubmitRsvpUseCase", () => {
  it("stores the RSVP against the invitation and notifies the owner", async () => {
    const { invitations, rsvps, notifier, useCase } = buildUseCase();
    await invitations.create(baseInvitation);

    const rsvp = await useCase.execute({
      slug: "ulugbek-malika",
      input: { guestName: "Aziza", status: "COMING" },
    });

    expect(rsvp.guestName).toBe("Aziza");
    expect(await rsvps.listByInvitationId(rsvp.invitationId)).toHaveLength(1);
    expect(notifier.notifications).toHaveLength(1);
    expect(notifier.notifications[0]?.ownerChatId).toBe(42n);
  });

  it("throws NotFoundError for an unknown slug", async () => {
    const { useCase } = buildUseCase();

    await expect(
      useCase.execute({ slug: "unknown", input: { guestName: "Aziza", status: "COMING" } }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws DomainValidationError for invalid input without notifying anyone", async () => {
    const { invitations, notifier, useCase } = buildUseCase();
    await invitations.create(baseInvitation);

    await expect(
      useCase.execute({ slug: "ulugbek-malika", input: { guestName: "", status: "COMING" } }),
    ).rejects.toBeInstanceOf(DomainValidationError);

    expect(notifier.notifications).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx vitest run test/unit/application/submit-rsvp.test.ts`
Expected: FAIL — cannot find module `../../../src/application/use-cases/submit-rsvp.js`

- [ ] **Step 3: Create `backend/src/application/use-cases/submit-rsvp.ts`**

```typescript
import type { InvitationRepository } from "../ports/invitation-repository.js";
import type { RsvpRepository } from "../ports/rsvp-repository.js";
import type { OwnerNotifier } from "../ports/owner-notifier.js";
import type { RsvpInput, RsvpResponse } from "../../domain/rsvp-response.js";
import { validateRsvpInput } from "../../domain/rsvp-response.js";
import { NotFoundError } from "../../domain/errors.js";

export interface SubmitRsvpRequest {
  slug: string;
  input: RsvpInput;
}

export class SubmitRsvpUseCase {
  constructor(
    private readonly invitations: InvitationRepository,
    private readonly rsvps: RsvpRepository,
    private readonly notifier: OwnerNotifier,
  ) {}

  async execute(request: SubmitRsvpRequest): Promise<RsvpResponse> {
    validateRsvpInput(request.input);

    const invitation = await this.invitations.findBySlug(request.slug);
    if (!invitation) throw new NotFoundError("Invitation");

    const rsvp = await this.rsvps.create(invitation.id, request.input);
    await this.notifier.notifyNewRsvp(invitation.ownerChatId, rsvp);

    return rsvp;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && npx vitest run test/unit/application/submit-rsvp.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/src/application/use-cases/submit-rsvp.ts backend/test/unit/application/submit-rsvp.test.ts
git commit -m "feat: add SubmitRsvp use-case"
```

---

### Task 12: ListGuests use-case

**Files:**
- Create: `backend/src/application/use-cases/list-guests.ts`
- Test: `backend/test/unit/application/list-guests.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// backend/test/unit/application/list-guests.test.ts
import { describe, expect, it } from "vitest";
import { ListGuestsUseCase } from "../../../src/application/use-cases/list-guests.js";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";
import { InMemoryRsvpRepository } from "../../helpers/in-memory-rsvp-repository.js";
import { NotFoundError } from "../../../src/domain/errors.js";

const baseInvitation = {
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

describe("ListGuestsUseCase", () => {
  it("returns an empty list when nobody has responded yet", async () => {
    const invitations = new InMemoryInvitationRepository();
    await invitations.create(baseInvitation);
    const rsvps = new InMemoryRsvpRepository();
    const useCase = new ListGuestsUseCase(invitations, rsvps);

    expect(await useCase.execute(1n)).toEqual([]);
  });

  it("returns all responses for the owner's invitation", async () => {
    const invitations = new InMemoryInvitationRepository();
    const invitation = await invitations.create(baseInvitation);
    const rsvps = new InMemoryRsvpRepository();
    await rsvps.create(invitation.id, { guestName: "Aziza", status: "COMING" });
    await rsvps.create(invitation.id, { guestName: "Bek", status: "NOT_COMING" });
    const useCase = new ListGuestsUseCase(invitations, rsvps);

    const guests = await useCase.execute(1n);

    expect(guests.map((g) => g.guestName).sort()).toEqual(["Aziza", "Bek"]);
  });

  it("throws NotFoundError when the owner has no invitation", async () => {
    const invitations = new InMemoryInvitationRepository();
    const rsvps = new InMemoryRsvpRepository();
    const useCase = new ListGuestsUseCase(invitations, rsvps);

    await expect(useCase.execute(999n)).rejects.toBeInstanceOf(NotFoundError);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx vitest run test/unit/application/list-guests.test.ts`
Expected: FAIL — cannot find module `../../../src/application/use-cases/list-guests.js`

- [ ] **Step 3: Create `backend/src/application/use-cases/list-guests.ts`**

```typescript
import type { InvitationRepository } from "../ports/invitation-repository.js";
import type { RsvpRepository } from "../ports/rsvp-repository.js";
import type { RsvpResponse } from "../../domain/rsvp-response.js";
import { NotFoundError } from "../../domain/errors.js";

export class ListGuestsUseCase {
  constructor(
    private readonly invitations: InvitationRepository,
    private readonly rsvps: RsvpRepository,
  ) {}

  async execute(ownerTelegramId: bigint): Promise<RsvpResponse[]> {
    const invitation = await this.invitations.findByOwnerTelegramId(ownerTelegramId);
    if (!invitation) throw new NotFoundError("Invitation");

    return this.rsvps.listByInvitationId(invitation.id);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && npx vitest run test/unit/application/list-guests.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/src/application/use-cases/list-guests.ts backend/test/unit/application/list-guests.test.ts
git commit -m "feat: add ListGuests use-case"
```

---

### Task 13: Prisma client and integration test setup helper

**Files:**
- Create: `backend/src/infrastructure/db/prisma-client.ts`
- Create: `backend/test/integration/setup.ts`

- [ ] **Step 1: Create `backend/src/infrastructure/db/prisma-client.ts`**

```typescript
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

- [ ] **Step 2: Create `backend/test/integration/setup.ts`**

This must be the **first** import in every integration test file — it points
Prisma at a disposable test database file before anything else touches
`process.env.DATABASE_URL`, and exposes a helper to wipe tables between tests.

```typescript
import { execSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.join(__dirname, "..", "..");
export const TEST_DB_PATH = path.join(BACKEND_ROOT, "prisma", "test.db");

process.env.DATABASE_URL = `file:${TEST_DB_PATH}`;

export function resetTestDatabase(): void {
  if (existsSync(TEST_DB_PATH)) unlinkSync(TEST_DB_PATH);
  execSync("npx prisma migrate deploy", {
    cwd: BACKEND_ROOT,
    env: process.env,
    stdio: "ignore",
  });
}

export async function clearTestDatabaseTables(): Promise<void> {
  const { prisma } = await import("../../src/infrastructure/db/prisma-client.js");
  await prisma.rsvpResponse.deleteMany();
  await prisma.invitation.deleteMany();
}
```

- [ ] **Step 3: Add `test.db*` to `backend/.gitignore`**

```
node_modules/
dist/
.env
prisma/dev.db
prisma/dev.db-journal
prisma/test.db
prisma/test.db-journal
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/infrastructure/db/prisma-client.ts backend/test/integration/setup.ts backend/.gitignore
git commit -m "chore: add Prisma client and integration test database setup"
```

---

### Task 14: PrismaInvitationRepository

**Files:**
- Create: `backend/src/infrastructure/repositories/prisma-invitation-repository.ts`
- Test: `backend/test/integration/repositories/prisma-invitation-repository.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// backend/test/integration/repositories/prisma-invitation-repository.test.ts
import "../setup.js";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resetTestDatabase, clearTestDatabaseTables } from "../setup.js";
import { PrismaInvitationRepository } from "../../../src/infrastructure/repositories/prisma-invitation-repository.js";

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

describe("PrismaInvitationRepository", () => {
  beforeAll(() => {
    resetTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabaseTables();
  });

  it("persists and retrieves an invitation by slug", async () => {
    const repo = new PrismaInvitationRepository();
    await repo.create(baseInput);

    const found = await repo.findBySlug("ulugbek-malika");

    expect(found?.groomName).toBe("Ulug'bek");
    expect(found?.mapUrl).toBeUndefined();
  });

  it("updates fields and returns the merged row", async () => {
    const repo = new PrismaInvitationRepository();
    const created = await repo.create(baseInput);

    const updated = await repo.update(created.id, { venueName: "New Hall" });

    expect(updated.venueName).toBe("New Hall");
  });

  it("rejects a second invitation for the same owner telegram id", async () => {
    const repo = new PrismaInvitationRepository();
    await repo.create(baseInput);

    await expect(repo.create({ ...baseInput, slug: "someone-else" })).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx vitest run test/integration/repositories/prisma-invitation-repository.test.ts`
Expected: FAIL — cannot find module `.../prisma-invitation-repository.js`

- [ ] **Step 3: Create `backend/src/infrastructure/repositories/prisma-invitation-repository.ts`**

```typescript
import type { Invitation as PrismaInvitationRow } from "@prisma/client";
import { prisma } from "../db/prisma-client.js";
import type { InvitationRepository } from "../../application/ports/invitation-repository.js";
import type { Invitation, InvitationInput } from "../../domain/invitation.js";

type CreateArgs = InvitationInput & { slug: string; ownerTelegramId: bigint; ownerChatId: bigint };

function toDomain(row: PrismaInvitationRow): Invitation {
  return {
    id: row.id,
    slug: row.slug,
    ownerTelegramId: row.ownerTelegramId,
    ownerChatId: row.ownerChatId,
    groomName: row.groomName,
    brideName: row.brideName,
    eventDateTime: row.eventDateTime,
    venueName: row.venueName,
    venueAddress: row.venueAddress,
    mapUrl: row.mapUrl ?? undefined,
    greetingText: row.greetingText ?? undefined,
    musicTrackId: row.musicTrackId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaInvitationRepository implements InvitationRepository {
  async create(input: CreateArgs): Promise<Invitation> {
    const row = await prisma.invitation.create({ data: { ...input } });
    return toDomain(row);
  }

  async findByOwnerTelegramId(ownerTelegramId: bigint): Promise<Invitation | null> {
    const row = await prisma.invitation.findUnique({ where: { ownerTelegramId } });
    return row ? toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<Invitation | null> {
    const row = await prisma.invitation.findUnique({ where: { slug } });
    return row ? toDomain(row) : null;
  }

  async slugExists(slug: string): Promise<boolean> {
    const count = await prisma.invitation.count({ where: { slug } });
    return count > 0;
  }

  async update(id: string, input: Partial<InvitationInput>): Promise<Invitation> {
    const row = await prisma.invitation.update({ where: { id }, data: input });
    return toDomain(row);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && npx vitest run test/integration/repositories/prisma-invitation-repository.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/src/infrastructure/repositories/prisma-invitation-repository.ts backend/test/integration/repositories/prisma-invitation-repository.test.ts
git commit -m "feat: add PrismaInvitationRepository"
```

---

### Task 15: PrismaRsvpRepository

**Files:**
- Create: `backend/src/infrastructure/repositories/prisma-rsvp-repository.ts`
- Test: `backend/test/integration/repositories/prisma-rsvp-repository.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// backend/test/integration/repositories/prisma-rsvp-repository.test.ts
import "../setup.js";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resetTestDatabase, clearTestDatabaseTables } from "../setup.js";
import { prisma } from "../../../src/infrastructure/db/prisma-client.js";
import { PrismaRsvpRepository } from "../../../src/infrastructure/repositories/prisma-rsvp-repository.js";

async function createTestInvitation() {
  return prisma.invitation.create({
    data: {
      groomName: "Ulug'bek",
      brideName: "Malika",
      eventDateTime: new Date("2026-11-11T17:00:00.000Z"),
      venueName: "Baxtiyor restorani",
      venueAddress: "Toshkent viloyati",
      musicTrackId: "romantic-piano",
      slug: "ulugbek-malika",
      ownerTelegramId: 1n,
      ownerChatId: 1n,
    },
  });
}

describe("PrismaRsvpRepository", () => {
  beforeAll(() => {
    resetTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabaseTables();
  });

  it("creates a response linked to the invitation", async () => {
    const invitation = await createTestInvitation();
    const repo = new PrismaRsvpRepository();

    const rsvp = await repo.create(invitation.id, { guestName: "Aziza", status: "COMING" });

    expect(rsvp.invitationId).toBe(invitation.id);
    expect(rsvp.status).toBe("COMING");
  });

  it("lists responses in the order they were submitted", async () => {
    const invitation = await createTestInvitation();
    const repo = new PrismaRsvpRepository();
    await repo.create(invitation.id, { guestName: "Aziza", status: "COMING" });
    await repo.create(invitation.id, { guestName: "Bek", status: "NOT_COMING" });

    const list = await repo.listByInvitationId(invitation.id);

    expect(list.map((r) => r.guestName)).toEqual(["Aziza", "Bek"]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx vitest run test/integration/repositories/prisma-rsvp-repository.test.ts`
Expected: FAIL — cannot find module `.../prisma-rsvp-repository.js`

- [ ] **Step 3: Create `backend/src/infrastructure/repositories/prisma-rsvp-repository.ts`**

```typescript
import type { RsvpResponse as PrismaRsvpRow } from "@prisma/client";
import { prisma } from "../db/prisma-client.js";
import type { RsvpRepository } from "../../application/ports/rsvp-repository.js";
import type { RsvpInput, RsvpResponse } from "../../domain/rsvp-response.js";
import type { RsvpStatus } from "../../shared/constants/rsvp-status.js";

function toDomain(row: PrismaRsvpRow): RsvpResponse {
  return {
    id: row.id,
    invitationId: row.invitationId,
    guestName: row.guestName,
    status: row.status as RsvpStatus,
    respondedAt: row.respondedAt,
  };
}

export class PrismaRsvpRepository implements RsvpRepository {
  async create(invitationId: string, input: RsvpInput): Promise<RsvpResponse> {
    const row = await prisma.rsvpResponse.create({
      data: { invitationId, guestName: input.guestName.trim(), status: input.status },
    });
    return toDomain(row);
  }

  async listByInvitationId(invitationId: string): Promise<RsvpResponse[]> {
    const rows = await prisma.rsvpResponse.findMany({
      where: { invitationId },
      orderBy: { respondedAt: "asc" },
    });
    return rows.map(toDomain);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && npx vitest run test/integration/repositories/prisma-rsvp-repository.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/src/infrastructure/repositories/prisma-rsvp-repository.ts backend/test/integration/repositories/prisma-rsvp-repository.test.ts
git commit -m "feat: add PrismaRsvpRepository"
```

---

### Task 16: ConsoleOwnerNotifier stub

A real Telegram-sending implementation is added in the Bot plan (Plan 3),
once the bot process exists. For now the backend needs a working
`OwnerNotifier` so `SubmitRsvpUseCase` can run end-to-end locally.

**Files:**
- Create: `backend/src/infrastructure/notifications/console-owner-notifier.ts`
- Test: `backend/test/unit/infrastructure/console-owner-notifier.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// backend/test/unit/infrastructure/console-owner-notifier.test.ts
import { describe, expect, it, vi } from "vitest";
import { ConsoleOwnerNotifier } from "../../../src/infrastructure/notifications/console-owner-notifier.js";

describe("ConsoleOwnerNotifier", () => {
  it("logs the chat id and guest name so a developer can see it locally", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const notifier = new ConsoleOwnerNotifier();

    await notifier.notifyNewRsvp(42n, {
      id: "rsvp-1",
      invitationId: "inv-1",
      guestName: "Aziza",
      status: "COMING",
      respondedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("42"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Aziza"));
    logSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npx vitest run test/unit/infrastructure/console-owner-notifier.test.ts`
Expected: FAIL — cannot find module `.../console-owner-notifier.js`

- [ ] **Step 3: Create `backend/src/infrastructure/notifications/console-owner-notifier.ts`**

```typescript
import type { OwnerNotifier } from "../../application/ports/owner-notifier.js";
import type { RsvpResponse } from "../../domain/rsvp-response.js";

export class ConsoleOwnerNotifier implements OwnerNotifier {
  async notifyNewRsvp(ownerChatId: bigint, rsvp: RsvpResponse): Promise<void> {
    console.log(`[RSVP] chatId=${ownerChatId} guest=${rsvp.guestName} status=${rsvp.status}`);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npx vitest run test/unit/infrastructure/console-owner-notifier.test.ts`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add backend/src/infrastructure/notifications/console-owner-notifier.ts backend/test/unit/infrastructure/console-owner-notifier.test.ts
git commit -m "feat: add ConsoleOwnerNotifier stub for local development"
```

---

### Task 17: Telegram `initData` validator

Implements Telegram's documented WebApp launch-data validation algorithm:
HMAC-SHA256("WebAppData", botToken) as secret key, then HMAC-SHA256(secret,
sorted "key=value" pairs joined by "\n") must equal the `hash` field.

**Files:**
- Create: `backend/src/infrastructure/auth/telegram-init-data-validator.ts`
- Create: `backend/test/helpers/sign-init-data.ts`
- Test: `backend/test/unit/infrastructure/telegram-init-data-validator.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// backend/test/unit/infrastructure/telegram-init-data-validator.test.ts
import { describe, expect, it } from "vitest";
import { validateTelegramInitData } from "../../../src/infrastructure/auth/telegram-init-data-validator.js";
import { signInitData } from "../../helpers/sign-init-data.js";

const BOT_TOKEN = "test-bot-token";

describe("validateTelegramInitData", () => {
  it("accepts data signed with the matching bot token", () => {
    const initData = signInitData(BOT_TOKEN, {
      auth_date: String(Math.floor(Date.now() / 1000)),
      user: JSON.stringify({ id: 12345 }),
    });

    const result = validateTelegramInitData(initData, BOT_TOKEN);

    expect(result.isValid).toBe(true);
    expect(result.telegramId).toBe(12345n);
  });

  it("rejects data signed with a different bot token", () => {
    const initData = signInitData("other-token", {
      auth_date: String(Math.floor(Date.now() / 1000)),
      user: JSON.stringify({ id: 12345 }),
    });

    expect(validateTelegramInitData(initData, BOT_TOKEN).isValid).toBe(false);
  });

  it("rejects tampered fields", () => {
    const initData = signInitData(BOT_TOKEN, {
      auth_date: String(Math.floor(Date.now() / 1000)),
      user: JSON.stringify({ id: 12345 }),
    });
    const tampered = initData.replace("12345", "99999");

    expect(validateTelegramInitData(tampered, BOT_TOKEN).isValid).toBe(false);
  });

  it("rejects data older than the configured max age", () => {
    const oneWeekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
    const initData = signInitData(BOT_TOKEN, {
      auth_date: String(oneWeekAgo),
      user: JSON.stringify({ id: 12345 }),
    });

    expect(validateTelegramInitData(initData, BOT_TOKEN).isValid).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx vitest run test/unit/infrastructure/telegram-init-data-validator.test.ts`
Expected: FAIL — cannot find modules `telegram-init-data-validator.js` and `sign-init-data.js`

- [ ] **Step 3: Create `backend/test/helpers/sign-init-data.ts`**

```typescript
import { createHmac } from "node:crypto";

export function signInitData(botToken: string, fields: Record<string, string>): string {
  const dataCheckString = Object.entries(fields)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const hash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  const params = new URLSearchParams({ ...fields, hash });
  return params.toString();
}
```

- [ ] **Step 4: Create `backend/src/infrastructure/auth/telegram-init-data-validator.ts`**

```typescript
import { createHmac } from "node:crypto";
import { LIMITS } from "../../shared/constants/limits.js";

export interface TelegramInitDataResult {
  isValid: boolean;
  telegramId?: bigint;
}

export function validateTelegramInitData(initData: string, botToken: string): TelegramInitDataResult {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { isValid: false };
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (computedHash !== hash) return { isValid: false };

  const authDate = Number(params.get("auth_date"));
  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
  if (!Number.isFinite(authDate) || ageSeconds > LIMITS.TELEGRAM_INIT_DATA_MAX_AGE_SECONDS) {
    return { isValid: false };
  }

  const userJson = params.get("user");
  if (!userJson) return { isValid: false };

  const user = JSON.parse(userJson) as { id: number };
  return { isValid: true, telegramId: BigInt(user.id) };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd backend && npx vitest run test/unit/infrastructure/telegram-init-data-validator.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add backend/src/infrastructure/auth/telegram-init-data-validator.ts backend/test/helpers/sign-init-data.ts backend/test/unit/infrastructure/telegram-init-data-validator.test.ts
git commit -m "feat: add Telegram initData HMAC validator"
```

---

### Task 18: Fastify app factory, auth preHandler, error handler

**Files:**
- Create: `backend/src/presentation/plugins/auth-plugin.ts`
- Create: `backend/src/presentation/error-handler.ts`
- Create: `backend/src/presentation/app.ts`
- Create: `backend/src/presentation/types.ts`
- Test: `backend/test/integration/routes/app-error-handling.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// backend/test/integration/routes/app-error-handling.test.ts
import { describe, expect, it } from "vitest";
import { buildApp } from "../../../src/presentation/app.js";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";
import { InMemoryRsvpRepository } from "../../helpers/in-memory-rsvp-repository.js";
import { FakeOwnerNotifier } from "../../helpers/fake-owner-notifier.js";

function buildTestApp() {
  return buildApp({
    invitationRepository: new InMemoryInvitationRepository(),
    rsvpRepository: new InMemoryRsvpRepository(),
    ownerNotifier: new FakeOwnerNotifier(),
    botToken: "test-bot-token",
  });
}

describe("app error handling", () => {
  it("returns 401 when the Authorization header is missing on a protected route", async () => {
    const app = buildTestApp();

    const response = await app.inject({ method: "GET", url: "/api/invitations/me" });

    expect(response.statusCode).toBe(401);
  });

  it("returns 404 with a JSON body for an unknown public invitation", async () => {
    const app = buildTestApp();

    const response = await app.inject({ method: "GET", url: "/api/public/invitations/unknown-slug" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "Invitation not found" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npx vitest run test/integration/routes/app-error-handling.test.ts`
Expected: FAIL — cannot find module `../../../src/presentation/app.js`

- [ ] **Step 3: Create `backend/src/presentation/types.ts`**

```typescript
import type { InvitationRepository } from "../application/ports/invitation-repository.js";
import type { RsvpRepository } from "../application/ports/rsvp-repository.js";
import type { OwnerNotifier } from "../application/ports/owner-notifier.js";

export interface AppDependencies {
  invitationRepository: InvitationRepository;
  rsvpRepository: RsvpRepository;
  ownerNotifier: OwnerNotifier;
  botToken: string;
}

declare module "fastify" {
  interface FastifyRequest {
    ownerTelegramId?: bigint;
  }
}
```

- [ ] **Step 4: Create `backend/src/presentation/plugins/auth-plugin.ts`**

```typescript
import type { FastifyReply, FastifyRequest } from "fastify";
import { validateTelegramInitData } from "../../infrastructure/auth/telegram-init-data-validator.js";

export function createTelegramAuthPreHandler(botToken: string) {
  return async function telegramAuthPreHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const header = request.headers.authorization;
    if (!header || !header.startsWith("tma ")) {
      reply.code(401).send({ error: "Missing Telegram authorization" });
      return;
    }

    const result = validateTelegramInitData(header.slice("tma ".length), botToken);
    if (!result.isValid || result.telegramId === undefined) {
      reply.code(401).send({ error: "Invalid Telegram authorization" });
      return;
    }

    request.ownerTelegramId = result.telegramId;
  };
}
```

- [ ] **Step 5: Create `backend/src/presentation/error-handler.ts`**

```typescript
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { DomainValidationError, NotFoundError, ConflictError } from "../domain/errors.js";

export function handleError(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply): void {
  if (error instanceof DomainValidationError) {
    reply.code(400).send({ error: error.message, field: error.field });
    return;
  }

  if (error instanceof NotFoundError) {
    reply.code(404).send({ error: error.message });
    return;
  }

  if (error instanceof ConflictError) {
    reply.code(409).send({ error: error.message });
    return;
  }

  request.log.error(error);
  reply.code(500).send({ error: "Internal server error" });
}
```

- [ ] **Step 6: Create `backend/src/presentation/app.ts`**

```typescript
import Fastify, { type FastifyInstance } from "fastify";
import type { AppDependencies } from "./types.js";
import { handleError } from "./error-handler.js";
import { registerInvitationsRoutes } from "./routes/invitations.js";
import { registerPublicInvitationsRoutes } from "./routes/public-invitations.js";

export function buildApp(deps: AppDependencies): FastifyInstance {
  const app = Fastify({ logger: false });

  app.setErrorHandler(handleError);

  app.register(async (instance) => registerInvitationsRoutes(instance, deps));
  app.register(async (instance) => registerPublicInvitationsRoutes(instance, deps));

  return app;
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `cd backend && npx vitest run test/integration/routes/app-error-handling.test.ts`
Expected: still FAIL at this point — `routes/invitations.js` and `routes/public-invitations.js` do not exist yet. That is expected; they are built in Tasks 19-20. Do not commit until Task 20 makes this test pass.

- [ ] **Step 8: Commit the scaffolding pieces that already compile on their own**

```bash
git add backend/src/presentation/types.ts backend/src/presentation/plugins/auth-plugin.ts backend/src/presentation/error-handler.ts
git commit -m "feat: add app dependencies type, Telegram auth preHandler, and error handler"
```

---

### Task 19: Invitation serializers and protected `/api/invitations*` routes

`bigint` and `Date` values are not directly JSON-serializable the way we want
them (Fastify's default JSON serializer throws on `bigint`), so every route
converts domain objects through a serializer before sending a response.

**Files:**
- Create: `backend/src/presentation/serializers.ts`
- Create: `backend/src/presentation/routes/invitations.ts`
- Test: `backend/test/integration/routes/invitations.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// backend/test/integration/routes/invitations.test.ts
import { describe, expect, it } from "vitest";
import { buildApp } from "../../../src/presentation/app.js";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";
import { InMemoryRsvpRepository } from "../../helpers/in-memory-rsvp-repository.js";
import { FakeOwnerNotifier } from "../../helpers/fake-owner-notifier.js";
import { signInitData } from "../../helpers/sign-init-data.js";

const BOT_TOKEN = "test-bot-token";

function authHeader(telegramId: number) {
  const initData = signInitData(BOT_TOKEN, {
    auth_date: String(Math.floor(Date.now() / 1000)),
    user: JSON.stringify({ id: telegramId }),
  });
  return `tma ${initData}`;
}

function buildTestApp() {
  return buildApp({
    invitationRepository: new InMemoryInvitationRepository(),
    rsvpRepository: new InMemoryRsvpRepository(),
    ownerNotifier: new FakeOwnerNotifier(),
    botToken: BOT_TOKEN,
  });
}

const validPayload = {
  groomName: "Ulug'bek",
  brideName: "Malika",
  eventDateTime: "2026-11-11T17:00:00.000Z",
  venueName: "Baxtiyor restorani",
  venueAddress: "Toshkent viloyati",
  musicTrackId: "romantic-piano",
};

describe("POST /api/invitations", () => {
  it("creates an invitation and returns 201 with a JSON-safe body", async () => {
    const app = buildTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/invitations",
      headers: { authorization: authHeader(1), "content-type": "application/json" },
      payload: validPayload,
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.slug).toBe("ulugbek-malika");
    expect(typeof body.ownerTelegramId).toBe("string");
  });

  it("returns 400 for invalid input", async () => {
    const app = buildTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/invitations",
      headers: { authorization: authHeader(1), "content-type": "application/json" },
      payload: { ...validPayload, groomName: "" },
    });

    expect(response.statusCode).toBe(400);
  });
});

describe("GET/PUT /api/invitations/me", () => {
  it("returns the owner's invitation after creation, and updates it", async () => {
    const app = buildTestApp();
    await app.inject({
      method: "POST",
      url: "/api/invitations",
      headers: { authorization: authHeader(2), "content-type": "application/json" },
      payload: validPayload,
    });

    const getResponse = await app.inject({
      method: "GET",
      url: "/api/invitations/me",
      headers: { authorization: authHeader(2) },
    });
    expect(getResponse.json().venueName).toBe("Baxtiyor restorani");

    const putResponse = await app.inject({
      method: "PUT",
      url: "/api/invitations/me",
      headers: { authorization: authHeader(2), "content-type": "application/json" },
      payload: { venueName: "New Hall" },
    });
    expect(putResponse.json().venueName).toBe("New Hall");
  });
});

describe("GET /api/invitations/me/guests", () => {
  it("returns an empty array when nobody has responded yet", async () => {
    const app = buildTestApp();
    await app.inject({
      method: "POST",
      url: "/api/invitations",
      headers: { authorization: authHeader(3), "content-type": "application/json" },
      payload: validPayload,
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/invitations/me/guests",
      headers: { authorization: authHeader(3) },
    });

    expect(response.json()).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx vitest run test/integration/routes/invitations.test.ts`
Expected: FAIL — cannot find module `../../../src/presentation/routes/invitations.js`

- [ ] **Step 3: Create `backend/src/presentation/serializers.ts`**

```typescript
import type { Invitation } from "../domain/invitation.js";
import type { RsvpResponse } from "../domain/rsvp-response.js";

export function serializeInvitation(invitation: Invitation) {
  return {
    id: invitation.id,
    slug: invitation.slug,
    ownerTelegramId: invitation.ownerTelegramId.toString(),
    ownerChatId: invitation.ownerChatId.toString(),
    groomName: invitation.groomName,
    brideName: invitation.brideName,
    eventDateTime: invitation.eventDateTime.toISOString(),
    venueName: invitation.venueName,
    venueAddress: invitation.venueAddress,
    mapUrl: invitation.mapUrl ?? null,
    greetingText: invitation.greetingText ?? null,
    musicTrackId: invitation.musicTrackId,
    createdAt: invitation.createdAt.toISOString(),
    updatedAt: invitation.updatedAt.toISOString(),
  };
}

export function serializeGuest(rsvp: RsvpResponse) {
  return {
    id: rsvp.id,
    guestName: rsvp.guestName,
    status: rsvp.status,
    respondedAt: rsvp.respondedAt.toISOString(),
  };
}
```

- [ ] **Step 4: Create `backend/src/presentation/routes/invitations.ts`**

```typescript
import type { FastifyInstance } from "fastify";
import { API_ROUTES } from "../../shared/constants/routes.js";
import { createTelegramAuthPreHandler } from "../plugins/auth-plugin.js";
import { serializeInvitation, serializeGuest } from "../serializers.js";
import { CreateInvitationUseCase } from "../../application/use-cases/create-invitation.js";
import { GetMyInvitationUseCase } from "../../application/use-cases/get-my-invitation.js";
import { UpdateInvitationUseCase } from "../../application/use-cases/update-invitation.js";
import { ListGuestsUseCase } from "../../application/use-cases/list-guests.js";
import type { AppDependencies } from "../types.js";
import type { InvitationInput } from "../../domain/invitation.js";

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function toInvitationInput(body: Record<string, unknown>): InvitationInput {
  return {
    groomName: String(body.groomName ?? ""),
    brideName: String(body.brideName ?? ""),
    eventDateTime: new Date(String(body.eventDateTime ?? "")),
    venueName: String(body.venueName ?? ""),
    venueAddress: String(body.venueAddress ?? ""),
    mapUrl: readOptionalString(body.mapUrl),
    greetingText: readOptionalString(body.greetingText),
    musicTrackId: String(body.musicTrackId ?? ""),
  };
}

function toPartialInvitationInput(body: Record<string, unknown>): Partial<InvitationInput> {
  const partial: Partial<InvitationInput> = {};
  if ("groomName" in body) partial.groomName = String(body.groomName);
  if ("brideName" in body) partial.brideName = String(body.brideName);
  if ("eventDateTime" in body) partial.eventDateTime = new Date(String(body.eventDateTime));
  if ("venueName" in body) partial.venueName = String(body.venueName);
  if ("venueAddress" in body) partial.venueAddress = String(body.venueAddress);
  if ("mapUrl" in body) partial.mapUrl = readOptionalString(body.mapUrl);
  if ("greetingText" in body) partial.greetingText = readOptionalString(body.greetingText);
  if ("musicTrackId" in body) partial.musicTrackId = String(body.musicTrackId);
  return partial;
}

export async function registerInvitationsRoutes(app: FastifyInstance, deps: AppDependencies): Promise<void> {
  const auth = createTelegramAuthPreHandler(deps.botToken);
  const createInvitation = new CreateInvitationUseCase(deps.invitationRepository);
  const getMyInvitation = new GetMyInvitationUseCase(deps.invitationRepository);
  const updateInvitation = new UpdateInvitationUseCase(deps.invitationRepository);
  const listGuests = new ListGuestsUseCase(deps.invitationRepository, deps.rsvpRepository);

  app.post(API_ROUTES.CREATE_INVITATION, { preHandler: auth }, async (request, reply) => {
    const ownerTelegramId = request.ownerTelegramId!;
    const invitation = await createInvitation.execute({
      ownerTelegramId,
      ownerChatId: ownerTelegramId, // private chat id equals the user's telegram id
      input: toInvitationInput(request.body as Record<string, unknown>),
    });
    reply.code(201).send(serializeInvitation(invitation));
  });

  app.get(API_ROUTES.MY_INVITATION, { preHandler: auth }, async (request, reply) => {
    const invitation = await getMyInvitation.execute(request.ownerTelegramId!);
    reply.send(serializeInvitation(invitation));
  });

  app.put(API_ROUTES.MY_INVITATION, { preHandler: auth }, async (request, reply) => {
    const invitation = await updateInvitation.execute({
      ownerTelegramId: request.ownerTelegramId!,
      input: toPartialInvitationInput(request.body as Record<string, unknown>),
    });
    reply.send(serializeInvitation(invitation));
  });

  app.get(API_ROUTES.MY_GUESTS, { preHandler: auth }, async (request, reply) => {
    const guests = await listGuests.execute(request.ownerTelegramId!);
    reply.send(guests.map(serializeGuest));
  });
}
```

- [ ] **Step 5: Run tests — expect the app-error-handling test to still fail here**

Run: `cd backend && npx vitest run test/integration/routes/invitations.test.ts`
Expected: FAIL — `app.ts` also imports `./routes/public-invitations.js`, which does not exist until Task 20. Continue to Task 20 before running the suite again.

---

### Task 20: Public routes — `GET /api/public/invitations/:slug` and RSVP submission

**Files:**
- Create: `backend/src/infrastructure/rate-limiter.ts`
- Create: `backend/src/presentation/routes/public-invitations.ts`
- Test: `backend/test/unit/infrastructure/rate-limiter.test.ts`
- Test: `backend/test/integration/routes/public-invitations.test.ts`

- [ ] **Step 1: Write the failing rate limiter test**

```typescript
// backend/test/unit/infrastructure/rate-limiter.test.ts
import { describe, expect, it, vi } from "vitest";
import { InMemoryRateLimiter } from "../../../src/infrastructure/rate-limiter.js";

describe("InMemoryRateLimiter", () => {
  it("allows requests up to the limit and blocks the next one", () => {
    const limiter = new InMemoryRateLimiter(2, 60_000);

    expect(limiter.isAllowed("1.2.3.4")).toBe(true);
    expect(limiter.isAllowed("1.2.3.4")).toBe(true);
    expect(limiter.isAllowed("1.2.3.4")).toBe(false);
  });

  it("tracks each key independently", () => {
    const limiter = new InMemoryRateLimiter(1, 60_000);

    expect(limiter.isAllowed("a")).toBe(true);
    expect(limiter.isAllowed("b")).toBe(true);
  });

  it("allows requests again after the window passes", () => {
    vi.useFakeTimers();
    const limiter = new InMemoryRateLimiter(1, 1_000);

    expect(limiter.isAllowed("1.2.3.4")).toBe(true);
    expect(limiter.isAllowed("1.2.3.4")).toBe(false);

    vi.advanceTimersByTime(1_001);
    expect(limiter.isAllowed("1.2.3.4")).toBe(true);
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npx vitest run test/unit/infrastructure/rate-limiter.test.ts`
Expected: FAIL — cannot find module `.../rate-limiter.js`

- [ ] **Step 3: Create `backend/src/infrastructure/rate-limiter.ts`**

```typescript
export class InMemoryRateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly maxHits: number,
    private readonly windowMs: number,
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const recentHits = (this.hits.get(key) ?? []).filter((timestamp) => now - timestamp < this.windowMs);

    if (recentHits.length >= this.maxHits) {
      this.hits.set(key, recentHits);
      return false;
    }

    recentHits.push(now);
    this.hits.set(key, recentHits);
    return true;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npx vitest run test/unit/infrastructure/rate-limiter.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Write the failing public routes tests**

```typescript
// backend/test/integration/routes/public-invitations.test.ts
import { describe, expect, it } from "vitest";
import { buildApp } from "../../../src/presentation/app.js";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";
import { InMemoryRsvpRepository } from "../../helpers/in-memory-rsvp-repository.js";
import { FakeOwnerNotifier } from "../../helpers/fake-owner-notifier.js";

const baseInvitation = {
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

function buildTestApp(invitationRepository: InMemoryInvitationRepository, notifier: FakeOwnerNotifier) {
  return buildApp({
    invitationRepository,
    rsvpRepository: new InMemoryRsvpRepository(),
    ownerNotifier: notifier,
    botToken: "test-bot-token",
  });
}

describe("GET /api/public/invitations/:slug", () => {
  it("returns the invitation without exposing owner ids as numbers", async () => {
    const invitations = new InMemoryInvitationRepository();
    await invitations.create(baseInvitation);
    const app = buildTestApp(invitations, new FakeOwnerNotifier());

    const response = await app.inject({ method: "GET", url: "/api/public/invitations/ulugbek-malika" });

    expect(response.statusCode).toBe(200);
    expect(response.json().groomName).toBe("Ulug'bek");
  });

  it("returns 404 for an unknown slug", async () => {
    const app = buildTestApp(new InMemoryInvitationRepository(), new FakeOwnerNotifier());

    const response = await app.inject({ method: "GET", url: "/api/public/invitations/unknown" });

    expect(response.statusCode).toBe(404);
  });
});

describe("POST /api/public/invitations/:slug/rsvp", () => {
  it("stores the RSVP and notifies the owner", async () => {
    const invitations = new InMemoryInvitationRepository();
    await invitations.create(baseInvitation);
    const notifier = new FakeOwnerNotifier();
    const app = buildTestApp(invitations, notifier);

    const response = await app.inject({
      method: "POST",
      url: "/api/public/invitations/ulugbek-malika/rsvp",
      headers: { "content-type": "application/json" },
      payload: { guestName: "Aziza", status: "COMING" },
    });

    expect(response.statusCode).toBe(201);
    expect(notifier.notifications).toHaveLength(1);
  });

  it("returns 429 after exceeding the per-IP rate limit", async () => {
    const invitations = new InMemoryInvitationRepository();
    await invitations.create(baseInvitation);
    const app = buildTestApp(invitations, new FakeOwnerNotifier());
    const limit = 5;

    for (let i = 0; i < limit; i += 1) {
      await app.inject({
        method: "POST",
        url: "/api/public/invitations/ulugbek-malika/rsvp",
        headers: { "content-type": "application/json", "x-forwarded-for": "9.9.9.9" },
        payload: { guestName: `Guest ${i}`, status: "COMING" },
      });
    }

    const response = await app.inject({
      method: "POST",
      url: "/api/public/invitations/ulugbek-malika/rsvp",
      headers: { "content-type": "application/json", "x-forwarded-for": "9.9.9.9" },
      payload: { guestName: "One too many", status: "COMING" },
    });

    expect(response.statusCode).toBe(429);
  });
});
```

- [ ] **Step 6: Run tests to verify they fail**

Run: `cd backend && npx vitest run test/integration/routes/public-invitations.test.ts`
Expected: FAIL — cannot find module `.../routes/public-invitations.js`

- [ ] **Step 7: Create `backend/src/presentation/routes/public-invitations.ts`**

```typescript
import type { FastifyInstance } from "fastify";
import { API_ROUTES } from "../../shared/constants/routes.js";
import { LIMITS } from "../../shared/constants/limits.js";
import { serializeInvitation } from "../serializers.js";
import { GetInvitationBySlugUseCase } from "../../application/use-cases/get-invitation-by-slug.js";
import { SubmitRsvpUseCase } from "../../application/use-cases/submit-rsvp.js";
import { InMemoryRateLimiter } from "../../infrastructure/rate-limiter.js";
import type { AppDependencies } from "../types.js";

export async function registerPublicInvitationsRoutes(app: FastifyInstance, deps: AppDependencies): Promise<void> {
  const getInvitationBySlug = new GetInvitationBySlugUseCase(deps.invitationRepository);
  const submitRsvp = new SubmitRsvpUseCase(deps.invitationRepository, deps.rsvpRepository, deps.ownerNotifier);
  const rateLimiter = new InMemoryRateLimiter(LIMITS.RSVP_SUBMISSIONS_PER_MINUTE_PER_IP, 60_000);

  app.get(API_ROUTES.PUBLIC_INVITATION_BY_SLUG, async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const invitation = await getInvitationBySlug.execute(slug);
    reply.send(serializeInvitation(invitation));
  });

  app.post(API_ROUTES.PUBLIC_RSVP, async (request, reply) => {
    if (!rateLimiter.isAllowed(request.ip)) {
      reply.code(429).send({ error: "Too many RSVP submissions, please try again later" });
      return;
    }

    const { slug } = request.params as { slug: string };
    const body = request.body as Record<string, unknown>;
    const rsvp = await submitRsvp.execute({
      slug,
      input: { guestName: String(body.guestName ?? ""), status: String(body.status ?? "") },
    });
    reply.code(201).send({ id: rsvp.id, status: rsvp.status });
  });
}
```

- [ ] **Step 8: Run every backend test to verify everything now passes**

Run: `cd backend && npm test`
Expected: PASS — all unit and integration test files, including
`app-error-handling.test.ts` and `invitations.test.ts` from Tasks 18-19.

- [ ] **Step 9: Commit**

```bash
git add backend/src/infrastructure/rate-limiter.ts backend/src/presentation
git add backend/test/unit/infrastructure/rate-limiter.test.ts backend/test/integration/routes
git commit -m "feat: add public invitation routes, RSVP rate limiting, and wire up the Fastify app"
```

---

### Task 21: Environment config and server entrypoint

**Files:**
- Create: `backend/src/presentation/env-config.ts`
- Create: `backend/src/presentation/server.ts`
- Create: `backend/.env.example`
- Modify: `backend/.env`
- Test: `backend/test/unit/presentation/env-config.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// backend/test/unit/presentation/env-config.test.ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadEnvConfig } from "../../../src/presentation/env-config.js";

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
    expect(() => loadEnvConfig()).toThrow("TELEGRAM_BOT_TOKEN");
  });

  it("defaults PORT to 3000 when not set", () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    delete process.env.PORT;

    expect(loadEnvConfig().port).toBe(3000);
  });

  it("parses a custom PORT", () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.PORT = "4000";

    expect(loadEnvConfig().port).toBe(4000);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx vitest run test/unit/presentation/env-config.test.ts`
Expected: FAIL — cannot find module `.../env-config.js`

- [ ] **Step 3: Create `backend/src/presentation/env-config.ts`**

```typescript
export interface EnvConfig {
  botToken: string;
  port: number;
}

export function loadEnvConfig(): EnvConfig {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN environment variable is required");
  }

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  if (Number.isNaN(port)) {
    throw new Error("PORT environment variable must be a number");
  }

  return { botToken, port };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && npx vitest run test/unit/presentation/env-config.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Create `backend/src/presentation/server.ts`**

```typescript
import { buildApp } from "./app.js";
import { loadEnvConfig } from "./env-config.js";
import { PrismaInvitationRepository } from "../infrastructure/repositories/prisma-invitation-repository.js";
import { PrismaRsvpRepository } from "../infrastructure/repositories/prisma-rsvp-repository.js";
import { ConsoleOwnerNotifier } from "../infrastructure/notifications/console-owner-notifier.js";

const config = loadEnvConfig();

const app = buildApp({
  invitationRepository: new PrismaInvitationRepository(),
  rsvpRepository: new PrismaRsvpRepository(),
  ownerNotifier: new ConsoleOwnerNotifier(),
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

- [ ] **Step 6: Create `backend/.env.example`**

```
DATABASE_URL="file:./dev.db"
TELEGRAM_BOT_TOKEN="replace-with-a-real-bot-token-from-BotFather"
PORT=3000
```

- [ ] **Step 7: Update `backend/.env`** (add the two new keys next to the existing `DATABASE_URL`)

```
DATABASE_URL="file:./dev.db"
TELEGRAM_BOT_TOKEN="replace-with-a-real-bot-token-from-BotFather"
PORT=3000
```

- [ ] **Step 8: Start the server manually and confirm it boots**

Run: `cd backend && npm run dev`
Expected: console prints `Backend listening on port 3000`. Stop it with Ctrl+C before continuing.

- [ ] **Step 9: Commit**

```bash
git add backend/src/presentation/env-config.ts backend/src/presentation/server.ts backend/.env.example
git add backend/test/unit/presentation/env-config.test.ts
git commit -m "feat: add env config loader and server entrypoint"
```

---

### Task 22: End-to-end integration test against the real database

Every earlier route test used the in-memory fakes. This final test wires the
real `PrismaInvitationRepository` and `PrismaRsvpRepository` into `buildApp`
to prove the whole stack — HTTP → use-case → Prisma → SQLite — works
together, closing the loop the MVP spec describes: create → guest views →
guest RSVPs → owner sees the guest list.

**Files:**
- Test: `backend/test/integration/end-to-end.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// backend/test/integration/end-to-end.test.ts
import "./setup.js";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resetTestDatabase, clearTestDatabaseTables } from "./setup.js";
import { buildApp } from "../../src/presentation/app.js";
import { PrismaInvitationRepository } from "../../src/infrastructure/repositories/prisma-invitation-repository.js";
import { PrismaRsvpRepository } from "../../src/infrastructure/repositories/prisma-rsvp-repository.js";
import { FakeOwnerNotifier } from "../helpers/fake-owner-notifier.js";
import { signInitData } from "../helpers/sign-init-data.js";

const BOT_TOKEN = "test-bot-token";

function authHeader(telegramId: number) {
  const initData = signInitData(BOT_TOKEN, {
    auth_date: String(Math.floor(Date.now() / 1000)),
    user: JSON.stringify({ id: telegramId }),
  });
  return `tma ${initData}`;
}

describe("end-to-end: create invitation, guest RSVPs, owner sees guest list", () => {
  beforeAll(() => {
    resetTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabaseTables();
  });

  it("covers the full MVP flow through real Prisma repositories", async () => {
    const notifier = new FakeOwnerNotifier();
    const app = buildApp({
      invitationRepository: new PrismaInvitationRepository(),
      rsvpRepository: new PrismaRsvpRepository(),
      ownerNotifier: notifier,
      botToken: BOT_TOKEN,
    });

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/invitations",
      headers: { authorization: authHeader(777), "content-type": "application/json" },
      payload: {
        groomName: "Sardor",
        brideName: "Nilufar",
        eventDateTime: "2026-12-05T16:00:00.000Z",
        venueName: "Sun Palace",
        venueAddress: "Andijon",
        musicTrackId: "gentle-strings",
      },
    });
    expect(createResponse.statusCode).toBe(201);
    const slug = createResponse.json().slug as string;

    const publicResponse = await app.inject({ method: "GET", url: `/api/public/invitations/${slug}` });
    expect(publicResponse.statusCode).toBe(200);
    expect(publicResponse.json().groomName).toBe("Sardor");

    const rsvpResponse = await app.inject({
      method: "POST",
      url: `/api/public/invitations/${slug}/rsvp`,
      headers: { "content-type": "application/json" },
      payload: { guestName: "Kamola", status: "COMING" },
    });
    expect(rsvpResponse.statusCode).toBe(201);
    expect(notifier.notifications).toHaveLength(1);

    const guestsResponse = await app.inject({
      method: "GET",
      url: "/api/invitations/me/guests",
      headers: { authorization: authHeader(777) },
    });
    expect(guestsResponse.json()).toEqual([
      expect.objectContaining({ guestName: "Kamola", status: "COMING" }),
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npx vitest run test/integration/end-to-end.test.ts`
Expected: FAIL initially if run in isolation before `resetTestDatabase()` has ever run in this file — the `beforeAll` handles that, so the more likely failure mode before this task existed was simply "no such test file." Confirm it does run and reaches real assertions.

- [ ] **Step 3: Run the full backend test suite**

Run: `cd backend && npm test`
Expected: PASS — every unit and integration test file, including this new end-to-end test.

- [ ] **Step 4: Commit**

```bash
git add backend/test/integration/end-to-end.test.ts
git commit -m "test: add end-to-end integration test covering the full MVP flow"
```

---

## Definition of Done

- [ ] `cd backend && npm test` passes with zero failures.
- [ ] `cd backend && npx tsc --noEmit` passes with zero errors (strict mode, no `any`).
- [ ] `cd backend && npm run dev` boots the server on `PORT` and logs the listening message.
- [ ] Manually exercised with `curl` against a locally running server:
  - `curl -X GET http://localhost:3000/api/public/invitations/does-not-exist` returns HTTP 404 with `{"error":"Invitation not found"}`.
- [ ] No file under `src/domain/` imports Prisma, Fastify, or any other framework.
- [ ] No hardcoded RSVP status strings, music track data, or route paths outside `src/shared/constants/`.

## Out of scope for this plan (covered by later plans)

- Telegram Bot process (`apps/bot`) — will replace `ConsoleOwnerNotifier` with a
  real Telegram-sending `OwnerNotifier` implementation and add the `/start` command.
- Public invitation site rendering (`apps/public-site`) — will call
  `GET /api/public/invitations/:slug` and `POST .../rsvp` from a real browser page.
- Builder Mini App (`apps/miniapp`) — will call the `/api/invitations*` routes
  using the real Telegram WebApp `initData`.
- Migrating `DATABASE_URL` from SQLite to Postgres for production hosting.
