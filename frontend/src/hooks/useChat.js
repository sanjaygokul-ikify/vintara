import { useState, useCallback } from 'react';
import { sendChat } from '../utils/api';

export function useChat(userId) {
  const [messages, setMessages]   = useState([]);
  const [history, setHistory]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [emotionData, setEmotion] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError]         = useState(null);

  const send = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: text, ts: Date.now() }]);
    setLoading(true);
    try {
      const data = await sendChat(userId, text, history);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, emotion: data.emotion_data, ts: Date.now() }]);
      setHistory(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: data.reply }]);
      setEmotion(data.emotion_data);
      setAnalytics(data.analytics);
    } catch {
      setError('Could not reach Ventara. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [userId, history, loading]);

  return { messages, loading, emotionData, analytics, error, send };
}
