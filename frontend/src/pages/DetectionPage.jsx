import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Play, Square, Camera, RefreshCw, CheckCircle2, AlertTriangle, FileText, BarChart3, BookOpen, Trash2, ShieldCheck, Zap, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://maizescan-vmi3.onrender.com';

const INITIAL_COUNTS = { Excellent: 0, Good: 0, Average: 0, Bad: 0, Worst: 0 };

const CLASS_CONFIG = {
    Excellent: { color: '#00C853', text: 'white', label: 'Excellent' },
    Good: { color: '#FFD600', text: 'black', label: 'Good' },
    Average: { color: '#FF9100', text: 'white', label: 'Average' },
    Bad: { color: '#D50000', text: 'white', label: 'Bad' },
    Worst: { color: '#000000', text: 'white', label: 'Worst' }
};

const DetectionPage = ({ user }) => {
    const navigate = useNavigate();
    const [isBatchActive, setIsBatchActive] = useState(false);
    const [batchId, setBatchId] = useState(null);
    const [counts, setCounts] = useState(INITIAL_COUNTS);
    const [detections, setDetections] = useState([]);
    const [logs, setLogs] = useState(["[SYS] AGRI-CORE KERNEL LOADED", "[SYS] YOLOv8_INF_SRV READY"]);
    const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
    const [isUsingCamera, setIsUsingCamera] = useState(true);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isBackendDown, setIsBackendDown] = useState(false);

    // Heatmap State
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [heatmapPoints, setHeatmapPoints] = useState([]);

    // UI Refs for scaling
    const containerRef = useRef(null);
    const mediaRef = useRef(null);
    const videoRef = useRef(null);
    const processIntervalRef = useRef(null);

    const totalCount = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);

    useEffect(() => {
        if (isUsingCamera) {
            startCamera();
            if (!processIntervalRef.current) {
                processIntervalRef.current = setInterval(captureAndProcess, 1000);
            }
        }
        return () => stopCamera();
    }, [isUsingCamera]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 1280, height: 720 } });
            if (videoRef.current) videoRef.current.srcObject = stream;
            setIsBackendDown(false);
        } catch (err) {
            console.error("Camera error:", err);
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        }
        if (processIntervalRef.current) {
            clearInterval(processIntervalRef.current);
            processIntervalRef.current = null;
        }
    };

    const startBatch = () => {
        const id = `BATCH-${Math.floor(1000 + Math.random() * 9000)}`;
        setBatchId(id);
        setCounts(INITIAL_COUNTS);
        setHeatmapPoints([]);
        setIsBatchActive(true);
    };

    const endBatch = async () => {
        if (processIntervalRef.current) clearInterval(processIntervalRef.current);
        setIsBatchActive(false);
        try {
            const badWorstSum = counts.Bad + counts.Worst;
            const defectRate = totalCount > 0 ? (badWorstSum / totalCount) * 100 : 0;

            let finalGrade = 'C';
            let recommendation = "Poor quality. High defect rate. Suitable for industrial fuel or animal feed only.";

            if (defectRate < 5) {
                finalGrade = 'A';
                recommendation = "Excellent quality. Suitable for replanting (seed use). High germination potential.";
            } else if (defectRate < 15) {
                finalGrade = 'B';
                recommendation = "Moderate quality. Recommended for commercial sale or milling. Average germination.";
            }

            const percentages = Object.fromEntries(Object.entries(counts).map(([k, v]) => [k.toLowerCase() + '_percentage', totalCount ? (v / totalCount * 100) : 0]));

            await axios.post(`${API_URL}/batches`, {
                batch_id: batchId,
                total_count: totalCount,
                excellent_count: counts.Excellent,
                good_count: counts.Good,
                average_count: counts.Average,
                bad_count: counts.Bad,
                worst_count: counts.Worst,
                ...percentages,
                final_grade: finalGrade,
                recommendation: recommendation
            });
            alert(`Batch Saved Successfully! Final Grade: ${finalGrade}`);
        } catch (err) {
            console.error("Save error:", err);
            setIsBackendDown(true);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUsingCamera(false);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setUploadedImage(ev.target.result);
            processImage(file);
        };
        reader.readAsDataURL(file);
    };

    const captureAndProcess = async () => {
        if (isProcessing || !videoRef.current) return;
        const video = videoRef.current;
        if (video.readyState !== 4) return;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        canvas.toBlob(async (blob) => {
            if (blob) processImage(blob);
        }, 'image/jpeg', 0.8);
    };

    const processImage = async (data) => {
        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', data, 'frame.jpg');
        formData.append('threshold', confidenceThreshold);

        try {
            const res = await axios.post(`${API_URL}/detect`, formData);
            setDetections(res.data);
            setIsBackendDown(false);

            // Update Heatmap Points
            const newPoints = res.data.map(d => ({
                x: (d.box[0] + d.box[2]) / 2,
                y: (d.box[1] + d.box[3]) / 2,
                label: d.label,
                id: Math.random()
            }));

            setHeatmapPoints(prev => {
                const combined = [...prev, ...newPoints];
                return combined.slice(-100); // Keep last 100 points for performance
            });

            if (isBatchActive) {
                const newCounts = { ...counts };
                res.data.forEach(d => { 
                    if (newCounts.hasOwnProperty(d.label)) {
                        newCounts[d.label]++; 
                        // Add to live telemetry log
                        setLogs(prev => [`[DET] ${d.label.toUpperCase()} detected (conf: ${d.confidence.toFixed(2)})`, ...prev.slice(0, 15)]);
                    }
                });
                setCounts(newCounts);
            }
        } catch (err) {
            console.error("Detection Error:", err);
            setIsBackendDown(true);
        } finally {
            setIsProcessing(false);
        }
    };

    // COORDINATE SCALING LOGIC
    const [mediaScale, setMediaScale] = useState({ s: 1, ox: 0, oy: 0, mw: 1, mh: 1 });

    useEffect(() => {
        const updateScaling = () => {
            const media = mediaRef.current;
            if (!media) return;

            const rect = media.getBoundingClientRect();
            const mw = isUsingCamera ? (videoRef.current?.videoWidth || 1) : (media.naturalWidth || 1);
            const mh = isUsingCamera ? (videoRef.current?.videoHeight || 1) : (media.naturalHeight || 1);

            const scale = Math.min(rect.width / mw, rect.height / mh);
            const ox = (rect.width - mw * scale) / 2;
            const oy = (rect.height - mh * scale) / 2;

            setMediaScale({ s: scale, ox, oy, mw, mh });
        };

        const timer = setInterval(updateScaling, 500);
        window.addEventListener('resize', updateScaling);
        return () => {
            clearInterval(timer);
            window.removeEventListener('resize', updateScaling);
        };
    }, [isUsingCamera, uploadedImage]);

    return (
        <div style={{ maxWidth: '1400px', margin: '1.5rem auto', padding: '0 2rem' }}>
            {isBackendDown && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#1e293b', padding: '1rem', borderRadius: '1rem', marginBottom: '1.5rem', fontWeight: 700, textAlign: 'center' }}>
                    ⚠️ ERROR: AI Engine at {API_URL} is unreachable. Ensure the backend server is running.
                </motion.div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>Live <span className="gradient-text">Inspection</span></h1>
                    <p style={{ color: 'var(--text-light)', fontWeight: 600 }}>Batch ID: {isBatchActive ? batchId : 'No Session Active'}</p>
                </motion.div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className="glass-panel btn"
                        style={{
                            padding: '0.6rem 1.2rem',
                            background: showHeatmap ? 'var(--primary)' : 'white',
                            color: showHeatmap ? 'white' : 'var(--text-main)',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <Layers size={18} /> {showHeatmap ? 'HIDE HEATMAP' : 'SHOW HEATMAP'}
                    </button>
                    {!isBackendDown && (
                        <div className="glass-panel" style={{ padding: '0.6rem 1.2rem', color: '#00C853', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 8, height: 8, background: '#00C853', borderRadius: '50%' }} /> AI ENGINE ACTIVE
                        </div>
                    )}
                    <AnimatePresence>
                        {isBatchActive && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-panel" style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#dc2626', fontWeight: 800 }}>
                                <div className="recording-status" /> LIVE RECORDING
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                {/* Main Viewfinder */}
                <div className="glass-panel" ref={containerRef} style={{ position: 'relative', height: '600px', background: '#000', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {isUsingCamera ? (
                        <video ref={(el) => { videoRef.current = el; mediaRef.current = el; }} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        <img ref={mediaRef} src={uploadedImage} alt="Analysis" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    )}

                    {/* HUD OVERLAY ELEMENTS */}
                    <div className="hud-grid" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
                    <div className="hud-scanline" />
                    
                    {/* Telemetry HUD */}
                    <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 20, width: '220px', pointerEvents: 'none' }}>
                        <div className="telemetry-text" style={{ fontSize: '0.65rem', opacity: 0.8, marginBottom: '0.5rem' }}>AGRI-CORE // TELEMETRY FEED</div>
                        <div style={{ height: '150px', overflow: 'hidden', maskImage: 'linear-gradient(to top, transparent, black 20%)' }}>
                            {logs.map((log, i) => (
                                <motion.div key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="telemetry-text">
                                    {log}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', zIndex: 20, textAlign: 'right', pointerEvents: 'none' }}>
                        <div className="telemetry-text" style={{ fontSize: '1.5rem', color: '#00C853' }}>{totalCount} <span style={{ fontSize: '0.7rem' }}>SEEDS</span></div>
                        <div className="telemetry-text" style={{ opacity: 0.6 }}>ACTIVE ANALYSIS MODE</div>
                    </div>

                    {/* Corner Accents for whole screen */}
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', width: '30px', height: '30px', borderTop: '2px solid rgba(255,255,255,0.3)', borderLeft: '2px solid rgba(255,255,255,0.3)' }} />
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: '30px', height: '30px', borderTop: '2px solid rgba(255,255,255,0.3)', borderRight: '2px solid rgba(255,255,255,0.3)' }} />
                    <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', width: '30px', height: '30px', borderBottom: '2px solid rgba(255,255,255,0.3)', borderLeft: '2px solid rgba(255,255,255,0.3)' }} />
                    <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', width: '30px', height: '30px', borderBottom: '2px solid rgba(255,255,255,0.3)', borderRight: '2px solid rgba(255,255,255,0.3)' }} />

                    {/* HEATMAP LAYER */}
                    {showHeatmap && (
                        <div style={{ position: 'absolute', top: mediaScale.oy, left: mediaScale.ox, width: mediaScale.mw * mediaScale.s, height: mediaScale.mh * mediaScale.s, pointerEvents: 'none', zIndex: 5 }}>
                            {heatmapPoints.map((pt, idx) => (
                                <motion.div
                                    key={pt.id}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: [0, 0.6, 0], scale: [0, 1.5, 0.5] }}
                                    transition={{ duration: 2 }}
                                    style={{
                                        position: 'absolute',
                                        left: pt.x * mediaScale.s - 25,
                                        top: pt.y * mediaScale.s - 25,
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                        background: `radial-gradient(circle, ${CLASS_CONFIG[pt.label]?.color || '#fff'} 0%, transparent 70%)`,
                                        filter: 'blur(8px)'
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* OVERLAY BOXES */}
                    <div style={{ position: 'absolute', top: mediaScale.oy, left: mediaScale.ox, width: mediaScale.mw * mediaScale.s, height: mediaScale.mh * mediaScale.s, pointerEvents: 'none' }}>
                        {detections.map((det, i) => {
                            const config = CLASS_CONFIG[det.label] || { color: '#ffffff', text: 'black', label: det.label };
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        boxShadow: [`0 0 10px ${config.color}44`, `0 0 25px ${config.color}88`, `0 0 10px ${config.color}44`]
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="detection-box"
                                    style={{
                                        border: `2.5px solid ${config.color}`,
                                        left: mediaScale.s * det.box[0],
                                        top: mediaScale.s * det.box[1],
                                        width: mediaScale.s * (det.box[2] - det.box[0]),
                                        height: mediaScale.s * (det.box[3] - det.box[1]),
                                        borderRadius: '0.5rem',
                                        zIndex: 10
                                    }}
                                >
                                    <div style={{
                                        background: config.color,
                                        color: config.text,
                                        padding: '4px 10px',
                                        fontSize: '0.7rem',
                                        fontWeight: 950,
                                        borderRadius: '4px',
                                        position: 'absolute',
                                        top: '-24px',
                                        left: '-2.5px',
                                        whiteSpace: 'nowrap',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                                    }}>
                                        {config.label.toUpperCase()} · {Math.round(det.confidence * 100)}%
                                    </div>
                                    {/* Corner Accents */}
                                    <div style={{ position: 'absolute', top: -5, left: -5, width: 10, height: 10, borderLeft: '4px solid white', borderTop: '4px solid white' }} />
                                    <div style={{ position: 'absolute', bottom: -5, right: -5, width: 10, height: 10, borderRight: '4px solid white', borderBottom: '4px solid white' }} />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Session Metrics</h3>
                        {Object.entries(CLASS_CONFIG).map(([key, config]) => (
                            <div key={key} style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                                    <span>{key}</span>
                                    <span>{counts[key]}</span>
                                </div>
                                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '10px' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: totalCount ? `${(counts[key] / totalCount) * 100}%` : 0 }}
                                        style={{ height: '100%', background: config.color, borderRadius: '10px' }}
                                    />
                                </div>
                            </div>
                        ))}
                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dotted #cbd5e1' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 800, color: 'var(--text-light)' }}>Total Detected</span>
                                <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{totalCount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '1.2rem' }}>AI Sensitivity</h3>
                        <input
                            type="range" min="0.1" max="0.95" step="0.05"
                            value={confidenceThreshold}
                            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--primary)', marginBottom: '0.5rem' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800 }}>
                            <span>Speed</span>
                            <span style={{ color: 'var(--primary)' }}>{Math.round(confidenceThreshold * 100)}% Match</span>
                            <span>Precision</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Controls Strip */}
            <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {!isBatchActive ? (
                        <button className="btn btn-primary" onClick={startBatch}><Play size={18} /> Start Session</button>
                    ) : (
                        <button className="btn" style={{ background: '#dc2626', color: 'white' }} onClick={endBatch}><Square size={18} /> End & Save</button>
                    )}
                    <button className="btn btn-secondary" onClick={() => { setCounts(INITIAL_COUNTS); setDetections([]); setHeatmapPoints([]); }}><Trash2 size={18} /> Reset</button>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                        <Camera size={18} /> Upload Image
                        <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                    </label>
                    <button className="btn btn-secondary" onClick={() => { setIsUsingCamera(true); setUploadedImage(null); }}><RefreshCw size={18} /> Switch to Live</button>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => navigate('/reports')}><FileText size={18} /> History</button>
                    <button className="btn btn-secondary" onClick={() => navigate('/guide')}><BookOpen size={18} /> Farmer Guide</button>
                </div>
            </div>
        </div>
    );
};

export default DetectionPage;
