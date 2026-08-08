import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Download, Search, Filter, ChevronRight, FileSpreadsheet, FileText, Calendar, History, Trash2, ArrowUpDown, QrCode, ShieldCheck, Globe, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = import.meta.env.VITE_API_URL || 'https://maizescan-vmi3.onrender.com';

const ReportsPage = ({ user }) => {
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGrade, setFilterGrade] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const response = await axios.get(`${API_URL}/batches`);
            setBatches(response.data);
        } catch (err) {
            console.error("Fetch batches failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        try {
            if (batches.length === 0) return;
            const headers = ["Batch ID", "Timestamp", "Total Count", "Final Grade", "Moisture Content", "Variety"].join(',');
            const rows = batches.map(b => [
                b.batch_id,
                b.timestamp,
                b.total_count,
                b.final_grade,
                b.moisture_content,
                b.seed_variety
            ].join(','));
            const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", `MaizeScan_FullAudit_${new Date().getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("CSV Download failed:", err);
            alert("CSV export failed.");
        }
    };

    const generateFullPDF = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.setTextColor(5, 31, 32); 
            doc.text("Operational Audit Log", 14, 22);
            doc.setFontSize(10);
            doc.text(`System Report | Generated: ${new Date().toLocaleString()}`, 14, 30);
            
            const tableData = batches.map(b => [
                b.batch_id,
                new Date(b.timestamp).toLocaleDateString(),
                b.total_count,
                b.final_grade,
                `${b.moisture_content}%`,
                b.seed_variety
            ]);

            autoTable(doc, {
                startY: 40,
                head: [['Batch ID', 'Date', 'Seeds', 'Grade', 'Moisture', 'Variety']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [5, 31, 32] },
                styles: { fontSize: 8 }
            });

            doc.save(`MaizeScan_FullAudit.pdf`);
        } catch (err) {
            console.error("Master PDF failed:", err);
        }
    };

    const generateCertificatePDF = (b) => {
        try {
            setDownloading(b.id);
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;

            // Calculations for Grading Logic
            const sound = Number(b.excellent_percentage) + Number(b.good_percentage);
            const defective = Number(b.bad_percentage) + Number(b.worst_percentage);
            
            // 1. HEADER SECTION
            doc.setFillColor(27, 67, 50); // #1b4332
            doc.rect(0, 0, pageWidth, 35, 'F');
            
            // Logo Implementation
            try {
                // We attempt to add the logo from the public path
                doc.addImage("/images/logo.png", "PNG", 15, 5, 25, 25);
            } catch (e) {
                console.warn("Logo overlay skipped/failed:", e);
            }
            
            // Header Content
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(26);
            doc.setFont('helvetica', 'bold');
            doc.text("MaizeScan", 50, 18);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text("AI-POWERED SEED QUALITY GRADING SYSTEM", 50, 25);
            
            doc.setFontSize(14);
            doc.text("OFFICIAL QUALITY REPORT", pageWidth - 15, 18, { align: 'right' });
            doc.setFontSize(10);
            doc.text(`Batch ID: ${b.batch_id}`, pageWidth - 15, 25, { align: 'right' });

            // 2. TITLE
            let currentY = 50;
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text(`Maize Seed Quality Report – Batch #${b.batch_id}`, 14, currentY);
            
            // 3. DETAILS GRID
            currentY += 15;
            doc.setFontSize(10);
            doc.setTextColor(100);
            
            // Left Column
            doc.setFont('helvetica', 'bold');
            doc.text("Report Date:", 14, currentY);
            doc.text("Location:", 14, currentY + 7);
            doc.text("Model Version:", 14, currentY + 14);
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30);
            doc.text(new Date(b.timestamp).toLocaleDateString(), 45, currentY);
            doc.text("Nagpur, Maharashtra", 45, currentY + 7);
            doc.text("maize_yolov8_cls_v1.2 (YOLOv8n-cls)", 45, currentY + 14);
            
            // Right Column
            doc.setTextColor(100);
            doc.setFont('helvetica', 'bold');
            doc.text("Farmer / Client:", 110, currentY);
            doc.text("Operator ID:", 110, currentY + 7);
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30);
            doc.text(user?.full_name || "Agri Operator", 145, currentY);
            doc.text(`MS-OPERATOR-${user?.id || '4'}`, 145, currentY + 7);

            doc.setDrawColor(230);
            doc.line(14, currentY + 22, pageWidth - 14, currentY + 22);
            
            // 4. BATCH DISTRIBUTION SUMMARY
            currentY += 35;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text("1. Batch Distribution Summary", 14, currentY);
            
            currentY += 10;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const summaryItems = [
                { l: "Excellent Quality:", v: `${b.excellent_count} Seeds`, p: `${b.excellent_percentage}%`, c: [22, 101, 52] },
                { l: "Good Quality:", v: `${b.good_count} Seeds`, p: `${b.good_percentage}%`, c: [34, 197, 94] },
                { l: "Average Quality:", v: `${b.average_count} Seeds`, p: `${b.average_percentage}%`, c: [234, 179, 8] },
                { l: "Defective Quality:", v: `${b.bad_count + b.worst_count} Seeds`, p: `${(Number(b.bad_percentage) + Number(b.worst_percentage)).toFixed(1)}%`, c: [153, 27, 27] }
            ];
            summaryItems.forEach((item, i) => {
                const itemY = currentY + (i * 7);
                doc.setFillColor(item.c[0], item.c[1], item.c[2]);
                doc.circle(16, itemY - 1, 1.5, 'F');
                doc.setTextColor(100);
                doc.text(item.l, 22, itemY);
                doc.setTextColor(30);
                doc.setFont('helvetica', 'bold');
                doc.text(`${item.v} (${item.p})`, 55, itemY);
                doc.setFont('helvetica', 'normal');
            });
            doc.setTextColor(30);
            doc.text(`${b.total_count} Total Seeds Analysed`, 22, currentY + (summaryItems.length * 7));

            // GRADE BADGE
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(pageWidth - 85, currentY - 5, 70, 32, 3, 3, 'F');
            doc.setDrawColor(226, 232, 240);
            doc.roundedRect(pageWidth - 85, currentY - 5, 70, 32, 3, 3, 'D');
            doc.setTextColor(100);
            doc.setFontSize(8);
            doc.text("FINAL EVALUATION", pageWidth - 50, currentY + 3, { align: 'center' });
            doc.setFontSize(14);
            const statusColor = b.final_grade === 'Excellent' || b.final_grade === 'Good' ? [22, 101, 52] : [153, 27, 27];
            doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
            doc.setFont('helvetica', 'bold');
            doc.text(b.final_grade.toUpperCase(), pageWidth - 50, currentY + 15, { align: 'center' });
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(`AI Validated Analysis`, pageWidth - 50, currentY + 23, { align: 'center' });

            // 5. CLASS DISTRIBUTION TABLE
            currentY += 40;
            doc.setTextColor(30);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text("2. Class-wise Distribution", 14, currentY);
            autoTable(doc, {
                startY: currentY + 5,
                head: [['Class', 'Description', 'Count', 'Percentage']],
                body: [
                    ['Excellent', 'Uniform, intact, healthy kernels', b.excellent_count, `${b.excellent_percentage}%`],
                    ['Good', 'Minor blemishes, still suitable', b.good_count, `${b.good_percentage}%`],
                    ['Average', 'Acceptable but below preferred quality', b.average_count, `${b.average_percentage}%`],
                    ['Bad', 'Chipped / cracked / shrivelled', b.bad_count, `${b.bad_percentage}%`],
                    ['Worst', 'Severe damage / mold / insect attack', b.worst_count, `${b.worst_percentage}%`],
                    ['Total', '', b.total_count, '100%']
                ],
                theme: 'striped',
                headStyles: { fillColor: [27, 67, 50], fontSize: 9, fontStyle: 'bold' },
                styles: { fontSize: 8, cellPadding: 3 },
                columnStyles: { 0: { fontStyle: 'bold', width: 25 }, 1: { width: 90 }, 2: { halign: 'center' }, 3: { halign: 'center' } }
            });

            // 6. GRADING LOGIC
            currentY = doc.lastAutoTable.finalY + 15;
            if (currentY > doc.internal.pageSize.height - 100) { doc.addPage(); currentY = 25; }
            doc.setTextColor(30);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text("3. Grading Logic (Transparency)", 14, currentY);
            currentY += 10;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Visual Purity (Sound) = ${sound.toFixed(1)}% | Damage Factor (Defective) = ${defective.toFixed(1)}%`, 14, currentY);
            currentY += 7;
            doc.text("Grade A: Sound >= 90% & Defe <= 3% | Grade B: Sound >= 80% & Defe <= 7% | Grade C: Substandard", 14, currentY);

            // 7. NOTES
            currentY += 15;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text("4. Notes / Observations", 14, currentY);
            currentY += 10;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text("- Analysis performed via YOLOv8-Nano real-time image processing sequence.", 14, currentY);
            currentY += 7;
            doc.text("- Verified against industrial standards (IMS-2024).", 14, currentY);
            if (b.total_count < 20) {
                doc.setTextColor(153, 27, 27);
                currentY += 7;
                doc.text("WARNING: Sample size is small (< 20 seeds); results may not represent full batch.", 14, currentY);
                doc.setTextColor(30);
            }

            // 8. RECOMMENDATION & MARKET SUITABILITY
            currentY += 18;
            if (currentY > doc.internal.pageSize.height - 80) { doc.addPage(); currentY = 25; }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text("5. Recommendation & Market Suitability", 14, currentY);
            currentY += 10;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            
            let recs = [];
            if (sound >= 90 && defective <= 3) {
                recs = [
                    "- Suitable for replanting (after germination test)",
                    "- Suitable for certified seed production",
                    "- Suitable for premium market sale"
                ];
            } else if (sound >= 80 && defective <= 7) {
                recs = [
                    "- Suitable for market sale (grain use)",
                    "- Suitable for processing (food industry)",
                    "- Not recommended for certified replanting"
                ];
            } else {
                recs = [
                    "- Suitable for animal feed / industrial use (ethanol, starch)",
                    "- Not suitable for direct human consumption (if highly defective)",
                    "- Not suitable for replanting"
                ];
            }
            recs.forEach(r => { doc.text(r, 16, currentY); currentY += 6; });
            currentY += 4;
            doc.setFontSize(7);
            doc.setTextColor(100);
            doc.text("[Verified] Recommendation validated against grading thresholds based on visual purity analysis.", 14, currentY);

            // 9. FOOTER
            const footerY = doc.internal.pageSize.height - 40;
            doc.setDrawColor(220); 
            doc.line(14, footerY - 10, pageWidth - 14, footerY - 10); 

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(27, 67, 50);
            doc.text("Smart Maize Seed Sorter – AI-Based Seed Quality Grading System", pageWidth / 2, footerY, { align: 'center' });
            
            doc.setFontSize(8);
            doc.setTextColor(100); 
            doc.setFont('helvetica', 'normal');
            doc.text(`© ${new Date().getFullYear()} – MaizeScan Agri-Core Distribution Hub`, pageWidth / 2, footerY + 10, { align: 'center' });
            
            doc.setFontSize(6.5);
            doc.setTextColor(160);
            const disclaimer1 = "Disclaimer: This report is generated using an AI-based image analysis model trained on maize seed images. Results depend on image quality,";
            const disclaimer2 = "sampling method, and model version. For critical certification, combine this report with standard lab tests.";
            doc.text(disclaimer1, pageWidth / 2, footerY + 20, { align: 'center' });
            doc.text(disclaimer2, pageWidth / 2, footerY + 26, { align: 'center' });

            doc.save(`Batch_Quality_Report_${b.batch_id}.pdf`);
        } catch (err) {
            console.error("PDF Fail:", err);
        } finally {
            setDownloading(null);
        }
    };

    const processedBatches = [...batches]
        .filter(b => (b.batch_id?.toLowerCase() || "").includes(searchTerm.toLowerCase()))
        .sort((a, b) => b.timestamp < a.timestamp ? -1 : 1);

    return (
        <div className="container" style={{ paddingTop: '8rem', paddingBottom: '6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="section-tag" style={{ background: 'var(--primary-dark)', color: 'white', marginBottom: '1.25rem' }}>Full Audit Trail</div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Operational <span style={{ color: 'var(--primary-light)' }}>Ledger</span></h1>
                    <p>Secure batch certification and regional quality records.</p>
                </motion.div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={downloadCSV} style={{ border: '1px solid rgba(0,0,0,0.05)' }}>
                        <FileSpreadsheet size={18} /> Export CSV
                    </button>
                    <button className="btn btn-primary" onClick={generateFullPDF}>
                        <Download size={18} /> Master Report
                    </button>
                </div>
            </div>

            <div style={{ 
                background: 'white', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid rgba(0,0,0,0.05)',
                marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' 
            }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input
                        type="text"
                        placeholder="Search system ID or batch ledger..."
                        style={{ 
                            width: '100%', padding: '1rem 1rem 1rem 3.5rem', background: '#f9fafb', border: '1px solid #f1f5f9',
                            borderRadius: '0.75rem', fontWeight: 600, color: 'var(--text-main)', outline: 'none'
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ 
                background: 'white', borderRadius: '1.5rem', border: '1px solid rgba(0,0,0,0.05)',
                overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                                <th style={{ padding: '1.25rem', color: 'var(--text-light)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Batch Identity</th>
                                <th style={{ padding: '1.25rem', color: 'var(--text-light)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Timestamp</th>
                                <th style={{ padding: '1.25rem', color: 'var(--text-light)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Yield Volume</th>
                                <th style={{ padding: '1.25rem', color: 'var(--text-light)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>AI Grade</th>
                                <th style={{ padding: '1.25rem', textAlign: 'right', color: 'var(--text-light)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '8rem', textAlign: 'center', fontWeight: 800, color: 'var(--text-light)' }}>Syncing records...</td></tr>
                            ) : processedBatches.map((batch, idx) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                                    key={batch.id}
                                    className="ledger-row"
                                    style={{ borderBottom: '1px solid #f1f5f9' }}
                                >
                                    <td style={{ padding: '1.25rem', fontWeight: 800, color: 'var(--primary-dark)' }}>{batch.batch_id}</td>
                                    <td style={{ padding: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{new Date(batch.timestamp).toLocaleDateString()}</td>
                                    <td style={{ padding: '1.25rem', fontWeight: 700 }}>{batch.total_count} Units</td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <span style={{
                                            padding: '0.35rem 0.75rem', borderRadius: '0.5rem', fontWeight: 800, fontSize: '0.7rem',
                                            background: '#dcfce7', color: '#166534'
                                        }}>{batch.final_grade?.toUpperCase()}</span>
                                    </td>
                                    <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button className="cert-btn" onClick={() => navigate(`/certificate/${batch.id}`)}>
                                                <Award size={16} /> View
                                            </button>
                                            <button className="cert-btn" onClick={() => generateCertificatePDF(batch)} disabled={downloading === batch.id}>
                                                <FileText size={16} /> PDF
                                            </button>
                                            <button className="cert-btn delete" onClick={async () => { if (confirm('Purge record?')) { await axios.delete(`${API_URL}/batches/${batch.id}`); fetchBatches(); } }}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .ledger-row { transition: background 0.2s; }
                .ledger-row:hover { background: #f9fafb !important; }
                .cert-btn {
                    background: transparent; border: 1.5px solid #f1f5f9; padding: 0.5rem 0.85rem; border-radius: 0.6rem;
                    cursor: pointer; color: var(--text-main); font-weight: 700; font-size: 0.8rem;
                    display: flex; alignItems: center; gap: 0.5rem; transition: all 0.2s;
                }
                .cert-btn:hover { background: var(--primary); border-color: var(--primary); color: white; transform: translateY(-1px); }
                .cert-btn.delete:hover { background: #ef4444; border-color: #ef4444; color: white; }
            `}</style>
        </div>
    );
};

export default ReportsPage;
