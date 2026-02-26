import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

export const AuthPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            // Navigate to Dashboard upon success
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Authentication failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
            {/* Animated Glow Background Effects */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '50vw',
                height: '50vw',
                background: 'radial-gradient(circle, rgba(123, 66, 246, 0.15) 0%, transparent 60%)',
                filter: 'blur(60px)',
                zIndex: 0
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                right: '-10%',
                width: '50vw',
                height: '50vw',
                background: 'radial-gradient(circle, rgba(45, 212, 191, 0.1) 0%, transparent 60%)',
                filter: 'blur(60px)',
                zIndex: 0
            }} />

            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '480px',
                padding: '3rem 2.5rem',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
            }}>
                {/* Header Back Button */}
                <button
                    onClick={() => navigate('/')}
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        left: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                    }}>
                        AgentWallet<span style={{ color: 'var(--accent-color)' }}>.AI</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        {mode === 'signin' ? 'Welcome back, commander.' : 'Initialize your agent instance.'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {mode === 'signup' && (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Name (Optional)</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="setting-input"
                                    placeholder="Your Name"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        transition: 'all 0.2s ease'
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Wallet (Optional)</label>
                                <input
                                    type="text"
                                    value={walletAddress}
                                    onChange={(e) => setWalletAddress(e.target.value)}
                                    className="setting-input"
                                    placeholder="e.g. 7AETLyAG..."
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        transition: 'all 0.2s ease'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                color: 'white',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                color: 'white',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'var(--accent-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '600',
                            fontSize: '1.05rem',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            opacity: isSubmitting ? 0.7 : 1,
                            marginTop: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 15px rgba(123, 66, 246, 0.3)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)' }}
                        onMouseOut={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'none' }}
                    >
                        {isSubmitting ? 'Authenticating...' : (
                            <>
                                {mode === 'signin' ? 'Access Console' : 'Initialize Agent'}
                                <Sparkles size={18} />
                            </>
                        )}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
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
                                    setError(err.response?.data?.error || 'Google Authentication failed. Please try again.');
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            onError={() => {
                                setError('Google Login Failed');
                            }}
                            theme="filled_black"
                            width="100%"
                            size="large"
                            text="continue_with"
                        />
                    </div>
                </form>

                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    {mode === 'signin' ? "Need clearance? " : "Already initialized? "}
                    <button
                        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            padding: 0,
                            fontWeight: '600',
                            transition: 'color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    >
                        {mode === 'signin' ? 'Request Access' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
};
