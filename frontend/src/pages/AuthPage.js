import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import s from './AuthPage.module.css';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const clear = () => { setMsg(null); setErr(null); };

  const handleGoogle = async () => {
    clear();
    setGoogleLoad(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setErr(error.message);
      setGoogleLoad(false);
    }
  };

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
        setMsg('Account created! Check your email to confirm, then sign in.');
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

        {/* Google Sign In */}
        {mode !== 'reset' && (
          <>
            <button className={s.googleBtn} onClick={handleGoogle} disabled={googleLoad}>
              {googleLoad ? (
                <span className={s.spinner} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span>{googleLoad ? 'Redirecting…' : `Continue with Google`}</span>
            </button>

            <div className={s.divider}>
              <span className={s.divLine} />
              <span className={s.divText}>or</span>
              <span className={s.divLine} />
            </div>
          </>
        )}

        {/* Email / Password form */}
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
            {loading
              ? 'Please wait…'
              : mode === 'reset'
                ? 'Send reset link'
                : mode === 'signup'
                  ? 'Create account'
                  : 'Sign in'}
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