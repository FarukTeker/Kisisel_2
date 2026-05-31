"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { NewsArticle } from '../lib/mockData';

interface WidgetProps {
  articles: NewsArticle[];
  layoutType: 'card1' | 'card2' | 'card3' | 'card4' | 'card5' | 'card6';
  readingMode: 'S' | 'H' | 'F';
  editMode: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onSettingsClick?: () => void;
}

export default function Widget({ 
  articles, 
  layoutType, 
  readingMode, 
  editMode, 
  isSelected = false, 
  onSelect, 
  onSettingsClick 
}: WidgetProps) {
  
  const [customSize, setCustomSize] = useState<{ width?: number; height?: number }>({});
  const cardRef = useRef<HTMLDivElement>(null);

  // Border styles based on edit mode and selection state
  const borderStyle = isSelected
    ? '3px solid #4f46e5' 
    : editMode 
      ? '2.2px dashed #4f46e5' 
      : '1.5px solid #111827'; 

  let displayArticles: NewsArticle[] = [];
  const startIndex = parseInt(layoutType.replace('card', '')) - 1;

  if (readingMode === 'F') {
    displayArticles = [articles[startIndex % articles.length]];
  } else if (readingMode === 'S') {
    const countMap = { card1: 2, card2: 1, card3: 2, card4: 2, card5: 3, card6: 3 };
    const count = countMap[layoutType];
    for (let i = 0; i < count; i++) {
      displayArticles.push(articles[(startIndex + i) % articles.length]);
    }
  } else if (readingMode === 'H') {
    const countMap = { card1: 4, card2: 2, card3: 3, card4: 3, card5: 6, card6: 5 };
    const count = countMap[layoutType];
    for (let i = 0; i < count; i++) {
      displayArticles.push(articles[(startIndex + i) % articles.length]);
    }
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();

    if (onSelect) onSelect(); 

    const startX = e.clientX;
    const startY = e.clientY;
    
    if (!cardRef.current) return;
    const startWidth = cardRef.current.offsetWidth;
    const startHeight = cardRef.current.offsetHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      setCustomSize({
        width: Math.max(180, startWidth + deltaX),
        height: Math.max(100, startHeight + deltaY)
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderTitle = (title: string, fontSize = '1.15rem') => (
    <h3 style={{ 
      fontSize, 
      fontWeight: '800', 
      color: '#111827',
      lineHeight: '1.25',
      letterSpacing: '-0.3px',
      margin: 0
    }}>
      {title}
    </h3>
  );

  const renderMetadata = (article: NewsArticle) => (
    <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#4b5563', margin: '0.25rem 0' }}>
      By {article.author} | {article.date} | <span style={{ textTransform: 'uppercase', color: '#4f46e5' }}>{article.category}</span>
    </p>
  );

  const renderContent = () => {
    if (readingMode === 'H') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
          {displayArticles.map((art, idx) => (
            <div key={`${art.id}-${idx}`} style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid #111827',
              borderRadius: '2px',
              padding: '0.75rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxShadow: '1px 1px 0px rgba(0,0,0,0.05)',
              gap: '0.25rem'
            }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#111827', margin: 0, lineHeight: '1.2' }}>
                {art.title}
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600' }}>
                  {art.date}
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#4f46e5' }}>
                  {art.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (readingMode === 'S') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
          {displayArticles.map((art, idx) => (
            <div key={`${art.id}-${idx}`} style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid #111827',
              borderRadius: '2px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              boxShadow: '1px 1px 0px rgba(0,0,0,0.05)'
            }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#111827', margin: 0, lineHeight: '1.25' }}>
                  {art.title}
                </h4>
                <p style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', margin: '0.15rem 0 0 0' }}>
                  By {art.author} | <span style={{ textTransform: 'uppercase', color: '#4f46e5' }}>{art.category}</span>
                </p>
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.4', color: '#374151', margin: 0 }}>
                {art.summary}
              </p>
            </div>
          ))}
        </div>
      );
    }

    const article = displayArticles[0] || articles[0];

    return (
      <>
        {layoutType === 'card1' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {article.imageUrl && (
                <div style={{ width: '100px', height: '100px', flexShrink: 0, position: 'relative', border: '1.5px solid #111827', borderRadius: '2px', overflow: 'hidden' }}>
                  <Image src={article.imageUrl} alt={article.title} fill style={{ objectFit: 'cover' }} unoptimized draggable={false} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                {renderTitle(article.title, '1.25rem')}
                {renderMetadata(article)}
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#111827', flex: 1, textAlign: 'justify' }}>
              {article.fullContent}
            </p>
          </div>
        )}

        {layoutType === 'card2' && (
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', height: '100%' }}>
            {article.imageUrl && (
              <div style={{ width: '130px', height: '100px', flexShrink: 0, position: 'relative', border: '1.5px solid #111827', borderRadius: '2px', overflow: 'hidden' }}>
                <Image src={article.imageUrl} alt={article.title} fill style={{ objectFit: 'cover' }} unoptimized draggable={false} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              {renderTitle(article.title, '1.35rem')}
              {renderMetadata(article)}
              <p style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {article.summary}
              </p>
            </div>
          </div>
        )}

        {layoutType === 'card3' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              {article.imageUrl && (
                <div style={{ width: '80px', height: '80px', flexShrink: 0, position: 'relative', border: '1.5px solid #111827', borderRadius: '2px', overflow: 'hidden' }}>
                  <Image src={article.imageUrl} alt={article.title} fill style={{ objectFit: 'cover' }} unoptimized draggable={false} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                {renderTitle(article.title, '1.15rem')}
                {renderMetadata(article)}
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.45', color: '#111827', flex: 1, textAlign: 'justify' }}>
              {article.fullContent.substring(0, 180)}...
            </p>
          </div>
        )}

        {layoutType === 'card4' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.5rem' }}>
            {renderTitle(article.title, '1.15rem')}
            {renderMetadata(article)}
            <p style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#111827', flex: 1, textAlign: 'justify' }}>
              {article.fullContent}
            </p>
          </div>
        )}

        {layoutType === 'card5' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
            <div>
              {renderTitle(article.title, '1.3rem')}
              {renderMetadata(article)}
            </div>
            {article.imageUrl && (
              <div style={{ width: '100%', height: '180px', position: 'relative', border: '1.5px solid #111827', borderRadius: '2px', overflow: 'hidden' }}>
                <Image src={article.imageUrl} alt={article.title} fill style={{ objectFit: 'cover' }} unoptimized draggable={false} />
              </div>
            )}
            <p style={{ fontSize: '0.875rem', lineHeight: '1.5', color: '#111827', flex: 1, textAlign: 'justify' }}>
              {article.fullContent}
            </p>
          </div>
        )}

        {layoutType === 'card6' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem', justifyContent: 'space-between' }}>
            <div>
              {renderTitle(article.title, '1.4rem')}
              {renderMetadata(article)}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <div style={{ height: '100px', position: 'relative', border: '1.5px solid #111827', borderRadius: '2px', overflow: 'hidden' }}>
                <Image src={article.imageUrl || ""} alt="Image 1" fill style={{ objectFit: 'cover' }} unoptimized draggable={false} />
              </div>
              <div style={{ height: '100px', position: 'relative', border: '1.5px solid #111827', borderRadius: '2px', overflow: 'hidden' }}>
                <Image src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=60" alt="Image 2" fill style={{ objectFit: 'cover' }} unoptimized draggable={false} />
              </div>
              <div style={{ height: '100px', position: 'relative', border: '1.5px solid #111827', borderRadius: '2px', overflow: 'hidden' }}>
                <Image src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60" alt="Image 3" fill style={{ objectFit: 'cover' }} unoptimized draggable={false} />
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', lineHeight: '1.5', color: '#111827', textAlign: 'justify' }}>
              {article.fullContent}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '2px', border: '1.5px solid #111827', overflow: 'hidden', position: 'relative' }}>
                <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60" alt="Author avatar" fill style={{ objectFit: 'cover' }} unoptimized draggable={false} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#111827' }}>Verified Story</span>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div 
      ref={cardRef}
      className="card animate-fade-in" 
      onClick={() => { if (editMode && onSelect) onSelect(); }}
      style={{ 
        padding: '1.5rem', 
        height: customSize.height ? `${customSize.height}px` : '100%', 
        width: customSize.width ? `${customSize.width}px` : 'auto',
        display: 'flex', 
        flexDirection: 'column',
        border: borderStyle,
        borderRadius: '4px',
        backgroundColor: readingMode === 'F' ? '#ffffff' : '#f9fafb',
        position: 'relative',
        cursor: editMode ? 'grab' : 'default',
        boxSizing: 'border-box',
        userSelect: editMode ? 'none' : 'text', 
        transition: 'box-shadow 0.2s ease',
        zIndex: isSelected ? 5 : 1,
        flex: (customSize.width || customSize.height) ? 'none' : undefined
      }}
    >
      {/* 1. Gear button on Top-Left Corner */}
      {editMode && (
        <button 
          onClick={(e) => { e.stopPropagation(); if (onSettingsClick) onSettingsClick(); }}
          style={{ 
            position: 'absolute', 
            top: '-12px', 
            left: '-12px', 
            background: '#ffffff', 
            border: '1.5px solid #111827', 
            borderRadius: '50%', 
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            zIndex: 10 
          }}
          title="Widget Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73v.18a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      )}

      {/* Main card body */}
      <div style={{ flex: 1 }}>
        {renderContent()}
      </div>

      {/* 2. Selected Widget label floating below the card */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          bottom: '-28px',
          left: '0',
          color: '#4f46e5',
          fontWeight: '900',
          fontSize: '0.9rem',
          pointerEvents: 'none',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          zIndex: 5
        }}>
          Selected Widget
        </div>
      )}

      {/* 3. Resize Handle on Bottom-Right Corner */}
      {editMode && (
        <div 
          onMouseDown={handleResizeMouseDown}
          style={{
            position: 'absolute',
            bottom: '-8px',
            right: '-8px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: '2px solid #111827',
            cursor: 'se-resize',
            zIndex: 15,
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Drag to Resize"
        />
      )}
    </div>
  );
}
