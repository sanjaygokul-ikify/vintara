import React from 'react';
import s from './BottomNav.module.css';

const tabs = [
  {
    id: 'chat', label: 'Chat',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  },
  {
    id: 'history', label: 'History',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  },
];

export default function BottomNav({ view, setView }) {
  return (
    <nav className={s.nav}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`${s.tab} ${view === tab.id ? s.active : ''}`}
          onClick={() => setView(tab.id)}
        >
          <span className={s.icon}>{tab.icon}</span>
          <span className={s.label}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
