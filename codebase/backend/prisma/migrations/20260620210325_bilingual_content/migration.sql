/*
  Warnings:

  - You are about to drop the column `aiFull` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `aiHeadings` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `aiSummary` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `narrationScript` on the `Article` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "fullContent" TEXT NOT NULL,
    "aiTitleEn" TEXT,
    "aiTitleTr" TEXT,
    "aiSummaryEn" TEXT,
    "aiSummaryTr" TEXT,
    "aiHeadingsEn" TEXT,
    "aiHeadingsTr" TEXT,
    "aiFullEn" TEXT,
    "aiFullTr" TEXT,
    "narrationScriptEn" TEXT,
    "narrationScriptTr" TEXT,
    "author" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "enrichmentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "enrichRetries" INTEGER NOT NULL DEFAULT 0,
    "enrichLastError" TEXT,
    "enrichedAt" DATETIME,
    "contentHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Article_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Publisher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("author", "category", "contentHash", "createdAt", "date", "enrichLastError", "enrichRetries", "enrichedAt", "enrichmentStatus", "fullContent", "id", "imageUrl", "sourceId", "sourceUrl", "summary", "title", "updatedAt") SELECT "author", "category", "contentHash", "createdAt", "date", "enrichLastError", "enrichRetries", "enrichedAt", "enrichmentStatus", "fullContent", "id", "imageUrl", "sourceId", "sourceUrl", "summary", "title", "updatedAt" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE INDEX "Article_sourceId_date_idx" ON "Article"("sourceId", "date" DESC);
CREATE INDEX "Article_date_idx" ON "Article"("date" DESC);
CREATE INDEX "Article_enrichmentStatus_enrichRetries_idx" ON "Article"("enrichmentStatus", "enrichRetries");
CREATE TABLE "new_Newspaper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "readingMode" TEXT NOT NULL DEFAULT 'F',
    "columns" INTEGER NOT NULL DEFAULT 3,
    "theme" TEXT NOT NULL DEFAULT 'Light',
    "font" TEXT NOT NULL DEFAULT 'Sans-Serif (Modern Clean)',
    "language" TEXT NOT NULL DEFAULT 'en',
    "curatorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Newspaper_curatorId_fkey" FOREIGN KEY ("curatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Newspaper" ("columns", "createdAt", "curatorId", "description", "font", "id", "name", "readingMode", "slug", "theme", "updatedAt") SELECT "columns", "createdAt", "curatorId", "description", "font", "id", "name", "readingMode", "slug", "theme", "updatedAt" FROM "Newspaper";
DROP TABLE "Newspaper";
ALTER TABLE "new_Newspaper" RENAME TO "Newspaper";
CREATE UNIQUE INDEX "Newspaper_slug_key" ON "Newspaper"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
