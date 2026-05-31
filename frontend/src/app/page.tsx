"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Widget from '@/components/Widget';
import EditorialWidget from '@/components/EditorialWidget';
import Modal from '@/components/Modal';
import { mockArticles } from '@/lib/mockData';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [readingMode, setReadingMode] = useState<'S' | 'H' | 'F'>('S');
  const [editMode, setEditMode] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isWidgetSettingsOpen, setIsWidgetSettingsOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-hover)' }}>
        <p style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Loading...</p>
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
      />

      <main className="container" style={{ padding: '2rem 1rem', flex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          gridAutoRows: 'minmax(250px, auto)'
        }}>
          {/* Main article */}
          <div style={{ gridColumn: '1 / -1', gridRow: 'span 2' }}>
            <Widget 
              article={mockArticles[0]} 
              readingMode={readingMode} 
              editMode={editMode}
              onSettingsClick={() => setIsWidgetSettingsOpen(true)}
            />
          </div>

          <div style={{ gridRow: 'span 1' }}>
            <Widget 
              article={mockArticles[1]} 
              readingMode={readingMode} 
              editMode={editMode}
              onSettingsClick={() => setIsWidgetSettingsOpen(true)}
            />
          </div>
          
          <div style={{ gridRow: 'span 1' }}>
            <Widget 
              article={mockArticles[2]} 
              readingMode={readingMode} 
              editMode={editMode}
              onSettingsClick={() => setIsWidgetSettingsOpen(true)}
            />
          </div>

          {/* Editorial Column */}
          <div style={{ gridColumn: 'span 2' }}>
            <EditorialWidget />
          </div>

          <div style={{ gridRow: 'span 1' }}>
            <Widget 
              article={mockArticles[3]} 
              readingMode={readingMode} 
              editMode={editMode}
              onSettingsClick={() => setIsWidgetSettingsOpen(true)}
            />
          </div>
        </div>
      </main>

      <Modal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} title="Share with link">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              readOnly 
              value="www.kisisel.com/extension" 
              style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
            />
            <button className="btn btn-outline">Copy</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
            <button style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--border)' }}>I</button>
            <button style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--border)' }}>F</button>
            <button style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--border)' }}>X</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isWidgetSettingsOpen} onClose={() => setIsWidgetSettingsOpen(false)} title="Widget Settings">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Category</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['Technology', 'Science', 'Food', 'Finance', 'Editorial'].map(cat => (
                <button key={cat} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Source</label>
            <input type="text" placeholder="Add source..." style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
