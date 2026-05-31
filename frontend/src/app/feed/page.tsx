"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockFeed } from '@/lib/mockData';
import Modal from '@/components/Modal';

export default function Feed() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface-hover)' }}>
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
          <Link href="/" className="btn btn-outline">&lt;- Turn Back</Link>
        </div>
        <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
          Kişisel - Feed
        </div>
        <div>
          <button className="btn btn-primary" onClick={() => setIsFilterOpen(true)}>Filter</button>
        </div>
      </nav>

      <main className="container" style={{ padding: '2rem 1rem', flex: 1 }}>
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)' }}>
          A free 2D space which we can go to any direction in x,y. We can discover other's shared newspapers.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '2rem'
        }}>
          {mockFeed.map(feed => (
            <div key={feed.id} className="card" style={{ padding: '1.5rem', transition: 'transform 0.2s', cursor: 'pointer' }}
                 onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                 onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <span>{feed.date}</span>
                <span>{feed.author}</span>
                <span>{feed.viewCount} views</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{feed.name}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', height: '150px' }}>
                <div style={{ backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ flex: 1, backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)' }}></div>
                  <div style={{ flex: 1, backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Screen">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem' }}>
            <input type="text" placeholder="Category, keyword etc." style={{ flex: 1, border: 'none', outline: 'none' }} />
            <span style={{ fontSize: '1.25rem' }}>🔍</span>
          </div>

          <div>
            <h4 style={{ marginBottom: '0.5rem' }}>Categories</h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['Technology', 'Global', 'Entertainment', 'Food'].map(cat => (
                <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                  <span>{cat}</span>
                  <input type="checkbox" defaultChecked />
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
