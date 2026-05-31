"use client";

import React from 'react';
import Link from 'next/link';

interface NavbarProps {
  readingMode: 'S' | 'H' | 'F';
  setReadingMode: (mode: 'S' | 'H' | 'F') => void;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  onShare: () => void;
}

export default function Navbar({ readingMode, setReadingMode, editMode, setEditMode, onShare }: NavbarProps) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 2rem',
      backgroundColor: '#f3f4f6', // Light gray navbar background
      borderBottom: '1px solid #d1d5db',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      {/* Left side: Date + View Icon + Segmented Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Date Display */}
        <div style={{ 
          fontSize: '0.85rem', 
          fontWeight: '800', 
          color: '#111827', 
          textTransform: 'uppercase',
          border: '1.5px solid #111827',
          padding: '0.25rem 0.6rem',
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          marginRight: '0.5rem'
        }}>
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>

        {/* Eye icon */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        
        {/* Segmented control: Summary, Heading, Full */}
        <div style={{ 
          display: 'flex', 
          backgroundColor: '#e5e7eb',
          padding: '2px',
          borderRadius: '4px',
          border: '1.5px solid #111827'
        }}>
          {(['S', 'H', 'F'] as const).map((mode) => {
            const label = mode === 'S' ? 'Summary' : mode === 'H' ? 'Heading' : 'Full';
            const isActive = readingMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setReadingMode(mode)}
                style={{
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: '#111827',
                  backgroundColor: isActive ? '#ffffff' : 'transparent',
                  borderRight: mode !== 'F' && !isActive ? '1px solid #9ca3af' : 'none',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Center: FeeDaily Brand */}
      <div style={{ 
        backgroundColor: '#ffffff',
        border: '1.5px solid #111827',
        borderRadius: '4px',
        padding: '0.35rem 2.5rem',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        color: '#111827',
        letterSpacing: '0.5px'
      }}>
        <Link href="/">FeeDaily</Link>
      </div>

      {/* Right side: Share, Edit Toggle, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Share Button */}
        <button 
          onClick={onShare}
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            border: '1.5px solid #111827',
            borderRadius: '4px',
            padding: '0.35rem 1.25rem',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            color: '#111827',
            cursor: 'pointer'
          }}
        >
          <span>share</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px' }}>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>

        {/* Edit Toggle */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#111827' }}>edit</span>
          <div 
            onClick={() => setEditMode(!editMode)}
            style={{
              width: '42px',
              height: '22px',
              backgroundColor: editMode ? '#111827' : '#ffffff',
              border: '1.5px solid #111827',
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

        {/* User avatar/Logout */}
        <button 
          onClick={() => {
            localStorage.removeItem('isLoggedIn');
            window.location.href = '/login';
          }}
          title="Logout"
          style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            backgroundColor: '#e5e7eb', 
            border: '1.5px solid #9ca3af',
            color: '#4b5563', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
