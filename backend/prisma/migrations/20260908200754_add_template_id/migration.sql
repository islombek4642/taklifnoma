-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "ownerTelegramId" BIGINT NOT NULL,
    "ownerChatId" BIGINT NOT NULL,
    "groomName" TEXT NOT NULL,
    "brideName" TEXT NOT NULL,
    "eventDateTime" DATETIME NOT NULL,
    "venueName" TEXT NOT NULL,
    "venueAddress" TEXT NOT NULL,
    "mapUrl" TEXT,
    "greetingText" TEXT,
    "templateId" TEXT NOT NULL DEFAULT 'classic',
    "musicTrackId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Invitation" ("brideName", "createdAt", "eventDateTime", "greetingText", "groomName", "id", "mapUrl", "musicTrackId", "ownerChatId", "ownerTelegramId", "slug", "updatedAt", "venueAddress", "venueName") SELECT "brideName", "createdAt", "eventDateTime", "greetingText", "groomName", "id", "mapUrl", "musicTrackId", "ownerChatId", "ownerTelegramId", "slug", "updatedAt", "venueAddress", "venueName" FROM "Invitation";
DROP TABLE "Invitation";
ALTER TABLE "new_Invitation" RENAME TO "Invitation";
CREATE UNIQUE INDEX "Invitation_slug_key" ON "Invitation"("slug");
CREATE UNIQUE INDEX "Invitation_ownerTelegramId_key" ON "Invitation"("ownerTelegramId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
