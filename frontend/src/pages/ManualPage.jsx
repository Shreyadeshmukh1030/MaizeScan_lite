import React, { useState } from 'react';
import { BookOpen, Zap, FileText, Camera, Layout, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManualPage = () => {
    const [activeTab, setActiveTab] = useState('Manual');

    const tabs = [
        { id: 'Manual', label: "Operating Manual", icon: <BookOpen size={18} /> },
        { id: 'Architecture', label: "System Pipeline", icon: <Zap size={18} /> },
        { id: 'Dataset', label: "Dataset & Purpose", icon: <FileText size={18} /> },
    ];

    return (
        <div style={{ maxWidth: '1300px', margin: '3rem auto', padding: '0 2rem' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: '1rem' }}>
                        System <span className="gradient-text">Manual & Documentation</span>
                    </h1>
                    <p style={{ color: 'var(--text-light)', fontSize: '1.2rem', maxWidth: '700px', fontWeight: 600 }}>
                        Learn how to operate MaizeScan, understand the system architecture, and view the training dataset.
                    </p>
                </motion.div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '1.25rem 2.5rem', borderRadius: '1.5rem',
                            background: activeTab === tab.id ? 'var(--primary)' : 'white',
                            color: activeTab === tab.id ? 'white' : 'var(--text-main)',
                            border: '1px solid #f1f5f9', fontWeight: 800,
                            cursor: 'pointer', transition: '0.4s', boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'Manual' && (
                        <div className="glass-panel" style={{ padding: '3rem' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem' }}>How to Operate MaizeScan</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>1. Start an Inspection</h3>
                                    <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Navigate to the Live Inspection page. Grant camera permissions or upload an image directly from your device. The AI engine automatically detects and draws bounding boxes around maize seeds in real-time.</p>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>2. AI Sensitivity Slider</h3>
                                    <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Use the sensitivity slider on the right panel to adjust the confidence threshold. If the lighting is poor and seeds are not being detected, lower the sensitivity to ~20%. If false positives appear, increase the sensitivity.</p>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>3. Understanding Telemetry</h3>
                                    <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginTop: '0.5rem' }}>The left panel provides real-time analytics. It calculates the overall batch grade (A, B, C) based on the ratio of excellent/good seeds versus bad/shriveled/moldy seeds.</p>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>4. Digital Certificates</h3>
                                    <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Once an inspection is completed, it is saved to the database. Navigate to the Reports page to view the history and generate a Digital Quality Certificate for any batch.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Architecture' && (
                        <div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', textAlign: 'center' }}>System Pipeline & Architecture</h2>
                            <div className="glass-panel" style={{ padding: '3rem', background: 'var(--card-bg)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
                                    <div>
                                        <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1rem' }}><Camera size={32} color="#0369a1" style={{ margin: '0 auto' }} /></div>
                                        <div style={{ fontWeight: 800 }}>1. Capture</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>WebRTC / Upload</div>
                                    </div>
                                    <ArrowRight size={24} color="var(--text-light)" style={{ margin: '0 auto' }} />
                                    <div>
                                        <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1rem' }}><Layout size={32} color="#e11d48" style={{ margin: '0 auto' }} /></div>
                                        <div style={{ fontWeight: 800 }}>2. Preprocess</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Resize 640x640</div>
                                    </div>
                                    <ArrowRight size={24} color="var(--text-light)" style={{ margin: '0 auto' }} />
                                    <div>
                                        <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1rem' }}><Zap size={32} color="#059669" style={{ margin: '0 auto' }} /></div>
                                        <div style={{ fontWeight: 800 }}>3. Inference</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>YOLOv8 ONNX (FastAPI)</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '3rem', color: 'var(--text-light)', lineHeight: '1.8' }}>
                                    <p><strong>Image Capture:</strong> The React frontend uses WebRTC to capture frames from the webcam or reads uploaded files.</p>
                                    <p><strong>Preprocessing:</strong> Images are resized to 640x640 resolution to match the YOLOv8 input tensor requirements.</p>
                                    <p><strong>Inference:</strong> The FastAPI backend loads the lightweight <code>seed_model.onnx</code>. It runs inference, applying Non-Maximum Suppression (NMS) to filter overlapping bounding boxes.</p>
                                    <p><strong>Rendering:</strong> Bounding boxes and class confidences are sent back to the React UI, which draws them on a canvas overlaying the video feed.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Dataset' && (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Dataset & Purpose</h2>
                                <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto' }}>
                                    MaizeScan was built to solve the inconsistencies in manual grain grading. By standardizing the assessment of maize quality using computer vision, farmers and distributors can guarantee fair pricing and avoid health hazards like Aflatoxin.
                                </p>
                            </div>
                            
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '2rem 0 1rem 0' }}>Dataset Overview</h3>
                            <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
                                The model was trained on thousands of annotated images categorized into 5 quality classes. Below are real samples from the original dataset used to train the MaizeScan AI:
                            </p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                                <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                                    <img src="/images/dataset_samples/Excellent (1).JPG" alt="Excellent" style={{ width: '100%', borderRadius: '1rem', height: '150px', objectFit: 'cover' }} />
                                    <div style={{ fontWeight: 800, marginTop: '1rem', color: '#059669' }}>Excellent</div>
                                </div>
                                <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                                    <img src="/images/dataset_samples/Good (1).JPG" alt="Good" style={{ width: '100%', borderRadius: '1rem', height: '150px', objectFit: 'cover' }} />
                                    <div style={{ fontWeight: 800, marginTop: '1rem', color: '#0ea5e9' }}>Good</div>
                                </div>
                                <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                                    <img src="/images/dataset_samples/Average (79).JPG" alt="Average" style={{ width: '100%', borderRadius: '1rem', height: '150px', objectFit: 'cover' }} />
                                    <div style={{ fontWeight: 800, marginTop: '1rem', color: '#eab308' }}>Average</div>
                                </div>
                                <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                                    <img src="/images/dataset_samples/Bad (40).JPG" alt="Bad" style={{ width: '100%', borderRadius: '1rem', height: '150px', objectFit: 'cover' }} />
                                    <div style={{ fontWeight: 800, marginTop: '1rem', color: '#f97316' }}>Bad</div>
                                </div>
                                <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                                    <img src="/images/dataset_samples/Worst (26).JPG" alt="Worst" style={{ width: '100%', borderRadius: '1rem', height: '150px', objectFit: 'cover' }} />
                                    <div style={{ fontWeight: 800, marginTop: '1rem', color: '#ef4444' }}>Worst</div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default ManualPage;
