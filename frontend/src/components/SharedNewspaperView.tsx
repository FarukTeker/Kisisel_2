"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Responsive, useContainerWidth } from 'react-grid-layout';
import Widget from '@/components/Widget';
import { mockArticles, mockPublishers, type NewsArticle } from '@/lib/mockData';
import type { SharedNewspaper } from '@/lib/prototypeNewspapers';
import { getCurrentPrototypeUser, initializePrototypeState, isFollowingSlug, toggleFollowSlug } from '@/lib/prototypeState';

interface SharedNewspaperViewProps {
  newspaper: SharedNewspaper;
}

const getPublisherArticles = (publisherId?: string): NewsArticle[] => {
  if (!publisherId) return mockArticles;

  const publisher = mockPublishers.find((item) => item.id === publisherId);
  if (!publisher) return mockArticles;

  const articles = publisher.articleIds
    .map((articleId) => mockArticles.find((article) => article.id === articleId))
    .filter((article): article is NewsArticle => Boolean(article));

  return articles.length > 0 ? articles : mockArticles;
};

export default function SharedNewspaperView({ newspaper }: SharedNewspaperViewProps) {
  const router = useRouter();
  const { width, containerRef } = useContainerWidth({ initialWidth: 1280 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  useEffect(() => {
    initializePrototypeState();
    setIsFollowing(isFollowingSlug(newspaper.slug));
    setCurrentUserName(getCurrentPrototypeUser()?.name || null);
  }, [newspaper.slug]);

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
              onClick={() => {
                const nextUser = toggleFollowSlug(newspaper.slug);
                if (!nextUser) {
                  router.push('/login');
                  return;
                }

                setIsFollowing(nextUser.followingSlugs.includes(newspaper.slug));
                setCurrentUserName(nextUser.name);
              }}
              style={{ padding: '0.8rem 1rem', borderRadius: '999px', border: '1px solid rgba(23,23,23,0.12)', backgroundColor: isFollowing ? '#eef0f8' : '#ffffff', fontWeight: 800, boxShadow: '0 10px 24px rgba(17,24,39,0.07)' }}
            >
              {isFollowing ? 'Following' : 'Follow curator'}
            </button>
            <button
              onClick={() => {
                const currentUser = getCurrentPrototypeUser();
                if (!currentUser) {
                  router.push('/login');
                  return;
                }
                localStorage.setItem('pendingForkSlug', newspaper.slug);
                router.push('/');
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
                  articles={getPublisherArticles(widget.publisherId)}
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
