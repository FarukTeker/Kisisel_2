"use client";

import React from 'react';
import Link from 'next/link';
import { logoutPrototypeUser } from '@/lib/prototypeState';

interface NavbarProps {
  readingMode: 'S' | 'H' | 'F';
  setReadingMode: (mode: 'S' | 'H' | 'F') => void;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  onShare: () => void;
  onPageSettings?: () => void;
  isMobile?: boolean;
}

export default function Navbar({ readingMode, setReadingMode, editMode, setEditMode, onShare, onPageSettings, isMobile = false }: NavbarProps) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: isMobile ? 'stretch' : 'center',
      justifyContent: 'space-between',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.85rem' : 0,
      padding: isMobile ? '0.95rem 1rem' : '1rem 2rem 0.9rem',
      background: 'rgba(255, 253, 250, 0.84)',
      borderBottom: '1px solid rgba(23, 23, 23, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      backdropFilter: 'blur(12px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        {/* Date Display */}
        <div style={{ 
          fontSize: isMobile ? '0.72rem' : '0.78rem', 
          fontWeight: '800', 
          color: '#5f5b54', 
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          border: '1px solid rgba(23,23,23,0.1)',
          padding: '0.35rem 0.7rem',
          backgroundColor: 'rgba(255,255,255,0.78)',
          borderRadius: '999px',
          whiteSpace: 'nowrap'
        }}>
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>

        {/* Eye icon */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        )}
        <div style={{
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontWeight: 900,
          fontSize: isMobile ? '1rem' : '1.24rem',
          letterSpacing: '-0.06em',
          textTransform: 'uppercase',
          color: '#171717'
        }}>
          <Link href="/feed" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem' }}>
            <span style={{ display: 'inline-flex', width: isMobile ? '0.55rem' : '0.7rem', height: isMobile ? '0.55rem' : '0.7rem', borderRadius: '999px', background: '#2647d6' }} />
            Kisisel
          </Link>
        </div>
        </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.65rem' : '1.25rem', flexShrink: 0 }}>
        {/* Share Button */}
        <button 
          onClick={onShare}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(23,23,23,0.12)',
            borderRadius: '999px',
            padding: isMobile ? '0.55rem 0.75rem' : '0.45rem 1rem',
            fontWeight: '800',
            fontSize: '0.82rem',
            color: '#111827',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(17,24,39,0.08)'
          }}
          aria-label="Share newspaper"
        >
          {!isMobile && <span>share</span>}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px' }}>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>

        {/* Edit Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.1rem', borderRadius: '999px', background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(23,23,23,0.09)' }}>
          <span style={{ fontWeight: '800', fontSize: '0.82rem', color: '#5f5b54', paddingLeft: '0.65rem' }}>{isMobile ? 'Edit' : 'Edit'}</span>
          <div 
            onClick={() => setEditMode(!editMode)}
            style={{
              width: '42px',
              height: '22px',
              backgroundColor: editMode ? '#2647d6' : '#f4efe7',
              border: '1px solid rgba(23,23,23,0.12)',
              borderRadius: '999px',
              position: 'relative',
              cursor: 'pointer',
              marginLeft: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: editMode ? '#ffffff' : '#111827',
              borderRadius: '50%',
              position: 'absolute',
              top: '3px',
              left: editMode ? '23px' : '3px',
              transition: 'left 0.2s'
            }} />
          </div>
        </div>

        {/* Page Settings Gear Icon (visible in edit mode) */}
        {editMode && onPageSettings && (
          <button 
            onClick={onPageSettings}
            style={{
              background: '#ffffff',
              border: '1px solid rgba(23,23,23,0.12)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.45rem',
              borderRadius: '999px',
              color: '#111827',
              transition: 'transform 0.2s ease',
              boxShadow: '0 8px 20px rgba(17,24,39,0.08)'
            }}
            title="Page Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        )}

        {/* User avatar/Logout */}
        <button 
          onClick={() => {
            logoutPrototypeUser();
            window.location.href = '/login';
          }}
          title="Logout"
          style={{ 
            width: isMobile ? '38px' : '32px', 
            height: isMobile ? '38px' : '32px', 
            borderRadius: '50%', 
            backgroundColor: '#ffffff', 
            border: '1px solid rgba(23,23,23,0.12)',
            color: '#4b5563', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(17,24,39,0.08)'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>

      </div>

      <div style={{ 
        display: 'flex', 
        width: '100%', 
        backgroundColor: 'rgba(255,255,255,0.82)',
        padding: '4px',
        borderRadius: '999px',
        border: '1px solid rgba(23,23,23,0.09)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)'
      }}>
        {(['S', 'H', 'F'] as const).map((mode) => {
          const label = mode === 'S' ? 'Summary' : mode === 'H' ? 'Headline' : 'Focused';
          const isActive = readingMode === mode;
          return (
            <button
              key={mode}
              onClick={() => setReadingMode(mode)}
              style={{
                flex: 1,
                padding: isMobile ? '0.55rem 0.4rem' : '0.45rem 0.85rem',
                fontSize: isMobile ? '0.78rem' : '0.85rem',
                fontWeight: '800',
                color: isActive ? '#ffffff' : '#5f5b54',
                background: isActive ? 'linear-gradient(180deg, #315efb 0%, #2647d6 100%)' : 'transparent',
                borderRadius: '999px',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
