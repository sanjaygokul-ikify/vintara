import React, { useState, useEffect } from 'react';
import { supabase }    from './utils/supabase';
import AuthPage        from './pages/AuthPage';
import HistoryPage     from './pages/HistoryPage';
import Sidebar         from './components/Sidebar';
import ChatWindow      from './components/ChatWindow';
import ChatInput       from './components/ChatInput';
import { useChat }     from './hooks/useChat';
import s               from './App.module.css';

function ChatApp({ user, onLogout }) {
  const { messages, loading, emotionData, analytics, error, send } = useChat(user.id);
  const [view, setView] = useState('chat');

  return (
    <div className={s.shell}>
      <Sidebar
        analytics={analytics}
        emotionData={emotionData}
        userEmail={user.email}
        onLogout={onLogout}
      />

      <div className={s.main}>
        <div className={s.topbar}>
          <div className={s.topLeft}>
            <div className={s.pulse} />
            <span className={s.status}>Ventara is listening</span>
          </div>
          <div className={s.topRight}>
            <button className={`${s.navBtn} ${view==='chat'?s.active:''}`} onClick={() => setView('chat')}>Chat</button>
            <button className={`${s.navBtn} ${view==='history'?s.active:''}`} onClick={() => setView('history')}>History</button>
          </div>
        </div>

        {view === 'chat' ? (
          <>
            <ChatWindow messages={messages} loading={loading} error={error} />
            <ChatInput onSend={send} loading={loading} />
          </>
        ) : (
          <HistoryPage userId={user.id} onBack={() => setView('chat')} />
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser]       = useState(null);
  const [checking, setChecking] = useState(true);

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

  if (checking) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)', fontSize:14 }}>
        Loading Ventara…
      </div>
    );
  }

  if (!user) return <AuthPage />;
  return <ChatApp user={user} onLogout={handleLogout} />;
}
