/*
  Warnings:

  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `adClip` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isAdmin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isPro` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Image_deleteHash_key";

-- DropIndex
DROP INDEX "Image_url_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Comment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Image";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Message";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "passwordHash" TEXT,
    "salt" TEXT,
    "bio" TEXT,
    "image" TEXT,
    "extensionAPIKey" TEXT
);
INSERT INTO "new_User" ("bio", "displayName", "email", "extensionAPIKey", "id", "image", "passwordHash", "salt") SELECT "bio", "displayName", "email", "extensionAPIKey", "id", "image", "passwordHash", "salt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_extensionAPIKey_key" ON "User"("extensionAPIKey");
CREATE INDEX "User_email_idx" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ScheduleItem_stationId_idx" ON "ScheduleItem"("stationId");

-- CreateIndex
CREATE INDEX "ScheduleItem_videoId_idx" ON "ScheduleItem"("videoId");

-- CreateIndex
CREATE INDEX "ScheduleItem_dayOfWeek_startTime_idx" ON "ScheduleItem"("dayOfWeek", "startTime");

-- CreateIndex
CREATE INDEX "Station_userId_idx" ON "Station"("userId");

-- CreateIndex
CREATE INDEX "Station_isPublic_idx" ON "Station"("isPublic");

-- CreateIndex
CREATE INDEX "Station_name_idx" ON "Station"("name");

-- CreateIndex
CREATE INDEX "VideoStation_videoId_idx" ON "VideoStation"("videoId");

-- CreateIndex
CREATE INDEX "VideoStation_stationId_idx" ON "VideoStation"("stationId");

-- CreateIndex
CREATE INDEX "VideoStation_userId_idx" ON "VideoStation"("userId");
