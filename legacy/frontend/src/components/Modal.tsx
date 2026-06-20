"use client";

import React, { useEffect, useRef, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  variant?: 'centered' | 'floating';
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function Modal({ isOpen, onClose, title, children, maxWidth, variant = 'centered' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({ startX: 0, startY: 0, originX: 0, originY: 0 });
  const [position, setPosition] = useState({ x: 32, y: 92 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(false);

  useEffect(() => {
    const syncViewport = () => setIsCompactViewport(window.innerWidth < 768);

    syncViewport();
    window.addEventListener('resize', syncViewport);

    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  useEffect(() => {
    if (!isOpen || variant !== 'floating') return;

    const width = Math.min(window.innerWidth - 32, 760);
    setPosition({
      x: Math.max(16, window.innerWidth - width - 28),
      y: 92,
    });
  }, [isOpen, variant]);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      const panelWidth = panelRef.current?.offsetWidth || 760;
      const maxX = Math.max(16, window.innerWidth - panelWidth - 16);
      const maxY = Math.max(16, window.innerHeight - 72);
      const nextX = dragRef.current.originX + event.clientX - dragRef.current.startX;
      const nextY = dragRef.current.originY + event.clientY - dragRef.current.startY;

      setPosition({
        x: clamp(nextX, 16, maxX),
        y: clamp(nextY, 16, maxY),
      });
    };

    const handlePointerUp = () => setIsDragging(false);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  if (variant === 'floating' && !isCompactViewport) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        pointerEvents: 'none'
      }}>
        <div
          ref={panelRef}
          className="card animate-fade-in"
          style={{
            backgroundColor: 'var(--surface)',
            color: 'var(--foreground)',
            width: maxWidth || '500px',
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 'calc(100vh - 112px)',
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'auto',
            border: '2px solid var(--foreground)',
            boxShadow: '6px 6px 0px var(--foreground)',
            borderRadius: '14px',
            overflow: 'hidden'
          }}
        >
          <div
            onPointerDown={(event) => {
              event.preventDefault();
              dragRef.current = {
                startX: event.clientX,
                startY: event.clientY,
                originX: position.x,
                originY: position.y,
              };
              setIsDragging(true);
            }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--surface-hover)',
              borderBottom: '1.5px solid var(--foreground)',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none'
            }}
          >
            <h2 style={{ fontSize: '1.25rem' }}>{title}</h2>
            <button
              type="button"
              aria-label="Close settings panel"
              onPointerDown={(event) => {
                event.stopPropagation();
                setIsDragging(false);
              }}
              onPointerUp={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                setIsDragging(false);
                onClose();
              }}
              style={{
                width: '2rem',
                height: '2rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid transparent',
                borderRadius: '4px',
                color: 'var(--foreground)',
                fontSize: '1.5rem',
                fontWeight: 800,
                lineHeight: 1,
                cursor: 'pointer'
              }}
            >
              &times;
            </button>
          </div>
          <div style={{ padding: '1.25rem', overflow: 'auto' }}>
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(17,24,39,0.46)',
      display: 'flex',
      alignItems: isCompactViewport ? 'flex-end' : 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: isCompactViewport ? '0.75rem' : '1rem'
    }}>
      <div className="card animate-fade-in" style={{
        backgroundColor: 'var(--surface)',
        color: 'var(--foreground)',
        width: '100%',
        maxWidth: isCompactViewport ? '100%' : maxWidth || '500px',
        padding: isCompactViewport ? '1rem' : '2rem',
        position: 'relative',
        borderRadius: isCompactViewport ? '24px 24px 0 0' : '18px',
        border: '2px solid var(--foreground)',
        boxShadow: isCompactViewport ? '0 -10px 30px rgba(0,0,0,0.12)' : '8px 8px 0px var(--foreground)',
        maxHeight: isCompactViewport ? '88vh' : 'auto',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>{title}</h2>
          <button onClick={onClose} style={{ fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}
