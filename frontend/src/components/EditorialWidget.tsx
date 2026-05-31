"use client";

import React, { useState } from 'react';

export default function EditorialWidget() {
  const [content, setContent] = useState('');

  return (
    <div className="card" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginBottom: '1rem' }}>Editorial Column</h3>
      <textarea 
        style={{ 
          flex: 1, 
          width: '100%', 
          resize: 'none', 
          border: '1px solid var(--border)', 
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem',
          marginBottom: '1rem'
        }}
        placeholder="Type something..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => alert('Saved!')}>Save</button>
      </div>
    </div>
  );
}
