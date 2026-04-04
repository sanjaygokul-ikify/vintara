import React, { useState, useEffect } from 'react';
import { supabase }    from './utils/supabase';
import AuthPage        from './pages/AuthPage';
import HistoryPage     from './pages/HistoryPage';
import AnalyticsPage   from './pages/AnalyticsPage';
import Sidebar         from './components/Sidebar';
import ChatWindow      from './components/ChatWindow';
import ChatInput       from './components/ChatInput';
import BottomNav       from './components/BottomNav';
import { useChat }     from './hooks/useChat';
import s               from './App.module.css';

function ChatApp({ user, onLogout }) {
  const { messages, loading, emotionData, analytics, error, send } = useChat(user.id);
  const [view, setView]             = useState('chat');
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  // Close sheet on back gesture / escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setAnalyticsOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className={s.shell}>

      {/* Desktop sidebar */}
      <Sidebar
        analytics={analytics}
        emotionData={emotionData}
        userEmail={user.email}
        onLogout={onLogout}
      />

      {/* Main */}
      <div className={s.main}>

        <div className={s.topbar}>
          <div className={s.topLeft}>
            <div className={s.pulse} />
            <span className={s.logoText}>v<span className={s.logoIN}>IN</span>tara</span>
          </div>
          <div className={s.topRight}>
            {/* Desktop nav buttons */}
            <button className={`${s.navBtn} ${s.deskOnly} ${view==='chat'?s.active:''}`} onClick={() => setView('chat')}>Chat</button>
            <button className={`${s.navBtn} ${s.deskOnly} ${view==='history'?s.active:''}`} onClick={() => setView('history')}>History</button>

            {/* Mobile analytics icon — always visible on mobile */}
            <button className={`${s.iconBtn} ${s.deskHide}`} onClick={() => setAnalyticsOpen(true)} aria-label="Open analytics">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </button>

            <button className={s.iconBtn} onClick={onLogout} aria-label="Sign out">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Page views */}
        <div className={s.content}>
          {view === 'chat' && (
            <>
              <ChatWindow messages={messages} loading={loading} error={error} />
              <ChatInput onSend={send} loading={loading} />
            </>
          )}
          {view === 'history' && <HistoryPage userId={user.id} />}
        </div>

        {/* Mobile bottom nav */}
        <BottomNav view={view} setView={setView} />
      </div>

      {/* ── Analytics bottom sheet ── */}
      {analyticsOpen && (
        <div className={s.overlay} onClick={() => setAnalyticsOpen(false)}>
          <div className={s.sheet} onClick={e => e.stopPropagation()}>
            <div className={s.sheetBar}>
              <div className={s.sheetHandle} />
              <button className={s.sheetClose} onClick={() => setAnalyticsOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className={s.sheetScroll}>
              <AnalyticsPage analytics={analytics} emotionData={emotionData} compact />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser]           = useState(null);
  const [checking, setChecking]   = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (checking) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)', fontSize:14 }}>
      Loading vINtara…
    </div>
  );

  if (!user) return <AuthPage />;
  return <ChatApp user={user} onLogout={handleLogout} />;
}