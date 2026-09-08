-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RsvpResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invitationId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "respondedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RsvpResponse_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RsvpResponse" ("guestName", "id", "invitationId", "respondedAt", "status") SELECT "guestName", "id", "invitationId", "respondedAt", "status" FROM "RsvpResponse";
DROP TABLE "RsvpResponse";
ALTER TABLE "new_RsvpResponse" RENAME TO "RsvpResponse";
CREATE INDEX "RsvpResponse_invitationId_idx" ON "RsvpResponse"("invitationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
