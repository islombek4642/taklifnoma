import type { RsvpResponse as PrismaRsvpRow } from "@prisma/client";
import { prisma } from "../db/prisma-client.js";
import type { RsvpRepository, RsvpUpsertResult } from "../../application/ports/rsvp-repository.js";
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

  async upsertByToken(invitationId: string, guestToken: string, input: RsvpInput): Promise<RsvpUpsertResult> {
    const existing = await prisma.rsvpResponse.findUnique({
      where: { invitationId_guestToken: { invitationId, guestToken } },
    });

    const row = await prisma.rsvpResponse.upsert({
      where: { invitationId_guestToken: { invitationId, guestToken } },
      create: { invitationId, guestToken, guestName: input.guestName.trim(), status: input.status },
      update: { guestName: input.guestName.trim(), status: input.status, respondedAt: new Date() },
    });

    return { rsvp: toDomain(row), previousStatus: existing ? (existing.status as RsvpStatus) : null };
  }

  async listByInvitationId(invitationId: string): Promise<RsvpResponse[]> {
    const rows = await prisma.rsvpResponse.findMany({
      where: { invitationId },
      orderBy: { respondedAt: "asc" },
    });
    return rows.map(toDomain);
  }
}
