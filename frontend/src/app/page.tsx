"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Responsive, useContainerWidth, type Layout, type LayoutItem } from 'react-grid-layout';
import Navbar from '@/components/Navbar';
import MobileTabBar from '@/components/MobileTabBar';
import Widget from '@/components/Widget';
import Modal from '@/components/Modal';
import { mockArticles, mockPublishers, type NewsArticle } from '@/lib/mockData';
import { DEFAULT_LAYOUT, DEFAULT_WIDGETS, getSharedNewspaperBySlug, SHARED_NEWSPAPERS, type FeedWidget, type WidgetKind, type WidgetLayoutType } from '@/lib/prototypeNewspapers';
import { getCurrentPrototypeUser, initializePrototypeState, isFollowingSlug } from '@/lib/prototypeState';
import { loadPrototypeDashboardState, savePrototypeDashboardState } from '@/lib/prototypeDashboardState';
import { useLiveSources } from '@/hooks/useLiveSources';
import { fetchArticlesBySource, type LiveArticle } from '@/lib/articlesApi';

const WIDGET_TEMPLATE_OPTIONS: Array<{ id: WidgetLayoutType; label: string; description: string }> = [
  { id: 'card1', label: 'Feature', description: 'Large story with image and long body.' },
  { id: 'card2', label: 'Wide Brief', description: 'Horizontal image and short summary.' },
  { id: 'card3', label: 'Compact', description: 'Small image with concise body text.' },
  { id: 'card4', label: 'Text Column', description: 'Text-first column for reading.' },
  { id: 'card5', label: 'Visual Story', description: 'Title, large image, and body.' },
  { id: 'card6', label: 'Gallery', description: 'Wide feature with image strip.' },
  { id: 'editorial', label: 'Editorial', description: 'Curator commentary block with title and note.' },
  { id: 'discovery', label: 'Popular', description: 'A serendipity widget for high-signal stories outside your usual feed.' },
];

const DISCOVERY_WIDGET_OPTIONS = [
  { id: 'popular', label: 'Popular', description: 'Trending stories from the broader corpus.' },
  { id: 'random', label: 'Random', description: 'Unexpected stories sampled outside your preferences.' },
] as const;

const getPublisherArticles = (publisherId: string, liveCache: Record<string, LiveArticle[]>): NewsArticle[] => {
  // Check live RSS cache first
  if (liveCache[publisherId] && liveCache[publisherId].length > 0) {
    return liveCache[publisherId] as unknown as NewsArticle[];
  }
  const publisher = mockPublishers.find((item) => item.id === publisherId);
  if (!publisher) return mockArticles;
  const articles = publisher.articleIds
    .map((articleId) => mockArticles.find((article) => article.id === articleId))
    .filter((article): article is NewsArticle => Boolean(article));
  return articles.length > 0 ? articles : mockArticles;
};

const getInitialLayoutForWidget = (id: string, layoutType: WidgetLayoutType, existingLayout: Layout): LayoutItem => {
  const bottomY = existingLayout.reduce((maxY, item) => Math.max(maxY, item.y + item.h), 0);
  const isWide = layoutType === 'card2' || layoutType === 'card6';
  const isTall = layoutType === 'card1' || layoutType === 'card5';
  const isEditorial = layoutType === 'editorial';
  const isDiscovery = layoutType === 'discovery';

  return {
    i: id,
    x: 0,
    y: bottomY,
    w: isEditorial || isWide || isDiscovery ? 2 : 1,
    h: isEditorial ? 3 : isDiscovery ? 2 : isTall ? 4 : 3,
    minW: 1,
    minH: 1,
  };
};

