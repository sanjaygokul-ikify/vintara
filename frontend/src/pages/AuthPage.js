import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import s from './AuthPage.module.css';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.08-6.08C34.5 3.08 29.56 1 24 1 14.84 1 7.01 6.4 3.5 14.09l7.08 5.5C12.3 13.28 17.68 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.14-3.14-.4-4.64H24v8.79h12.7c-.55 2.94-2.2 5.43-4.68 7.1l7.18 5.58C43.36 37.5 46.5 31.44 46.5 24.5z"/>
      <path fill="#FBBC05" d="M10.58 28.41A14.56 14.56 0 0 1 9.5 24c0-1.53.26-3.01.72-4.41L3.14 14.09A23.93 23.93 0 0 0 1 24c0 3.87.93 7.52 2.5 10.75l7.08-6.34z"/>
      <path fill="#34A853" d="M24 47c5.56 0 10.22-1.84 13.63-4.99l-7.18-5.58c-1.84 1.23-4.2 1.96-6.45 1.96-6.32 0-11.7-3.78-13.42-9.09l-7.08 6.34C7.01 41.6 14.84 47 24 47z"/>
    </svg>
  );
}

export default function AuthPage() {
  const [mode, setMode]         = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [msg, setMsg]           = useState(null);
  const [err, setErr]           = useState(null);

  const clear = () => { setMsg(null); setErr(null); };

  const handleGoogle = async () => {
    clear();
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (e) {
      setErr(e.message || 'Google sign-in failed.');
      setGoogleLoading(false);
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
        setMsg('Reset link sent! Check your inbox.');
      } else if (mode === 'signup') {
        if (password.length < 6) return setErr('Password must be at least 6 characters.');
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg('Account created! Sign in now.');
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
        <div className={s.logoWrap}>
          <div className={s.logo}>v<span>IN</span>tara</div>
          <div className={s.tagline}>
            {mode === 'reset' ? 'Reset your password'
              : mode === 'signup' ? 'Create your safe space'
              : 'Welcome back'}
          </div>
        </div>

        {/* Google button — only show on login/signup, not reset */}
        {mode !== 'reset' && (
          <>
            <button
              className={s.googleBtn}
              onClick={handleGoogle}
              disabled={googleLoading || loading}
            >
              <GoogleIcon />
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            <div className={s.divider}>
              <span className={s.dividerLine} />
              <span className={s.dividerText}>or</span>
              <span className={s.dividerLine} />
            </div>
          </>
        )}

        <div className={s.form}>
          <div className={s.field}>
            <label className={s.label}>Email address</label>
            <input
              className={s.input}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && handleSubmit()}
            />
          </div>

          {mode !== 'reset' && (
            <div className={s.field}>
              <label className={s.label}>Password</label>
              <input
                className={s.input}
                type="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && handleSubmit()}
              />
            </div>
          )}

          {err && <div className={s.err}>{err}</div>}
          {msg && <div className={s.success}>{msg}</div>}

          <button className={s.btn} onClick={handleSubmit} disabled={loading || googleLoading}>
            {loading ? 'Please wait…'
              : mode === 'reset' ? 'Send reset link'
              : mode === 'signup' ? 'Create account'
              : 'Sign in with email'}
          </button>
        </div>

        <div className={s.links}>
          {mode === 'login' && <>
            <button className={s.link} onClick={() => { setMode('signup'); clear(); }}>Create account</button>
            <span className={s.sep}>·</span>
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
