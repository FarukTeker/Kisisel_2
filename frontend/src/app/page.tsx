"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Responsive, useContainerWidth, type Layout, type LayoutItem } from 'react-grid-layout';
import Navbar from '@/components/Navbar';
import Widget from '@/components/Widget';
import Modal from '@/components/Modal';
import { mockArticles, mockPublishers, type NewsArticle } from '@/lib/mockData';

type WidgetLayoutType = 'card1' | 'card2' | 'card3' | 'card4' | 'card5' | 'card6';

interface FeedWidget {
  id: string;
  title: string;
  layoutType: WidgetLayoutType;
  publisherId: string;
}

const DEFAULT_WIDGETS: FeedWidget[] = [
  { id: 'card1', title: 'Lead Story', layoutType: 'card1', publisherId: 'tech-today' },
  { id: 'card2', title: 'Market Watch', layoutType: 'card2', publisherId: 'global-finance' },
  { id: 'card3', title: 'Food Brief', layoutType: 'card3', publisherId: 'culinary-delights' },
  { id: 'card4', title: 'Science Column', layoutType: 'card4', publisherId: 'science-digest' },
  { id: 'card5', title: 'Culture Story', layoutType: 'card5', publisherId: 'tech-today' },
  { id: 'card6', title: 'Mars Feature', layoutType: 'card6', publisherId: 'science-digest' },
];

const WIDGET_TEMPLATE_OPTIONS: Array<{ id: WidgetLayoutType; label: string; description: string }> = [
  { id: 'card1', label: 'Feature', description: 'Large story with image and long body.' },
  { id: 'card2', label: 'Wide Brief', description: 'Horizontal image and short summary.' },
  { id: 'card3', label: 'Compact', description: 'Small image with concise body text.' },
  { id: 'card4', label: 'Text Column', description: 'Text-first column for reading.' },
  { id: 'card5', label: 'Visual Story', description: 'Title, large image, and body.' },
  { id: 'card6', label: 'Gallery', description: 'Wide feature with image strip.' },
];

const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: 'card1', x: 0, y: 0, w: 1, h: 5, minW: 1, minH: 2 },
  { i: 'card2', x: 1, y: 0, w: 2, h: 2, minW: 1, minH: 1 },
  { i: 'card3', x: 1, y: 2, w: 1, h: 3, minW: 1, minH: 1 },
  { i: 'card4', x: 2, y: 2, w: 1, h: 3, minW: 1, minH: 1 },
  { i: 'card5', x: 0, y: 5, w: 1, h: 3, minW: 1, minH: 1 },
  { i: 'card6', x: 1, y: 5, w: 2, h: 3, minW: 1, minH: 1 },
];

const getPublisherArticles = (publisherId: string): NewsArticle[] => {
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

  return {
    i: id,
    x: 0,
    y: bottomY,
    w: isWide ? 2 : 1,
    h: isTall ? 4 : 3,
    minW: 1,
    minH: 1,
  };
};

