import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Calendar, Edit3,
    BarChart3, Activity, FileText, Settings,
    Shield, Bell, Moon, Sun, Globe, LogOut,
    CheckCircle2, TrendingUp, Layers, BadgeCheck
} from 'lucide-react';

const ProfilePage = ({ user: initialUser }) => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [user, setUser] = useState(initialUser);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const API_URL = import.meta.env.VITE_API_URL || '/api';
                const [userRes, statsRes] = await Promise.all([
                    axios.get(`${API_URL}/users/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_URL}/analytics`)
                ]);

                setUser(userRes.data);
                setStats(statsRes.data);
            } catch (err) {
                console.error("Profile fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--background)' }}>
            <div className="telemetry-text">ESTABLISHING_UPLINK...</div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '2rem auto', padding: '0 2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '2.5rem', alignItems: 'start' }}>

                {/* LEFT PANEL: Profile Summary */}
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ padding: '3rem', background: 'white' }}>
                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
                        <div style={{
                            width: '140px', height: '140px', borderRadius: '3.5rem',
                            background: 'var(--primary-dark)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
                            fontSize: '3.5rem', fontWeight: 950, 
                            boxShadow: '0 20px 40px rgba(5,31,32,0.1)',
                            border: '4px solid var(--accent)'
                        }}>
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <button style={{ position: 'absolute', bottom: '5px', right: '35%', background: 'var(--primary-light)', color: 'white', padding: '0.6rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}>
                            <Edit3 size={16} />
                        </button>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 950, marginBottom: '0.25rem', color: 'var(--primary-dark)', letterSpacing: '-0.5px' }}>{user?.full_name || 'Agri Operator'}</h2>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent)', color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '2rem' }}>
                            <BadgeCheck size={14} /> {user?.role || 'Operator'}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '2.5rem' }}>
                        <InfoRow icon={<Mail size={16} />} label="Auth Email" val={user?.email} />
                        <InfoRow icon={<Globe size={16} />} label="Organization" val="Agri-Core Network" />
                        <InfoRow icon={<MapPin size={16} />} label="Service Hub" val="Satara, MH, India" />
                        <InfoRow icon={<Calendar size={16} />} label="Member Since" val="Aug 2024" />
                    </div>

                    <button onClick={logout} className="btn" style={{ width: '100%', marginTop: '3rem', background: '#fee2e2', color: '#991b1b', fontWeight: 800, padding: '1rem', borderRadius: '0.75rem', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <LogOut size={18} /> Disconnect Account
                    </button>
                </motion.div>

                {/* RIGHT PANEL: Dynamic Content Tabs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Tab Navigation */}
                    <div className="glass-panel" style={{ padding: '0.6rem', display: 'flex', gap: '0.4rem', background: 'rgba(5,31,32,0.02)', border: 'none' }}>
                        <TabBtn active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} icon={<BarChart3 size={18} />} label="Overview" />
                        <TabBtn active={activeTab === 'Activity'} onClick={() => setActiveTab('Activity')} icon={<Activity size={18} />} label="Activity" />
                        <TabBtn active={activeTab === 'Security'} onClick={() => setActiveTab('Security')} icon={<Shield size={18} />} label="Security" />
                        <TabBtn active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} icon={<Settings size={18} />} label="Preferences" />
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="glass-panel"
                            style={{ padding: '3rem', minHeight: '600px', background: 'white' }}
                        >
                            {activeTab === 'Overview' && <OverviewTab stats={stats} />}
                            {activeTab === 'Activity' && <ActivityTab />}
                            {activeTab === 'Security' && <SecurityTab />}
                            {activeTab === 'Settings' && <SettingsTab />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const OverviewTab = ({ stats }) => (
    <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 950, marginBottom: '2.5rem', color: 'var(--primary-dark)' }}>Platform Performance</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
            <MetricCard label="Global Analysis Count" val={stats?.total_seeds?.toLocaleString() || '...'} sub="Across local regions" color="var(--primary)" />
            <MetricCard label="Sync Persistence" val="99.9%" sub="Uptime via NeonDB" color="var(--primary)" />
            <MetricCard label="Batch Quality Score" val="High" sub="System-wide average" color="var(--primary)" />
            <MetricCard label="Process Velocity" val="1.2s" sub="Avg. Inference Time" color="var(--primary)" />
        </div>

        <h4 style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Network Stability</h4>
        <div style={{ height: '260px', background: 'var(--background)', borderRadius: '1.5rem', border: '1px dashed var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
            <TrendingUp size={40} color="var(--primary-light)" opacity={0.5} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Historical performance analytics synced.</span>
        </div>
    </div>
);

const ActivityTab = () => (
    <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 950, marginBottom: '2.5rem', color: 'var(--primary-dark)' }}>Live System Audit</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <TimelineItem icon={<FileText size={18} />} title="Audit Trail Synchronized" desc="Batch list exported to corporate ledger." time="2h ago" />
            <TimelineItem icon={<CheckCircle2 size={18} />} title="AI Calibration Success" desc="Threshold adjusted for low-light harvesting." time="6h ago" />
            <TimelineItem icon={<Layers size={18} />} title="Batch Verification #9012" desc="540 seeds analyzed. Grade: Excellent." time="Yesterday" />
            <TimelineItem icon={<Shield size={18} />} title="Security Handshake" desc="Authenticated login from trusted device ID 09." time="24 Aug" />
        </div>
    </div>
);

