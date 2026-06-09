import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

export const newspapersRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_for_development';

function getUserId(req: any): string | null {
  try {
    const token = req.cookies.token;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

newspapersRouter.get('/dashboard', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  let newspaper = await prisma.newspaper.findFirst({
    where: { curatorId: userId, slug: { startsWith: 'dashboard-' } },
    include: { widgets: true },
  });

  if (!newspaper) {
    newspaper = await prisma.newspaper.create({
      data: {
        slug: `dashboard-${userId}`,
        name: 'My Dashboard',
        curatorId: userId,
        readingMode: 'F',
      },
      include: { widgets: true },
    });
  }

  res.json({ newspaper });
});

newspapersRouter.post('/dashboard', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const { widgets, readingMode } = req.body;

  let newspaper = await prisma.newspaper.findFirst({
    where: { curatorId: userId, slug: { startsWith: 'dashboard-' } },
  });

  if (!newspaper) {
    newspaper = await prisma.newspaper.create({
      data: {
        slug: `dashboard-${userId}`,
        name: 'My Dashboard',
        curatorId: userId,
        readingMode: readingMode || 'F',
      },
    });
  } else if (readingMode) {
    newspaper = await prisma.newspaper.update({
      where: { id: newspaper.id },
      data: { readingMode },
    });
  }

  await prisma.widget.deleteMany({ where: { newspaperId: newspaper.id } });

  const createdWidgets = [];
  if (widgets && Array.isArray(widgets)) {
    for (const w of widgets) {
      const widget = await prisma.widget.create({
        data: {
          id: w.id,
          newspaperId: newspaper.id,
          title: w.title || 'Untitled',
          layoutType: w.layoutType,
          kind: w.kind,
          publisherId: w.publisherId,
          editorialBody: w.editorialBody,
          categoryFilter: w.categoryFilter,
          layoutX: w.layoutX || 0,
          layoutY: w.layoutY || 0,
          layoutW: w.layoutW || 1,
          layoutH: w.layoutH || 1,
          layoutMinW: w.layoutMinW || 1,
          layoutMinH: w.layoutMinH || 1,
        },
      });
      createdWidgets.push(widget);
    }
  }

  res.json({ newspaper: { ...newspaper, widgets: createdWidgets } });
});

newspapersRouter.get('/shared/:slug', async (req, res) => {
  const { slug } = req.params;
  const newspaper = await prisma.newspaper.findUnique({
    where: { slug },
    include: { widgets: true, curator: { select: { name: true } } },
  });

  if (!newspaper) {
    res.status(404).json({ error: 'Newspaper not found' });
    return;
  }

  res.json({ newspaper });
});

newspapersRouter.post('/share', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const { name, description, widgets, readingMode } = req.body;
  const slug = `share-${Math.random().toString(36).substring(2, 8)}`;

  const newspaper = await prisma.newspaper.create({
    data: {
      slug,
      name: name || 'Shared Newspaper',
      description,
      readingMode: readingMode || 'F',
      curatorId: userId,
    },
  });

  if (widgets && Array.isArray(widgets)) {
    for (const w of widgets) {
      await prisma.widget.create({
        data: {
          newspaperId: newspaper.id,
          title: w.title || 'Untitled',
          layoutType: w.layoutType,
          kind: w.kind,
          publisherId: w.publisherId,
          editorialBody: w.editorialBody,
          categoryFilter: w.categoryFilter,
          layoutX: w.layoutX || 0,
          layoutY: w.layoutY || 0,
          layoutW: w.layoutW || 1,
          layoutH: w.layoutH || 1,
          layoutMinW: w.layoutMinW || 1,
          layoutMinH: w.layoutMinH || 1,
        },
      });
    }
  }

  res.json({ slug });
});
