import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const sources = await prisma.publisher.findMany({ include: { _count: { select: { articles: true } } } });
  console.log("Sources:");
  console.table(sources.map(s => ({ id: s.id, name: s.name, articles: s._count.articles })));

  const firstHN = await prisma.article.findFirst({ where: { sourceId: 'hacker-news' } });
  console.log("First HN Article:", firstHN?.title);

  const firstTC = await prisma.article.findFirst({ where: { sourceId: 'tech-today' } });
  console.log("First TC Article:", firstTC?.title);
}

main().catch(console.error).finally(() => prisma.$disconnect());
