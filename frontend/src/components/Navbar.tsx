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
      padding: '1rem 2rem',
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <strong>Date: {new Date().toLocaleDateString()}</strong>
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <button 
            style={{ padding: '0.25rem 0.5rem', backgroundColor: readingMode === 'S' ? 'var(--primary)' : 'transparent', color: readingMode === 'S' ? 'white' : 'inherit' }}
            onClick={() => setReadingMode('S')}
          >S</button>
          <button 
            style={{ padding: '0.25rem 0.5rem', backgroundColor: readingMode === 'H' ? 'var(--primary)' : 'transparent', color: readingMode === 'H' ? 'white' : 'inherit' }}
            onClick={() => setReadingMode('H')}
          >H</button>
          <button 
            style={{ padding: '0.25rem 0.5rem', backgroundColor: readingMode === 'F' ? 'var(--primary)' : 'transparent', color: readingMode === 'F' ? 'white' : 'inherit' }}
            onClick={() => setReadingMode('F')}
          >F</button>
        </div>
      </div>

      <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
        <Link href="/">Kişisel</Link> | <Link href="/feed">Feed</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-outline" onClick={onShare}>Share</button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <span>Edit Mode</span>
          <input 
            type="checkbox" 
            checked={editMode} 
            onChange={(e) => setEditMode(e.target.checked)} 
          />
        </label>
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
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '0.875rem'
          }}
        >
          U
        </button>
      </div>
    </nav>
  );
}
