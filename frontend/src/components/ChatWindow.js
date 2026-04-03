import React, { useEffect, useRef } from 'react';
import s from './ChatWindow.module.css';

const EC = { happy:'#1D9E75', hopeful:'#5DCAA5', neutral:'#8aa292', surprised:'#378ADD', anxious:'#EF9F27', sad:'#378ADD', fearful:'#EF9F27', angry:'#E24B4A', disgusted:'#E24B4A', exhausted:'#4e6658' };

function EmotionTag({ emotion }) {
  if (!emotion?.primary_emotion) return null;
  const c = EC[emotion.primary_emotion] || '#8aa292';
  return (
    <div className={s.tag} style={{ borderColor: c + '40', color: c }}>
      {emotion.primary_emotion} · {emotion.intensity}/10
      {emotion.risk_flag && <span className={s.risk}>risk</span>}
    </div>
  );
}

function Msg({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`${s.wrap} ${isUser ? s.userWrap : ''}`}>
      {!isUser && <div className={s.botAv}>V</div>}
      <div className={s.col}>
        <div className={`${s.bubble} ${isUser ? s.userBubble : s.botBubble}`}>{msg.content}</div>
        {!isUser && <EmotionTag emotion={msg.emotion} />}
      </div>
      {isUser && <div className={s.userAv}>●</div>}
    </div>
  );
}

function Typing() {
  return (
    <div className={s.wrap}>
      <div className={s.botAv}>V</div>
      <div className={`${s.bubble} ${s.botBubble} ${s.typing}`}><span/><span/><span/></div>
    </div>
  );
}

export default function ChatWindow({ messages, loading, error }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  return (
    <div className={s.window}>
      <div className={s.welcome}>
        <div className={s.welcomeTitle}>How are you feeling today?</div>
        <div className={s.welcomeSub}>This is your safe space. Share anything — no judgment, ever.</div>
      </div>
      {messages.map((m, i) => <Msg key={i} msg={m} />)}
      {loading && <Typing />}
      {error && <div className={s.error}>{error}</div>}
      <div ref={endRef} />
    </div>
  );
}