export default function Home() {
  const router = useRouter();
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
  const { width, containerRef } = useContainerWidth({ initialWidth: 1280 });
  const selectedWidget = selectedWidgetId ? widgets.find((widget) => widget.id === selectedWidgetId) : null;
  const selectedPublisher = mockPublishers.find((publisher) => publisher.id === newWidgetPublisherId) || mockPublishers[0];

  const handleAddWidget = () => {
    if (!selectedPublisher) return;

    const id = `widget-${Date.now()}`;
    const newWidget: FeedWidget = {
      id,
      title: selectedPublisher.name,
      layoutType: newWidgetTemplate,
      publisherId: selectedPublisher.id,
    };

    setWidgets((currentWidgets) => [...currentWidgets, newWidget]);
    setLayout((currentLayout) => [
      ...currentLayout,
      getInitialLayoutForWidget(id, newWidgetTemplate, currentLayout),
    ]);
    setSelectedWidgetId(id);
    setActiveSettingsTab('Category');
  };

  useEffect(() => {
    if (selectedWidgetId === null) {
      setActiveSettingsTab('Widgets');
    } else {
      setActiveSettingsTab('Category');
    }
  }, [selectedWidgetId]);

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      router.push('/login');
    } else {
      setLoading(false);
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [router]);

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      <Navbar 
        readingMode={readingMode} 
        setReadingMode={setReadingMode} 
        editMode={editMode} 
        setEditMode={setEditMode}
        onShare={() => setIsShareOpen(true)}
        onPageSettings={() => { setSelectedWidgetId(null); setIsWidgetSettingsOpen(true); }}
      />

      <main ref={containerRef} className="container" style={{ padding: '2.5rem 1.5rem 4rem', flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <Responsive
          className={`feed-rgl ${editMode ? 'feed-rgl-editing' : 'feed-rgl-viewing'}`}
          width={width}
          layouts={{ lg: layout, md: layout, sm: layout, xs: layout, xxs: layout }}
          breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 0, xxs: 0 }}
          cols={{ lg: 3, md: 3, sm: 1, xs: 1, xxs: 1 }}
          rowHeight={readingMode === 'F' ? 120 : 96}
          margin={[24, 44]}
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
                articles={getPublisherArticles(widget.publisherId)}
                layoutType={widget.layoutType}
                readingMode={readingMode}
                editMode={editMode}
                isSelected={selectedWidgetId === widget.id}
                onSelect={() => setSelectedWidgetId(widget.id)}
                onSettingsClick={() => { setSelectedWidgetId(widget.id); setIsWidgetSettingsOpen(true); }}
              />
            </div>
          ))}
        </Responsive>
      </main>

      {/* Share Modal */}
      <Modal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} title="Share newspaper">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Copy the shareable link for this personalized newspaper:</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              readOnly 
              value="https://feedaily.com/newspaper/share-19d2b8" 
              style={{ flex: 1, padding: '0.6rem 0.85rem', border: '1.5px solid #111827', borderRadius: '4px', outline: 'none', fontSize: '0.9rem' }}
            />
            <button 
              className="btn" 
              onClick={() => {
                navigator.clipboard.writeText("https://feedaily.com/newspaper/share-19d2b8");
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
        <div style={{ display: 'flex', minHeight: '380px', border: '1.5px solid #111827', borderRadius: '4px', overflow: 'hidden' }}>
          {/* Left panel: tabs */}
          <div style={{ width: '130px', borderRight: '1.5px solid #111827', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
            {(selectedWidgetId 
              ? ['Category', 'Editorial', 'Popular', 'I feel lucky'] 
              : ['Widgets', 'Design', 'layout', 'share', 'following']
            ).map(tab => {
              const isActive = activeSettingsTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveSettingsTab(tab)}
                  style={{
                    padding: '1rem 0.75rem',
                    textAlign: 'left',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    color: '#111827',
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    borderBottom: '1.5px solid #111827',
                    borderRight: isActive ? 'none' : '1.5px solid transparent',
                    cursor: 'pointer',
                    outline: 'none',
                    marginRight: isActive ? '-1.5px' : '0'
                  }}
                >
                  {tab === 'Editorial' ? 'Editional' : tab}
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
                    {['Technology', 'Science', 'Food', 'Finance', 'Culture'].map(cat => {
                      const isSelected = selectedCategory === cat;
                      return (
                        <button 
                          key={cat} 
                          onClick={() => setSelectedCategory(cat)}
                          style={{ 
                            padding: '0.5rem 0.75rem', 
                            fontSize: '0.8rem', 
                            border: '1.5px solid #111827', 
                            borderRadius: '4px', 
                            backgroundColor: isSelected ? '#111827' : '#ffffff', 
                            color: isSelected ? '#ffffff' : '#111827',
                            fontWeight: '800', 
                            cursor: 'pointer' 
                          }}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem' }}>
                    Filtering by Category shifts the stories loaded inside this widget.
                  </p>
                </div>
              )}

              {/* Selected Widget - Editorial */}
              {selectedWidgetId && activeSettingsTab === 'Editorial' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', flex: 1 }}>
                  <h4 style={{ fontWeight: '800', fontSize: '0.95rem' }}>Editorial Notes</h4>
                  <textarea 
                    placeholder="Enter editorial commentary for this widget..." 
                    style={{ 
                      width: '100%', 
                      flex: 1, 
                      minHeight: '120px', 
                      padding: '0.5rem', 
                      border: '1.5px solid #111827', 
                      borderRadius: '4px', 
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit',
                      fontSize: '0.85rem'
                    }} 
                  />
                </div>
              )}

              {/* Selected Widget - Popular */}
              {selectedWidgetId && activeSettingsTab === 'Popular' && (
                <div>
                  <h4 style={{ fontWeight: '800', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Popularity Metrics</h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: '#111827' }} />
                    <span>Show article view count badges</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', marginTop: '0.75rem' }}>
                    <input type="checkbox" style={{ accentColor: '#111827' }} />
                    <span>Prioritize high-traffic articles</span>
                  </label>
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
                  <h4 style={{ fontWeight: '800', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Add Widget</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontWeight: '800', fontSize: '0.85rem' }}>
                      Publisher
                      <select
                        value={newWidgetPublisherId}
                        onChange={(event) => setNewWidgetPublisherId(event.target.value)}
                        style={{
                          padding: '0.55rem 0.65rem',
                          border: '1.5px solid #111827',
                          borderRadius: '4px',
                          outline: 'none',
                          fontWeight: '700',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        {mockPublishers.map((publisher) => (
                          <option key={publisher.id} value={publisher.id}>
                            {publisher.name} - {publisher.author}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>Widget Template</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {WIDGET_TEMPLATE_OPTIONS.map((template) => {
                          const isSelected = newWidgetTemplate === template.id;

                          return (
                            <button
                              key={template.id}
                              onClick={() => setNewWidgetTemplate(template.id)}
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
                              <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: '900' }}>{template.label}</span>
                              <span style={{ display: 'block', fontSize: '0.7rem', lineHeight: 1.3, opacity: isSelected ? 0.85 : 0.7 }}>
                                {template.description}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedPublisher && (
                      <div style={{ padding: '0.75rem', border: '1.5px solid #111827', borderRadius: '4px', backgroundColor: '#f9fafb' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '800', color: '#111827' }}>
                          {selectedPublisher.name}
                        </p>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#4b5563', lineHeight: 1.35 }}>
                          {selectedPublisher.defaultCategory} publisher by {selectedPublisher.author}. This widget will start with {selectedPublisher.articleIds.length} local article{selectedPublisher.articleIds.length === 1 ? '' : 's'}.
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
                    value="https://feedaily.com/newspaper/share-19d2b8"
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
                      navigator.clipboard.writeText("https://feedaily.com/newspaper/share-19d2b8");
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
                  <h4 style={{ fontWeight: '800', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Following Publishers</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {mockPublishers.map((publisher) => (
                      <label key={publisher.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: '#111827' }} />
                        <span>{publisher.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Actions inside content panel */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <button onClick={() => setIsWidgetSettingsOpen(false)} style={{ padding: '0.4rem 1rem', border: '1.5px solid #111827', borderRadius: '4px', backgroundColor: '#ffffff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Cancel
                </button>
                <button onClick={() => { setIsWidgetSettingsOpen(false); alert('Settings saved successfully!'); }} style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '4px', backgroundColor: '#111827', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Save
                </button>
              </div>

            </div>

            {/* Right part of right panel: Layout Preview & Input Field */}
            <div style={{
              width: '240px',
              borderLeft: '1.5px solid #111827',
              backgroundColor: '#f9fafb',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box'
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

                {/* 6-Widget Mini Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1.2fr 1fr 1fr', 
                  gridTemplateRows: 'repeat(4, 1fr)',
                  gap: '0.4rem', 
                  width: '100%', 
                  height: '170px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #111827',
                  borderRadius: '4px',
                  padding: '0.4rem',
                  boxSizing: 'border-box'
                }}>
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
                    
                    return (
                      <div
                        key={slot.id}
                        onClick={() => {
                          if (widget) setSelectedWidgetId(isSelected ? null : widget.id);
                        }}
                        style={{
                          ...slot.style,
                          backgroundColor: isSelected ? '#4f46e5' : widget ? '#e5e7eb' : '#f9fafb',
                          border: isSelected ? '1.5px solid #4f46e5' : '1.5px solid #111827',
                          borderRadius: '2px',
                          cursor: widget ? 'pointer' : 'default',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: '900',
                          color: isSelected ? '#ffffff' : widget ? '#111827' : '#9ca3af',
                          transition: 'all 0.15s ease'
                        }}
                        title={widget ? `Select ${widget.title}` : 'Empty slot'}
                      >
                        {widget ? slot.name : '+'}
                      </div>
                    );
                  })}
                </div>
                {widgets.length > 6 && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '92px', overflowY: 'auto' }}>
                    {widgets.slice(6).map((widget, index) => {
                      const isSelected = selectedWidgetId === widget.id;

                      return (
                        <button
                          key={widget.id}
                          onClick={() => setSelectedWidgetId(isSelected ? null : widget.id)}
                          style={{
                            padding: '0.35rem 0.45rem',
                            border: '1.5px solid #111827',
                            borderRadius: '4px',
                            backgroundColor: isSelected ? '#4f46e5' : '#ffffff',
                            color: isSelected ? '#ffffff' : '#111827',
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          W{index + 7} - {widget.title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom: "Input field" toggle/switch/pill input */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#111827' }}>Input field</span>
                <input 
                  type="text" 
                  placeholder="value..."
                  style={{
                    width: '90px',
                    padding: '0.25rem 0.5rem',
                    border: '1.5px solid #111827',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    outline: 'none',
                    fontWeight: 'bold',
                    backgroundColor: '#ffffff',
                    textAlign: 'center'
                  }}
                />
              </div>

            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
