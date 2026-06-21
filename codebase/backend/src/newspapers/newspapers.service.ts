import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { WidgetDto } from './dto/widget.dto';
import type { SaveDashboardDto } from './dto/save-dashboard.dto';
import type { ShareDashboardDto } from './dto/share-dashboard.dto';

@Injectable()
export class NewspapersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public list of shared newspapers for the Discover page. */
  async discover() {
    const papers = await this.prisma.newspaper.findMany({
      where: { slug: { startsWith: 'share-' } },
      orderBy: { createdAt: 'desc' },
      take: 60,
      include: {
        widgets: { select: { kind: true, layoutType: true } },
        curator: { select: { name: true } },
      },
    });
    return {
      newspapers: papers.map((p) => ({
        slug: p.slug,
        name: p.name,
        description: p.description,
        curator: p.curator.name,
        readingMode: p.readingMode,
        language: p.language,
        widgetCount: p.widgets.length,
        widgets: p.widgets.map((w) => ({ kind: w.kind, layoutType: w.layoutType })),
      })),
    };
  }

  /** Find-or-create the user's personal dashboard newspaper, with widgets. */
  async getDashboard(userId: string) {
    const slug = `dashboard-${userId}`;
    let newspaper = await this.prisma.newspaper.findFirst({
      where: { curatorId: userId, slug },
      include: { widgets: true },
    });
    if (!newspaper) {
      newspaper = await this.prisma.newspaper.create({
        data: { slug, name: 'My Dashboard', curatorId: userId, readingMode: 'F' },
        include: { widgets: true },
      });
    }
    return { newspaper };
  }

  /** Upsert the dashboard: update settings, then replace all widgets. */
  async saveDashboard(userId: string, dto: SaveDashboardDto) {
    const slug = `dashboard-${userId}`;
    const existing = await this.prisma.newspaper.findFirst({
      where: { curatorId: userId, slug },
    });

    const settings = {
      ...(dto.readingMode ? { readingMode: dto.readingMode } : {}),
      ...(dto.columns ? { columns: dto.columns } : {}),
      ...(dto.theme ? { theme: dto.theme } : {}),
      ...(dto.font ? { font: dto.font } : {}),
      ...(dto.language ? { language: dto.language } : {}),
    };

    const newspaper = existing
      ? await this.prisma.newspaper.update({
          where: { id: existing.id },
          data: settings,
        })
      : await this.prisma.newspaper.create({
          data: {
            slug,
            name: 'My Dashboard',
            curatorId: userId,
            readingMode: dto.readingMode ?? 'F',
            ...settings,
          },
        });

    await this.prisma.widget.deleteMany({ where: { newspaperId: newspaper.id } });
    await this.createWidgets(newspaper.id, dto.widgets, true);

    const widgets = await this.prisma.widget.findMany({
      where: { newspaperId: newspaper.id },
    });
    return { newspaper: { ...newspaper, widgets } };
  }

  /** Snapshot the current layout into a public, shareable newspaper. */
  async share(userId: string, dto: ShareDashboardDto) {
    const slug = `share-${Math.random().toString(36).slice(2, 8)}`;
    const newspaper = await this.prisma.newspaper.create({
      data: {
        slug,
        name: dto.name || 'Shared Newspaper',
        description: dto.description,
        readingMode: dto.readingMode ?? 'F',
        columns: dto.columns ?? 3,
        theme: dto.theme ?? 'Light',
        font: dto.font ?? 'Sans-Serif (Modern Clean)',
        language: dto.language ?? 'en',
        curatorId: userId,
      },
    });
    // Share widgets get fresh ids so they never collide with the source dashboard.
    await this.createWidgets(newspaper.id, dto.widgets, false);
    return { slug };
  }

  /** Public read of a shared newspaper by slug. */
  async getShared(slug: string) {
    const newspaper = await this.prisma.newspaper.findUnique({
      where: { slug },
      include: { widgets: true, curator: { select: { name: true } } },
    });
    if (!newspaper) throw new NotFoundException('Newspaper not found');
    return { newspaper };
  }

  private async createWidgets(
    newspaperId: string,
    widgets: WidgetDto[],
    keepIds: boolean,
  ) {
    for (const w of widgets) {
      await this.prisma.widget.create({
        data: {
          id: keepIds ? w.id : `${newspaperId}-${w.id}`,
          newspaperId,
          title: w.title || 'Untitled',
          layoutType: w.layoutType,
          kind: w.kind,
          publisherId: w.publisherId,
          editorialBody: w.editorialBody,
          categoryFilter: w.categoryFilter,
          layoutX: w.layoutX ?? 0,
          layoutY: w.layoutY ?? 0,
          layoutW: w.layoutW ?? 1,
          layoutH: w.layoutH ?? 1,
          layoutMinW: w.layoutMinW ?? 1,
          layoutMinH: w.layoutMinH ?? 1,
        },
      });
    }
  }
}
