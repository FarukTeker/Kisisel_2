"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Modal from '@/components/Modal';
import MobileTabBar from '@/components/MobileTabBar';
import { SHARED_NEWSPAPERS, type SharedNewspaper } from '@/lib/prototypeNewspapers';
import { initializePrototypeState, isFollowingSlug, toggleFollowSlug } from '@/lib/prototypeState';

const READING_MODE_LABEL: Record<string, string> = { S: 'Scan', H: 'Skim', F: 'Full read' };
const READING_MODE_COLOR: Record<string, string> = { S: '#2647d6', H: '#7c3aed', F: '#059669' };

const PUBLISHER_CATEGORIES: Record<string, string> = {
  'bbc-tech': 'Technology',
  'bbc-science': 'Science',
  'the-guardian-tech': 'Technology',
  'hacker-news': 'Technology',
  'nasa': 'Science',
  'tech-today': 'Technology',
  'culinary-delights': 'Food',
  'science-digest': 'Science',
  'global-finance': 'Finance',
};

function getNewspaperTags(newspaper: SharedNewspaper): string[] {
  const tags = new Set<string>();
  newspaper.widgets.forEach((w) => {
    if (w.publisherId) {
      const cat = PUBLISHER_CATEGORIES[w.publisherId];
      if (cat) tags.add(cat);
    }
    if (w.kind === 'editorial') tags.add('Editorial');
    if (w.kind === 'popular') tags.add('Popular');
    if (w.kind === 'random') tags.add('Serendipity');
  });
  return Array.from(tags).slice(0, 3);
}

function getWidgetSlotColor(widgetIndex: number, newspaper: SharedNewspaper): string {
  const widget = newspaper.widgets[widgetIndex];
  if (!widget) return '#f3f4f6';
  if (widget.kind === 'editorial') return '#dbeafe';
  if (widget.kind === 'popular' || widget.kind === 'random') return '#ede9fe';
  return '#dcfce7';
}

function CuratorAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['#2647d6', '#7c3aed', '#059669', '#d97706', '#dc2626'];
  const colorIndex = name.charCodeAt(0) % colors.length;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '22px', height: '22px', borderRadius: '50%',
      backgroundColor: colors[colorIndex], color: '#ffffff',
      fontSize: '0.6rem', fontWeight: 900, flexShrink: 0,
    }}>
      {initials}
    </span>
  );
}

const CARD_POSITIONS = [
  { x: -520, y: -300 },
  { x:   20, y: -300 },
  { x: -520, y:  200 },
  { x:   20, y:  200 },
  { x: -250, y: -520 },
  { x: -250, y:  420 },
  { x:  300, y: -80  },
  { x: -800, y:   50 },
];

const CARD_ROTATIONS = [-0.8, 0.6, -0.5, 0.9, -0.4, 0.7, -0.6, 0.5];

