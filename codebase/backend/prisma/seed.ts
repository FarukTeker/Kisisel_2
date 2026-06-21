import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Seeds a few real curator accounts (email/password) with shared newspapers so
// the Discover page has content. This is real API data — not hardcoded in the
// frontend. Safe to re-run: it upserts by email/slug and rebuilds widgets.

type SeedWidget = {
  title: string;
  kind: 'news' | 'editorial' | 'popular' | 'random';
  publisherId?: string;
  editorialBody?: string;
};

type SeedPaper = {
  slug: string;
  name: string;
  description: string;
  readingMode: 'S' | 'H' | 'F';
  curator: { name: string; email: string };
  widgets: SeedWidget[];
};

// A known-good non-overlapping 3-column react-grid-layout (mirrors the web default).
const SLOTS = [
  { x: 0, y: 0, w: 1, h: 5 },
  { x: 1, y: 0, w: 2, h: 2 },
  { x: 1, y: 2, w: 1, h: 3 },
  { x: 2, y: 2, w: 1, h: 3 },
  { x: 0, y: 5, w: 2, h: 3 },
  { x: 2, y: 5, w: 1, h: 3 },
];

function layoutTypeFor(w: SeedWidget, index: number): string {
  if (w.kind === 'editorial') return 'editorial';
  if (w.kind === 'popular' || w.kind === 'random') return 'discovery';
  return `card${(index % 6) + 1}`;
}

const PAPERS: SeedPaper[] = [
  {
    slug: 'share-ece-morning',
    name: 'Morning Signal',
    description:
      'High-signal stories, serendipity, and curator commentary to start the day.',
    readingMode: 'S',
    curator: { name: 'Ece Karaca', email: 'ece@kisisel.app' },
    widgets: [
      { title: 'Tech Lead', kind: 'news', publisherId: 'bbc-tech' },
      { title: 'Popular Picks', kind: 'popular' },
      {
        title: 'Why this matters today',
        kind: 'editorial',
        editorialBody:
          'Read these together: market optimism, the AI adoption curve, and governance gaps all point to the same speed-vs-accountability tension.',
      },
      { title: 'Science Column', kind: 'news', publisherId: 'bbc-science' },
      { title: 'Serendipity', kind: 'random' },
    ],
  },
  {
    slug: 'share-kerem-techpulse',
    name: 'Tech Pulse',
    description:
      "Daily briefing on what's shipping, what's hyped, and what actually matters in tech.",
    readingMode: 'H',
    curator: { name: 'Kerem Doğan', email: 'kerem@kisisel.app' },
    widgets: [
      { title: 'BBC Tech', kind: 'news', publisherId: 'bbc-tech' },
      { title: 'Trending Now', kind: 'popular' },
      { title: 'Guardian Tech', kind: 'news', publisherId: 'the-guardian-tech' },
      { title: 'Hacker News', kind: 'news', publisherId: 'hacker-news' },
      { title: 'TechCrunch', kind: 'news', publisherId: 'tech-today' },
    ],
  },
  {
    slug: 'share-alara-deepspace',
    name: 'Deep Space',
    description:
      'Science-heavy curation for curious minds — space, climate, and the edge of human knowledge.',
    readingMode: 'F',
    curator: { name: 'Alara Yıldız', email: 'alara@kisisel.app' },
    widgets: [
      { title: 'NASA Feature', kind: 'news', publisherId: 'nasa' },
      { title: 'Science Brief', kind: 'news', publisherId: 'bbc-science' },
      {
        title: 'Why science matters',
        kind: 'editorial',
        editorialBody: "Every story here starts with a question we haven't answered yet.",
      },
      { title: 'Science Daily', kind: 'news', publisherId: 'science-digest' },
      { title: 'Serendipity', kind: 'random' },
    ],
  },
  {
    slug: 'share-berk-headline',
    name: 'Headline Scan',
    description: 'Minimal and fast. Headlines across sources — get in, get out, be informed.',
    readingMode: 'S',
    curator: { name: 'Berk Arslan', email: 'berk@kisisel.app' },
    widgets: [
      { title: 'BBC Tech', kind: 'news', publisherId: 'bbc-tech' },
      { title: 'Popular', kind: 'popular' },
      { title: 'BBC Science', kind: 'news', publisherId: 'bbc-science' },
      { title: 'Guardian', kind: 'news', publisherId: 'the-guardian-tech' },
    ],
  },
  {
    slug: 'share-deniz-plate',
    name: 'Plate & Markets',
    description: 'Food culture and money, side by side — a lighter daily mix.',
    readingMode: 'H',
    curator: { name: 'Deniz Aydın', email: 'deniz@kisisel.app' },
    widgets: [
      { title: 'Eater', kind: 'news', publisherId: 'culinary-delights' },
      { title: 'Markets', kind: 'news', publisherId: 'global-finance' },
      { title: 'Popular Picks', kind: 'popular' },
      {
        title: "Editor's note",
        kind: 'editorial',
        editorialBody: 'Two appetites: one for dinner, one for the markets that pay for it.',
      },
    ],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  for (const paper of PAPERS) {
    const user = await prisma.user.upsert({
      where: { email: paper.curator.email },
      update: { name: paper.curator.name },
      create: { name: paper.curator.name, email: paper.curator.email, passwordHash },
    });

    const newspaper = await prisma.newspaper.upsert({
      where: { slug: paper.slug },
      update: {
        name: paper.name,
        description: paper.description,
        readingMode: paper.readingMode,
        columns: 3,
        curatorId: user.id,
      },
      create: {
        slug: paper.slug,
        name: paper.name,
        description: paper.description,
        readingMode: paper.readingMode,
        columns: 3,
        curatorId: user.id,
      },
    });

    await prisma.widget.deleteMany({ where: { newspaperId: newspaper.id } });
    await prisma.widget.createMany({
      data: paper.widgets.map((w, i) => {
        const slot = SLOTS[i % SLOTS.length];
        return {
          id: `${paper.slug}-w${i}`,
          newspaperId: newspaper.id,
          title: w.title,
          layoutType: layoutTypeFor(w, i),
          kind: w.kind,
          publisherId: w.kind === 'news' ? (w.publisherId ?? null) : null,
          editorialBody: w.kind === 'editorial' ? (w.editorialBody ?? '') : null,
          layoutX: slot.x,
          layoutY: slot.y,
          layoutW: slot.w,
          layoutH: slot.h,
          layoutMinW: 1,
          layoutMinH: 1,
        };
      }),
    });

    console.log(`Seeded ${paper.slug} (${paper.widgets.length} widgets) by ${paper.curator.name}`);
  }
}

main()
  .then(() => console.log('Discover seed complete. Login as any curator with password: password123'))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
