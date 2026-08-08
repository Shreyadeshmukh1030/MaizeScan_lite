import React, { useState, useEffect } from 'react';
import {
    Database, TrendingUp, Users, AlertTriangle, Download,
    Calendar, Search, ArrowUpRight, ArrowDownRight, FileSpreadsheet,
    Zap, LayoutDashboard, Scan, FileText, Info, DollarSign, Target, AlertCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import QualityMap from '../components/QualityMap';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const DashboardPage = ({ user }) => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total_batches: 0,
        avg_defect_rate: 0,
        most_common_grade: 'N/A',
        grade_distribution: [],
        defect_trend: []
    });

    const [counters, setCounters] = useState({ batches: 0, seeds: 0, accuracy: 0 });

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await axios.get(`${API_URL}/analytics`);
                const bRes = await axios.get(`${API_URL}/batches`);

                setStats(res.data);
                setBatches(bRes.data);

                // Animate counters based on real data
                const targetBatches = res.data.total_batches || 0;
                const targetSeeds = res.data.total_seeds || 0;
                // Calculate a dynamic accuracy based on batch volume (simulated high precision)
                const targetAccuracy = res.data.total_batches > 0 ? (98.2 + (Math.random() * 0.5)).toFixed(1) : 0;

                let i = 0;
                const steps = 30;
                const interval = setInterval(() => {
                    setCounters(prev => ({
                        batches: Math.min(targetBatches, Math.floor(targetBatches * (i / steps))),
                        seeds: Math.min(targetSeeds, Math.floor(targetSeeds * (i / steps))),
                        accuracy: Math.min(targetAccuracy, +(targetAccuracy * (i / steps)).toFixed(1))
                    }));
                    i++;
                    if (i > steps) clearInterval(interval);
                }, 40);

            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const exportCSV = () => {
        if (!batches.length) return;
        const headers = Object.keys(batches[0]).join(',');
        const rows = batches.map(b => Object.values(b).join(','));
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MaizeScan_FullReport_${new Date().toLocaleDateString()}.csv`;
        a.click();
    };

    // Palette: #051F20 (Dark), #235347 (Primary), #8EB69B (Muted), #DAF1DE (Mint)
    const COLORS = ['#235347', '#52b788', '#8EB69B', '#b9dec9', '#051F20'];

    // --- NEW: MARKET PRICE SIMULATION ---
    const MARKET_PRICES = {
        'A': 2400, // INR per Quintal
        'B': 1850,
        'C': 1200
    };

    const latestBatch = batches[0] || {};
    const currentPrice = MARKET_PRICES[latestBatch.final_grade] || 0;
    const potentialGain = MARKET_PRICES['A'] - currentPrice;
    const isHighRisk = (latestBatch.bad_count + latestBatch.worst_count) > (latestBatch.total_count * 0.15);

    return (
        <div style={{ padding: '2rem', minHeight: '100vh', position: 'relative' }}>
            {/* Background Pattern */}
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'url("/images/pattern.png")',
                backgroundSize: '400px',
                opacity: 0.05,
                zIndex: -1,
                pointerEvents: 'none'
            }} />

            {/* --- NEW: HIGH RISK ALERT BANNER --- */}
            <AnimatePresence>
                {isHighRisk && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="glass-panel" 
                        style={{ 
                            background: 'linear-gradient(90deg, #fee2e2, #fef2f2)', 
                            border: '1px solid #ef4444', 
                            padding: '1.5rem', 
                            marginBottom: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem'
                        }}
                    >
                        <div style={{ background: '#ef4444', color: 'white', padding: '1rem', borderRadius: '1rem' }}>
                            <AlertCircle size={28} />
                        </div>
                        <div>
                            <h3 style={{ color: '#991b1b', fontWeight: 900, marginBottom: '0.2rem' }}>CRITICAL QUALITY RISK DETECTED</h3>
                            <p style={{ color: '#b91c1c', fontSize: '0.9rem', fontWeight: 600 }}>
                                Batch {latestBatch.batch_id} shows {(latestBatch.bad_percentage + latestBatch.worst_percentage).toFixed(1)}% contamination. 
                                Immediate silo isolation recommended to prevent moisture-spread.
                            </p>
                        </div>
                        <button className="btn btn-primary" style={{ marginLeft: 'auto', background: '#ef4444' }}>View Risk Report</button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="section-tag" style={{ background: 'var(--primary-dark)', color: 'white', marginBottom: '1.25rem' }}>SaaS Enterprise Hub</div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--primary-dark)', letterSpacing: '-1.5px', margin: 0 }}>
                        Operational <span style={{ color: 'var(--primary-light)' }}>Intelligence</span>
                    </h2>
                </motion.div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div className="glass-panel" style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>SYSTEM_SYNC: ACTIVE</span>
                    </div>
                    <button className="btn btn-primary" onClick={exportCSV} style={{ padding: '0.6rem 1.5rem', borderRadius: '0.75rem' }}>
                        <Download size={18} /> Export Results
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <KPICard
                    icon={<Scan size={24} />}
                    label="Total Seeds Tested"
                    value={loading ? "..." : counters.seeds.toLocaleString()}
                    trend={loading ? "" : "+real-time"}
                    trendUp={true}
                    sub="Seeds detected by AI"
                />
                <KPICard
                    icon={<TrendingUp size={24} />}
                    label="Active Batches"
                    value={loading ? "..." : counters.batches.toString()}
                    trend="Syncing"
                    trendUp={null}
                    sub="Total batch history"
                />
                <KPICard
                    icon={<Database size={24} />}
                    label="Sowing Quality"
                    value={loading ? "..." : `${stats.avg_defect_rate < 15 ? 'Excellent' : stats.avg_defect_rate < 25 ? 'Moderate' : 'Review'}`}
                    trend={`${(100 - stats.avg_defect_rate).toFixed(1)}%`}
                    trendUp={stats.avg_defect_rate < 20}
                    sub="Overall quality health"
                />
                <KPICard
                    icon={<DollarSign size={24} />}
                    label="Revenue Velocity"
                    value={loading ? "..." : `₹${(counters.seeds * 0.02).toFixed(0)}k`}
                    trend="+12.5%"
                    trendUp={true}
                    sub="Estimated market value"
                />
            </div>

            {/* --- NEW: PROFIT MAXIMIZER WIDGET --- */}
            <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', background: 'var(--primary-dark)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '250px', height: '250px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />
                
                <div>
                    <div className="section-tag" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>AI Profit Maximizer</div>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 950, marginBottom: '1.5rem' }}>Your Current Batch Value: <span style={{ color: '#34d399' }}>₹{currentPrice}/quintal</span></h2>
                    <p style={{ opacity: 0.8, fontSize: '1.1rem', maxWidth: '600px', lineHeight: 1.6 }}>
                        Our AI models suggest that by removing {latestBatch.bad_count + latestBatch.worst_count} defective seeds from this batch, you can upgrade to **Grade A** quality.
                    </p>
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 800 }}>Potential Profit Lift</div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#34d399' }}>+₹{potentialGain} <ArrowUpRight size={20} /></div>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                        <div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 800 }}>Market Rating</div>
                            <div style={{ fontSize: '2rem', fontWeight: 900 }}>{latestBatch.final_grade || 'PND'} <span style={{ fontSize: '1rem', opacity: 0.5 }}>INDEX</span></div>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ background: '#34d399', color: '#064e3b', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <Target size={30} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 950, marginBottom: '0.5rem' }}>Enable Agri-Trader API</h3>
                    <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1.5rem' }}>Automate your price listings on regional markets directly from MaizeScan results.</p>
                    <button className="btn btn-primary" style={{ background: 'white', color: 'var(--primary-dark)', width: '100%' }}>Connect Marketplace</button>
                </div>
            </div>

            {/* Visual Insights Section - Professional Roadmap Tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', height: '240px', overflow: 'hidden', border: '1px solid #6ee7b733' }}>
                    <img
                        src="/images/dashboard_1.png"
                        alt="Agri Tech"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent)', color: 'white' }}>
                        <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#6ee7b7' }}>Real-Time Quality Monitoring</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Live tracking of defect percentages across all active silos.</div>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', height: '240px', overflow: 'hidden', border: '1px solid #6ee7b733' }}>
                    <img
                        src="/images/dashboard_2.png"
                        alt="Field Analysis"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent)', color: 'white' }}>
                        <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#6ee7b7' }}>Certified Standard Audit</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Verification against 90% germination and 12.5% moisture standards.</div>
                    </div>
                </div>
            </div>

            {/* Analytics Dashboard Triple Charts (Roadmap Module 5) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* 1. Daily Performance Bar Chart */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={18} color="var(--primary)" /> Performance Snapshot
                        </h3>
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '0.5rem' }}>REAL-TIME</span>
                    </div>
                    <div style={{ height: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.defect_trend.slice(-10)}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#059669" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="timestamp" hide />
                                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1.25rem', border: 'none', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}
                                    cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                                />
                                <Bar dataKey="defect_rate" fill="url(#barGradient)" radius={[8, 8, 0, 0]} barSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 2. Grade Distribution Pie */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Database size={18} color="var(--primary)" /> Quality Breakdown
                        </h3>
                    </div>
                    <div style={{ height: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.grade_distribution}
                                    innerRadius={65}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationBegin={200}
                                    animationDuration={1500}
                                >
                                    {stats.grade_distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '1.25rem', border: 'none', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 3. Defect Trend Line Time-series */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={18} color="var(--primary)" /> Defect Volatility
                        </h3>
                    </div>
                    <div style={{ height: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.defect_trend}>
                                <defs>
                                    <linearGradient id="colorDefect" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="timestamp" hide />
                                <YAxis fontSize={10} axisLine={false} tickLine={false} unit="%" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1.25rem', border: 'none', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}
                                />
                                <Area type="monotone" dataKey="defect_rate" stroke="#10b981" strokeWidth={5} fill="url(#colorDefect)" dot={{ r: 5, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0, fill: '#059669' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Quality Map Integration */}
            <div style={{ marginBottom: '2rem' }}>
                <QualityMap batches={batches} />
            </div>

            {/* Bottom Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem' }}>Recent Batch Inspections</h3>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>View All <ArrowUpRight size={16} /></button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 700 }}>BATCH ID</th>
                            <th style={{ padding: '1rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 700 }}>DATE</th>
                            <th style={{ padding: '1rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 700 }}>SEEDS</th>
                            <th style={{ padding: '1rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 700 }}>GRADES</th>
                            <th style={{ padding: '1rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 700 }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {batches.slice(0, 5).map((b, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                <td style={{ padding: '1.25rem 1rem', fontWeight: 800 }}>{b.batch_id}</td>
                                <td style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)' }}>{new Date(b.timestamp).toLocaleDateString()}</td>
                                <td style={{ padding: '1.25rem 1rem', fontWeight: 700 }}>{b.total_count}</td>
                                <td style={{ padding: '1.25rem 1rem' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} title="Excellent" />
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} title="Average" />
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1rem' }}>
                                    <span style={{
                                        padding: '0.3rem 0.8rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 800,
                                        background: b.final_grade === 'A' ? 'var(--accent)' : '#fee2e2',
                                        color: b.final_grade === 'A' ? 'var(--primary)' : '#991b1b'
                                    }}>
                                        Grade {b.final_grade} Ready
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
};

const KPICard = ({ icon, label, value, trend, trendUp, sub }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-10px', top: '-10px', color: 'var(--primary)', opacity: 0.05 }}>
            {React.cloneElement(icon, { size: 100 })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '1rem' }}>
                {icon}
            </div>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 700,
                color: trendUp === true ? '#16a34a' : trendUp === false ? '#dc2626' : 'var(--text-light)'
            }}>
                {trendUp === true ? <ArrowUpRight size={16} /> : trendUp === false ? <ArrowDownRight size={16} /> : null}
                {trend}
            </div>
        </div>
        <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem' }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{sub}</div>
        </div>
    </div>
);

export default DashboardPage;
