import React from 'react';
import AnalyticsPage from '../pages/AnalyticsPage';
import s from './Sidebar.module.css';

export default function Sidebar({ analytics, emotionData, userEmail, onLogout }) {
  return (
    <aside className={s.sidebar}>
      <div className={s.top}>
        <div className={s.logo}>v<span>IN</span>tara</div>
        <div className={s.user}>
          <div className={s.avatar}>{(userEmail||'U')[0].toUpperCase()}</div>
          <span className={s.email}>{userEmail}</span>
          <button className={s.logout} onClick={onLogout} title="Sign out">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </div>
      <div className={s.body}>
        <AnalyticsPage analytics={analytics} emotionData={emotionData} compact />
      </div>
    </aside>
  );
}
