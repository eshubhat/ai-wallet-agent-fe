import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import { ArrowLeft, Sparkles, Eye, EyeOff, Zap, Repeat, TrendingUp } from 'lucide-react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

export const AuthPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (mode === 'signup') {
                const res = await authService.signup({ email, password, name, walletAddress });
                login(res.user, res.token);
            } else {
                const res = await authService.signin({ email, password });
                login(res.user, res.token);
            }
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Authentication failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const features = [
        { icon: <Zap size={14} />, label: 'AI-powered transfers' },
        { icon: <Repeat size={14} />, label: 'Token swaps via Jupiter' },
        { icon: <TrendingUp size={14} />, label: 'SOL staking rewards' },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'var(--bg-color)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Glow Background */}
            <div style={{
                position: 'absolute', top: '-10%', left: '-10%',
                width: '50vw', height: '50vw',
                background: 'radial-gradient(circle, rgba(123, 66, 246, 0.15) 0%, transparent 60%)',
                filter: 'blur(60px)', zIndex: 0
            }} />
            <div style={{
                position: 'absolute', bottom: '-10%', right: '-10%',
                width: '50vw', height: '50vw',
                background: 'radial-gradient(circle, rgba(45, 212, 191, 0.1) 0%, transparent 60%)',
                filter: 'blur(60px)', zIndex: 0
            }} />

            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '460px',
                padding: '2.75rem 2.5rem',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.75rem'
            }}>
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="btn-ghost"
                    style={{ position: 'absolute', top: '1.25rem', left: '1.25rem' }}
                >
                    <ArrowLeft size={15} /> Back
                </button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    {/* Solana badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '4px 12px', borderRadius: '999px',
                        background: 'rgba(153, 69, 255, 0.1)',
                        border: '1px solid rgba(153, 69, 255, 0.25)',
                        color: '#c084fc', fontSize: '0.75rem', fontWeight: 600,
                        marginBottom: '1rem', letterSpacing: '0.04em'
                    }}>
                        <Sparkles size={11} /> POWERED BY SOLANA
                    </div>

                    <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>
                        AgentWallet<span style={{ color: 'var(--accent-color)' }}>.AI</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        {mode === 'signin' ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
                    </p>

                    {/* Feature pills — only shown on signup */}
                    {mode === 'signup' && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '1rem' }}>
                            {features.map((f, i) => (
                                <span key={i} className="tag tag-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                    {f.icon} {f.label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#ef4444',
                        padding: '11px 15px',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    {/* Signup-only fields */}
                    {mode === 'signup' && (
                        <>
                            <div>
                                <label style={{ display: 'block', marginBottom: '7px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                    Name <span style={{ opacity: 0.5 }}>(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="setting-input"
                                    placeholder="Your full name"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '7px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                    Wallet Address <span style={{ opacity: 0.5 }}>(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={walletAddress}
                                    onChange={(e) => setWalletAddress(e.target.value)}
                                    className="setting-input"
                                    placeholder="e.g. 7AETLyAG..."
                                />
                            </div>
                        </>
                    )}

                    {/* Email */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '7px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            className="setting-input"
                        />
                    </div>

                    {/* Password with show/hide */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '7px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="setting-input"
                                style={{ paddingRight: '44px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                style={{
                                    position: 'absolute', right: '12px', top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-secondary)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    padding: '4px', display: 'flex', alignItems: 'center'
                                }}
                            >
                                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary"
                        style={{ width: '100%', padding: '15px', marginTop: '0.4rem', fontSize: '1rem' }}
                    >
                        {isSubmitting ? 'Please wait…' : (
                            <>
                                {mode === 'signin' ? 'Sign In' : 'Create Account'}
                                <Sparkles size={16} />
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={async (credentialResponse: CredentialResponse) => {
                                try {
                                    setIsSubmitting(true);
                                    setError('');
                                    if (credentialResponse.credential) {
                                        const res = await authService.googleLogin(credentialResponse.credential);
                                        login(res.user, res.token);
                                        navigate('/');
                                    }
                                } catch (err: any) {
                                    setError(err.response?.data?.error || 'Google sign-in failed. Please try again.');
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            onError={() => setError('Google sign-in failed.')}
                            theme="filled_black"
                            width="100%"
                            size="large"
                            text="continue_with"
                        />
                    </div>
                </form>

                {/* Switch mode */}
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                    {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
                        style={{
                            background: 'none', border: 'none',
                            color: 'var(--accent-color)', cursor: 'pointer',
                            fontWeight: 600, fontSize: '0.92rem'
                        }}
                    >
                        {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
};