export default function Feed() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [followVersion, setFollowVersion] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);

  // ── Canvas pan state ──────────────────────────────────────────
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // ── Per-card drag state ───────────────────────────────────────
  const [cardPositions, setCardPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    SHARED_NEWSPAPERS.forEach((np, i) => {
      positions[np.slug] = { ...CARD_POSITIONS[i % CARD_POSITIONS.length] };
    });
    return positions;
  });

  const draggingCardRef = useRef<{ slug: string; lastX: number; lastY: number } | null>(null);
  const [draggingSlug, setDraggingSlug] = useState<string | null>(null);
  const [topCardSlug, setTopCardSlug] = useState<string | null>(null);

  const RANGE_X = 2000;
  const RANGE_Y = 1400;

  useEffect(() => {
    initializePrototypeState();
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      router.push('/login');
    } else {
      setLoading(false);
    }
    const syncViewport = () => setIsMobile(window.innerWidth < 768);
    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, [router]);

  useEffect(() => {
    if (loading) return;
    const container = document.getElementById('discover-canvas');
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setPanOffset((prev) => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      setHintVisible(false);
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [loading]);

  const extendedFeed = SHARED_NEWSPAPERS.map((item, index) => ({
    ...item,
    viewCount: 15420 - index * 1800,
    dateLabel: `May ${31 - (index % 10)}, 2026`,
    rotation: CARD_ROTATIONS[index % CARD_ROTATIONS.length],
  }));

  const openSharedNewspaper = (slug: string) => router.push(`/newspaper/${slug}`);

  const handleFollowToggle = (slug: string) => {
    const next = toggleFollowSlug(slug);
    if (!next) { router.push('/login'); return; }
    setFollowVersion((v) => v + 1);
  };

  // ── Card drag handlers ────────────────────────────────────────
  const handleCardMouseDown = (e: React.MouseEvent, slug: string) => {
    const target = e.target as HTMLElement;
    // Let buttons handle themselves
    if (target.closest('.np-card-interactive') || target.tagName === 'BUTTON') return;
    e.stopPropagation();
    e.preventDefault();
    draggingCardRef.current = { slug, lastX: e.clientX, lastY: e.clientY };
    setDraggingSlug(slug);
    setTopCardSlug(slug);
    setHintVisible(false);
  };

  // ── Canvas + card combined mousemove ─────────────────────────
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingCardRef.current) {
      const { slug, lastX, lastY } = draggingCardRef.current;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      draggingCardRef.current = { slug, lastX: e.clientX, lastY: e.clientY };
      setCardPositions((prev) => ({
        ...prev,
        [slug]: { x: prev[slug].x + dx, y: prev[slug].y + dy },
      }));
      return;
    }
    if (isPanning) {
      setPanOffset({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  };

  const handleMouseUp = () => {
    draggingCardRef.current = null;
    setDraggingSlug(null);
    setIsPanning(false);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.np-card-interactive') ||
      target.closest('.np-card') ||
      target.closest('.modal-content') ||
      target.tagName === 'A' ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT'
    ) return;
    setIsPanning(true);
    setHintVisible(false);
    setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const getWrappedCoords = (slug: string) => {
    const pos = cardPositions[slug] ?? { x: 0, y: 0 };
    const relX = pos.x + panOffset.x;
    const relY = pos.y + panOffset.y;
    const halfX = RANGE_X / 2;
    const wrappedX = ((((relX + halfX) % RANGE_X) + RANGE_X) % RANGE_X) - halfX;
    const halfY = RANGE_Y / 2;
    const wrappedY = ((((relY + halfY) % RANGE_Y) + RANGE_Y) % RANGE_Y) - halfY;
    return { x: 2500 + wrappedX - panOffset.x, y: 2500 + wrappedY - panOffset.y };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Loading…</p>
      </div>
    );
  }

  /* ── MOBILE ──────────────────────────────────────────────────── */
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', padding: '1rem 0.85rem 6.5rem', background: 'var(--background)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', border: '1.5px solid #111827', backgroundColor: 'var(--surface)', color: '#111827' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          </Link>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2647d6' }}>Discover</p>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#111827' }}>Public newspapers</h1>
          </div>
          <button onClick={() => setIsFilterOpen(true)} style={{ padding: '0.5rem 0.75rem', border: '1.5px solid #111827', borderRadius: '999px', backgroundColor: '#111827', color: '#fff', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}>
            Filter
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', marginBottom: '1.1rem', paddingBottom: '0.1rem' }}>
          {['All', 'Following', 'Popular', 'Suggested'].map((tab, i) => (
            <span key={tab} style={{ padding: '0.45rem 0.8rem', border: '1.5px solid #111827', borderRadius: '999px', backgroundColor: i === 0 ? '#111827' : 'var(--surface)', color: i === 0 ? '#fff' : '#111827', fontWeight: 800, whiteSpace: 'nowrap', fontSize: '0.76rem' }}>
              {tab}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {extendedFeed.map((feed) => {
            const tags = getNewspaperTags(feed);
            const isFollowed = isFollowingSlug(feed.slug);
            const modeColor = READING_MODE_COLOR[feed.readingMode] || '#2647d6';
            return (
              <article key={feed.slug} style={{ backgroundColor: 'var(--surface)', border: '1.5px solid #111827', borderRadius: '16px', overflow: 'hidden', boxShadow: '3px 3px 0px rgba(17,24,39,0.10)', color: '#111827' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280' }}>{feed.dateLabel}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 700 }}>{feed.viewCount.toLocaleString()} views</span>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '999px', backgroundColor: modeColor + '18', color: modeColor, fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.05em' }}>
                      {READING_MODE_LABEL[feed.readingMode]}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '0.9rem 1rem 0' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '0.35rem', color: '#111827' }}>{feed.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <CuratorAvatar name={feed.curator} />
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 700 }}>by {feed.curator}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#4b5563', lineHeight: 1.45, marginBottom: '0.75rem' }}>{feed.description}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gridTemplateRows: 'repeat(4, 1fr)', gap: '0.3rem', height: '100px', padding: '0.3rem', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '0.75rem' }}>
                    {[
                      { style: { gridColumn: '1', gridRow: '1 / 3' } },
                      { style: { gridColumn: '2 / 4', gridRow: '1' } },
                      { style: { gridColumn: '2', gridRow: '2' } },
                      { style: { gridColumn: '3', gridRow: '2' } },
                      { style: { gridColumn: '1', gridRow: '3 / 5' } },
                      { style: { gridColumn: '2 / 4', gridRow: '3 / 5' } },
                    ].map((slot, idx) => (
                      <div key={idx} style={{ ...slot.style, borderRadius: '5px', border: '1px solid #d1d5db', backgroundColor: getWidgetSlotColor(idx, feed) }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                    {tags.map((tag) => (
                      <span key={tag} style={{ padding: '0.22rem 0.55rem', borderRadius: '999px', border: '1px solid #d1d5db', fontSize: '0.65rem', fontWeight: 800, color: '#374151', backgroundColor: 'var(--surface)' }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1.5px solid #111827' }}>
                  <button onClick={() => openSharedNewspaper(feed.slug)} style={{ padding: '0.75rem', fontWeight: 800, fontSize: '0.82rem', borderRight: '1px solid #111827', backgroundColor: 'transparent', color: '#111827', cursor: 'pointer' }}>Open ↗</button>
                  <button onClick={() => handleFollowToggle(feed.slug)} style={{ padding: '0.75rem', fontWeight: 800, fontSize: '0.82rem', backgroundColor: isFollowed ? '#f0fdf4' : '#111827', color: isFollowed ? '#059669' : '#fff', cursor: 'pointer' }}>
                    {isFollowed ? '✓ Following' : 'Follow'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter" maxWidth="420px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1.5px solid #111827', borderRadius: '8px', padding: '0.6rem 0.85rem', backgroundColor: 'var(--surface)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Category, author, or keyword…" style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', backgroundColor: 'transparent', color: '#111827' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['Technology', 'Science', 'Food', 'Finance', 'Culture'].map((cat) => (
                <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.7rem', border: '1.5px solid #111827', borderRadius: '999px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, backgroundColor: 'var(--surface)', color: '#111827' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#111827' }} />
                  {cat}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setIsFilterOpen(false)} style={{ flex: 1, padding: '0.65rem', border: '1.5px solid #111827', borderRadius: '8px', fontWeight: 700, color: '#111827', backgroundColor: 'transparent', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => setIsFilterOpen(false)} style={{ flex: 1, padding: '0.65rem', border: 'none', borderRadius: '8px', backgroundColor: '#111827', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Apply</button>
            </div>
          </div>
        </Modal>

        <MobileTabBar active="discover" />
      </div>
    );
  }

  /* ── DESKTOP: 2D Canvas with draggable cards ─────────────────── */
  const canvasCursor = draggingSlug ? 'grabbing' : isPanning ? 'grabbing' : 'grab';

  return (
    <div
      id="discover-canvas"
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#f7f5f2',
        backgroundImage: 'radial-gradient(circle, #c8c0b8 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        cursor: canvasCursor,
        userSelect: 'none',
      }}
    >
      {/* Canvas layer */}
      <div
        style={{
          position: 'absolute',
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          width: '5000px',
          height: '5000px',
          marginLeft: '-2500px',
          marginTop: '-2500px',
          left: '50%',
          top: '50%',
        }}
      >
        {extendedFeed.map((feed) => {
          const coords = getWrappedCoords(feed.slug);
          const tags = getNewspaperTags(feed);
          const isFollowed = isFollowingSlug(feed.slug);
          const modeColor = READING_MODE_COLOR[feed.readingMode] || '#2647d6';
          const isBeingDragged = draggingSlug === feed.slug;
          const isOnTop = topCardSlug === feed.slug;

          return (
            <div
              key={feed.slug}
              className="np-card"
              onMouseDown={(e) => handleCardMouseDown(e, feed.slug)}
              onMouseEnter={(e) => {
                if (draggingCardRef.current) return;
                const el = e.currentTarget;
                el.style.transform = `rotate(0deg) scale(1.03)`;
                el.style.boxShadow = '8px 10px 0px #111827';
              }}
              onMouseLeave={(e) => {
                if (isBeingDragged) return;
                const el = e.currentTarget;
                el.style.transform = `rotate(${feed.rotation}deg)`;
                el.style.boxShadow = '4px 5px 0px #111827';
              }}
              style={{
                position: 'absolute',
                left: `${coords.x}px`,
                top: `${coords.y}px`,
                width: '360px',
                backgroundColor: '#ffffff',
                color: '#111827',
                border: '1.5px solid #111827',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: isBeingDragged ? '12px 14px 0px #111827' : '4px 5px 0px #111827',
                transform: isBeingDragged ? 'rotate(1.5deg) scale(1.04)' : `rotate(${feed.rotation}deg)`,
                transition: isBeingDragged ? 'box-shadow 0.08s ease, transform 0.08s ease' : 'transform 0.15s ease, box-shadow 0.15s ease',
                zIndex: isBeingDragged || isOnTop ? 50 : 1,
                cursor: isBeingDragged ? 'grabbing' : 'grab',
                willChange: 'transform',
              }}
            >
              {/* Drag handle — masthead strip acts as drag surface */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.55rem 0.9rem', backgroundColor: '#111827', color: '#fff',
                  cursor: isBeingDragged ? 'grabbing' : 'grab',
                }}
              >
                <span style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.7 }}>
                  {feed.dateLabel}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, opacity: 0.6 }}>
                    {feed.viewCount.toLocaleString()} views
                  </span>
                  <span style={{ padding: '0.18rem 0.45rem', borderRadius: '999px', backgroundColor: modeColor, fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.05em', color: '#fff' }}>
                    {READING_MODE_LABEL[feed.readingMode]}
                  </span>
                  {/* drag indicator dots */}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.4 }}>
                    <circle cx="4" cy="3" r="1.2" fill="white" />
                    <circle cx="8" cy="3" r="1.2" fill="white" />
                    <circle cx="4" cy="6" r="1.2" fill="white" />
                    <circle cx="8" cy="6" r="1.2" fill="white" />
                    <circle cx="4" cy="9" r="1.2" fill="white" />
                    <circle cx="8" cy="9" r="1.2" fill="white" />
                  </svg>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '1rem 1rem 0' }}>
                <h3 style={{ fontSize: '1.22rem', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.035em', color: '#111827', marginBottom: '0.4rem' }}>
                  {feed.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.6rem' }}>
                  <CuratorAvatar name={feed.curator} />
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#6b7280' }}>by {feed.curator}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#4b5563', lineHeight: 1.5, marginBottom: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {feed.description}
                </p>

                {/* Layout preview */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gridTemplateRows: 'repeat(4, 1fr)', gap: '0.28rem', height: '112px', padding: '0.3rem', backgroundColor: '#f0ede8', border: '1px solid #d1ccc5', borderRadius: '8px', marginBottom: '0.8rem' }}>
                  {[
                    { style: { gridColumn: '1', gridRow: '1 / 3' } },
                    { style: { gridColumn: '2 / 4', gridRow: '1' } },
                    { style: { gridColumn: '2', gridRow: '2' } },
                    { style: { gridColumn: '3', gridRow: '2' } },
                    { style: { gridColumn: '1', gridRow: '3 / 5' } },
                    { style: { gridColumn: '2 / 4', gridRow: '3 / 5' } },
                  ].map((slot, idx) => (
                    <div key={idx} style={{ ...slot.style, borderRadius: '5px', border: '1px solid #c8c0b8', backgroundColor: getWidgetSlotColor(idx, feed) }} />
                  ))}
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                  {tags.map((tag) => (
                    <span key={tag} style={{ padding: '0.22rem 0.55rem', borderRadius: '999px', border: '1px solid #d1ccc5', fontSize: '0.64rem', fontWeight: 800, color: '#374151', backgroundColor: '#ffffff' }}>
                      {tag}
                    </span>
                  ))}
                  <span style={{ padding: '0.22rem 0.55rem', borderRadius: '999px', border: `1px solid ${modeColor}40`, fontSize: '0.64rem', fontWeight: 800, color: modeColor, backgroundColor: modeColor + '0f' }}>
                    {feed.widgets.length} widgets
                  </span>
                </div>
              </div>

              {/* CTA row — interactive, stops card drag propagation */}
              <div className="np-card-interactive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1.5px solid #111827' }}>
                <button
                  className="np-card-interactive"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); openSharedNewspaper(feed.slug); }}
                  style={{ padding: '0.75rem', fontWeight: 800, fontSize: '0.8rem', borderRight: '1px solid #111827', backgroundColor: 'transparent', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', cursor: 'pointer' }}
                >
                  Open
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </button>
                <button
                  className="np-card-interactive"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); handleFollowToggle(feed.slug); }}
                  style={{ padding: '0.75rem', fontWeight: 800, fontSize: '0.8rem', backgroundColor: isFollowed ? '#f0fdf4' : '#111827', color: isFollowed ? '#059669' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                >
                  {isFollowed ? (
                    <><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Following</>
                  ) : 'Follow'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Fixed Chrome ──────────────────────────────────────────── */}

      <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', backgroundColor: 'rgba(255,253,248,0.92)', backdropFilter: 'blur(8px)', border: '1.5px solid #111827', borderRadius: '999px', boxShadow: '2px 2px 0px #111827', zIndex: 100, pointerEvents: 'none' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2647d6' }}>Discover</span>
        <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#d1d5db' }} />
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6b7280' }}>{extendedFeed.length} newspapers</span>
      </div>

      <Link
        href="/"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ position: 'fixed', top: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 0.85rem', backgroundColor: 'rgba(255,253,248,0.92)', backdropFilter: 'blur(8px)', border: '1.5px solid #111827', borderRadius: '999px', boxShadow: '2px 2px 0px #111827', fontSize: '0.75rem', fontWeight: 800, color: '#111827', zIndex: 100, textDecoration: 'none' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        My newspaper
      </Link>

      {hintVisible && (
        <div style={{ position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'rgba(17,24,39,0.8)', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, color: '#fff', zIndex: 100, pointerEvents: 'none', backdropFilter: 'blur(4px)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 9l-3 3 3 3"/><path d="M9 5l3-3 3 3"/><path d="M15 19l-3 3-3-3"/><path d="M19 9l3 3-3 3"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
          Drag background to explore · Grab cards to rearrange
        </div>
      )}

      <button
        className="np-card-interactive"
        onClick={() => setIsFilterOpen(true)}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0.65rem 1.1rem', backgroundColor: 'rgba(255,253,248,0.95)', backdropFilter: 'blur(8px)', border: '1.5px solid #111827', borderRadius: '999px', boxShadow: '2px 2px 0px #111827', fontSize: '0.78rem', fontWeight: 800, color: '#111827', cursor: 'pointer', zIndex: 100 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        Filter &amp; sort
      </button>

      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter newspapers" maxWidth="440px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1.5px solid #111827', borderRadius: '8px', padding: '0.6rem 0.85rem', backgroundColor: 'var(--surface)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Category, curator, or keyword…" style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', backgroundColor: 'transparent', color: '#111827' }} />
          </div>
          <div>
            <h4 style={{ fontWeight: 800, marginBottom: '0.65rem', fontSize: '0.88rem', color: '#111827' }}>Categories</h4>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['Technology', 'Science', 'Food', 'Finance', 'Culture'].map((cat) => (
                <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.7rem', border: '1.5px solid #111827', borderRadius: '999px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, backgroundColor: 'var(--surface)', color: '#111827' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#111827' }} />
                  {cat}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <button onClick={() => setIsFilterOpen(false)} style={{ padding: '0.45rem 1rem', border: '1.5px solid #111827', borderRadius: '6px', backgroundColor: 'var(--surface)', color: '#111827', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
            <button onClick={() => setIsFilterOpen(false)} style={{ padding: '0.45rem 1rem', border: 'none', borderRadius: '6px', backgroundColor: '#111827', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>Apply</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
