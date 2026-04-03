import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import s from './Sidebar.module.css';

const EC = {
  happy:'#1D9E75', hopeful:'#5DCAA5', neutral:'#8aa292',
  surprised:'#378ADD', anxious:'#EF9F27', sad:'#378ADD',
  fearful:'#EF9F27', angry:'#E24B4A', disgusted:'#E24B4A', exhausted:'#4e6658',
};

function Dot({ emotion }) {
  return <span className={s.dot} style={{ background: EC[emotion] || '#8aa292' }} />;
}

export default function Sidebar({ analytics, emotionData, userEmail, onLogout }) {
  const hasData = analytics && !analytics.message;

  return (
    <aside className={s.sidebar}>
      <div className={s.logo}>ventar<span>a</span></div>

      <div className={s.userChip}>
        <div className={s.avatar}>{(userEmail || 'U')[0].toUpperCase()}</div>
        <span className={s.userEmail}>{userEmail || 'guest'}</span>
        <button className={s.logoutBtn} onClick={onLogout} title="Sign out">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>

      {emotionData?.primary_emotion && (
        <div className={s.card}>
          <div className={s.cardLabel}>current emotion</div>
          <div className={s.emotionRow}>
            <Dot emotion={emotionData.primary_emotion} />
            <span className={s.emotionName}>{emotionData.primary_emotion}</span>
            <span className={s.intensity}>{emotionData.intensity}/10</span>
          </div>
          <div className={s.moodBar}>
            <div className={s.moodFill} style={{
              width: `${((emotionData.mood_score + 5) / 10) * 100}%`,
              background: emotionData.mood_score >= 0 ? 'var(--teal)' : 'var(--red)'
            }} />
          </div>
          <div className={s.moodLabels}><span>distressed</span><span>wellbeing</span></div>
          {emotionData.secondary_emotions?.length > 0 && (
            <div className={s.pills}>
              {emotionData.secondary_emotions.map(e => <span key={e} className={s.pill}>{e}</span>)}
            </div>
          )}
        </div>
      )}

      {hasData && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>mood trend</div>
            <ResponsiveContainer width="100%" height={72}>
              <LineChart data={analytics.timeline}>
                <YAxis domain={[-5, 5]} hide />
                <Tooltip
                  contentStyle={{ background: '#1c2a20', border: 'none', fontSize: 11, borderRadius: 6 }}
                  formatter={(v) => [Number(v).toFixed(1), 'mood']}
                  labelFormatter={(l) => typeof l === 'string' ? l : ''}
                />
                <Line type="monotone" dataKey="score" stroke="#1D9E75" strokeWidth={2} dot={{ r: 3, fill: '#1D9E75' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={s.statsGrid}>
            {[
              { val: analytics.average_mood_score, label: 'avg mood' },
              { val: analytics.session_count,      label: 'sessions' },
              { val: analytics.risk_sessions,      label: 'risk flags', danger: analytics.risk_sessions > 0 },
              { val: analytics.mood_swing_index,   label: 'swing' },
            ].map(({ val, label, danger }) => (
              <div key={label} className={s.statCard}>
                <div className={s.statVal} style={{ color: danger ? 'var(--red)' : 'var(--teal-l)' }}>{val}</div>
                <div className={s.statLabel}>{label}</div>
              </div>
            ))}
          </div>

          <div className={s.card}>
            <div className={s.cardLabel}>dominant emotions</div>
            {analytics.dominant_emotions.map(e => (
              <div key={e} className={s.emotionItem}><Dot emotion={e} /><span>{e}</span></div>
            ))}
          </div>

          {analytics.top_keywords?.length > 0 && (
            <div className={s.card}>
              <div className={s.cardLabel}>top keywords</div>
              <div className={s.pills}>
                {analytics.top_keywords.map(k => <span key={k} className={s.pill}>{k}</span>)}
              </div>
            </div>
          )}
        </>
      )}

      {!hasData && !emotionData && (
        <div className={s.empty}>Start sharing to see your mood analytics here.</div>
      )}
    </aside>
  );
}
