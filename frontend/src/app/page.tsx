"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Widget from '@/components/Widget';
import Modal from '@/components/Modal';
import { mockArticles } from '@/lib/mockData';

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
  const [activeSettingsTab, setActiveSettingsTab] = useState<'Category' | 'Editorial' | 'Popular' | 'I feel lucky'>('Category');
  const [selectedCategory, setSelectedCategory] = useState<string>('Technology');
  const [widgetOrder, setWidgetOrder] = useState<string[]>(['card1', 'card2', 'card3', 'card4', 'card5', 'card6']);
  const draggedItemIndex = React.useRef<number | null>(null);

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

  // Grid styling depending on screen size and reading mode
  const gridStyle: React.CSSProperties = isMobile 
    ? {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2.5rem' // Increased gap slightly for selection labels
      }
    : {
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1fr',
        gap: '2.5rem 1.5rem', // Added vertical gap for selected widget text label
        alignItems: 'stretch'
      };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      <Navbar 
        readingMode={readingMode} 
        setReadingMode={setReadingMode} 
        editMode={editMode} 
        setEditMode={setEditMode}
        onShare={() => setIsShareOpen(true)}
      />

      <main className="container" style={{ padding: '2.5rem 1.5rem 4rem', flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div style={gridStyle}>
          {[
            { id: 'slot0', style: (!isMobile && readingMode === 'F') ? { gridColumn: '1', gridRow: '1 / 3' } : {} },
            { id: 'slot1', style: !isMobile ? { gridColumn: '2 / 4', gridRow: '1' } : {} },
            { id: 'slot2', style: !isMobile ? { gridColumn: '2', gridRow: '2' } : {} },
            { id: 'slot3', style: !isMobile ? { gridColumn: '3', gridRow: '2' } : {} },
            { id: 'slot4', style: (!isMobile && readingMode === 'F') ? { gridColumn: '1', gridRow: '3 / 5' } : {} },
            { id: 'slot5', style: (!isMobile && readingMode === 'F') ? { gridColumn: '2 / 4', gridRow: '3 / 5' } : {} },
          ].map((slot, index) => {
            const currentWidgetId = widgetOrder[index];
            return (
              <div 
                key={slot.id}
                id={slot.id}
                style={slot.style}
                draggable={editMode}
                onDragStart={(e) => {
                  if (!editMode) return;
                  draggedItemIndex.current = index;
                  e.dataTransfer.setData('sourceIndex', index.toString());
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragEnter={(e) => {
                  if (!editMode) return;
                  e.preventDefault();
                  if (draggedItemIndex.current !== null && draggedItemIndex.current !== index) {
                    const newOrder = [...widgetOrder];
                    const temp = newOrder[draggedItemIndex.current];
                    newOrder[draggedItemIndex.current] = newOrder[index];
                    newOrder[index] = temp;
                    setWidgetOrder(newOrder);
                    draggedItemIndex.current = index;
                  }
                }}
                onDrop={(e) => {
                  if (!editMode) return;
                  e.preventDefault();
                }}
                onDragEnd={() => {
                  draggedItemIndex.current = null;
                }}
                onDragOver={(e) => {
                  if (!editMode) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
              >
                <Widget 
                  articles={mockArticles} 
                  layoutType={currentWidgetId as any}
                  readingMode={readingMode} 
                  editMode={editMode}
                  isSelected={selectedWidgetId === currentWidgetId}
                  onSelect={() => setSelectedWidgetId(currentWidgetId)}
                  onSettingsClick={() => { setSelectedWidgetId(currentWidgetId); setIsWidgetSettingsOpen(true); }}
                />
              </div>
            );
          })}
        </div>
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
        title={`Widget Settings - ${selectedWidgetId?.toUpperCase()}`}
      >
        <div style={{ display: 'flex', minHeight: '300px', border: '1.5px solid #111827', borderRadius: '4px', overflow: 'hidden' }}>
          {/* Left panel: tabs */}
          <div style={{ width: '130px', borderRight: '1.5px solid #111827', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
            {(['Category', 'Editorial', 'Popular', 'I feel lucky'] as const).map(tab => {
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
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Right panel: content */}
          <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#ffffff' }}>
            {activeSettingsTab === 'Category' && (
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

            {activeSettingsTab === 'Editorial' && (
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

            {activeSettingsTab === 'Popular' && (
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

            {activeSettingsTab === 'I feel lucky' && (
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

            {/* Bottom Actions inside content panel */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={() => setIsWidgetSettingsOpen(false)} style={{ padding: '0.4rem 1rem', border: '1.5px solid #111827', borderRadius: '4px', backgroundColor: '#ffffff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                Cancel
              </button>
              <button onClick={() => { setIsWidgetSettingsOpen(false); alert('Widget settings updated successfully!'); }} style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '4px', backgroundColor: '#111827', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                Save
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
