"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Modal from '@/components/Modal';

export default function Feed() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 2D Pan States
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Infinite Scroll Boundary Dimensions
  const RANGE_X = 1920; // Left-to-right wrap boundary
  const RANGE_Y = 1180; // Top-to-bottom wrap boundary

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  // Touchpad macOS wheel listener to allow 2D scroll and prevent default history swipes
  useEffect(() => {
    if (loading) return;

    const container = document.getElementById('discover-page-container');
    if (!container) return;

    const handleTouchpadWheel = (e: WheelEvent) => {
      // Prevent macOS swipe-to-navigate history pages when scrolling horizontally
      e.preventDefault();

      setPanOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    };

    container.addEventListener('wheel', handleTouchpadWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleTouchpadWheel);
    };
  }, [loading]);

  // 12 mock newspapers distributed in a compact grid coordinate system
  const [extendedFeed, setExtendedFeed] = useState([
    { id: "n1", name: "Tech Today Weekly", author: "Alex Morgan", viewCount: 15420, date: "2026-05-31", x: -720, y: -380 },
    { id: "n2", name: "Culinary & Baking Delights", author: "Chef Gordon", viewCount: 8900, date: "2026-05-30", x: -240, y: -380 },
    { id: "n3", name: "Science Digest Review", author: "Science Weekly", viewCount: 22100, date: "2026-05-29", x: 240, y: -380 },
    { id: "n4", name: "Global Finance Trends", author: "Market Watcher", viewCount: 5600, date: "2026-05-31", x: 720, y: -380 },
    { id: "n5", name: "Hacker News Special Edition", author: "Sam Altman", viewCount: 31200, date: "2026-05-28", x: -720, y: 0 },
    { id: "n6", name: "Nature & Cosmic Horizons", author: "Neil Tyson", viewCount: 14700, date: "2026-05-27", x: -240, y: 0 },
    { id: "n7", name: "Artistic Impressions", author: "Claude Monet", viewCount: 4200, date: "2026-05-26", x: 240, y: 0 },
    { id: "n8", name: "Healthy Living Guide", author: "Dr. Andrew", viewCount: 9500, date: "2026-05-25", x: 720, y: 0 },
    { id: "n9", name: "Cinema & Hollywood Review", author: "Tarantino", viewCount: 18400, date: "2026-05-24", x: -720, y: 380 },
    { id: "n10", name: "Gaming & Tech Innovators", author: "Hideo Kojima", viewCount: 27900, date: "2026-05-23", x: -240, y: 380 },
    { id: "n11", name: "Traveler & Globetrotter", author: "Marco Polo", viewCount: 6300, date: "2026-05-22", x: 240, y: 380 },
    { id: "n12", name: "Philosophy & Mindsets", author: "Marcus Aurelius", viewCount: 12500, date: "2026-05-21", x: 720, y: 380 },
  ]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Don't pan if clicking buttons, links or inside a modal
    if (
      target.closest('.interactive-btn') || 
      target.closest('.modal-content') || 
      target.tagName === 'A' || 
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT'
    ) {
      return;
    }
    setIsPanning(true);
    setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Calculates wrapped canvas coordinate based on current pan offset for continuous circular scroll
  const getWrappedCoords = (itemX: number, itemY: number) => {
    // Relative distance from viewport center (origin is 2500, 2500)
    const relX = itemX + panOffset.x;
    const relY = itemY + panOffset.y;

    const halfX = RANGE_X / 2;
    const wrappedX = ((((relX + halfX) % RANGE_X) + RANGE_X) % RANGE_X) - halfX;

    const halfY = RANGE_Y / 2;
    const wrappedY = ((((relY + halfY) % RANGE_Y) + RANGE_Y) % RANGE_Y) - halfY;

    return {
      x: 2500 + wrappedX - panOffset.x,
      y: 2500 + wrappedY - panOffset.y
    };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <p style={{ fontWeight: '600', color: '#4b5563' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div 
      id="discover-page-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ 
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        cursor: isPanning ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
    >
      {/* 2D Panning Canvas */}
      <div 
        style={{
          position: 'absolute',
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          // Grid background lines
          backgroundImage: 'linear-gradient(to right, #f3f4f6 2px, transparent 2px), linear-gradient(to bottom, #f3f4f6 2px, transparent 2px)',
          backgroundSize: '40px 40px',
          width: '5000px',
          height: '5000px',
          marginLeft: '-2500px',
          marginTop: '-2500px',
          left: '50%',
          top: '50%'
        }}
      >
        {extendedFeed.map(feed => {
          const coords = getWrappedCoords(feed.x, feed.y);
          return (
            <div 
              key={feed.id} 
              className="newspaper-card"
              onClick={() => alert(`Opening shared newspaper: ${feed.name}`)}
              style={{ 
                position: 'absolute',
                left: `calc(${coords.x}px)`,
                top: `calc(${coords.y}px)`,
                width: '420px',
                backgroundColor: '#ffffff',
                border: '2px solid #111827',
                borderRadius: '4px',
                padding: '1.25rem', 
                boxShadow: '4px 4px 0px #111827',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {/* Header: Date, Author, viewcount */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '0.75rem', 
                color: '#4b5563', 
                fontSize: '0.8rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: '1.5px solid #111827',
                paddingBottom: '0.35rem'
              }}>
                <span>{feed.date}</span>
                <span>{feed.author}</span>
                <span>{feed.viewCount} views</span>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#111827', margin: '0.5rem 0 1rem 0' }}>
                {feed.name}
              </h3>

              {/* Miniature Layout Preview of the 6-widget grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1.2fr 1fr 1fr', 
                gridTemplateRows: 'repeat(4, 1fr)',
                gap: '0.35rem', 
                width: '100%', 
                height: '140px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #111827',
                borderRadius: '3px',
                padding: '0.35rem',
                boxSizing: 'border-box'
              }}>
                {[
                  { id: 's0', style: { gridColumn: '1', gridRow: '1 / 3' } },
                  { id: 's1', style: { gridColumn: '2 / 4', gridRow: '1' } },
                  { id: 's2', style: { gridColumn: '2', gridRow: '2' } },
                  { id: 's3', style: { gridColumn: '3', gridRow: '2' } },
                  { id: 's4', style: { gridColumn: '1', gridRow: '3 / 5' } },
                  { id: 's5', style: { gridColumn: '2 / 4', gridRow: '3 / 5' } },
                ].map(slot => (
                  <div
                    key={slot.id}
                    style={{
                      ...slot.style,
                      backgroundColor: '#e5e7eb',
                      border: '1px solid #111827',
                      borderRadius: '1px'
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>



      {/* Static Floating Back Button (Circular Dark Grey with White Arrow) */}
      <Link 
        href="/" 
        style={{
          position: 'fixed',
          top: '24px',
          left: '24px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: '#4b5563',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          zIndex: 100,
          cursor: 'pointer',
          textDecoration: 'none'
        }}
        onMouseDown={(e) => e.stopPropagation()} // Prevent pan start
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </Link>

      {/* Floating Filter / Sort Button (Bottom Center) */}
      <button 
        onClick={() => setIsFilterOpen(true)}
        className="interactive-btn"
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '64px',
          height: '48px',
          backgroundColor: '#e5e7eb',
          border: '2px solid #111827',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '4px 4px 0px #111827',
          cursor: 'pointer',
          zIndex: 100
        }}
        onMouseDown={(e) => e.stopPropagation()} // Prevent pan start
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="15" y2="12" />
          <line x1="3" y1="6" x2="18" y2="6" />
          <line x1="3" y1="18" x2="12" y2="18" />
          <polyline points="17 14 20 17 23 14" />
          <line x1="20" y1="8" x2="20" y2="17" />
        </svg>
      </button>

      {/* Filter modal */}
      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Feed" maxWidth="450px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #111827', borderRadius: '4px', padding: '0.6rem 0.85rem' }}>
            <input type="text" placeholder="Category, author, or keyword..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem' }} />
            <span style={{ fontSize: '1.1rem', cursor: 'pointer' }}>🔍</span>
          </div>

          <div>
            <h4 style={{ fontWeight: '800', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Filter by Categories</h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['Technology', 'Science', 'Food', 'Finance', 'Culture'].map(cat => (
                <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', border: '1.5px solid #111827', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  <span>{cat}</span>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#111827' }} />
                </label>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <button onClick={() => setIsFilterOpen(false)} style={{ padding: '0.4rem 1rem', border: '1.5px solid #111827', borderRadius: '4px', backgroundColor: '#ffffff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
              Cancel
            </button>
            <button onClick={() => setIsFilterOpen(false)} style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '4px', backgroundColor: '#111827', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
              Apply Filter
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
