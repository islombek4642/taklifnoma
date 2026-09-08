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
