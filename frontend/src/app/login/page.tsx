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
      backgroundColor: '#f3f4f6', // Light gray background
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
          backgroundColor: '#ffffff', 
          borderRadius: '4px',
          boxShadow: '6px 6px 0px #111827',
          border: '2.5px solid #111827'
        }}
      >
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '2rem', 
          fontSize: '1.75rem', 
          fontWeight: '900',
          color: '#111827',
          letterSpacing: '-0.5px',
          textTransform: 'uppercase'
        }}>
          Kişisel {isLogin ? 'Login' : 'Register'}
        </h1>
        
        {/* Custom brutalist logo frame */}
        <div style={{ 
          width: '100px', 
          height: '100px', 
          margin: '0 auto 2.5rem', 
          borderRadius: '4px', 
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          border: '2.5px solid #111827',
          boxShadow: '3px 3px 0px #111827'
        }}>
          <Image 
            src="/logo.png" 
            alt="Kisisel Logo" 
            width={100} 
            height={100}
            style={{ objectFit: 'cover' }}
            priority
            unoptimized
          />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontWeight: '800', fontSize: '0.95rem', color: '#111827', textTransform: 'uppercase' }}>email</label>
            <input 
              type="email" 
              placeholder="email"
              style={{ 
                padding: '0.65rem 0.85rem', 
                borderRadius: '4px', 
                border: '2px solid #111827',
                backgroundColor: '#ffffff',
                outline: 'none',
                fontSize: '0.95rem',
                color: '#111827',
                fontWeight: 'bold'
              }} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontWeight: '800', fontSize: '0.95rem', color: '#111827', textTransform: 'uppercase' }}>password</label>
            <input 
              type="password" 
              placeholder="password"
              style={{ 
                padding: '0.65rem 0.85rem', 
                borderRadius: '4px', 
                border: '2px solid #111827',
                backgroundColor: '#ffffff',
                outline: 'none',
                fontSize: '0.95rem',
                color: '#111827',
                fontWeight: 'bold'
              }} 
            />
          </div>

          {!isLogin && (
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: '1rem' }}>
              <label style={{ fontWeight: '800', fontSize: '0.85rem', lineHeight: 1.2, color: '#111827', textTransform: 'uppercase' }}>
                Repeat<br/>password
              </label>
              <input 
                type="password" 
                placeholder="password"
                style={{ 
                  padding: '0.65rem 0.85rem', 
                  borderRadius: '4px', 
                  border: '2px solid #111827',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: '#111827',
                  fontWeight: 'bold'
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
                    style={{ fontSize: '0.85rem', fontWeight: '800', color: '#111827', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    new user?
                  </button>
                  <button 
                    type="button"
                    style={{ fontSize: '0.85rem', fontWeight: '800', color: '#111827', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    forgot password
                  </button>
                </div>
                <button 
                  type="submit" 
                  style={{ 
                    padding: '0.5rem 1.25rem', 
                    backgroundColor: '#ffffff', 
                    color: '#111827', 
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    borderRadius: '4px',
                    border: '2px solid #111827',
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0px #111827',
                    textTransform: 'uppercase'
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
                    padding: '0.5rem 2.25rem', 
                    backgroundColor: '#ffffff', 
                    color: '#111827', 
                    fontWeight: '800', 
                    fontSize: '0.95rem',
                    borderRadius: '4px',
                    border: '2px solid #111827',
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0px #111827',
                    textTransform: 'uppercase'
                  }}
                >
                  Register
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsLogin(true)} 
                  style={{ fontSize: '0.85rem', fontWeight: '800', color: '#111827', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Already a user? Login
                </button>
              </div>
            )}
          </div>
        </form>

        <div style={{ margin: '2rem 0', borderBottom: '2px solid #111827' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={handleMockLogin}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.5rem', 
              padding: '0.75rem 1.25rem',
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              border: '2px solid #111827',
              fontWeight: '800',
              fontSize: '0.95rem',
              color: '#111827',
              boxShadow: '3px 3px 0px #111827',
              cursor: 'pointer',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '1.1rem', fontWeight: '900' }}>G</span> 
            <span>{isLogin ? 'Login with Google' : 'Sign up with Google'}</span>
          </button>
          
          <button 
            onClick={handleMockLogin}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.5rem', 
              padding: '0.75rem 1.25rem',
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              border: '2px solid #111827',
              fontWeight: '800',
              fontSize: '0.95rem',
              color: '#111827',
              boxShadow: '3px 3px 0px #111827',
              cursor: 'pointer',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '1.1rem', fontWeight: '900' }}>F</span> 
            <span>{isLogin ? 'Login with Facebook' : 'Sign up with Facebook'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
