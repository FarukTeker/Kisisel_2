-- CreateTable
CREATE TABLE "Edition" (
    "date" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ArticleEdition" (
    "editionDate" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("editionDate", "articleId"),
    CONSTRAINT "ArticleEdition_editionDate_fkey" FOREIGN KEY ("editionDate") REFERENCES "Edition" ("date") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ArticleEdition_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ArticleEdition_editionDate_idx" ON "ArticleEdition"("editionDate");
