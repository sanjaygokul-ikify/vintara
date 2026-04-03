import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import s from './AuthPage.module.css';

export default function AuthPage() {
  const [mode, setMode]       = useState('login');   // 'login' | 'signup' | 'reset'
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState(null);
  const [err, setErr]         = useState(null);

  const clear = () => { setMsg(null); setErr(null); };

  const handleSubmit = async () => {
    if (!email.trim()) return setErr('Please enter your email.');
    clear();
    setLoading(true);
    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setMsg('Password reset link sent! Check your inbox.');
      } else if (mode === 'signup') {
        if (password.length < 6) return setErr('Password must be at least 6 characters.');
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg('Account created! Check your email to confirm, then log in.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      setErr(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>ventar<span>a</span></div>
        <div className={s.tagline}>
          {mode === 'reset'
            ? 'Reset your password'
            : mode === 'signup'
            ? 'Create your safe space'
            : 'Welcome back'}
        </div>

        <div className={s.form}>
          <div className={s.field}>
            <label className={s.label}>Email address</label>
            <input
              className={s.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && handleSubmit()}
              autoFocus
            />
          </div>

          {mode !== 'reset' && (
            <div className={s.field}>
              <label className={s.label}>Password</label>
              <input
                className={s.input}
                type="password"
                placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && handleSubmit()}
              />
            </div>
          )}

          {err && <div className={s.err}>{err}</div>}
          {msg && <div className={s.success}>{msg}</div>}

          <button className={s.btn} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'reset' ? 'Send reset link' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </div>

        <div className={s.links}>
          {mode === 'login' && <>
            <button className={s.link} onClick={() => { setMode('signup'); clear(); }}>Create account</button>
            <span className={s.dot}>·</span>
            <button className={s.link} onClick={() => { setMode('reset'); clear(); }}>Forgot password?</button>
          </>}
          {mode === 'signup' && <button className={s.link} onClick={() => { setMode('login'); clear(); }}>Already have an account? Sign in</button>}
          {mode === 'reset' && <button className={s.link} onClick={() => { setMode('login'); clear(); }}>Back to sign in</button>}
        </div>

        <div className={s.note}>Your conversations are private and encrypted.</div>
      </div>
    </div>
  );
}