export default function Home() {
  const router = useRouter();
  const { sources: liveSources } = useLiveSources();
  const [liveArticleCache, setLiveArticleCache] = useState<Record<string, LiveArticle[]>>({});
  const [loading, setLoading] = useState(true);
  const [readingMode, setReadingMode] = useState<'S' | 'H' | 'F'>('F'); // Default to 'F' (Full) as shown in the wireframe title "HomePage- Full"
  const [editMode, setEditMode] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isWidgetSettingsOpen, setIsWidgetSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Edit Mode Specific States
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [activeSettingsTab, setActiveSettingsTab] = useState<string>('Design');
  const [selectedCategory, setSelectedCategory] = useState<string>('Technology');
  const [widgets, setWidgets] = useState<FeedWidget[]>(DEFAULT_WIDGETS);
  const [layout, setLayout] = useState<Layout>(DEFAULT_LAYOUT);
  const [newWidgetPublisherId, setNewWidgetPublisherId] = useState(mockPublishers[0]?.id || '');
  const [newWidgetTemplate, setNewWidgetTemplate] = useState<WidgetLayoutType>('card3');
  const [newDiscoveryKind, setNewDiscoveryKind] = useState<'popular' | 'random'>('popular');
  const [currentUserName, setCurrentUserName] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [editorialSaveError, setEditorialSaveError] = useState('');
  const [customSources, setCustomSources] = useState<Array<{ id: string; name: string; url: string; category: string }>>([]);
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceCategory, setNewSourceCategory] = useState('Technology');
  const [sourceAddError, setSourceAddError] = useState('');
  const { width, containerRef } = useContainerWidth({ initialWidth: 1280 });
  const selectedWidget = selectedWidgetId ? widgets.find((widget) => widget.id === selectedWidgetId) : null;
  const selectedMockPublisher = mockPublishers.find((p) => p.id === newWidgetPublisherId);
  const selectedLiveSource = liveSources.find((s) => s.id === newWidgetPublisherId);
  const selectedPublisher = selectedMockPublisher
    ? { id: selectedMockPublisher.id, name: selectedMockPublisher.name, author: selectedMockPublisher.author, articleIds: selectedMockPublisher.articleIds, defaultCategory: selectedMockPublisher.defaultCategory }
    : selectedLiveSource
      ? { id: selectedLiveSource.id, name: selectedLiveSource.name, author: selectedLiveSource.name, articleIds: [], defaultCategory: selectedLiveSource.category }
      : mockPublishers[0];
  const shareUrl = 'http://localhost:3000/newspaper/share-19d2b8';

  const updateSelectedWidget = (updater: (widget: FeedWidget) => FeedWidget) => {
    if (!selectedWidgetId) return;

    setWidgets((currentWidgets) =>
      currentWidgets.map((widget) => (widget.id === selectedWidgetId ? updater(widget) : widget)),
    );
  };

  const handleAddWidget = async () => {
    const id = `widget-${Date.now()}`;
    const isEditorial = newWidgetTemplate === 'editorial';
    const isDiscovery = newWidgetTemplate === 'discovery';

    if (!isEditorial && !isDiscovery && !selectedPublisher) return;

    // Pre-fetch live articles for RSS source
    if (!isEditorial && !isDiscovery && selectedLiveSource && !liveArticleCache[selectedLiveSource.id]) {
      const articles = await fetchArticlesBySource(selectedLiveSource.id, 10);
      if (articles.length > 0) {
        setLiveArticleCache((prev) => ({ ...prev, [selectedLiveSource.id]: articles }));
      }
    }

    const newWidget: FeedWidget = isEditorial
      ? {
          id,
          title: 'Editorial Note',
          layoutType: 'editorial',
          kind: 'editorial',
          editorialBody: 'Add your angle, context, or criticism here. This note travels with the newspaper when you share it.',
        }
      : isDiscovery
        ? {
            id,
            title: newDiscoveryKind === 'popular' ? 'Popular Picks' : 'Random Discovery',
            layoutType: 'discovery',
            kind: newDiscoveryKind,
          }
        : {
            id,
            title: selectedPublisher.name,
            layoutType: newWidgetTemplate,
            publisherId: selectedPublisher.id,
            kind: 'news',
          };

    setWidgets((currentWidgets) => [...currentWidgets, newWidget]);
    setLayout((currentLayout) => [
      ...currentLayout,
      getInitialLayoutForWidget(id, newWidgetTemplate, currentLayout),
    ]);
    setSelectedWidgetId(id);
    setActiveSettingsTab(isEditorial ? 'Editorial' : isDiscovery ? 'Popular' : 'Category');
  };

  useEffect(() => {
    if (selectedWidgetId === null) {
      setActiveSettingsTab('Widgets');
    } else {
      setActiveSettingsTab(
        selectedWidget?.kind === 'editorial'
          ? 'Editorial'
          : selectedWidget?.kind === 'popular' || selectedWidget?.kind === 'random'
            ? 'Popular'
            : 'Category',
      );
      // Sync category picker to selected widget's filter
      if (selectedWidget?.categoryFilter) {
        setSelectedCategory(selectedWidget.categoryFilter);
      }
    }
  }, [selectedWidgetId, selectedWidget?.kind, selectedWidget?.categoryFilter]);

  useEffect(() => {
    initializePrototypeState();
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      router.push('/login');
    } else {
      setLoading(false);
      setCurrentUserName(getCurrentPrototypeUser()?.name || 'Prototype user');

      const savedDashboard = loadPrototypeDashboardState();
      setWidgets(savedDashboard.widgets);
      setLayout(savedDashboard.layout);
      setReadingMode(savedDashboard.readingMode);
      setIsHydrated(true);

      // Pre-fetch live articles for all news widgets
      const liveSourceIds = savedDashboard.widgets
        .filter((w) => w.kind === 'news' && w.publisherId)
        .map((w) => w.publisherId as string)
        .filter((id) => !['tech-today','culinary-delights','science-digest','global-finance'].includes(id));
      const unique = [...new Set(liveSourceIds)];
      if (unique.length > 0) {
        Promise.all(unique.map((id) => fetchArticlesBySource(id, 10))).then((results) => {
          const cache: Record<string, LiveArticle[]> = {};
          results.forEach((articles, i) => { if (articles.length > 0) cache[unique[i]] = articles; });
          setLiveArticleCache(cache);
        });
      }
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (!isHydrated) return;

    const pendingForkSlug = localStorage.getItem('pendingForkSlug');
    if (!pendingForkSlug) return;

    const sharedNewspaper = getSharedNewspaperBySlug(pendingForkSlug);
    if (!sharedNewspaper) return;

    setWidgets(sharedNewspaper.widgets);
    setLayout(sharedNewspaper.layout);
    setReadingMode(sharedNewspaper.readingMode);
    savePrototypeDashboardState({
      widgets: sharedNewspaper.widgets,
      layout: [...sharedNewspaper.layout],
      readingMode: sharedNewspaper.readingMode,
    });
    localStorage.removeItem('pendingForkSlug');
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated || loading) return;

    savePrototypeDashboardState({
      widgets,
      layout: [...layout],
      readingMode,
    });
  }, [widgets, layout, readingMode, isHydrated, loading]);

  // Select Card 1 by default when editMode is turned on
  useEffect(() => {
    if (editMode) {
      setSelectedWidgetId((currentWidgetId) => currentWidgetId || widgets[0]?.id || null);
    } else {
      setSelectedWidgetId(null);
    }
  }, [editMode, widgets]);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <p style={{ fontWeight: '600', color: '#4b5563' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        readingMode={readingMode} 
        setReadingMode={setReadingMode} 
        editMode={editMode} 
        setEditMode={setEditMode}
        onShare={() => setIsShareOpen(true)}
        onPageSettings={() => { setSelectedWidgetId(null); setIsWidgetSettingsOpen(true); }}
        isMobile={isMobile}
      />

      <main ref={containerRef} className="container" style={{ padding: isMobile ? '1rem 0.85rem 6.5rem' : '2.5rem 1.5rem 4rem', flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        {isMobile && (
          <section style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280' }}>Mobile briefing</p>
                <h1 style={{ fontSize: '1.35rem', lineHeight: 1.1, fontWeight: 900, letterSpacing: '-0.04em' }}>Your personal newspaper, rebuilt for touch.</h1>
              </div>
              <span style={{ padding: '0.45rem 0.7rem', border: '1.5px solid #111827', borderRadius: '999px', backgroundColor: '#fffdf8', fontWeight: 800, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                {editMode ? 'Editing' : 'Reading'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.1rem' }}>
              {['AI summaries', 'Popular picks', 'Editorial notes', 'Share ready'].map((label) => (
                <span key={label} style={{ padding: '0.5rem 0.8rem', border: '1px solid #111827', borderRadius: '999px', backgroundColor: '#fffdf8', fontWeight: 800, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              ))}
            </div>
          </section>
        )}
        <Responsive
          className={`feed-rgl ${editMode ? 'feed-rgl-editing' : 'feed-rgl-viewing'}`}
          width={width}
          layouts={{ lg: layout, md: layout, sm: layout, xs: layout, xxs: layout }}
          breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 0, xxs: 0 }}
          cols={{ lg: 3, md: 3, sm: 1, xs: 1, xxs: 1 }}
          rowHeight={isMobile ? (readingMode === 'F' ? 112 : 88) : readingMode === 'F' ? 120 : 96}
          margin={isMobile ? [16, 18] : [24, 44]}
          containerPadding={[0, 0]}
          dragConfig={{
            enabled: editMode,
            cancel: '.widget-settings-btn, .react-resizable-handle, button, input, textarea',
            threshold: 3,
          }}
          resizeConfig={{
            enabled: editMode,
            handles: ['se'],
          }}
          onLayoutChange={(nextLayout) => setLayout(nextLayout)}
          onDragStart={(_, item) => { if (item) setSelectedWidgetId(item.i); }}
          onResizeStart={(_, item) => { if (item) setSelectedWidgetId(item.i); }}
        >
          {widgets.map((widget) => (
            <div key={widget.id} className="feed-rgl-item">
              <Widget
                 articles={(() => {
                   const all = widget.publisherId ? getPublisherArticles(widget.publisherId, liveArticleCache) : mockArticles;
                   if (!widget.categoryFilter) return all;
                   const filtered = all.filter((a) => a.category === widget.categoryFilter);
                   return filtered.length > 0 ? filtered : all;
                 })()}
                 layoutType={widget.layoutType}
                 readingMode={readingMode}
                 editMode={editMode}
                 compact={isMobile}
                 title={widget.title}
                 kind={widget.kind}
                 editorialBody={widget.editorialBody}
                 onEditorialBodyChange={(value) => {
                   setEditorialSaveError('');
                   setWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, editorialBody: value } : w)));
                 }}
                 isSelected={selectedWidgetId === widget.id}
                 onSelect={() => setSelectedWidgetId(widget.id)}
                 onSettingsClick={() => { setSelectedWidgetId(widget.id); setIsWidgetSettingsOpen(true); }}
                 onDelete={() => {
                   setWidgets((prev) => prev.filter((w) => w.id !== widget.id));
                   setLayout((prev) => prev.filter((l) => l.i !== widget.id));
                   if (selectedWidgetId === widget.id) setSelectedWidgetId(null);
                 }}
              />
            </div>
          ))}
        </Responsive>
      </main>

      {/* Share Modal */}
      <Modal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} title="Share newspaper">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Copy the shareable link for this personalized newspaper:</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexDirection: isMobile ? 'column' : 'row' }}>
            <input 
              type="text" 
              readOnly 
              value={shareUrl} 
              style={{ flex: 1, padding: '0.6rem 0.85rem', border: '1.5px solid #111827', borderRadius: '4px', outline: 'none', fontSize: '0.9rem' }}
            />
            <button 
              className="btn" 
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                alert("Link copied to clipboard!");
              }}
              style={{ padding: '0.6rem 1.25rem', backgroundColor: '#111827', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Copy
            </button>
          </div>
        </div>
      </Modal>

      {/* Widget Settings Modal with split screen split tabs */}
      <Modal 
        isOpen={isWidgetSettingsOpen} 
        onClose={() => setIsWidgetSettingsOpen(false)} 
        title={selectedWidget ? `Widget Settings - ${selectedWidget.title}` : 'Page Settings'}
        maxWidth="750px"
        variant="floating"
      >
        <div style={{ display: 'flex', minHeight: '420px', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          {/* Left panel: tabs */}
          <div style={{ width: '148px', borderRight: '1px solid #e5e7eb', backgroundColor: '#f8f9fb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af', margin: 0 }}>
                {selectedWidgetId ? 'Widget' : 'Page'}
              </p>
              <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#111827', margin: '0.15rem 0 0' }}>
                {selectedWidgetId ? (selectedWidget?.title || 'Settings') : 'Settings'}
              </p>
            </div>
            {(selectedWidgetId
              ? selectedWidget?.kind === 'editorial'
                ? ['Editorial']
                : selectedWidget?.kind === 'popular' || selectedWidget?.kind === 'random'
                  ? ['Popular', 'I feel lucky']
                  : ['Category', 'Editorial', 'Popular', 'I feel lucky']
              : ['Widgets', 'Design', 'layout', 'share', 'following', 'sources']
            ).map(tab => {
              const isActive = activeSettingsTab === tab;
              const TAB_ICONS: Record<string, string> = {
                Widgets: '⊞', Design: '◈', layout: '⊟', share: '↑', following: '♡', sources: '⊕',
                Category: '⊕', Editorial: '✎', Popular: '↑', 'I feel lucky': '✦',
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveSettingsTab(tab)}
                  style={{
                    padding: '0.7rem 1rem',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    color: isActive ? '#2647d6' : '#6b7280',
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    borderBottom: '1px solid #f3f4f6',
                    borderLeft: isActive ? '3px solid #2647d6' : '3px solid transparent',
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{TAB_ICONS[tab] ?? '·'}</span>
                  {tab === 'Editorial' ? 'Editorial' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              );
            })}
          </div>

          {/* Right panel: content */}
          <div style={{ flex: 1, display: 'flex', backgroundColor: '#ffffff' }}>
            {/* Left part of right panel: Form Content */}
            <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
              
              {/* Selected Widget - Category */}
              {selectedWidgetId && activeSettingsTab === 'Category' && (
                <div>
                  <h4 style={{ fontWeight: '800', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Select Filter Category</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[{ label: 'All', value: '' }, 'Technology', 'Science', 'Food', 'Finance', 'Culture'].map(item => {
                      const val = typeof item === 'string' ? item : item.value;
                      const label = typeof item === 'string' ? item : item.label;
                      const isSelected = selectedCategory === val;
                      return (
                        <button
                          key={val || 'all'}
                          onClick={() => {
                            setSelectedCategory(val);
                            if (selectedWidgetId) {
                              updateSelectedWidget((w) => ({ ...w, categoryFilter: val || undefined }));
                            }
                          }}
                          style={{
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.8rem',
                            border: '1.5px solid #111827',
                            borderRadius: '4px',
                            backgroundColor: isSelected ? '#111827' : '#ffffff',
                            color: isSelected ? '#ffffff' : '#111827',
                            fontWeight: '800',
                            cursor: 'pointer',
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  {selectedWidget?.categoryFilter && (
                    <div style={{ padding: '0.55rem 0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 600 }}>
                      Showing: <strong>{selectedWidget.categoryFilter}</strong> articles only
                    </div>
                  )}
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Filtering by category narrows which stories this widget shows. Select "All" to remove the filter.
                  </p>
                </div>
              )}

              {/* Selected Widget - Editorial */}
              {selectedWidgetId && activeSettingsTab === 'Editorial' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', flex: 1 }}>
                  <h4 style={{ fontWeight: '800', fontSize: '0.95rem' }}>{selectedWidget?.kind === 'editorial' ? 'Editorial Widget' : 'Editorial Notes'}</h4>
                  <input
                    type="text"
                    value={selectedWidget?.title || ''}
                    onChange={(event) => updateSelectedWidget((widget) => ({ ...widget, title: event.target.value }))}
                    placeholder="Editorial title"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.8rem',
                      border: '1.5px solid #111827',
                      borderRadius: '8px',
                      outline: 'none',
                      fontWeight: '800',
                      fontSize: '0.88rem',
                      backgroundColor: '#ffffff'
                    }}
                  />
                  <textarea
                    value={selectedWidget?.editorialBody || ''}
                    onChange={(event) => {
                      setEditorialSaveError('');
                      updateSelectedWidget((widget) => ({ ...widget, editorialBody: event.target.value }));
                    }}
                    placeholder="Enter editorial commentary for this widget..."
                    style={{
                      width: '100%',
                      flex: 1,
                      minHeight: '120px',
                      padding: '0.5rem',
                      border: editorialSaveError ? '1.5px solid #b91c1c' : '1.5px solid #111827',
                      borderRadius: '4px',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit',
                      fontSize: '0.85rem'
                    }}
                  />
                  {editorialSaveError && (
                    <p style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 700 }}>
                      {editorialSaveError}
                    </p>
                  )}
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.45 }}>
                    This content is part of the newspaper itself and should stay visible when the layout is shared publicly.
                  </p>
                </div>
              )}

              {/* Selected Widget - Popular */}
              {selectedWidgetId && activeSettingsTab === 'Popular' && (
                <div>
                  <h4 style={{ fontWeight: '800', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                    {selectedWidget?.kind === 'random' ? 'Random Discovery Settings' : 'Popularity Metrics'}
                  </h4>
                  {selectedWidget?.kind === 'popular' || selectedWidget?.kind === 'random' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div style={{ padding: '0.8rem', border: '1.5px solid #111827', borderRadius: '8px', backgroundColor: selectedWidget?.kind === 'random' ? '#f5efe4' : '#eef3ff' }}>
                        <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: '800', color: '#111827' }}>
                          {selectedWidget?.kind === 'random' ? 'This widget is designed to break routine.' : 'This widget surfaces broadly relevant stories.'}
                        </p>
                        <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem', color: '#4b5563', lineHeight: 1.45 }}>
                          {selectedWidget?.kind === 'random'
                            ? 'Readers should encounter articles that are not tightly coupled to their normal source list.'
                            : 'Readers should see stories that matter beyond their chosen publishers and categories.'}
                        </p>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        <input type="checkbox" defaultChecked={selectedWidget?.kind === 'popular'} style={{ accentColor: '#111827' }} />
                        <span>{selectedWidget?.kind === 'random' ? 'Mix in less familiar categories' : 'Show article view count badges'}</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: '#111827' }} />
                        <span>{selectedWidget?.kind === 'random' ? 'Avoid repeating the same source twice' : 'Prioritize high-traffic articles'}</span>
                      </label>
                    </div>
                  ) : (
                  <>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: '#111827' }} />
                    <span>Show article view count badges</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', marginTop: '0.75rem' }}>
                    <input type="checkbox" style={{ accentColor: '#111827' }} />
                    <span>Prioritize high-traffic articles</span>
                  </label>
                  </>
                  )}
                </div>
              )}

              {/* Selected Widget - I feel lucky */}
              {selectedWidgetId && activeSettingsTab === 'I feel lucky' && (
                <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
                  <h4 style={{ fontWeight: '800', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Feeling Lucky?</h4>
                  <p style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '1.5rem' }}>
                    Randomize the articles currently assigned to this widget slot.
                  </p>
                  <button 
                    onClick={() => {
                      alert('Shuffled content for ' + selectedWidgetId);
                      setIsWidgetSettingsOpen(false);
                    }}
                    style={{ 
                      padding: '0.6rem 1.5rem', 
                      backgroundColor: '#111827', 
                      color: '#ffffff', 
                      border: 'none', 
                      borderRadius: '4px', 
                      fontWeight: '800', 
                      cursor: 'pointer' 
                    }}
                  >
                    Shuffle Articles
                  </button>
                </div>
              )}

              {/* Unselected - Widgets */}
              {!selectedWidgetId && activeSettingsTab === 'Widgets' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827' }}>Add Widget</h4>
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600 }}>{widgets.length} active</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {newWidgetTemplate !== 'editorial' && newWidgetTemplate !== 'discovery' && (
                      <div>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: '0.4rem' }}>Publisher</p>
                        <select
                          value={newWidgetPublisherId}
                          onChange={async (event) => {
                            const id = event.target.value;
                            setNewWidgetPublisherId(id);
                            // Pre-fetch live articles if it's an RSS source
                            if (liveSources.some((s) => s.id === id) && !liveArticleCache[id]) {
                              const articles = await fetchArticlesBySource(id, 10);
                              if (articles.length > 0) {
                                setLiveArticleCache((prev) => ({ ...prev, [id]: articles }));
                              }
                            }
                          }}
                          style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', outline: 'none', fontWeight: 700, fontSize: '0.85rem', backgroundColor: '#ffffff', color: '#111827', appearance: 'auto' }}
                        >
                          <optgroup label="Mock sources">
                            {mockPublishers.map((publisher) => (
                              <option key={publisher.id} value={publisher.id}>
                                {publisher.name} — {publisher.author}
                              </option>
                            ))}
                          </optgroup>
                          {liveSources.length > 0 && (
                            <optgroup label="Live RSS sources">
                              {liveSources.map((source) => (
                                <option key={source.id} value={source.id}>
                                  {source.name} ({source.category})
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>
                    )}

                    <div>
                      <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: '0.5rem' }}>Widget Template</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                        {WIDGET_TEMPLATE_OPTIONS.map((template) => {
                          const isSelected = newWidgetTemplate === template.id;
                          const TEMPLATE_ICONS: Record<string, string> = {
                            card1: '⬛', card2: '▬', card3: '⊞', card4: '≡',
                            card5: '▤', card6: '⊟', editorial: '✎', discovery: '✦',
                          };
                          return (
                            <button
                              key={template.id}
                              onClick={() => setNewWidgetTemplate(template.id)}
                              style={{
                                padding: '0.6rem 0.7rem',
                                border: isSelected ? '2px solid #2647d6' : '1px solid #e5e7eb',
                                borderRadius: '10px',
                                backgroundColor: isSelected ? '#eff4ff' : '#fafafa',
                                color: isSelected ? '#1e40af' : '#374151',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.12s ease',
                              }}
                            >
                              <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 900, marginBottom: '0.15rem' }}>
                                <span style={{ marginRight: '0.3rem', opacity: 0.6 }}>{TEMPLATE_ICONS[template.id] ?? '·'}</span>
                                {template.label}
                              </span>
                              <span style={{ display: 'block', fontSize: '0.66rem', lineHeight: 1.4, color: isSelected ? '#3b82f6' : '#9ca3af' }}>
                                {template.description}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {newWidgetTemplate === 'discovery' && (
                      <div>
                        <h5 style={{ fontSize: '0.85rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>Discovery Mode</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          {DISCOVERY_WIDGET_OPTIONS.map((option) => {
                            const isSelected = newDiscoveryKind === option.id;

                            return (
                              <button
                                key={option.id}
                                onClick={() => setNewDiscoveryKind(option.id)}
                                style={{
                                  padding: '0.65rem',
                                  border: '1.5px solid #111827',
                                  borderRadius: '4px',
                                  backgroundColor: isSelected ? '#111827' : '#ffffff',
                                  color: isSelected ? '#ffffff' : '#111827',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: '900' }}>{option.label}</span>
                                <span style={{ display: 'block', fontSize: '0.7rem', lineHeight: 1.3, opacity: isSelected ? 0.85 : 0.7 }}>
                                  {option.description}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {newWidgetTemplate !== 'editorial' && newWidgetTemplate !== 'discovery' && selectedPublisher && (
                      <div style={{ padding: '0.75rem', border: '1.5px solid #111827', borderRadius: '4px', backgroundColor: '#f9fafb' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '800', color: '#111827' }}>
                          {selectedPublisher.name}
                        </p>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#4b5563', lineHeight: 1.35 }}>
                          {selectedPublisher.defaultCategory} publisher by {selectedPublisher.author}.{' '}
                          {selectedLiveSource
                            ? 'Live RSS feed — articles fetched in real time.'
                            : `This widget will start with ${selectedPublisher.articleIds.length} local article${selectedPublisher.articleIds.length === 1 ? '' : 's'}.`}
                        </p>
                      </div>
                    )}
                    {newWidgetTemplate === 'editorial' && (
                      <div style={{ padding: '0.75rem', border: '1.5px solid #111827', borderRadius: '4px', backgroundColor: '#eef3ff' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '800', color: '#111827' }}>
                          Editorial widget
                        </p>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#4b5563', lineHeight: 1.35 }}>
                          Add your own commentary directly into the newspaper so shared readers can see both the articles and your framing.
                        </p>
                      </div>
                    )}
                    {newWidgetTemplate === 'discovery' && (
                      <div style={{ padding: '0.75rem', border: '1.5px solid #111827', borderRadius: '4px', backgroundColor: newDiscoveryKind === 'popular' ? '#eef3ff' : '#f5efe4' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '800', color: '#111827' }}>
                          {newDiscoveryKind === 'popular' ? 'Popular widget' : 'Random widget'}
                        </p>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#4b5563', lineHeight: 1.35 }}>
                          {newDiscoveryKind === 'popular'
                            ? 'A non-personalized high-signal section that surfaces broadly relevant stories.'
                            : 'A serendipity section designed to expose readers to something they would not normally choose.'}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleAddWidget}
                      style={{
                        alignSelf: 'flex-start',
                        padding: '0.55rem 1rem',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: '#111827',
                        color: '#ffffff',
                        fontWeight: '900',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Add Widget
                    </button>
                  </div>
                </div>
              )}

              {/* Unselected - Design */}
              {!selectedWidgetId && activeSettingsTab === 'Design' && (
                <div>
                  <h4 style={{ fontWeight: '800', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Appearance Theme</h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['Light', 'Dark', 'Sepia'].map(theme => (
                      <button
                        key={theme}
                        onClick={() => alert(`Theme changed to ${theme}`)}
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.8rem',
                          border: '1.5px solid #111827',
                          borderRadius: '4px',
                          backgroundColor: theme === 'Light' ? '#111827' : '#ffffff',
                          color: theme === 'Light' ? '#ffffff' : '#111827',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                  <h4 style={{ fontWeight: '800', margin: '1.25rem 0 0.75rem 0', fontSize: '0.95rem' }}>Typography</h4>
                  <select style={{ padding: '0.5rem', border: '1.5px solid #111827', borderRadius: '4px', width: '100%', outline: 'none', fontWeight: 'bold' }}>
                    <option>Serif (Classic Newspaper)</option>
                    <option>Sans-Serif (Modern Clean)</option>
                    <option>Mono (Tech/Code)</option>
                  </select>
                </div>
              )}

              {/* Unselected - layout */}
              {!selectedWidgetId && activeSettingsTab === 'layout' && (
                <div>
                  <h4 style={{ fontWeight: '800', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Grid Layout Style</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {['Standard (3 Columns)', 'Compact Grid (4 Columns)', 'List View (Single Column)'].map((layoutOption, i) => (
                      <label key={layoutOption} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>
                        <input type="radio" name="layout-style" defaultChecked={i === 0} style={{ accentColor: '#111827' }} />
                        <span>{layoutOption}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Unselected - share */}
              {!selectedWidgetId && activeSettingsTab === 'share' && (
                <div>
                  <h4 style={{ fontWeight: '800', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Share Newspaper</h4>
                  <p style={{ fontSize: '0.8rem', color: '#4b5563', marginBottom: '0.75rem' }}>Copy and share the URL for your customized daily feed:</p>
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1.5px solid #111827',
                      borderRadius: '4px',
                      outline: 'none',
                      fontSize: '0.85rem',
                      marginBottom: '0.5rem'
                    }}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      alert("Link copied to clipboard!");
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#111827',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Copy Link
                  </button>
                </div>
              )}

              {/* Unselected - following */}
              {!selectedWidgetId && activeSettingsTab === 'following' && (
                <div>
                  <h4 style={{ fontWeight: '800', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Following Newspapers</h4>
                  <p style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '0.85rem', lineHeight: 1.45 }}>
                    {currentUserName ? `${currentUserName} can reopen followed public newspapers from here.` : 'Followed public newspapers appear here.'}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {SHARED_NEWSPAPERS.filter((item) => isFollowingSlug(item.slug)).map((newspaper) => (
                      <div key={newspaper.slug} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.7rem 0.8rem', border: '1.5px solid #111827', borderRadius: '12px', backgroundColor: '#fffdf8' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 800, fontSize: '0.84rem', color: '#111827' }}>{newspaper.name}</p>
                          <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#6b7280' }}>by {newspaper.curator}</p>
                        </div>
                        <span style={{ padding: '0.35rem 0.6rem', borderRadius: '999px', border: '1px solid #111827', backgroundColor: '#efe7da', fontWeight: 800, fontSize: '0.72rem' }}>
                          Following
                        </span>
                      </div>
                    ))}
                    {SHARED_NEWSPAPERS.every((item) => !isFollowingSlug(item.slug)) && (
                      <div style={{ padding: '0.8rem', border: '1.5px dashed #111827', borderRadius: '12px', backgroundColor: '#f9fafb', fontSize: '0.8rem', color: '#6b7280' }}>
                        No followed newspapers yet. Go to Discover and follow a curator to populate this list.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Unselected - sources (UC-07) */}
              {!selectedWidgetId && activeSettingsTab === 'sources' && (
                <div>
                  <h4 style={{ fontWeight: '800', marginBottom: '0.25rem', fontSize: '0.95rem' }}>RSS Sources</h4>
                  <p style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '0.85rem', lineHeight: 1.45 }}>
                    Live news feeds from your sources appear in widgets that use them.
                  </p>

                  {/* Built-in sources */}
                  <p style={{ margin: '0 0 0.4rem', fontSize: '0.73rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Built-in feeds</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
                    {liveSources.map((src) => (
                      <div key={src.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.8rem', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#fffdf8' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.83rem', color: '#111827' }}>{src.name}</p>
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: '#6b7280' }}>{src.category} · {src.language.toUpperCase()}</p>
                        </div>
                        <span style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.7rem', fontWeight: 700 }}>Active</span>
                      </div>
                    ))}
                  </div>

                  {/* Custom sources */}
                  {customSources.length > 0 && (
                    <>
                      <p style={{ margin: '0 0 0.4rem', fontSize: '0.73rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your feeds</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
                        {customSources.map((src) => (
                          <div key={src.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.8rem', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#fffdf8' }}>
                            <div>
                              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.83rem', color: '#111827' }}>{src.name}</p>
                              <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: '#6b7280' }}>{src.category}</p>
                            </div>
                            <button
                              onClick={() => setCustomSources((prev) => prev.filter((s) => s.id !== src.id))}
                              style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', border: '1px solid #fca5a5', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Add new source form (TC-UC07-01, TC-UC07-02, TC-UC07-03) */}
                  <p style={{ margin: '0 0 0.6rem', fontSize: '0.73rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add RSS feed</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Feed name"
                      value={newSourceName}
                      onChange={(e) => { setNewSourceName(e.target.value); setSourceAddError(''); }}
                      style={{ padding: '0.5rem 0.7rem', border: sourceAddError && !newSourceName.trim() ? '1.5px solid #ef4444' : '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.82rem', outline: 'none' }}
                    />
                    <input
                      type="url"
                      placeholder="https://example.com/feed.xml"
                      value={newSourceUrl}
                      onChange={(e) => { setNewSourceUrl(e.target.value); setSourceAddError(''); }}
                      style={{ padding: '0.5rem 0.7rem', border: sourceAddError && !newSourceUrl.trim() ? '1.5px solid #ef4444' : '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.82rem', outline: 'none' }}
                    />
                    <select
                      value={newSourceCategory}
                      onChange={(e) => setNewSourceCategory(e.target.value)}
                      style={{ padding: '0.5rem 0.7rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.82rem', backgroundColor: '#ffffff', outline: 'none' }}
                    >
                      {['Technology', 'Science', 'Finance', 'Food', 'Culture'].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {sourceAddError && (
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>{sourceAddError}</p>
                    )}
                    <button
                      onClick={() => {
                        const name = newSourceName.trim();
                        const url = newSourceUrl.trim();
                        if (!name) { setSourceAddError('Feed name is required.'); return; }
                        if (!url) { setSourceAddError('RSS URL is required.'); return; }
                        // TC-UC07-02: validate URL format
                        try { new URL(url); } catch { setSourceAddError('Enter a valid URL (must start with https://).'); return; }
                        if (!url.startsWith('http')) { setSourceAddError('URL must start with http:// or https://.'); return; }
                        // TC-UC07-03: prevent duplicates
                        const allUrls = [...liveSources.map((s) => s.url), ...customSources.map((s) => s.url)];
                        if (allUrls.includes(url)) { setSourceAddError('This feed URL is already added.'); return; }
                        setCustomSources((prev) => [...prev, { id: `custom-${Date.now()}`, name, url, category: newSourceCategory }]);
                        setNewSourceName('');
                        setNewSourceUrl('');
                        setSourceAddError('');
                      }}
                      style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', backgroundColor: '#2647d6', color: '#ffffff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      Add feed
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Actions inside content panel */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                <button onClick={() => setIsWidgetSettingsOpen(false)} style={{ padding: '0.45rem 1.1rem', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', color: '#374151' }}>
                  Cancel
                </button>
                <button onClick={() => {
                  // TC-UC11-02: block save when editorial widget body is empty
                  if (selectedWidget?.kind === 'editorial' && !selectedWidget?.editorialBody?.trim()) {
                    setEditorialSaveError('Editorial note cannot be empty. Add your commentary before saving.');
                    setActiveSettingsTab('Editorial');
                    return;
                  }
                  setEditorialSaveError('');
                  savePrototypeDashboardState({
                    widgets,
                    layout: [...layout],
                    readingMode,
                  });
                  setIsWidgetSettingsOpen(false);
                  alert('Settings saved successfully!');
                }} style={{ padding: '0.45rem 1.1rem', border: 'none', borderRadius: '8px', backgroundColor: '#2647d6', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                  Save
                </button>
              </div>

            </div>

            {/* Right part of right panel: Layout Preview */}
            <div style={{
              width: '220px',
              borderLeft: '1px solid #e5e7eb',
              backgroundColor: '#fafafa',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              ...(isMobile ? { display: 'none' } : {})
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontWeight: '800', fontSize: '0.95rem', margin: 0 }}>Layout Preview</h4>
                  {selectedWidgetId && (
                    <button 
                      onClick={() => setSelectedWidgetId(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#4f46e5',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Deselect
                    </button>
                  )}
                </div>

                {/* 6-Widget Mini Grid — semantic colors */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gridTemplateRows: 'repeat(4, 1fr)', gap: '0.35rem', width: '100%', height: '175px', backgroundColor: '#f0ede8', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '0.4rem', boxSizing: 'border-box' }}>
                  {[
                    { id: 'slot0', name: 'W1', style: { gridColumn: '1', gridRow: '1 / 3' } },
                    { id: 'slot1', name: 'W2', style: { gridColumn: '2 / 4', gridRow: '1' } },
                    { id: 'slot2', name: 'W3', style: { gridColumn: '2', gridRow: '2' } },
                    { id: 'slot3', name: 'W4', style: { gridColumn: '3', gridRow: '2' } },
                    { id: 'slot4', name: 'W5', style: { gridColumn: '1', gridRow: '3 / 5' } },
                    { id: 'slot5', name: 'W6', style: { gridColumn: '2 / 4', gridRow: '3 / 5' } },
                  ].map((slot, index) => {
                    const widget = widgets[index];
                    const isSelected = Boolean(widget && selectedWidgetId === widget.id);
                    const slotBg = isSelected
                      ? '#2647d6'
                      : widget?.kind === 'editorial' ? '#dbeafe'
                      : widget?.kind === 'popular' || widget?.kind === 'random' ? '#ede9fe'
                      : widget ? '#dcfce7'
                      : '#f3f4f6';

                    return (
                      <div
                        key={slot.id}
                        onClick={() => { if (widget) setSelectedWidgetId(isSelected ? null : widget.id); }}
                        style={{
                          ...slot.style,
                          backgroundColor: slotBg,
                          border: isSelected ? '2px solid #2647d6' : '1px solid #d1ccc5',
                          borderRadius: '6px',
                          cursor: widget ? 'pointer' : 'default',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          color: isSelected ? '#ffffff' : widget ? '#374151' : '#d1d5db',
                          transition: 'all 0.12s ease',
                        }}
                        title={widget ? `Select ${widget.title}` : 'Empty slot'}
                      >
                        {widget ? slot.name : '+'}
                      </div>
                    );
                  })}
                </div>
                {widgets.length > 6 && (
                  <div style={{ marginTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: '88px', overflowY: 'auto' }}>
                    {widgets.slice(6).map((widget, index) => {
                      const isSelected = selectedWidgetId === widget.id;
                      return (
                        <button
                          key={widget.id}
                          onClick={() => setSelectedWidgetId(isSelected ? null : widget.id)}
                          style={{ padding: '0.3rem 0.5rem', border: `1px solid ${isSelected ? '#2647d6' : '#e5e7eb'}`, borderRadius: '6px', backgroundColor: isSelected ? '#eff4ff' : '#ffffff', color: isSelected ? '#2647d6' : '#374151', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}
                        >
                          W{index + 7} — {widget.title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom: reading mode hint */}
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '0.85rem', marginTop: '0.85rem' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: '0.4rem' }}>Reading mode</p>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  {(['F', 'S', 'H'] as const).map((m) => (
                    <span key={m} style={{ padding: '0.22rem 0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.68rem', fontWeight: 800, backgroundColor: readingMode === m ? '#111827' : '#ffffff', color: readingMode === m ? '#fff' : '#6b7280' }}>
                      {m === 'F' ? 'Full' : m === 'S' ? 'Scan' : 'Skim'}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </Modal>
      {isMobile && <MobileTabBar active="feed" />}
    </div>
  );
}
