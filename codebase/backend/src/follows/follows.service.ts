import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Follow a user (idempotent). Self-follow is rejected. */
  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }
    await this.prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      update: {},
      create: { followerId, followingId },
    });
    return { ok: true };
  }

  async unfollow(followerId: string, followingId: string) {
    await this.prisma.follow.deleteMany({ where: { followerId, followingId } });
    return { ok: true };
  }

  /** The people I follow (for button state + counts). */
  async listFollowing(followerId: string) {
    const rows = await this.prisma.follow.findMany({
      where: { followerId },
      include: { following: { select: { id: true, name: true } } },
    });
    return { following: rows.map((r) => r.following) };
  }

  /**
   * Daily list: the latest shared newspaper for each followed curator
   * (one card per person).
   */
  async feed(followerId: string) {
    const follows = await this.prisma.follow.findMany({
      where: { followerId },
      select: { followingId: true },
    });
    const followedIds = follows.map((f) => f.followingId);
    if (followedIds.length === 0) return { newspapers: [] };

    const papers = await this.prisma.newspaper.findMany({
      where: { curatorId: { in: followedIds }, slug: { startsWith: 'share-' } },
      orderBy: { createdAt: 'desc' },
      include: {
        widgets: { select: { kind: true, layoutType: true } },
        curator: { select: { name: true } },
      },
    });

    // Keep only the most recent paper per curator (papers are already desc by date).
    const seen = new Set<string>();
    const latestPerCurator = papers.filter((p) => {
      if (seen.has(p.curatorId)) return false;
      seen.add(p.curatorId);
      return true;
    });

    return {
      newspapers: latestPerCurator.map((p) => ({
        slug: p.slug,
        name: p.name,
        description: p.description,
        curator: p.curator.name,
        curatorId: p.curatorId,
        readingMode: p.readingMode,
        widgetCount: p.widgets.length,
        widgets: p.widgets.map((w) => ({ kind: w.kind, layoutType: w.layoutType })),
        createdAt: p.createdAt.toISOString(),
      })),
    };
  }
}
