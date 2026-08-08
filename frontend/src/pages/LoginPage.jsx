import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft, Scan } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('username', formData.email);
            params.append('password', formData.password);

            const API_URL = import.meta.env.VITE_API_URL || 'https://maizescan-vmi3.onrender.com';
            const response = await axios.post(`${API_URL}/token`, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            localStorage.setItem('token', response.data.access_token);
            navigate('/analytics');
        } catch (err) {
            console.error("Login failed:", err);
            alert("Uplink Failed: " + (err.response?.data?.detail || "Invalid credentials or backend offline."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(rgba(5, 31, 32, 0.4), rgba(5, 31, 32, 0.6)), url("/images/auth_bg.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '1.5rem',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <Link to="/" style={{
                position: 'absolute', top: '1.5rem', left: '1.5rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: 'white', textDecoration: 'none', fontWeight: 700,
                fontSize: '0.9rem', background: 'rgba(255,255,255,0.1)',
                padding: '0.6rem 1rem', borderRadius: '0.75rem',
                backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s'
            }} className="nav-link-back">
                <ArrowLeft size={16} /> Back to Website
            </Link>

            <style>{`
                .nav-link-back:hover { background: rgba(255,255,255,0.2) !important; transform: translateX(-3px); }
            `}</style>
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ 
                    width: '100%', maxWidth: '420px', padding: '2.5rem', borderRadius: '1.25rem', 
                    background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.1)' 
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', marginBottom: '1.25rem', background: 'var(--primary-dark)', padding: '0.6rem', borderRadius: '0.8rem' }}>
                        <img src="/images/logo.png" alt="MaizeScan" style={{ height: '32px', width: 'auto' }} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 950, color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>Operator Login</h2>
                    <p style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: '0.9rem' }}>Access the MaizeScan Intelligence Hub</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} size={16} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            style={{ 
                                width: '100%', padding: '0.85rem 1rem 0.85rem 3.5rem', height: '52px', borderRadius: '0.6rem', 
                                border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, outline: 'none', fontSize: '0.95rem'
                            }}
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} size={16} />
                        <input
                            type="password"
                            placeholder="Password"
                            style={{ 
                                width: '100%', padding: '0.85rem 1rem 0.85rem 3.5rem', height: '52px', borderRadius: '0.6rem', 
                                border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, outline: 'none', fontSize: '0.95rem'
                            }}
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-light)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                            <input type="checkbox" style={{ width: '14px', height: '14px', accentColor: 'var(--primary)' }} /> Remember me
                        </label>
                        <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Forgot password?</a>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px', borderRadius: '0.6rem', fontSize: '1rem', marginTop: '0.25rem' }}>
                        Establish Connection <LogIn size={16} />
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: 600 }}>
                        New to MaizeScan? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 900 }}>Create account</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
