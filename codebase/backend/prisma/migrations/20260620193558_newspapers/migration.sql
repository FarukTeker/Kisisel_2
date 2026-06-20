-- CreateTable
CREATE TABLE "Newspaper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "readingMode" TEXT NOT NULL DEFAULT 'F',
    "columns" INTEGER NOT NULL DEFAULT 3,
    "theme" TEXT NOT NULL DEFAULT 'Light',
    "font" TEXT NOT NULL DEFAULT 'Sans-Serif (Modern Clean)',
    "curatorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Newspaper_curatorId_fkey" FOREIGN KEY ("curatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Widget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "newspaperId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "layoutType" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "publisherId" TEXT,
    "editorialBody" TEXT,
    "categoryFilter" TEXT,
    "layoutX" INTEGER NOT NULL DEFAULT 0,
    "layoutY" INTEGER NOT NULL DEFAULT 0,
    "layoutW" INTEGER NOT NULL DEFAULT 1,
    "layoutH" INTEGER NOT NULL DEFAULT 1,
    "layoutMinW" INTEGER NOT NULL DEFAULT 1,
    "layoutMinH" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Widget_newspaperId_fkey" FOREIGN KEY ("newspaperId") REFERENCES "Newspaper" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Newspaper_slug_key" ON "Newspaper"("slug");
