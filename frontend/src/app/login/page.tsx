"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { loginUser, registerUser } from '@/lib/prototypeState';

export default function Login() {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = await loginUser(email, password);
      if (!user) {
        setError('Invalid email or password.');
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

    const result = await registerUser(username.trim(), email, password);
    if (result.error) {
      setError(result.error);
      return;
    }

    router.push('/');
  };

  const handleDevLogin = async (email: string, pass: string, name: string) => {
    setError('');
    let user = await loginUser(email, pass);
    if (!user) {
      const res = await registerUser(name, email, pass);
      if (res.error) {
        setError(res.error);
        return;
      }
      user = res.user || null;
    }
    if (user) {
      router.push('/');
    }
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
                    style={{ fontSize: '0.85rem', fontWeight: '800', color: '#111827', textDecoration: 'underline', cursor: 'pointer', border: 'none', background: 'transparent' }}
                  >
                    new user?
                  </button>
                  <button 
                    type="button"
                    style={{ fontSize: '0.85rem', fontWeight: '800', color: '#111827', textDecoration: 'underline', cursor: 'pointer', border: 'none', background: 'transparent' }}
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
                  style={{ fontSize: '0.85rem', fontWeight: '800', color: '#111827', textDecoration: 'underline', cursor: 'pointer', border: 'none', background: 'transparent' }}
                >
                  Already a user? Login
                </button>
              </div>
            )}
          </div>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(23,23,23,0.1)' }}>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            Quick Dev Logins
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleDevLogin('alice@dev.com', 'password', 'Alice')}
              style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Log in as Alice
            </button>
            <button
              onClick={() => handleDevLogin('bob@dev.com', 'password', 'Bob')}
              style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Log in as Bob
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
