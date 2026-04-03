const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export async function sendChat(userId, message, history) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, message, history }),
  });
  if (!res.ok) throw new Error('Chat API failed');
  return res.json();
}

export async function fetchAnalytics(userId) {
  const res = await fetch(`${BASE}/analytics/${userId}`);
  if (!res.ok) throw new Error('Analytics failed');
  return res.json();
}

export async function fetchHistory(userId, limit = 30) {
  const res = await fetch(`${BASE}/history/${userId}?limit=${limit}`);
  if (!res.ok) throw new Error('History failed');
  return res.json();
}
