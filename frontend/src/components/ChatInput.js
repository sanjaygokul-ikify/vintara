import React, { useState, useRef } from 'react';
import s from './ChatInput.module.css';

export default function ChatInput({ onSend, loading }) {
  const [text, setText] = useState('');
  const ref = useRef(null);

  const send = () => {
    if (!text.trim() || loading) return;
    onSend(text.trim());
    setText('');
    if (ref.current) ref.current.style.height = 'auto';
  };

  const onKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };
  const onInput = e => {
    setText(e.target.value);
    const el = ref.current;
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; }
  };

  return (
    <div className={s.bar}>
      <div className={s.wrap}>
        <textarea
          ref={ref}
          className={s.ta}
          placeholder="Share what's on your mind…"
          value={text}
          onChange={onInput}
          onKeyDown={onKey}
          rows={1}
          disabled={loading}
        />
        <button
          className={`${s.btn} ${(!text.trim()||loading) ? s.off : ''}`}
          onClick={send}
          disabled={!text.trim() || loading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}
