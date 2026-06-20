-- CreateTable
CREATE TABLE "Publisher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "fullContent" TEXT NOT NULL,
    "aiSummary" TEXT,
    "aiHeadings" TEXT,
    "aiFull" TEXT,
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

-- CreateIndex
CREATE INDEX "Article_sourceId_date_idx" ON "Article"("sourceId", "date" DESC);

-- CreateIndex
CREATE INDEX "Article_date_idx" ON "Article"("date" DESC);

-- CreateIndex
CREATE INDEX "Article_enrichmentStatus_enrichRetries_idx" ON "Article"("enrichmentStatus", "enrichRetries");
