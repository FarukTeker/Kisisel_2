"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Responsive, useContainerWidth } from 'react-grid-layout';
import Widget from '@/components/Widget';
import type { SharedNewspaper } from '@/lib/prototypeNewspapers';
import { getCurrentUser, isFollowingSlug, toggleFollowSlug } from '@/lib/prototypeState';
import { fetchArticlesBySource, type LiveArticle } from '@/lib/articlesApi';

interface SharedNewspaperViewProps {
  newspaper: SharedNewspaper;
}

export default function SharedNewspaperView({ newspaper }: SharedNewspaperViewProps) {
  const router = useRouter();
  const { width, containerRef } = useContainerWidth({ initialWidth: 1280 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [liveArticleCache, setLiveArticleCache] = useState<Record<string, LiveArticle[]>>({});

  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUserName(user.name);
        setIsFollowing(isFollowingSlug(newspaper.slug));
      }
    }
    loadUser();

    // Prefetch articles
    const liveSourceIds = newspaper.widgets
      .filter((w) => w.kind === 'news' && w.publisherId)
      .map((w) => w.publisherId as string);
    const unique = [...new Set(liveSourceIds)];
    if (unique.length > 0) {
      Promise.all(unique.map((id) => fetchArticlesBySource(id, 10))).then((results) => {
        const cache: Record<string, LiveArticle[]> = {};
        results.forEach((articles, i) => { if (articles.length > 0) cache[unique[i]] = articles; });
        setLiveArticleCache(cache);
      });
    }
  }, [newspaper.slug, newspaper.widgets]);

  const getPublisherArticles = (publisherId?: string): LiveArticle[] => {
    if (!publisherId) return [];
    return liveArticleCache[publisherId] || [];
  };

  return (
    <div style={{ minHeight: '100vh', padding: '1.2rem 1rem 3rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1.15rem 1.25rem', border: '1px solid rgba(23,23,23,0.12)', borderRadius: '26px', background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, #fffaf1 100%)', boxShadow: '0 18px 40px rgba(17,24,39,0.09)' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#315efb', marginBottom: '0.45rem' }}>
              Public newspaper · read only
            </p>
            <h1 style={{ fontSize: '1.8rem', lineHeight: 1.02, fontWeight: 900, letterSpacing: '-0.05em', margin: 0 }}>{newspaper.name}</h1>
            <p style={{ margin: '0.55rem 0 0', color: '#5f5b54', maxWidth: '760px', lineHeight: 1.58, fontSize: '0.95rem' }}>
              Curated by {newspaper.curator}. {newspaper.description}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              onClick={async () => {
                const user = await getCurrentUser();
                if (!user) {
                  router.push('/login');
                  return;
                }
                const nextUser = toggleFollowSlug(newspaper.slug);
                if (nextUser) {
                  setIsFollowing(true); // actually toggleFollowSlug is deprecated but let's keep it simple for now
                }
              }}
              style={{ padding: '0.8rem 1rem', borderRadius: '999px', border: '1px solid rgba(23,23,23,0.12)', backgroundColor: isFollowing ? '#eef0f8' : '#ffffff', fontWeight: 800, boxShadow: '0 10px 24px rgba(17,24,39,0.07)' }}
            >
              {isFollowing ? 'Following' : 'Follow curator'}
            </button>
            <button
              onClick={async () => {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                  router.push('/login');
                  return;
                }
                // We're skipping the fork logic as mentioned in page.tsx
                alert('Forking not yet fully implemented');
              }}
              style={{ padding: '0.8rem 1rem', borderRadius: '999px', border: '1px solid rgba(23,23,23,0.12)', background: 'linear-gradient(180deg, #1e2433 0%, #111827 100%)', color: '#ffffff', fontWeight: 800, boxShadow: '0 10px 24px rgba(17,24,39,0.16)' }}
            >
              Use this layout
            </button>
          </div>
        </div>

        <div style={{ padding: '0.9rem 1rem', border: '1px dashed rgba(23,23,23,0.18)', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.64)', color: '#5f5b54', fontSize: '0.85rem', backdropFilter: 'blur(8px)' }}>
          {currentUserName ? `${currentUserName} is viewing this public newspaper in read-only mode.` : 'Public visitors can read this newspaper in read-only mode.'}
        </div>

        <div ref={containerRef}>
          <Responsive
            className="feed-rgl feed-rgl-viewing"
            width={width}
            layouts={{ lg: newspaper.layout, md: newspaper.layout, sm: newspaper.layout, xs: newspaper.layout, xxs: newspaper.layout }}
            breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 0, xxs: 0 }}
            cols={{ lg: 3, md: 3, sm: 1, xs: 1, xxs: 1 }}
            rowHeight={newspaper.readingMode === 'F' ? 120 : 96}
            margin={[24, 28]}
            containerPadding={[0, 0]}
            dragConfig={{ enabled: false }}
            resizeConfig={{ enabled: false }}
          >
            {newspaper.widgets.map((widget) => (
              <div key={widget.id} className="feed-rgl-item">
                <Widget
                  articles={(() => {
                    const all = getPublisherArticles(widget.publisherId);
                    if (!widget.categoryFilter) return all;
                    const filtered = all.filter((a) => a.category === widget.categoryFilter);
                    return filtered.length > 0 ? filtered : all;
                  })() as any}
                  layoutType={widget.layoutType}
                  readingMode={newspaper.readingMode}
                  editMode={false}
                  title={widget.title}
                  kind={widget.kind}
                  editorialBody={widget.editorialBody}
                />
              </div>
            ))}
          </Responsive>
        </div>
      </div>
    </div>
  );
}