const SecurityTab = () => (
    <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 950, marginBottom: '2rem', color: 'var(--primary-dark)' }}>Security Protocols</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h4 style={{ fontWeight: 800, marginBottom: '0.25rem' }}>Two-Factor Authentication</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Secure your harvests with an extra layer of protection.</p>
                </div>
                <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 800 }}>ACTIVE</div>
            </div>
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h4 style={{ fontWeight: 800, marginBottom: '0.25rem' }}>Trusted Device ID</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current station: MS-WIN-DESKTOP-04</p>
                </div>
                <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 800, background: '#f8fafc', border: '1px solid #e2e8f0' }}>MANAGE</button>
            </div>
        </div>
    </div>
);

const SettingsTab = () => (
    <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 950, marginBottom: '2rem', color: 'var(--primary-dark)' }}>System Preferences</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-dark)', display: 'block', marginBottom: '0.5rem' }}>Detection Threshold</label>
                    <input type="range" style={{ width: '100%', accentColor: 'var(--primary)' }} defaultValue="65" />
                </div>
                <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-dark)', display: 'block', marginBottom: '0.5rem' }}>Auto-Sync (Min)</label>
                    <input type="number" defaultValue={5} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                </div>
            </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: '3rem', padding: '1rem 2rem' }}>Update Enterprise Sync</button>
    </div>
);

const TabBtn = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
            padding: '0.8rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', fontWeight: 800, fontSize: '0.85rem',
            background: active ? 'white' : 'transparent',
            color: active ? 'var(--primary-dark)' : 'var(--primary-light)',
            boxShadow: active ? '0 4px 15px rgba(5,31,32,0.06)' : 'none'
        }}
    >
        {icon} {label}
    </button>
);

const InfoRow = ({ icon, label, val }) => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ color: 'var(--primary-dark)', background: 'var(--accent)', padding: '0.6rem', borderRadius: '0.8rem' }}>{icon}</div>
        <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-dark)' }}>{val}</div>
        </div>
    </div>
);

const MetricCard = ({ label, val, sub, color }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', background: '#f8fafc', border: '1px solid rgba(0,0,0,0.03)', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary-light)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: '2.2rem', fontWeight: 950, color: 'var(--primary-dark)', lineHeight: 1, marginBottom: '0.4rem' }}>{val}</div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>{sub}</div>
    </div>
);

const TimelineItem = ({ icon, title, desc, time }) => (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ width: '40px', height: '40px', background: 'var(--accent)', color: 'var(--primary-dark)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {icon}
        </div>
        <div style={{ flex: 1, borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--primary-dark)' }}>{title}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-light)' }}>{time}</div>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{desc}</div>
        </div>
    </div>
);

export default ProfilePage;
