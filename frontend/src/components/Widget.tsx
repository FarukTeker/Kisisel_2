"use client";

import React from 'react';
import { NewsArticle } from '../lib/mockData';

interface WidgetProps {
  article: NewsArticle;
  readingMode: 'S' | 'H' | 'F';
  editMode: boolean;
  onSettingsClick?: () => void;
}

export default function Widget({ article, readingMode, editMode, onSettingsClick }: WidgetProps) {
  return (
    <div className="card" style={{ 
      padding: '1.5rem', 
      position: 'relative',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      cursor: editMode ? 'move' : 'default',
      border: editMode ? '2px dashed var(--primary)' : '1px solid var(--border)'
    }}>
      {editMode && (
        <button 
          onClick={onSettingsClick}
          style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem' }}
        >
          ⚙️
        </button>
      )}

      {(readingMode === 'H' || readingMode === 'F') && (
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{article.title}</h3>
      )}

      {readingMode === 'S' && (
        <div>
          <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{article.title}</h4>
          <p style={{ marginTop: '0.5rem' }}>{article.summary}</p>
        </div>
      )}

      {readingMode === 'F' && (
        <div style={{ flex: 1 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>By {article.author} - {article.date}</p>
          <p style={{ lineHeight: '1.6' }}>{article.fullContent}</p>
        </div>
      )}
    </div>
  );
}
