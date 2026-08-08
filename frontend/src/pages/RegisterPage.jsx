import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, ArrowLeft, Phone, MapPin, Scan } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', role: 'Farmer', location: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://maizescan-vmi3.onrender.com';
            await axios.post(`${API_URL}/register`, {
                email: formData.email,
                password: formData.password,
                full_name: formData.name,
                role: formData.role
            });
            alert("Network Enrollment Successful! Please authenticate to start your session.");
            navigate('/login');
        } catch (err) {
            console.error("Enrollment failed:", err);
            alert("Enrollment Failed: " + (err.response?.data?.detail || "Connection error."));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(rgba(5, 31, 32, 0.45), rgba(5, 31, 32, 0.65)), url("/images/auth_bg.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '1rem',
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
                    width: '100%', maxWidth: '580px', padding: '2rem', borderRadius: '1.25rem', 
                    background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.1)' 
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'inline-flex', marginBottom: '1rem', background: 'var(--primary-dark)', padding: '0.5rem', borderRadius: '0.75rem' }}>
                        <img src="/images/logo.png" alt="MaizeScan" style={{ height: '30px', width: 'auto' }} />
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 950, color: 'var(--primary-dark)', marginBottom: '0.2rem' }}>Operator Enrollment</h2>
                    <p style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: '0.85rem' }}>Create your account to access the AI sorting engine</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ position: 'relative' }}>
                            <User style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} size={16} />
                            <input
                                type="text"
                                placeholder="Full Legal Name"
                                style={{ 
                                    width: '100%', padding: '0.75rem 1rem 0.75rem 3.5rem', height: '48px', borderRadius: '0.6rem', 
                                    border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, outline: 'none', fontSize: '0.9rem'
                                }}
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Mail style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} size={16} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            style={{ 
                                width: '100%', padding: '0.75rem 1rem 0.75rem 3.5rem', height: '48px', borderRadius: '0.6rem', 
                                border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, outline: 'none', fontSize: '0.9rem'
                            }}
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Phone style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} size={16} />
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            style={{ 
                                width: '100%', padding: '0.75rem 1rem 0.75rem 3.5rem', height: '48px', borderRadius: '0.6rem', 
                                border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, outline: 'none', fontSize: '0.9rem'
                            }}
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} size={16} />
                        <input
                            type="password"
                            placeholder="Create Password"
                            style={{ 
                                width: '100%', padding: '0.75rem 1rem 0.75rem 3.5rem', height: '48px', borderRadius: '0.6rem', 
                                border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, outline: 'none', fontSize: '0.9rem'
                            }}
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <MapPin style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} size={16} />
                        <input
                            type="text"
                            placeholder="Location (Village / Dist)"
                            style={{ 
                                width: '100%', padding: '0.75rem 1rem 0.75rem 3.5rem', height: '48px', borderRadius: '0.6rem', 
                                border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, outline: 'none', fontSize: '0.9rem'
                            }}
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <select
                            style={{ 
                                width: '100%', padding: '0 1rem', height: '48px', borderRadius: '0.6rem', 
                                border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer', outline: 'none', fontSize: '0.9rem'
                            }}
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="Farmer">Primary Producer (Farmer)</option>
                            <option value="Lab Technician">Laboratory Analyst</option>
                            <option value="Admin">Territory Administrator</option>
                        </select>
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)' }}>
                        <input type="checkbox" required style={{ width: '14px', height: '14px', accentColor: 'var(--primary)' }} />
                        <span>I accept the <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>MaizeScan Protocol Terms</a></span>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ gridColumn: 'span 2', width: '100%', height: '50px', borderRadius: '0.6rem', fontSize: '1rem', marginTop: '0.25rem' }}>
                        {isSubmitting ? "Validating..." : "Register Identity"} <UserPlus size={18} />
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 600 }}>
                        Already enrolled in the network? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 900 }}>Authenticate here</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
