import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Play, Square, Camera, RefreshCw, CheckCircle2, AlertTriangle, FileText, BarChart3, BookOpen, Trash2, ShieldCheck, Zap, Layers, X, Award, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://maizescan-vmi3.onrender.com';

const INITIAL_COUNTS = { Excellent: 0, Good: 0, Average: 0, Bad: 0, Worst: 0 };

const CLASS_CONFIG = {
    Excellent: { color: '#00C853', text: 'white', label: 'Excellent' },
    Good:      { color: '#FFD600', text: 'black',  label: 'Good' },
    Average:   { color: '#FF9100', text: 'white',  label: 'Average' },
    Bad:       { color: '#D50000', text: 'white',  label: 'Bad' },
    Worst:     { color: '#000000', text: 'white',  label: 'Worst' }
};

// AI Processing Step Animation Component
const AiProcessingOverlay = ({ steps, visible }) => (
    <AnimatePresence>
        {visible && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    zIndex: 30, borderRadius: '1rem', gap: '0.75rem'
                }}
            >
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#00C853', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                    ⚡ MAIZESCAN AI ENGINE
                </div>
                {steps.map((step, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: step.done ? 1 : 0.5, x: 0 }}
                        transition={{ delay: i * 0.3 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem' }}
                    >
                        {step.done
                            ? <span style={{ color: '#00C853' }}>✓</span>
                            : <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} style={{ color: '#FFD600' }}>◆</motion.span>
                        }
                        <span style={{ color: step.done ? '#00C853' : 'rgba(255,255,255,0.7)' }}>{step.label}</span>
                    </motion.div>
                ))}
            </motion.div>
        )}
    </AnimatePresence>
);

