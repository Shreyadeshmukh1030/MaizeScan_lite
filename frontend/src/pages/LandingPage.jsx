import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Scan, ArrowRight, CheckCircle2, ShieldCheck, Zap,
    BarChart3, Users, Leaf, Cpu, HelpCircle, ChevronDown,
    AlertTriangle, PlayCircle
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ background: 'var(--background)', overflowX: 'hidden' }}>
            {/* 1. HERO SECTION */}
            <section style={{
                position: 'relative', paddingTop: '10rem', paddingBottom: '8rem', minHeight: '80vh', display: 'flex', alignItems: 'center',
                background: 'linear-gradient(rgba(5, 31, 32, 0.45), rgba(5, 31, 32, 0.75)), url("/images/landing_hero.png")',
                backgroundSize: 'cover', backgroundPosition: 'center', color: 'white'
            }}>
                <div className="container" style={{ zIndex: 2 }}>
                    <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            <div className="section-tag" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', marginBottom: '1.5rem', backdropFilter: 'blur(5px)' }}>
                                Artificial Intelligence // Agriculture
                            </div>
                            <h1 style={{ color: 'white', fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
                                Precision Maize Quality <br /> 
                                <span style={{ color: 'var(--primary-light)' }}>Automated at Scale.</span>
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem', marginBottom: '2.5rem', fontWeight: 500, maxWidth: '700px', margin: '0 auto 2.5rem' }}>
                                Detect defects and grade batches instantly with high-performance YOLOv8 computer vision.
                                The definitive industrial tool for professional seed quality management.
                            </p>
                            
                            <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', alignItems: 'center' }}>
                                <button onClick={() => navigate('/detect')} className="btn btn-primary" style={{ padding: '1rem 2.5rem', background: '#52b788', borderRadius: '0.75rem' }}>
                                    Start Detection <ArrowRight size={18} />
                                </button>
                                <button className="btn btn-outline" style={{ padding: '1rem 2.5rem', borderRadius: '0.75rem' }}>
                                    <PlayCircle size={18} /> Watch Demo
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 2. METRICS SECTION (Card Grid) */}
            <section style={{ marginTop: '-4rem', position: 'relative', zIndex: 10 }}>
                <div className="container">
                    <div className="metrics-grid">
                        <MetricCard val="10K+" label="Seeds Analyzed" desc="Real-time precision counts." icon={<Scan size={20} />} />
                        <MetricCard val="98.4%" label="Inference Accuracy" desc="Validated AI core." icon={<ShieldCheck size={20} />} />
                        <MetricCard val="150ms" label="Response Time" desc="Ultra-fast edge compute." icon={<Zap size={20} />} />
                        <MetricCard val="2K+" label="Global Partners" desc="Trusted by agri-networks." icon={<Users size={20} />} />
                    </div>
                </div>
            </section>

            {/* 3. PROBLEM VS SOLUTION SECTION */}
            <section style={{ padding: '8rem 0', background: 'white' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ color: 'var(--primary-dark)' }}>Eradicating <span style={{ color: 'var(--primary)' }}>Human Error</span></h2>
                        <p style={{ maxWidth: '700px', margin: '0 auto' }}>Manual inspection is slow and inconsistent. MaizeScan brings industrial-grade precision to your fingertips.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem' }}>
                        <div style={{ padding: '3rem', background: '#fef2f2', borderRadius: '1.5rem', border: '1px solid #fee2e2' }}>
                            <h3 style={{ color: '#991b1b', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><AlertTriangle size={24} /> Manual Struggle</h3>
                            <BenefitItem icon={<XCircleRed />} title="Time Consuming" desc="Hours spent manually checking grains one by one." />
                            <BenefitItem icon={<XCircleRed />} title="Inconsistent Grading" desc="Fatigue leads to errors and poor quality batches." />
                            <BenefitItem icon={<XCircleRed />} title="Subjective Data" desc="No verifiable metrics or historical logs." />
                        </div>

                        <div style={{ padding: '3rem', background: '#f0fdf4', borderRadius: '1.5rem', border: '1px solid #dcfce7' }}>
                            <h3 style={{ color: 'var(--primary)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><ShieldCheck size={24} /> MaizeScan Edge</h3>
                            <BenefitItem icon={<CheckCircleGreen />} title="Rapid Analysis" desc="Detect hundreds of seeds in under a second." />
                            <BenefitItem icon={<CheckCircleGreen />} title="Objective Metrics" desc="Precision scoring based on mathematical vision." />
                            <BenefitItem icon={<CheckCircleGreen />} title="Audit Trail" desc="Automatic history and CSV report generation." />
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. TECHNOLOGY SECTION */}
            <section style={{ padding: '8rem 0', background: '#fafafa' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '5rem', alignItems: 'center' }}>
                        <div>
                            <div className="section-tag">Deep Learning Engine</div>
                            <h2>Powered by <span style={{ color: 'var(--primary)' }}>YOLOv8</span> Core</h2>
                            <p style={{ margin: '1.5rem 0 2.5rem' }}>
                                Our proprietary training pipeline optimizes the state-of-the-art YOLOv8 model specifically for small-object agricultural detection.
                                We handle occlusions and extreme density with precision mAP of over 0.85.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <TechFeature icon={<Zap size={20} />} title="RT-Inference" desc="Real-time processing." />
                                <TechFeature icon={<Cpu size={20} />} title="GPU Accelerated" desc="Optimized compute." />
                                <TechFeature icon={<BarChart3 size={20} />} title="Class Logic" desc="Math-based grading." />
                                <TechFeature icon={<ShieldCheck size={20} />} title="Strict Quality" desc="Visual HUD standards." />
                            </div>
                        </div>
                        <div style={{ background: '#051F20', padding: '1rem', borderRadius: '2rem', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }}>
                             <img src="/images/landing_hero.png" alt="Tech" style={{ width: '100%', borderRadius: '1.5rem', opacity: 0.8 }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. CALL TO ACTION */}
            <section style={{ padding: '8rem 0' }}>
                <div className="container">
                    <div style={{
                        padding: '6rem 3rem', textAlign: 'center',
                        background: 'var(--primary-dark)',
                        color: 'white', borderRadius: '2rem',
                        boxShadow: '0 40px 100px -20px rgba(5, 31, 32, 0.4)'
                    }}>
                        <h2 style={{ color: 'white', fontSize: '3rem' }}>Start Smart Inspection Today</h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '1.5rem auto 3rem' }}>
                            Join the network of thousands of farmers and labs optimizing their agricultural ecosystem with MaizeScan AI.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => navigate('/register')} className="btn" style={{ background: 'white', color: 'var(--primary-dark)' }}>Create Free Account</button>
                            <button onClick={() => navigate('/detect')} className="btn btn-outline">Launch Live Demo</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '6rem 0', background: 'white', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img src="/images/logo.png" alt="Logo" style={{ height: '32px' }} />
                            <span style={{ fontSize: '1.25rem', fontWeight: 950, color: 'var(--primary-dark)' }}>MaizeScan</span>
                        </div>
                        <div style={{ display: 'flex', gap: '2rem', fontWeight: 700, fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--text-light)' }}>Privacy Policy</span>
                            <span style={{ color: 'var(--text-light)' }}>Terms of Service</span>
                            <span style={{ color: 'var(--text-light)' }}>Contact</span>
                        </div>
                        <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>© 2024 MaizeScan AI Core.</div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const MetricCard = ({ val, label, desc, icon }) => (
    <div className="metric-card">
        <div style={{ background: 'var(--accent)', color: 'var(--primary)', width: '45px', height: '45px', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            {icon}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 950, color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>{val}</div>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{label}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: 1.4 }}>{desc}</div>
    </div>
);

const BenefitItem = ({ icon, title, desc }) => (
    <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ marginTop: '0.25rem' }}>{icon}</div>
        <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--primary-dark)' }}>{title}</div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>{desc}</div>
        </div>
    </div>
);

const TechFeature = ({ icon, title, desc }) => (
    <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ height: 'max-content', background: 'white', padding: '0.75rem', borderRadius: '1rem', color: 'var(--primary)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>{icon}</div>
        <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-dark)' }}>{title}</div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>{desc}</div>
        </div>
    </div>
);

const XCircleRed = () => <div style={{ background: '#ef4444', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={12} color="white" /></div>;
const CheckCircleGreen = () => <div style={{ background: '#22c55e', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={12} color="white" /></div>;

export default LandingPage;

