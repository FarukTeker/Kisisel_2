"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { initializePrototypeState, loginPrototypeUser, MOCK_TEST_USERS, registerPrototypeUser, setCurrentPrototypeUser } from '@/lib/prototypeState';

export default function Login() {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    initializePrototypeState();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = loginPrototypeUser(email, password);
      if (!user) {
        setError('Invalid test credentials. Use one of the mock users below or register a new one.');
        return;
      }

      router.push('/');
      return;
    }

    if (!username.trim()) {
      setError('Username is required for registration.');
      return;
    }

    if (password !== repeatPassword) {
      setError('Passwords do not match.');
      return;
    }

    const result = registerPrototypeUser(username.trim(), email, password);
    if ('error' in result) {
      setError('This email is already registered. Try logging in with the existing test user.');
      return;
    }

    router.push('/');
  };

  const handleMockLogin = (userId: string) => {
    setCurrentPrototypeUser(userId);
    router.push('/');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f9f5ee 0%, #efe6d8 100%)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div 
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.2rem 1.5rem',
          backgroundColor: '#fffdf8', 
          borderRadius: '28px',
          boxShadow: '0 22px 50px rgba(17,24,39,0.12)',
          border: '1px solid rgba(23,23,23,0.12)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <span style={{ padding: '0.35rem 0.7rem', border: '1px solid rgba(23,23,23,0.1)', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', backgroundColor: '#f5efe4', color: '#5f5b54' }}>
            Mobile ready
          </span>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280' }}>{isLogin ? 'Welcome back' : 'New curator setup'}</span>
        </div>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '1.25rem', 
          fontSize: '1.75rem', 
          fontWeight: '900',
          color: '#111827',
          letterSpacing: '-1px',
          textTransform: 'uppercase'
        }}>
          Kişisel {isLogin ? 'Login' : 'Register'}
        </h1>
        <p style={{ textAlign: 'center', margin: '0 0 1.75rem', color: '#6b7280', fontSize: '0.92rem', lineHeight: 1.45 }}>
          Build a calmer reading flow, publish your own newspaper, and add editorial context to every story.
        </p>
        <div style={{ margin: '0 0 1rem', padding: '0.85rem 1rem', border: '1.5px dashed #111827', borderRadius: '16px', backgroundColor: '#f5efe4' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' }}>Test users</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {MOCK_TEST_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleMockLogin(user.id)}
                style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', padding: '0.65rem 0.75rem', borderRadius: '12px', border: '1.5px solid #111827', backgroundColor: '#fffdf8', textAlign: 'left' }}
              >
                <span>
                  <strong style={{ display: 'block', fontSize: '0.88rem' }}>{user.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{user.email}</span>
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827', whiteSpace: 'nowrap' }}>{user.password}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Custom brutalist logo frame */}
        <div style={{ 
          width: '100px', 
          height: '100px', 
          margin: '0 auto 2rem', 
          borderRadius: '18px', 
          overflow: 'hidden',
          backgroundColor: '#fffdf8',
          border: '2.5px solid #111827',
          boxShadow: '0 14px 30px rgba(17,24,39,0.10)'
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
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={{ 
                padding: '0.65rem 0.85rem', 
                 borderRadius: '12px', 
                 border: '1px solid rgba(23,23,23,0.14)',
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={{ 
                padding: '0.65rem 0.85rem', 
                 borderRadius: '12px', 
                 border: '1px solid rgba(23,23,23,0.14)',
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
                value={repeatPassword}
                onChange={(event) => setRepeatPassword(event.target.value)}
                style={{ 
                  padding: '0.65rem 0.85rem', 
                   borderRadius: '12px', 
                   border: '1px solid rgba(23,23,23,0.14)',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: '#111827',
                  fontWeight: 'bold'
                }} 
              />
            </div>
          )}

          {!isLogin && (
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: '1rem' }}>
              <label style={{ fontWeight: '800', fontSize: '0.95rem', color: '#111827', textTransform: 'uppercase' }}>name</label>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
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

          {error && (
            <div style={{ padding: '0.75rem 0.85rem', borderRadius: '12px', border: '1.5px solid #b91c1c', backgroundColor: '#fef2f2', color: '#991b1b', fontSize: '0.82rem', fontWeight: 700 }}>
              {error}
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
                  background: 'linear-gradient(180deg, #1e2433 0%, #111827 100%)', 
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(23,23,23,0.1)',
                  cursor: 'pointer',
                  boxShadow: '0 14px 28px rgba(17,24,39,0.16)',
                  textTransform: 'uppercase',
                  color: '#ffffff'
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
                    background: 'linear-gradient(180deg, #315efb 0%, #2647d6 100%)', 
                    fontWeight: '800', 
                    fontSize: '0.95rem',
                    borderRadius: '999px',
                    border: '1px solid rgba(23,23,23,0.1)',
                    cursor: 'pointer',
                    boxShadow: '0 14px 28px rgba(38,71,214,0.22)',
                    textTransform: 'uppercase',
                    color: '#ffffff'
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

         <div style={{ margin: '2rem 0', borderBottom: '2px solid #111827', opacity: 0.18 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={() => handleMockLogin(MOCK_TEST_USERS[0].id)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.5rem', 
              padding: '0.75rem 1.25rem',
              backgroundColor: '#ffffff',
               borderRadius: '999px',
               border: '1px solid rgba(23,23,23,0.12)',
               fontWeight: '800',
               fontSize: '0.95rem',
               color: '#111827',
               boxShadow: '0 12px 24px rgba(17,24,39,0.10)',
              cursor: 'pointer',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '1.1rem', fontWeight: '900' }}>G</span> 
            <span>{isLogin ? 'Login with Google' : 'Sign up with Google'}</span>
          </button>
          
          <button 
            onClick={() => handleMockLogin(MOCK_TEST_USERS[1].id)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.5rem', 
              padding: '0.75rem 1.25rem',
              backgroundColor: '#ffffff',
               borderRadius: '999px',
               border: '1px solid rgba(23,23,23,0.12)',
               fontWeight: '800',
               fontSize: '0.95rem',
               color: '#111827',
               boxShadow: '0 12px 24px rgba(17,24,39,0.10)',
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
