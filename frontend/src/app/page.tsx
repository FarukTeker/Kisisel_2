"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Responsive, useContainerWidth, type Layout, type LayoutItem } from 'react-grid-layout';
import Navbar from '@/components/Navbar';
import Widget from '@/components/Widget';
import Modal from '@/components/Modal';
import { mockArticles } from '@/lib/mockData';

type WidgetId = 'card1' | 'card2' | 'card3' | 'card4' | 'card5' | 'card6';

const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: 'card1', x: 0, y: 0, w: 1, h: 5, minW: 1, minH: 2 },
  { i: 'card2', x: 1, y: 0, w: 2, h: 2, minW: 1, minH: 1 },
  { i: 'card3', x: 1, y: 2, w: 1, h: 3, minW: 1, minH: 1 },
  { i: 'card4', x: 2, y: 2, w: 1, h: 3, minW: 1, minH: 1 },
  { i: 'card5', x: 0, y: 5, w: 1, h: 3, minW: 1, minH: 1 },
  { i: 'card6', x: 1, y: 5, w: 2, h: 3, minW: 1, minH: 1 },
];

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
  const [widgetOrder, setWidgetOrder] = useState<WidgetId[]>(['card1', 'card2', 'card3', 'card4', 'card5', 'card6']);
  const [layout, setLayout] = useState<Layout>(DEFAULT_LAYOUT);
  const { width, containerRef } = useContainerWidth({ initialWidth: 1280 });

  useEffect(() => {
    if (selectedWidgetId === null) {
      setActiveSettingsTab('Design');
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
      setSelectedWidgetId('card1');
    } else {
      setSelectedWidgetId(null);
    }
  }, [editMode]);

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
          {widgetOrder.map((currentWidgetId) => (
            <div key={currentWidgetId} className="feed-rgl-item">
              <Widget
                articles={mockArticles}
                layoutType={currentWidgetId}
                readingMode={readingMode}
                editMode={editMode}
                isSelected={selectedWidgetId === currentWidgetId}
                onSelect={() => setSelectedWidgetId(currentWidgetId)}
                onSettingsClick={() => { setSelectedWidgetId(currentWidgetId); setIsWidgetSettingsOpen(true); }}
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
        title={selectedWidgetId ? `Widget Settings - ${selectedWidgetId.toUpperCase()}` : 'Page Settings'}
        maxWidth="750px"
      >
        <div style={{ display: 'flex', minHeight: '380px', border: '1.5px solid #111827', borderRadius: '4px', overflow: 'hidden' }}>
          {/* Left panel: tabs */}
          <div style={{ width: '130px', borderRight: '1.5px solid #111827', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
            {(selectedWidgetId 
              ? ['Category', 'Editorial', 'Popular', 'I feel lucky'] 
              : ['Design', 'layout', 'share', 'following']
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
                    {['BBC News', 'TechCrunch', 'Wired', 'The New York Times', 'The Verge'].map(pub => (
                      <label key={pub} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked={pub !== 'Wired'} style={{ accentColor: '#111827' }} />
                        <span>{pub}</span>
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
                    const widgetId = widgetOrder[index];
                    const isSelected = selectedWidgetId === widgetId;
                    
                    return (
                      <div
                        key={slot.id}
                        onClick={() => setSelectedWidgetId(isSelected ? null : widgetId)}
                        style={{
                          ...slot.style,
                          backgroundColor: isSelected ? '#4f46e5' : '#e5e7eb',
                          border: isSelected ? '1.5px solid #4f46e5' : '1.5px solid #111827',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: '900',
                          color: isSelected ? '#ffffff' : '#111827',
                          transition: 'all 0.15s ease'
                        }}
                        title={`Select ${widgetId.toUpperCase()}`}
                      >
                        {slot.name}
                      </div>
                    );
                  })}
                </div>
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
