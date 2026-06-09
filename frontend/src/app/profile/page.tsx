"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, PrototypeUser } from '@/lib/prototypeState';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<PrototypeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const u = await getCurrentUser();
      if (!u) {
        router.push('/login');
      } else {
        setUser(u);
      }
      setLoading(false);
    }
    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      padding: '2rem 1rem',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: 'var(--surface, #ffffff)',
        borderRadius: '24px',
        padding: '3rem 2rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background element */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'linear-gradient(135deg, var(--primary, #315efb) 0%, transparent 100%)',
          opacity: 0.1,
          borderRadius: '50%',
          filter: 'blur(30px)',
          zIndex: 0
        }}></div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Avatar */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary, #315efb) 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            boxShadow: '0 10px 25px rgba(49, 94, 251, 0.3)',
            marginBottom: '1.5rem',
            textTransform: 'uppercase'
          }}>
            {user.name.charAt(0)}
          </div>

          <h1 style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: 'var(--foreground)',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
            textAlign: 'center'
          }}>
            {user.name}
          </h1>
          
          <div style={{
            display: 'inline-block',
            background: 'var(--surface-hover, #f3f4f6)',
            padding: '0.35rem 1rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: 'var(--text-muted, #6b7280)',
            textTransform: 'capitalize',
            marginBottom: '2rem'
          }}>
            {user.role}
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '1rem 1.25rem',
              background: 'var(--background)',
              borderRadius: '16px',
              border: '1px solid var(--border)'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #6b7280)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Email Address</span>
              <span style={{ fontSize: '1.1rem', color: 'var(--foreground)', fontWeight: '500' }}>{user.email}</span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '1rem 1.25rem',
              background: 'var(--background)',
              borderRadius: '16px',
              border: '1px solid var(--border)'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #6b7280)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Account ID</span>
              <span style={{ fontSize: '1.1rem', color: 'var(--foreground)', fontWeight: '500', fontFamily: 'monospace' }}>{user.id}</span>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/')}
            style={{
              marginTop: '2.5rem',
              padding: '0.8rem 2rem',
              background: 'var(--foreground)',
              color: 'var(--background)',
              border: 'none',
              borderRadius: '999px',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'transform 0.2s, opacity 0.2s',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            Back to Feed
          </button>
        </div>
      </div>
    </div>
  );
}
