"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Login() {
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('isLoggedIn', 'true');
    router.push('/');
  };

  const handleMockLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    router.push('/');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--surface-hover)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div 
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '3rem 2.5rem',
          backgroundColor: '#e5e7eb', // Light gray background to match wireframe
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #d1d5db'
        }}
      >
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '2rem', 
          fontSize: '1.5rem', 
          fontWeight: '700',
          color: '#111827'
        }}>
          Kişisel {isLogin ? 'Login' : 'Register'}
        </h1>
        
        <div style={{ 
          width: '100px', 
          height: '100px', 
          margin: '0 auto 2.5rem', 
          borderRadius: '20px', 
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <Image 
            src="/logo.png" 
            alt="Kisisel Logo" 
            width={100} 
            height={100}
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontWeight: '700', fontSize: '1rem', color: '#111827' }}>email</label>
            <input 
              type="email" 
              placeholder="email"
              style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: '4px', 
                border: 'none',
                backgroundColor: '#ffffff',
                boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
                outline: 'none',
                fontSize: '1rem',
                color: '#111827'
              }} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontWeight: '700', fontSize: '1rem', color: '#111827' }}>password</label>
            <input 
              type="password" 
              placeholder="password"
              style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: '4px', 
                border: 'none',
                backgroundColor: '#ffffff',
                boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
                outline: 'none',
                fontSize: '1rem',
                color: '#111827'
              }} 
            />
          </div>

          {!isLogin && (
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: '1rem' }}>
              <label style={{ fontWeight: '700', fontSize: '0.85rem', lineHeight: 1.2, color: '#111827' }}>
                Repeat<br/>password
              </label>
              <input 
                type="password" 
                placeholder="password"
                style={{ 
                  padding: '0.75rem 1rem', 
                  borderRadius: '4px', 
                  border: 'none',
                  backgroundColor: '#ffffff',
                  boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
                  outline: 'none',
                  fontSize: '1rem',
                  color: '#111827'
                }} 
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: isLogin ? 'space-between' : 'center', alignItems: 'center', marginTop: '0.75rem' }}>
            {isLogin ? (
              <>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setIsLogin(false)} 
                    style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827', textDecoration: 'none' }}
                  >
                    new user?
                  </button>
                  <button 
                    type="button"
                    style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827', textDecoration: 'none' }}
                  >
                    forgot password
                  </button>
                </div>
                <button 
                  type="submit" 
                  style={{ 
                    padding: '0.6rem 1.5rem', 
                    backgroundColor: '#ffffff', 
                    color: '#111827', 
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                >
                  Login
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '1rem', alignItems: 'center' }}>
                <button 
                  type="submit" 
                  style={{ 
                    padding: '0.6rem 2.5rem', 
                    backgroundColor: '#ffffff', 
                    color: '#111827', 
                    fontWeight: '600', 
                    fontSize: '1.1rem',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                >
                  Register
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsLogin(true)} 
                  style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827', textDecoration: 'underline' }}
                >
                  Already a user? Login
                </button>
              </div>
            )}
          </div>
        </form>

        <div style={{ margin: '2.5rem 0', borderBottom: '2px solid #374151' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={handleMockLogin}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.5rem', 
              padding: '0.85rem 1.5rem',
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              border: 'none',
              fontWeight: '700',
              fontSize: '1.1rem',
              color: '#111827',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>G</span> 
            {isLogin ? 'Login with Google' : 'Sign up with Google'}
          </button>
          
          <button 
            onClick={handleMockLogin}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.5rem', 
              padding: '0.85rem 1.5rem',
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              border: 'none',
              fontWeight: '700',
              fontSize: '1.1rem',
              color: '#111827',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>F</span> 
            {isLogin ? 'Login with Facebook' : 'Sign up with Facebook'}
          </button>
        </div>
      </div>
    </div>
  );
}
