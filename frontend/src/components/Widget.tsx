"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { NewsArticle } from '../lib/mockData';
import { fetchSummaryPreview } from '../lib/summaryApi';
import { fetchPopularArticles, fetchRandomArticles, type LiveArticle } from '../lib/articlesApi';

interface WidgetProps {
  articles: NewsArticle[];
  layoutType: 'card1' | 'card2' | 'card3' | 'card4' | 'card5' | 'card6' | 'editorial' | 'discovery';
  readingMode: 'S' | 'H' | 'F';
  editMode: boolean;
  compact?: boolean;
  title?: string;
  kind?: 'news' | 'editorial' | 'popular' | 'random';
  editorialBody?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  onSettingsClick?: () => void;
  onDelete?: () => void;
}

export default function Widget({
  articles,
  layoutType,
  readingMode,
  editMode,
  compact = false,
  title,
  kind = 'news',
  editorialBody,
  isSelected = false,
  onSelect,
  onSettingsClick,
  onDelete,
}: WidgetProps) {
  const newsLayoutType = layoutType as 'card1' | 'card2' | 'card3' | 'card4' | 'card5' | 'card6';

  const [liveSummaries, setLiveSummaries] = useState<Record<string, string>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [discoveryArticles, setDiscoveryArticles] = useState<LiveArticle[]>([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);

  const openSource = (article: NewsArticle | LiveArticle) => {
    if (typeof window !== 'undefined') {
      window.open(article.sourceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const borderStyle = isSelected
    ? '3px solid #4f46e5'
    : editMode
      ? '2.2px dashed #4f46e5'
      : '1.5px solid #111827';

  const startIndex = parseInt(layoutType.replace('card', '')) - 1;

  // ── Popular / Random: fetch live articles ──────────────────────────────────
  useEffect(() => {
    if (kind !== 'popular' && kind !== 'random') return;
    setDiscoveryLoading(true);
    const fetcher = kind === 'popular' ? fetchPopularArticles(6) : fetchRandomArticles(4);
    fetcher.then((data) => {
      if (data.length > 0) setDiscoveryArticles(data);
      setDiscoveryLoading(false);
    });
  }, [kind]);

  // ── News widget: pick displayArticles from prop ────────────────────────────
  const displayArticles = useMemo<NewsArticle[]>(() => {
    if (kind !== 'news') return [];
    if (readingMode === 'F') {
      return [articles[startIndex % articles.length]];
    } else if (readingMode === 'S') {
      const countMap = { card1: 2, card2: 1, card3: 2, card4: 2, card5: 3, card6: 3 };
      const count = countMap[newsLayoutType];
      return Array.from({ length: count }, (_, i) => articles[(startIndex + i) % articles.length]);
    } else {
      const countMap = { card1: 4, card2: 2, card3: 3, card4: 3, card5: 6, card6: 5 };
      const count = countMap[newsLayoutType];
      return Array.from({ length: count }, (_, i) => articles[(startIndex + i) % articles.length]);
    }
  }, [articles, kind, readingMode, newsLayoutType, startIndex]);

  const articleIdKey = displayArticles.map((a) => a.id).join(',');

  // ── Lazy AI summaries for news widgets ────────────────────────────────────
  useEffect(() => {
    if (kind !== 'news') return;
    const toFetch = displayArticles.filter((a) => !liveSummaries[a.id] && !loadingIds.has(a.id));
    if (toFetch.length === 0) return;

    setLoadingIds((prev) => {
      const next = new Set(prev);
      toFetch.forEach((a) => next.add(a.id));
      return next;
    });

    toFetch.forEach(async (article) => {
      const result = await fetchSummaryPreview({
        title: article.title,
        content: article.fullContent,
        publisher: article.publisher,
        category: article.category,
      });
      if (result?.summary) {
        setLiveSummaries((prev) => ({ ...prev, [article.id]: result.summary }));
      }
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(article.id);
        return next;
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleIdKey, kind]);

  // ── AI summaries for discovery articles ───────────────────────────────────
  const discIdKey = discoveryArticles.map((a) => a.id).join(',');
  useEffect(() => {
    if (discoveryArticles.length === 0) return;
    const toFetch = discoveryArticles.filter((a) => !liveSummaries[a.id] && !loadingIds.has(a.id));
    if (toFetch.length === 0) return;

    setLoadingIds((prev) => {
      const next = new Set(prev);
      toFetch.forEach((a) => next.add(a.id));
      return next;
    });

    toFetch.forEach(async (article) => {
      const result = await fetchSummaryPreview({
        title: article.title,
        content: article.fullContent,
        publisher: article.publisher,
        category: article.category,
      });
      if (result?.summary) {
        setLiveSummaries((prev) => ({ ...prev, [article.id]: result.summary }));
      }
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(article.id);
        return next;
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discIdKey]);

  // ── Design tokens ──────────────────────────────────────────────────────────
  const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
    Technology: { bg: '#dbeafe', text: '#1d4ed8' },
    Science:    { bg: '#d1fae5', text: '#065f46' },
    Finance:    { bg: '#fef3c7', text: '#92400e' },
    Food:       { bg: '#fce7f3', text: '#9d174d' },
    Culture:    { bg: '#ede9fe', text: '#5b21b6' },
  };

  const renderTitle = (t: string, fontSize = '1.1rem') => (
    <h3 style={{ fontSize, fontWeight: 800, color: '#0f172a', lineHeight: 1.3, letterSpacing: '-0.02em', margin: 0 }}>
      {t}
    </h3>
  );

  const getSummary = (article: NewsArticle | LiveArticle) =>
    liveSummaries[article.id] || article.summary;

  const isLoading = (article: NewsArticle | LiveArticle) => loadingIds.has(article.id);

  const renderCategoryPill = (category: string) => {
    const colors = CATEGORY_COLORS[category] ?? { bg: '#f3f4f6', text: '#374151' };
    return (
      <span style={{ padding: '0.15rem 0.45rem', borderRadius: '999px', backgroundColor: colors.bg, color: colors.text, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
        {category.toUpperCase()}
      </span>
    );
  };

  const renderAiStatusPill = (article: NewsArticle | LiveArticle) => {
    const loading = isLoading(article);
    const isLive = Boolean(liveSummaries[article.id]);
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.18rem 0.5rem', borderRadius: '999px', border: `1px solid ${loading ? '#e5e7eb' : isLive ? '#bbf7d0' : '#bfdbfe'}`, backgroundColor: loading ? '#f9fafb' : isLive ? '#f0fdf4' : '#eff6ff', fontSize: '0.62rem', fontWeight: 700, color: loading ? '#9ca3af' : isLive ? '#15803d' : '#2563eb', whiteSpace: 'nowrap' }}>
        {loading ? (
          <><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d1d5db', display: 'inline-block' }} />Generating…</>
        ) : isLive ? (
          <><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />AI summary</>
        ) : (
          <><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'inline-block' }} />{(article as LiveArticle).summaryLabel ?? 'AI preview'}</>
        )}
      </span>
    );
  };

  const renderOpenSourceBtn = (article: NewsArticle | LiveArticle, size: 'sm' | 'md' = 'sm') => (
    <button
      type="button"
      onClick={() => openSource(article)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: size === 'sm' ? '0.28rem 0.65rem' : '0.38rem 0.8rem', border: '1px solid #d1d5db', borderRadius: '999px', backgroundColor: '#ffffff', fontSize: size === 'sm' ? '0.68rem' : '0.75rem', fontWeight: 700, color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
    >
      Source
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
    </button>
  );

  const renderMetadata = (article: NewsArticle | LiveArticle) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '0.3rem 0 0.1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#374151' }}>{article.publisher}</span>
        <span style={{ color: '#d1d5db', fontSize: '0.65rem' }}>·</span>
        <span style={{ fontSize: '0.68rem', color: '#6b7280' }}>{article.author}</span>
        <span style={{ color: '#d1d5db', fontSize: '0.65rem' }}>·</span>
        <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{article.date}</span>
        {renderCategoryPill(article.category)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        {renderAiStatusPill(article)}
        {renderOpenSourceBtn(article)}
      </div>
    </div>
  );

  // ── Discovery (popular / random) content ──────────────────────────────────
  const renderDiscovery = () => {
    const isPop = kind === 'popular';
    const accentColor = isPop ? '#315efb' : '#7c3aed';
    const badgeBg = isPop ? '#eef3ff' : '#f4ecff';
    const badgeLabel = isPop ? 'Popular' : 'Random';
    const subLabel = isPop ? 'Beyond your feed' : 'Designed serendipity';

    if (discoveryLoading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: accentColor, marginBottom: '0.35rem' }}>{subLabel}</p>
              {renderTitle(title || (isPop ? 'Popular Picks' : 'Random Discovery'), compact ? '1rem' : '1.15rem')}
            </div>
            <span style={{ padding: '0.35rem 0.55rem', borderRadius: '999px', border: '1.5px solid #111827', backgroundColor: badgeBg, color: '#111827', fontSize: '0.68rem', fontWeight: 800 }}>{badgeLabel}</span>
          </div>
          {[0, 1].map((i) => (
            <div key={i} style={{ padding: '0.9rem', border: '1.5px solid #e5e7eb', borderRadius: '14px', backgroundColor: '#f9fafb', animation: 'pulse 1.5s ease-in-out infinite' }}>
              <div style={{ height: '0.85rem', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '0.5rem', width: '80%' }} />
              <div style={{ height: '0.65rem', backgroundColor: '#f3f4f6', borderRadius: '4px', width: '50%' }} />
            </div>
          ))}
        </div>
      );
    }

    const items = discoveryArticles.length > 0 ? discoveryArticles : (articles as LiveArticle[]);
    const shown = isPop ? items.slice(0, 3) : items.slice(0, 2);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '0.7rem' : '0.9rem', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: accentColor, marginBottom: '0.35rem' }}>{subLabel}</p>
            {renderTitle(title || (isPop ? 'Popular Picks' : 'Random Discovery'), compact ? '1rem' : '1.15rem')}
          </div>
          <span style={{ padding: '0.35rem 0.55rem', borderRadius: '999px', border: '1.5px solid #111827', backgroundColor: badgeBg, color: '#111827', fontSize: '0.68rem', fontWeight: 800, whiteSpace: 'nowrap' }}>{badgeLabel}</span>
        </div>

        {shown.map((article, index) => (
          <div key={`${article.id}-${index}`} style={{ padding: compact ? '0.75rem' : '0.9rem', border: '1.5px solid #111827', borderRadius: '14px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
              <h4 style={{ fontSize: compact ? '0.88rem' : '0.96rem', fontWeight: 900, lineHeight: 1.25, margin: 0, flex: 1, color: '#0f172a' }}>{article.title}</h4>
              {renderCategoryPill(article.category)}
            </div>
            <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0, fontWeight: 600 }}>
              {isPop ? '↑ Cross-source momentum' : '⟳ Unexpected angle'} · {article.publisher} · {article.date}
            </p>
            {readingMode !== 'H' && (
              <p style={{ fontSize: compact ? '0.78rem' : '0.82rem', lineHeight: 1.45, color: '#374151', margin: 0 }}>
                {getSummary(article)}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', flexWrap: 'wrap' }}>
              {renderAiStatusPill(article)}
              <button
                type="button"
                onClick={() => openSource(article)}
                style={{ padding: '0.3rem 0.6rem', border: '1.5px solid #111827', borderRadius: '999px', backgroundColor: '#fffdf8', color: '#111827', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Open source
              </button>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginTop: 'auto', flexShrink: 0 }}>
          <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600 }}>
            {isPop ? `${items.length} stories scored from live feeds` : 'Sampled from all sources'}
          </span>
          <span style={{ fontSize: '0.72rem', color: accentColor, fontWeight: 800, cursor: 'pointer' }}>Live</span>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (kind === 'editorial' || layoutType === 'editorial') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '0.8rem' : '1rem', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#315efb', marginBottom: '0.35rem' }}>Curator note</p>
              {renderTitle(title || 'Editorial Note', compact ? '1.05rem' : '1.2rem')}
            </div>
            <span style={{ padding: '0.35rem 0.55rem', borderRadius: '999px', border: '1.5px solid #111827', backgroundColor: '#eef3ff', color: '#111827', fontSize: '0.68rem', fontWeight: 800, whiteSpace: 'nowrap' }}>Public</span>
          </div>
          <div style={{ borderTop: '1.5px dashed #111827', opacity: 0.28 }} />
          <p style={{ fontSize: compact ? '0.82rem' : '0.9rem', lineHeight: 1.6, color: '#111827', margin: 0, flex: 1 }}>
            {editorialBody || 'Add your editorial note to frame why this story matters, what readers should question, or how related stories connect.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.74rem', color: '#6b7280', fontWeight: 700 }}>Visible in shared newspapers</span>
            <span style={{ fontSize: '0.74rem', color: '#111827', fontWeight: 800 }}>Author's note</span>
          </div>
        </div>
      );
    }

    if (kind === 'popular' || kind === 'random' || layoutType === 'discovery') {
      return renderDiscovery();
    }

    // ── H mode ─────────────────────────────────────────────────────────────
    if (readingMode === 'H') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', minHeight: 0 }}>
          {displayArticles.map((art, idx) => (
            <div key={`${art.id}-${idx}`} style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {art.title}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>{art.date}</span>
                  {renderCategoryPill(art.category)}
                </div>
              </div>
              {renderOpenSourceBtn(art, 'sm')}
            </div>
          ))}
        </div>
      );
    }

    // ── S mode ─────────────────────────────────────────────────────────────
    if (readingMode === 'S') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', height: '100%', minHeight: 0 }}>
          {displayArticles.map((art, idx) => (
            <div key={`${art.id}-${idx}`} style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '0.9rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.3, flex: 1 }}>{art.title}</h4>
                {renderCategoryPill(art.category)}
              </div>
              <p style={{ fontSize: '0.65rem', color: '#9ca3af', margin: 0, fontWeight: 600 }}>
                {art.publisher} · {art.author} · {art.date}
              </p>
              <p style={{ fontSize: '0.83rem', lineHeight: 1.55, color: '#374151', margin: 0 }}>
                {getSummary(art)}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                {renderAiStatusPill(art)}
                {renderOpenSourceBtn(art)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // ── F mode (card layouts) ───────────────────────────────────────────────
    const article = displayArticles[0] || articles[0];

    return (
      <>
        {layoutType === 'card1' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {article.imageUrl && (
                <div style={{ width: '100px', height: '100px', flexShrink: 0, position: 'relative', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                  <Image src={article.imageUrl} alt={article.title} fill style={{ objectFit: 'cover' }} unoptimized draggable={false} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                {renderTitle(article.title, '1.25rem')}
                {renderMetadata(article)}
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#111827', flex: 1, textAlign: 'justify' }}>
              {getSummary(article)}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => openSource(article)} style={{ padding: '0.45rem 0.75rem', border: '1.5px solid #111827', borderRadius: '999px', backgroundColor: '#fffdf8', color: '#111827', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}>
                Read original source
              </button>
            </div>
          </div>
        )}

        {layoutType === 'card2' && (
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', height: '100%' }}>
            {article.imageUrl && (
              <div style={{ width: '130px', height: '100px', flexShrink: 0, position: 'relative', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                <Image src={article.imageUrl} alt={article.title} fill style={{ objectFit: 'cover' }} unoptimized draggable={false} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              {renderTitle(article.title, '1.35rem')}
              {renderMetadata(article)}
              <p style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {getSummary(article)}
              </p>
              <div style={{ marginTop: '0.55rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => openSource(article)} style={{ padding: '0.4rem 0.7rem', border: '1.5px solid #111827', borderRadius: '999px', backgroundColor: '#fffdf8', color: '#111827', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>
                  Open source
                </button>
              </div>
            </div>
          </div>
        )}

        {layoutType === 'card3' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              {article.imageUrl && (
                <div style={{ width: '80px', height: '80px', flexShrink: 0, position: 'relative', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                  <Image src={article.imageUrl} alt={article.title} fill style={{ objectFit: 'cover' }} unoptimized draggable={false} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                {renderTitle(article.title, '1.15rem')}
                {renderMetadata(article)}
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.45', color: '#111827', flex: 1, textAlign: 'justify' }}>
              {getSummary(article).substring(0, 220)}…
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => openSource(article)} style={{ padding: '0.4rem 0.7rem', border: '1.5px solid #111827', borderRadius: '999px', backgroundColor: '#fffdf8', color: '#111827', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>
                Open source
              </button>
            </div>
          </div>
        )}

        {layoutType === 'card4' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: '0.5rem' }}>
            {renderTitle(article.title, '1.15rem')}
            {renderMetadata(article)}
            <p style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#111827', flex: 1, textAlign: 'justify' }}>
              {getSummary(article)}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => openSource(article)} style={{ padding: '0.4rem 0.7rem', border: '1.5px solid #111827', borderRadius: '999px', backgroundColor: '#fffdf8', color: '#111827', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>
                Open source
              </button>
            </div>
          </div>
        )}

        {layoutType === 'card5' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: '1rem' }}>
            <div>
              {renderTitle(article.title, '1.3rem')}
              {renderMetadata(article)}
            </div>
            {article.imageUrl && (
              <div style={{ width: '100%', height: '180px', position: 'relative', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                <Image src={article.imageUrl} alt={article.title} fill style={{ objectFit: 'cover' }} unoptimized draggable={false} />
              </div>
            )}
            <p style={{ fontSize: '0.875rem', lineHeight: '1.5', color: '#111827', flex: 1, textAlign: 'justify' }}>
              {getSummary(article)}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => openSource(article)} style={{ padding: '0.4rem 0.7rem', border: '1.5px solid #111827', borderRadius: '999px', backgroundColor: '#fffdf8', color: '#111827', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>
                Open source
              </button>
            </div>
          </div>
        )}

        {layoutType === 'card6' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: '1rem', justifyContent: 'space-between' }}>
            <div>
              {renderTitle(article.title, '1.4rem')}
              {renderMetadata(article)}
            </div>

            {/* Image strip: use real article images from displayArticles */}
            {(() => {
              const imgs = displayArticles
                .map((a) => a.imageUrl)
                .filter((url): url is string => Boolean(url))
                .slice(0, 3);
              // pad to 3 with article's own image
              while (imgs.length < 3 && article.imageUrl) imgs.push(article.imageUrl);
              return imgs.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  {imgs.map((url, i) => (
                    <div key={i} style={{ height: '100px', position: 'relative', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                      <Image src={url} alt={`Image ${i + 1}`} fill style={{ objectFit: 'cover' }} unoptimized draggable={false} />
                    </div>
                  ))}
                </div>
              ) : null;
            })()}

            <p style={{ fontSize: '0.875rem', lineHeight: '1.5', color: '#111827', textAlign: 'justify' }}>
              {getSummary(article)}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => openSource(article)} style={{ padding: '0.4rem 0.7rem', border: '1.5px solid #111827', borderRadius: '999px', backgroundColor: '#fffdf8', color: '#111827', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>
                Open source
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              {article.imageUrl && (
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1.5px solid #111827', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  <Image src={article.imageUrl} alt="Publisher" fill style={{ objectFit: 'cover' }} unoptimized draggable={false} />
                </div>
              )}
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#111827' }}>{article.publisher}</span>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div
      className="card animate-fade-in"
      onClick={() => { if (editMode && onSelect) onSelect(); }}
      style={{
        padding: compact ? '0.9rem' : '1.25rem',
        height: '100%',
        width: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        border: borderStyle,
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        color: '#111827',
        position: 'relative',
        cursor: editMode ? 'grab' : 'default',
        boxSizing: 'border-box',
        userSelect: editMode ? 'none' : 'text',
        boxShadow: isSelected
          ? '0 0 0 2px #4f46e5, 0 4px 16px rgba(79,70,229,0.15)'
          : editMode
            ? '0 2px 8px rgba(0,0,0,0.06)'
            : '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s ease',
        flex: 1,
      }}
    >
      {/* Settings button */}
      {editMode && (
        <button
          onClick={(e) => { e.stopPropagation(); if (onSettingsClick) onSettingsClick(); }}
          className="widget-settings-btn"
          style={{ position: 'absolute', top: compact ? '-10px' : '-12px', left: compact ? '-10px' : '-12px', background: '#ffffff', border: '2px solid #111827', borderRadius: '50%', width: compact ? '24px' : '26px', height: compact ? '24px' : '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '2px 2px 0px #111827', zIndex: 10 }}
          title="Widget Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73v.18a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      )}

      {/* Delete button — top-right, only in edit mode */}
      {editMode && onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ position: 'absolute', top: compact ? '-10px' : '-12px', right: compact ? '-10px' : '-12px', background: '#ffffff', border: '2px solid #ef4444', borderRadius: '50%', width: compact ? '24px' : '26px', height: compact ? '24px' : '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '2px 2px 0px #ef4444', zIndex: 10, color: '#ef4444', fontSize: '14px', lineHeight: 1, fontWeight: 900 }}
          title="Remove widget"
        >
          ×
        </button>
      )}

      {/* Main card body */}
      <div className="widget-body" style={{ flex: 1, minHeight: 0, height: '100%', overflowY: 'auto', overflowX: 'hidden', paddingRight: '0.15rem' }}>
        {renderContent()}
      </div>

      {/* Selected badge */}
      {isSelected && (
        <div style={{ position: 'absolute', right: '0.9rem', bottom: '0.8rem', backgroundColor: '#ffffff', padding: '0.15rem 0.35rem', borderRadius: '8px', color: '#4f46e5', fontWeight: '900', fontSize: '0.75rem', pointerEvents: 'none', textTransform: 'uppercase', letterSpacing: '0.5px', zIndex: 5 }}>
          Selected Widget
        </div>
      )}
    </div>
  );
}
