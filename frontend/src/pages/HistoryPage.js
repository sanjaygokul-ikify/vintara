import React, { useEffect, useState } from 'react';
import { fetchHistory } from '../utils/api';
import s from './HistoryPage.module.css';

const EC = { happy:'#1D9E75', hopeful:'#5DCAA5', neutral:'#8aa292', surprised:'#378ADD', anxious:'#EF9F27', sad:'#378ADD', fearful:'#EF9F27', angry:'#E24B4A', disgusted:'#E24B4A', exhausted:'#4e6658' };

function fmt(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

export default function HistoryPage({ userId, onBack }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory(userId, 50).then(setHistory).catch(() => {}).finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className={s.page}>
      <div className={s.header}>
        <button className={s.back} onClick={onBack}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M5 12L12 19M5 12L12 5"/></svg>
          back to chat
        </button>
        <div className={s.title}>Session History</div>
        <div className={s.sub}>{history.length} sessions recorded for your account</div>
      </div>

      <div className={s.list}>
        {loading && <div className={s.empty}>Loading your history…</div>}
        {!loading && history.length === 0 && (
          <div className={s.empty}>No sessions yet. Start chatting with Ventara.</div>
        )}
        {history.map((item, i) => {
          const color = EC[item.emotion] || '#8aa292';
          return (
            <div key={i} className={s.card}>
              <div className={s.cardTop}>
                <span className={s.badge} style={{ color, borderColor: color + '40' }}>{item.emotion || 'neutral'}</span>
                <span className={s.meta}>intensity {item.intensity}/10 · score {item.mood_score > 0 ? '+' : ''}{item.mood_score}</span>
                {item.risk_flag && <span className={s.risk}>risk</span>}
                <span className={s.time}>{fmt(item.timestamp)}</span>
              </div>
              <div className={s.userMsg}>"{item.user_msg}"</div>
              <div className={s.botReply}>{item.bot_reply}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