// End Session Summary Modal
const EndSessionModal = ({ batchId, counts, totalCount, grade, recommendation, onSave, onCancel }) => {
    const gradeColors = { A: '#00C853', B: '#FFD600', C: '#D50000' };
    const qualityPct = totalCount > 0 ? (((counts.Excellent + counts.Good) / totalCount) * 100).toFixed(1) : 0;
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999, padding: '2rem'
            }}
        >
            <motion.div
                initial={{ scale: 0.85, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                style={{
                    background: 'white', borderRadius: '2rem', padding: '3rem',
                    maxWidth: '520px', width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.25)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <CheckCircle2 size={48} color="#00C853" style={{ margin: '0 auto 1rem' }} />
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem' }}>Inspection Complete</h2>
                    <div style={{ color: 'var(--text-light)', fontWeight: 700 }}>Batch ID: {batchId}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
                    {Object.entries(counts).map(([key, val]) => (
                        <div key={key} style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 700, color: CLASS_CONFIG[key]?.color }}>{key}</span>
                            <span style={{ fontWeight: 900 }}>{val}</span>
                        </div>
                    ))}
                    <div style={{ background: '#f0fdf4', padding: '0.75rem 1rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', gridColumn: '1 / -1' }}>
                        <span style={{ fontWeight: 700 }}>Total Seeds</span>
                        <span style={{ fontWeight: 900, fontSize: '1.2rem' }}>{totalCount}</span>
                    </div>
                </div>

                <div style={{ textAlign: 'center', padding: '1.5rem', background: '#f8fafc', borderRadius: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: '0.5rem' }}>OVERALL QUALITY</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: gradeColors[grade] }}>{qualityPct}%</div>
                    <div style={{ display: 'inline-block', background: gradeColors[grade], color: 'white', padding: '0.4rem 1.5rem', borderRadius: '2rem', fontWeight: 900, fontSize: '1.1rem', marginTop: '0.5rem' }}>
                        GRADE {grade}
                    </div>
                    <div style={{ marginTop: '1rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>{recommendation}</div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={onCancel} style={{ flex: 1, padding: '1rem', border: '2px solid #e2e8f0', borderRadius: '0.75rem', background: 'white', fontWeight: 700, cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button onClick={onSave} className="btn btn-primary" style={{ flex: 2, padding: '1rem', borderRadius: '0.75rem' }}>
                        <Award size={18} /> Save Batch & View Report
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
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
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [heatmapPoints, setHeatmapPoints] = useState([]);

    // Phase 1 new state
    const [aiSteps, setAiSteps] = useState([]);
    const [showAiOverlay, setShowAiOverlay] = useState(false);
    const [sessionImages, setSessionImages] = useState([]); // [{thumb, count, detections}]
    const [showEndModal, setShowEndModal] = useState(false);
    const [pendingGrade, setPendingGrade] = useState({ grade: 'A', recommendation: '' });

    const containerRef = useRef(null);
    const mediaRef = useRef(null);
    const videoRef = useRef(null);
    const processIntervalRef = useRef(null);

    const totalCount = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);

    const qualityPct = useMemo(() => {
        if (totalCount === 0) return 0;
        return (((counts.Excellent + counts.Good) / totalCount) * 100).toFixed(1);
    }, [counts, totalCount]);

    const defectRate = useMemo(() => {
        if (totalCount === 0) return 0;
        return ((counts.Bad + counts.Worst) / totalCount) * 100;
    }, [counts, totalCount]);

    const currentGrade = useMemo(() => {
        if (defectRate < 5) return 'A';
        if (defectRate < 15) return 'B';
        return 'C';
    }, [defectRate]);

    const gradeColors = { A: '#00C853', B: '#FFD600', C: '#D50000' };

    const whyGrade = useMemo(() => {
        const goodPct = totalCount > 0 ? ((counts.Excellent + counts.Good) / totalCount * 100).toFixed(1) : 0;
        const defPct = totalCount > 0 ? ((counts.Bad + counts.Worst) / totalCount * 100).toFixed(1) : 0;
        if (currentGrade === 'A') return [
            `✓ ${goodPct}% Excellent + Good seeds`,
            `✓ Only ${defPct}% defective seeds`,
            `✓ Low proportion of worst-grade seeds`,
            `✓ Meets MaizeScan Grade A criteria`
        ];
        if (currentGrade === 'B') return [
            `⚠ ${goodPct}% Excellent + Good seeds`,
            `⚠ ${defPct}% defective seeds detected`,
            `⚠ Moderate defect rate (5-15%)`,
            `⚠ Review before commercial use`
        ];
        return [
            `✗ Only ${goodPct}% Excellent + Good seeds`,
            `✗ ${defPct}% defective seeds — too high`,
            `✗ Exceeds Grade B defect threshold (>15%)`,
            `✗ Recommended for animal feed only`
        ];
    }, [counts, totalCount, currentGrade]);

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
        } catch (err) { console.error("Camera error:", err); }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        if (processIntervalRef.current) { clearInterval(processIntervalRef.current); processIntervalRef.current = null; }
    };

    const startBatch = () => {
        const id = `BATCH-${Math.floor(1000 + Math.random() * 9000)}`;
        setBatchId(id);
        setCounts(INITIAL_COUNTS);
        setHeatmapPoints([]);
        setSessionImages([]);
        setIsBatchActive(true);
    };

    const endBatch = () => {
        if (processIntervalRef.current) clearInterval(processIntervalRef.current);
        const badWorstSum = counts.Bad + counts.Worst;
        const dr = totalCount > 0 ? (badWorstSum / totalCount) * 100 : 0;
        let grade = 'C';
        let rec = "Poor quality. High defect rate. Suitable for industrial fuel or animal feed only.";
        if (dr < 5) { grade = 'A'; rec = "Excellent quality. Suitable for replanting (seed use). High germination potential."; }
        else if (dr < 15) { grade = 'B'; rec = "Moderate quality. Recommended for commercial sale or milling. Average germination."; }
        setPendingGrade({ grade, recommendation: rec });
        setShowEndModal(true);
    };

    const confirmSave = async () => {
        setShowEndModal(false);
        setIsBatchActive(false);
        try {
            const percentages = Object.fromEntries(Object.entries(counts).map(([k, v]) => [k.toLowerCase() + '_percentage', totalCount ? (v / totalCount * 100) : 0]));
            await axios.post(`${API_URL}/batches`, {
                batch_id: batchId, total_count: totalCount,
                excellent_count: counts.Excellent, good_count: counts.Good,
                average_count: counts.Average, bad_count: counts.Bad, worst_count: counts.Worst,
                ...percentages, final_grade: pendingGrade.grade, recommendation: pendingGrade.recommendation
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            navigate('/reports');
        } catch (err) { console.error("Save error:", err); setIsBackendDown(true); }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUsingCamera(false);
        const reader = new FileReader();
        reader.onload = (ev) => { setUploadedImage(ev.target.result); processImage(file, ev.target.result); };
        reader.readAsDataURL(file);
    };

    const captureAndProcess = async () => {
        if (isProcessing || !videoRef.current) return;
        const video = videoRef.current;
        if (video.readyState !== 4) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        canvas.toBlob(async (blob) => { if (blob) processImage(blob, null); }, 'image/jpeg', 0.8);
    };

    const runAiAnimation = async () => {
        const steps = [
            { label: 'Image received & validated', done: false },
            { label: 'Preprocessing → 640×640 resize', done: false },
            { label: 'YOLOv8 ONNX inference running...', done: false },
            { label: 'Applying Non-Maximum Suppression', done: false },
            { label: 'Classification complete', done: false },
        ];
        setAiSteps(steps);
        setShowAiOverlay(true);
        for (let i = 0; i < steps.length; i++) {
            await new Promise(r => setTimeout(r, 350));
            setAiSteps(prev => prev.map((s, idx) => idx === i ? { ...s, done: true } : s));
        }
        await new Promise(r => setTimeout(r, 400));
        setShowAiOverlay(false);
    };

    const processImage = async (data, thumbSrc) => {
        setIsProcessing(true);
        if (!isUsingCamera) runAiAnimation();
        const formData = new FormData();
        formData.append('file', data, 'frame.jpg');
        formData.append('threshold', confidenceThreshold);
        try {
            const res = await axios.post(`${API_URL}/detect`, formData);
            setDetections(res.data);
            setIsBackendDown(false);
            const newPoints = res.data.map(d => ({ x: (d.box[0] + d.box[2]) / 2, y: (d.box[1] + d.box[3]) / 2, label: d.label, id: Math.random() }));
            setHeatmapPoints(prev => [...prev, ...newPoints].slice(-100));
            if (isBatchActive) {
                const newCounts = { ...counts };
                res.data.forEach(d => { if (newCounts.hasOwnProperty(d.label)) { newCounts[d.label]++; setLogs(prev => [`[DET] ${d.label.toUpperCase()} detected (conf: ${d.confidence.toFixed(2)})`, ...prev.slice(0, 15)]); } });
                setCounts(newCounts);
                if (thumbSrc) {
                    setSessionImages(prev => [...prev, { thumb: thumbSrc, count: res.data.length, detections: res.data }]);
                }
            }
        } catch (err) { console.error("Detection Error:", err); setIsBackendDown(true); }
        finally { setIsProcessing(false); }
    };

    const loadSampleImage = async (imagePath) => {
        setIsUsingCamera(false);
        setUploadedImage(imagePath);
        try {
            const response = await fetch(imagePath);
            const blob = await response.blob();
            processImage(blob, imagePath);
        } catch (err) { console.error("Error loading sample image", err); }
    };

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
        return () => { clearInterval(timer); window.removeEventListener('resize', updateScaling); };
    }, [isUsingCamera, uploadedImage]);

    return (
        <div style={{ maxWidth: '1400px', margin: '1.5rem auto', padding: '0 2rem' }}>
            {/* End Session Modal */}
            <AnimatePresence>
                {showEndModal && (
                    <EndSessionModal
                        batchId={batchId}
                        counts={counts}
                        totalCount={totalCount}
                        grade={pendingGrade.grade}
                        recommendation={pendingGrade.recommendation}
                        onSave={confirmSave}
                        onCancel={() => setShowEndModal(false)}
                    />
                )}
            </AnimatePresence>

            {/* Latency Warning Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'linear-gradient(90deg, #fef3c7, #fffbeb)',
                    border: '1px solid #f59e0b', borderRadius: '0.75rem',
                    padding: '0.6rem 1.25rem', marginBottom: '1rem',
                    display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: 700
                }}
            >
                <Info size={16} color="#d97706" />
                <span style={{ color: '#92400e' }}>
                    ⏱ First detection may take <strong>30–60 seconds</strong> due to Render free-tier cold start. Subsequent detections are fast.
                </span>
            </motion.div>

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
                    <button onClick={() => setShowHeatmap(!showHeatmap)} className="glass-panel btn" style={{ padding: '0.6rem 1.2rem', background: showHeatmap ? 'var(--primary)' : 'white', color: showHeatmap ? 'white' : 'var(--text-main)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer' }}>
                        <Layers size={18} /> {showHeatmap ? 'HIDE HEATMAP' : 'SHOW HEATMAP'}
                    </button>
                    {!isBackendDown && (
                        <div className="glass-panel" style={{ padding: '0.6rem 1.2rem', color: '#00C853', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} style={{ width: 8, height: 8, background: '#00C853', borderRadius: '50%' }} /> AI ENGINE ACTIVE
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
                <div className="glass-panel" ref={containerRef} style={{ position: 'relative', height: '550px', background: '#000', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {isUsingCamera ? (
                        <video ref={(el) => { videoRef.current = el; mediaRef.current = el; }} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        <img ref={mediaRef} src={uploadedImage} alt="Analysis" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    )}

                    {/* AI Processing Overlay */}
                    <AiProcessingOverlay steps={aiSteps} visible={showAiOverlay} />

                    {/* HUD Elements */}
                    <div className="hud-grid" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
                    <div className="hud-scanline" />
                    <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 20, width: '220px', pointerEvents: 'none' }}>
                        <div className="telemetry-text" style={{ fontSize: '0.65rem', opacity: 0.8, marginBottom: '0.5rem' }}>AGRI-CORE // TELEMETRY FEED</div>
                        <div style={{ height: '150px', overflow: 'hidden', maskImage: 'linear-gradient(to top, transparent, black 20%)' }}>
                            {logs.map((log, i) => (
                                <motion.div key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="telemetry-text">{log}</motion.div>
                            ))}
                        </div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', zIndex: 20, textAlign: 'right', pointerEvents: 'none' }}>
                        <div className="telemetry-text" style={{ fontSize: '1.5rem', color: '#00C853' }}>{totalCount} <span style={{ fontSize: '0.7rem' }}>SEEDS</span></div>
                        <div className="telemetry-text" style={{ opacity: 0.6 }}>ACTIVE ANALYSIS MODE</div>
                    </div>
                    {/* Corner Accents */}
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', width: '30px', height: '30px', borderTop: '2px solid rgba(255,255,255,0.3)', borderLeft: '2px solid rgba(255,255,255,0.3)' }} />
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: '30px', height: '30px', borderTop: '2px solid rgba(255,255,255,0.3)', borderRight: '2px solid rgba(255,255,255,0.3)' }} />
                    <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', width: '30px', height: '30px', borderBottom: '2px solid rgba(255,255,255,0.3)', borderLeft: '2px solid rgba(255,255,255,0.3)' }} />
                    <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', width: '30px', height: '30px', borderBottom: '2px solid rgba(255,255,255,0.3)', borderRight: '2px solid rgba(255,255,255,0.3)' }} />

                    {/* Heatmap Layer */}
                    {showHeatmap && (
                        <div style={{ position: 'absolute', top: mediaScale.oy, left: mediaScale.ox, width: mediaScale.mw * mediaScale.s, height: mediaScale.mh * mediaScale.s, pointerEvents: 'none', zIndex: 5 }}>
                            {heatmapPoints.map((pt, idx) => (
                                <motion.div key={pt.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 0.6, 0], scale: [0, 1.5, 0.5] }} transition={{ duration: 2 }}
                                    style={{ position: 'absolute', left: pt.x * mediaScale.s - 25, top: pt.y * mediaScale.s - 25, width: 50, height: 50, borderRadius: '50%', background: `radial-gradient(circle, ${CLASS_CONFIG[pt.label]?.color || '#fff'} 0%, transparent 70%)`, filter: 'blur(8px)' }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Detection Boxes */}
                    <div style={{ position: 'absolute', top: mediaScale.oy, left: mediaScale.ox, width: mediaScale.mw * mediaScale.s, height: mediaScale.mh * mediaScale.s, pointerEvents: 'none' }}>
                        {detections.map((det, i) => {
                            const config = CLASS_CONFIG[det.label] || { color: '#ffffff', text: 'black', label: det.label };
                            return (
                                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1, boxShadow: [`0 0 10px ${config.color}44`, `0 0 25px ${config.color}88`, `0 0 10px ${config.color}44`] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="detection-box"
                                    style={{ border: `2.5px solid ${config.color}`, left: mediaScale.s * det.box[0], top: mediaScale.s * det.box[1], width: mediaScale.s * (det.box[2] - det.box[0]), height: mediaScale.s * (det.box[3] - det.box[1]), borderRadius: '0.5rem', zIndex: 10 }}
                                >
                                    <div style={{ background: config.color, color: config.text, padding: '4px 10px', fontSize: '0.7rem', fontWeight: 950, borderRadius: '4px', position: 'absolute', top: '-24px', left: '-2.5px', whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                                        {config.label.toUpperCase()} · {Math.round(det.confidence * 100)}%
                                    </div>
                                    <div style={{ position: 'absolute', top: -5, left: -5, width: 10, height: 10, borderLeft: '4px solid white', borderTop: '4px solid white' }} />
                                    <div style={{ position: 'absolute', bottom: -5, right: -5, width: 10, height: 10, borderRight: '4px solid white', borderBottom: '4px solid white' }} />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Session Metrics with Progress Bars */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Session Quality</h3>
                        {Object.entries(CLASS_CONFIG).map(([key, config]) => {
                            const pct = totalCount ? ((counts[key] / totalCount) * 100).toFixed(1) : 0;
                            return (
                                <div key={key} style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                                        <span style={{ color: config.color }}>{key}</span>
                                        <span>{counts[key]} <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>({pct}%)</span></span>
                                    </div>
                                    <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '10px' }}>
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} style={{ height: '100%', background: config.color, borderRadius: '10px' }} />
                                    </div>
                                </div>
                            );
                        })}
                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dotted #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, color: 'var(--text-light)' }}>Total Detected</span>
                            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{totalCount}</span>
                        </div>
                    </div>

                    {/* AI Sensitivity */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '1.2rem' }}>AI Sensitivity</h3>
                        <input type="range" min="0.1" max="0.95" step="0.05" value={confidenceThreshold} onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)', marginBottom: '0.5rem' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800 }}>
                            <span>Speed</span>
                            <span style={{ color: 'var(--primary)' }}>{Math.round(confidenceThreshold * 100)}% Match</span>
                            <span>Precision</span>
                        </div>
                    </div>

                    {/* Why This Grade Card */}
                    {totalCount > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${gradeColors[currentGrade]}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>Why Grade {currentGrade}?</h3>
                                <span style={{ background: gradeColors[currentGrade], color: 'white', padding: '0.2rem 0.75rem', borderRadius: '2rem', fontWeight: 900, fontSize: '0.85rem' }}>
                                    Grade {currentGrade}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {whyGrade.map((point, i) => (
                                    <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 700 }}>{point}</div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Sample Images Strip — All 10 real dataset images */}
            <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1rem', display: 'flex', gap: '0.75rem', overflowX: 'auto', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, color: 'var(--text-light)', whiteSpace: 'nowrap', marginRight: '0.5rem', fontSize: '0.85rem' }}>📂 Test Samples:</div>
                {[
                    { file: 'Excellent (1).JPG', label: 'Excellent', color: '#059669' },
                    { file: 'Excellent (5).JPG', label: 'Excellent', color: '#059669' },
                    { file: 'Good (1).JPG', label: 'Good', color: '#0ea5e9' },
                    { file: 'Good (19).JPG', label: 'Good', color: '#0ea5e9' },
                    { file: 'Average (79).JPG', label: 'Average', color: '#eab308' },
                    { file: 'Average (81).JPG', label: 'Average', color: '#eab308' },
                    { file: 'Bad (40).JPG', label: 'Bad', color: '#f97316' },
                    { file: 'Bad (8).JPG', label: 'Bad', color: '#f97316' },
                    { file: 'Worst (26).JPG', label: 'Worst', color: '#ef4444' },
                    { file: 'Worst (39).JPG', label: 'Worst', color: '#ef4444' },
                ].map((item, idx) => (
                    <div key={idx} onClick={() => loadSampleImage(`/images/dataset_samples/${item.file}`)} style={{ cursor: 'pointer', textAlign: 'center', flexShrink: 0 }}>
                        <img
                            src={`/images/dataset_samples/${item.file}`}
                            alt={item.label}
                            style={{ width: '55px', height: '55px', objectFit: 'cover', borderRadius: '0.5rem', border: `2px solid ${item.color}40`, transition: 'transform 0.2s' }}
                            onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        />
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '0.2rem', color: item.color }}>{item.label}</div>
                    </div>
                ))}
            </div>

            {/* Session Image History */}
            {sessionImages.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ marginTop: '1.5rem', padding: '1rem' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-light)', marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                        📋 Session Images ({sessionImages.length})
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
                        {sessionImages.map((img, idx) => (
                            <div key={idx} onClick={() => { setUploadedImage(img.thumb); setDetections(img.detections); }} style={{ cursor: 'pointer', textAlign: 'center', flexShrink: 0 }}>
                                <div style={{ position: 'relative' }}>
                                    <img src={img.thumb} alt={`Session ${idx + 1}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem', border: '2px solid var(--primary)' }} />
                                    <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', fontSize: '0.6rem', fontWeight: 900, padding: '1px 5px', borderRadius: '0.25rem', whiteSpace: 'nowrap' }}>
                                        {img.count} seeds
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '0.8rem', color: 'var(--text-light)' }}>#{String(idx + 1).padStart(2, '0')}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Bottom Controls Strip */}
            <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {!isBatchActive ? (
                        <button className="btn btn-primary" onClick={startBatch}><Play size={18} /> Start Session</button>
                    ) : (
                        <button className="btn" style={{ background: '#dc2626', color: 'white' }} onClick={endBatch}><Square size={18} /> End & Save</button>
                    )}
                    <button className="btn btn-secondary" onClick={() => { setCounts(INITIAL_COUNTS); setDetections([]); setHeatmapPoints([]); setSessionImages([]); }}><Trash2 size={18} /> Reset</button>
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
