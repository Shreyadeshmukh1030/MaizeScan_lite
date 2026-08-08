import React, { useState } from 'react';
import {
    BookOpen, CheckCircle2, AlertTriangle, XCircle, Info, ArrowRight,
    Lightbulb, ShieldCheck, Microscope, Zap, FileText, Globe,
    Video, HelpCircle, Thermometer, Droplets, Layout, Download,
    ShieldAlert, Sprout, Ruler, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const translations = {
    en: {
        title: "The Farmer's Master Class",
        subtitle: "Maximize your yield with AI-driven precision. Learn how to grade, treat, and store your maize seeds for optimal results.",
        langSwitch: "Language Selection",

        // Tab Names
        tab1: "AI Interpretation",
        tab2: "Capture Tips",
        tab3: "Storage & Safety",
        tab4: "Defect Library",
        tab5: "Video Guides",

        // Interpreting Results
        gradingTitle: "Understanding AI Grades",
        gradeA: "Grade A - Elite",
        gradeADesc: "90%+ Germination. Primary seed stock. Low risk.",
        gradeB: "Grade B - Standard",
        gradeBDesc: "80-90% Germination. Commercial sale. Moderate risk.",
        gradeC: "Grade C - Reject",
        gradeCDesc: "<80% Germination. Animal feed only. High risk.",

        // Capture Tips
        captureTitle: "Perfect Image Capture",
        sampleRule: "Sampling Rule: Take 100 seeds from the middle of the bag.",
        doTitle: "DO'S",
        do1: "Use a dark blue or black matte background.",
        do2: "Spread seeds evenly - no overlapping.",
        do3: "Use bright, indirect natural light.",
        dontTitle: "DON'TS",
        dont1: "Don't use glossy surfaces (creates glare).",
        dont2: "Don't scan seeds in direct harsh sunlight.",
        dont3: "Don't use phone flash - it hides cracks.",

        // Defect Library
        libraryTitle: "Common Seed Defects",
        defect1: "Insect Damage (Weevils)",
        defect1Desc: "Circular holes. Seed mass lost. Destroy immediately.",
        defect2: "Shrivelled Seeds",
        defect2Desc: "Deep wrinkles. Poor moisture balance. Low yield.",
        defect3: "Germination Cracks",
        defect3Desc: "Fractured crown. Mechanical damage. High infection risk.",
        defect4: "Moldy/Discolored",
        defect4Desc: "Grey/Green spots. Toxic aflatoxin. Dangerous.",

        // FAQ
        faqTitle: "Frequently Asked Questions",
        q1: "My batch got Grade C, can I still sow it?",
        a1: "Not recommended. Grade C seeds have poor vigor and high failure risk. Use them for animal feed instead.",
        q2: "Why is the AI marking good seeds as bad?",
        a2: "Check your lighting. Harsh shadows or dust on seeds can confuse the AI. Clean your seeds before scanning.",

        // Video
        videoTitle: "Maize Education Gallery",
        v1: "Modern Maize Harvesting",
        v2: "Industrial Storage Tips",
        v3: "Sustainable Farming",

        // Safety
        safetyTitle: "Safety & Compliance",
        safe1: "Wear gloves when handling treated seeds.",
        safe2: "Never feed treated seeds to humans or livestock.",
        safe3: "AI grading is a tool; consult labs for certification."
    },
    hi: {
        title: "किसान मास्टर क्लास",
        subtitle: "AI-संचालित सटीकता के साथ अपनी उपज को अधिकतम करें। सर्वोत्तम परिणामों के लिए अपने मक्का के बीजों को ग्रेड, उपचार और स्टोर करना सीखें।",
        langSwitch: "भाषा चयन",

        tab1: "AI व्याख्या",
        tab2: "कैप्चर टिप्स",
        tab3: "भंडारण और सुरक्षा",
        tab4: "दोष पुस्तकालय",
        tab5: "वीडियो गाइड",

        gradingTitle: "AI ग्रेड को समझना",
        gradeA: "ग्रेड ए - विशिष्ट",
        gradeADesc: "90%+ अंकुरण। प्राथमिक बीज स्टॉक। कम जोखिम।",
        gradeB: "ग्रेड बी - मानक",
        gradeBDesc: "80-90% अंकुरण। व्यावसायिक बिक्री। मध्यम जोखिम।",
        gradeC: "ग्रेड सी - अस्वीकार",
        gradeCDesc: "<80% अंकुरण। केवल पशु आहार। उच्च जोखिम।",

        captureTitle: "परफेक्ट इमेज कैप्चर",
        sampleRule: "नमूना नियम: बैग के बीच से 100 बीज लें।",
        doTitle: "क्या करें",
        do1: "गहरे नीले या काले मैट बैकग्राउंड का उपयोग करें।",
        do2: "बीजों को समान रूप से फैलाएं - ओवरलैपिंग न करें।",
        do3: "तेज, अप्रत्यक्ष प्राकृतिक प्रकाश का उपयोग करें।",
        dontTitle: "क्या न करें",
        dont1: "चमकदार सतहों का उपयोग न करें (चमक पैदा करता है)।",
        dont2: "कड़ी धूप में बीजों को स्कैन न करें।",
        dont3: "फोन फ्लैश का उपयोग न करें - यह दरारें छुपाता है।",

        libraryTitle: "सामान्य बीज दोष",
        defect1: "कीट क्षति (घुन)",
        defect1Desc: "गोलाकार छेद। बीज द्रव्यमान नष्ट। तुरंत नष्ट करें।",
        defect2: "सिकुड़े हुए बीज",
        defect2Desc: "गहरी झुर्रियां। खराब नमी संतुलन। कम उपज।",
        defect3: "अंकुरण दरारें",
        defect3Desc: "खंडित मुकुट। यांत्रिक क्षति। उच्च संक्रमण जोखिम।",
        defect4: "फफूंद/बदरंग",
        defect4Desc: "धूसर/हरे धब्बे। जहरीला एफलाटॉक्सिन। खतरनाक।",

        faqTitle: "अक्सर पूछे जाने वाले प्रश्न",
        q1: "मेरे बैच को ग्रेड सी मिला, क्या मैं अभी भी इसकी बुवाई कर सकता हूँ?",
        a1: "अनुशंसित नहीं है। ग्रेड सी बीजों में कम जीवन शक्ति और उच्च विफलता जोखिम होता है। इसके बजाय उन्हें पशु आहार के लिए उपयोग करें।",
        q2: "AI अच्छे बीजों को खराब के रूप में क्यों चिन्हित कर रहा है?",
        a2: "अपनी लाइटिंग चेक करें। बीजों पर परछाई या धूल AI को भ्रमित कर सकती है। स्कैनिंग से पहले अपने बीज साफ करें।",

        videoTitle: "मक्का शिक्षा गैलरी",
        v1: "आधुनिक मक्का कटाई",
        v2: "औद्योगिक भंडारण युक्तियाँ",
        v3: "सतत खेती",

        safetyTitle: "सुरक्षा और अनुपालन",
        safe1: "उपचारित बीजों को संभालते समय दस्ताने पहनें।",
        safe2: "उपचारित बीजों को कभी भी इंसानों या पशुधन को न खिलाएं।",
        safe3: "AI ग्रेडिंग एक उपकरण है; प्रमाणन के लिए लैब से परामर्श लें।"
    },
    mr: {
        title: "शेतकरी मास्टर क्लास",
        subtitle: "AI-आधारित अचूकतेसह तुमचे उत्पन्न वाढवा. उत्तम निकालासाठी तुमचे मका बियाणे ग्रेड, प्रक्रिया आणि साठवणूक कशी करायची ते शिका.",
        langSwitch: "भाषा निवड",

        tab1: "AI विश्लेषण",
        tab2: "कॅप्चर टिप्स",
        tab3: "साठवणूक आणि सुरक्षा",
        tab4: "दोष लायब्ररी",
        tab5: "व्हिडिओ गाईड",

        gradingTitle: "AI ग्रेड समजून घ्या",
        gradeA: "ग्रेड ए - उत्कृष्ट",
        gradeADesc: "90%+ उगवण क्षमता. प्राथमिक बियाणे साठा. कमी धोका.",
        gradeB: "ग्रेड बी - मानक",
        gradeBDesc: "80-90% उगवण क्षमता. व्यावसायिक विक्री. मध्यम धोका.",
        gradeC: "ग्रेड सी - नाकारले",
        gradeCDesc: "<80% उगवण क्षमता. फक्त पशुखाद्य. जास्त धोका.",

        captureTitle: "अचूक फोटो कसा घ्यावा",
        sampleRule: "नमुना नियम: पोत्याच्या मध्यातून 100 बिया घ्या.",
        doTitle: "काय करावे",
        do1: "गडद निळ्या किंवा काळ्या मॅट बॅकग्राउंडचा वापर करा.",
        do2: "बिया समान रीतीने पसरवा - एकावर एक ठेवू नका.",
        do3: "प्रखर, अप्रत्यक्ष नैसर्गिक प्रकाशाचा वापर करा.",
        dontTitle: "काय करू नये",
        dont1: "चमकदार पृष्ठभाग वापरू नका (चकाकी निर्माण होते).",
        dont2: "थेट कडक उन्हात बिया स्कॅन करू नका.",
        dont3: "फोन फ्लॅश वापरू नका - यामुळे तडे लपतात.",

        libraryTitle: "सामान्य बीज दोष",
        defect1: "किडीचा प्रादुर्भाव (घूण)",
        defect1Desc: "गोलाकार छिद्रे. बियाण्याचे वजन घटले. त्वरित नष्ट करा.",
        defect2: "सुकलेली बियाणे",
        defect2Desc: "खोल सुरकुत्या. ओलाव्याचे खराब प्रमाण. कमी उत्पन्न.",
        defect3: "उगवण तडे",
        defect3Desc: "मुकुटावर तडा. यांत्रिक इजा. संसर्गाचा जास्त धोका.",
        defect4: "बुरशीजन्य/रंगहीन",
        defect4Desc: "राखाडी/हिरवे डाग. विषारी अफलाटॉक्सिन. धोकादायक.",

        faqTitle: "सतत विचारले जाणारे प्रश्न",
        q1: "माझ्या बॅचला ग्रेड सी मिळाला आहे, तरीही मी पेरणी करू शकतो का?",
        a1: "शिफारस केलेली नाही. ग्रेड सी बियाण्यांमध्ये उगवण शक्ती कमी असते. त्याऐवजी त्यांचा पशुखाद्यासाठी वापर करा.",
        q2: "AI चांगल्या बियांना खराब का म्हणत आहे?",
        a2: "तुमची प्रकाश व्यवस्था तपासा. प्रखर सावली किंवा धूळ असल्यास AI गोंधळू शकते. स्कॅन करण्यापूर्वी बिया स्वच्छ करा.",

        videoTitle: "मका शिक्षण दालन",
        v1: "आधुनिक मका काढणी",
        v2: "औद्योगिक साठवणूक टिप्स",
        v3: "शाश्वत शेती",

        safetyTitle: "सुरक्षा आणि पालन",
        safe1: "प्रक्रिया केलेले बियाणे हाताळताना हातमोजे वापरा.",
        safe2: "प्रक्रिया केलेले बियाणे मानव किंवा जनावरांना खायला घालू नका.",
        safe3: "AI ग्रेडिंग हे एक साधन आहे; प्रमाणपत्रासाठी लॅबचा सल्ला घ्या।"
    }
};

const FarmerGuidePage = () => {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [activeTab, setActiveTab] = useState('Interpretation');
    const t = translations[lang];

    const tabs = [
        { id: 'Interpretation', label: t.tab1, icon: <Layout size={18} /> },
        { id: 'Capture', label: t.tab2, icon: <Camera size={18} /> },
        { id: 'Storage', label: t.tab3, icon: <Thermometer size={18} /> },
        { id: 'Library', label: t.tab4, icon: <Microscope size={18} /> },
        { id: 'Videos', label: t.tab5, icon: <Video size={18} /> }
    ];

    return (
        <div style={{ maxWidth: '1300px', margin: '3rem auto', padding: '0 2rem' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: '1rem' }}>
                        {t.title.split('Master')[0]} <span className="gradient-text">Master Class</span>
                    </h1>
                    <p style={{ color: 'var(--text-light)', fontSize: '1.2rem', maxWidth: '700px', fontWeight: 600 }}>{t.subtitle}</p>
                </motion.div>

                <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Globe size={18} color="var(--primary)" />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['en', 'hi', 'mr'].map((l) => (
                            <button
                                key={l}
                                onClick={() => setLang(l)}
                                style={{
                                    padding: '6px 14px', borderRadius: '10px', border: 'none',
                                    background: lang === l ? 'var(--primary)' : 'transparent',
                                    color: lang === l ? 'white' : 'var(--text-light)',
                                    fontWeight: 900, cursor: 'pointer', transition: '0.3s'
                                }}
                            >
                                {l.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
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
                    key={activeTab + lang}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'Interpretation' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem' }}>{t.gradingTitle}</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <GradeRow color="#00C853" title={t.gradeA} desc={t.gradeADesc} icon={<CheckCircle2 />} />
                                    <GradeRow color="#FFD600" title={t.gradeB} desc={t.gradeBDesc} icon={<AlertTriangle />} />
                                    <GradeRow color="#D50000" title={t.gradeC} desc={t.gradeCDesc} icon={<XCircle />} />
                                </div>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <motion.div whileHover={{ scale: 1.02 }} style={{ borderRadius: '2rem', overflow: 'hidden', boxShadow: 'var(--shadow-premium)', background: 'white', padding: '1rem' }}>
                                    <img src="/images/grading_comparison.png" alt="Grading Comparison" style={{ width: '100%', height: 'auto', borderRadius: '1.5rem' }} />
                                    <div style={{ padding: '1rem', textAlign: 'center', fontWeight: 800, color: 'var(--text-light)' }}>AI Grading Visual Standards</div>
                                </motion.div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Capture' && (
                        <div className="glass-panel" style={{ padding: '3rem' }}>
                            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>{t.captureTitle}</h2>
                                <p style={{ color: 'var(--text-light)', fontWeight: 700 }}>{t.sampleRule}</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div style={{ background: '#ecfdf5', padding: '2.5rem', borderRadius: '2rem', borderLeft: '8px solid #059669' }}>
                                        <h3 style={{ color: '#047857', fontWeight: 950, fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 /> {t.doTitle}</h3>
                                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#064e3b', fontWeight: 700 }}>
                                            <li>✅ {t.do1}</li>
                                            <li>✅ {t.do2}</li>
                                            <li>✅ {t.do3}</li>
                                            <li>✅ Clean seeds of dust and cob silks.</li>
                                        </ul>
                                    </div>
                                    <div style={{ background: '#fff1f2', padding: '2.5rem', borderRadius: '2rem', borderLeft: '8px solid #e11d48' }}>
                                        <h3 style={{ color: '#be123c', fontWeight: 950, fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><XCircle /> {t.dontTitle}</h3>
                                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#881337', fontWeight: 700 }}>
                                            <li>❌ {t.dont1}</li>
                                            <li>❌ {t.dont2}</li>
                                            <li>❌ {t.dont3}</li>
                                            <li>❌ Don't scan seeds that are wet.</li>
                                        </ul>
                                    </div>
                                </div>
                                <motion.div whileHover={{ scale: 1.05 }} style={{ borderRadius: '2rem', overflow: 'hidden', boxShadow: 'var(--shadow-premium)' }}>
                                    <img src="/images/capture_tips.png" alt="Capture Guidelines" style={{ width: '100%', height: 'auto' }} />
                                </motion.div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Storage' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3rem' }}>
                            <div className="glass-panel" style={{ padding: '3rem' }}>
                                <div className="section-tag" style={{ background: '#dcfce7', color: '#166534', border: 'none' }}>Handling Protocols</div>
                                <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginTop: '1.5rem', marginBottom: '2rem' }}>Storage & Safety</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                                        <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '1rem', height: 'max-content' }}><Droplets color="#0369a1" /></div>
                                        <div>
                                            <h4 style={{ fontWeight: 900, fontSize: '1.1rem' }}>Moisture Limit</h4>
                                            <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginTop: '0.5rem' }}>Maintain 12-13% moisture. Any higher leads to rotting and fungal growth.</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                                        <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '1rem', height: 'max-content' }}><ShieldAlert color="#e11d48" /></div>
                                        <div>
                                            <h4 style={{ fontWeight: 900, fontSize: '1.1rem' }}>{t.safetyTitle}</h4>
                                            <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginTop: '0.5rem' }}>{t.safe1} {t.safe2}</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-primary" style={{ width: '100%', marginTop: '3rem' }}>
                                    <Download size={20} /> Download Farmer Poster
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <img src="/images/storage_facility.png" alt="Silo Storage" style={{ width: '100%', borderRadius: '2rem', padding: '0.5rem', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} />
                                <div className="glass-panel" style={{ padding: '2rem', background: '#0f172a', color: 'white' }}>
                                    <h4 style={{ fontWeight: 900, marginBottom: '1rem', color: '#6ee7b7' }}>Ventilation Rule</h4>
                                    <p style={{ opacity: 0.8, fontSize: '0.9rem', lineHeight: 1.8 }}>Keep bags on wooden pallets, 50cm away from walls. Avoid stacking more than 8 bags high to prevent heat buildup.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Library' && (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>{t.libraryTitle}</h2>
                                <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>Expert visual glossary for identifying damaged kernels.</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '3rem', alignItems: 'center' }}>
                                <img src="/images/defect_library.png" alt="Defect Library" style={{ width: '100%', borderRadius: '2rem', boxShadow: 'var(--shadow-premium)' }} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <DefectCard title={t.defect1} desc={t.defect1Desc} image="/images/defect_insect.jpg" />
                                    <DefectCard title={t.defect2} desc={t.defect2Desc} image="/images/defect_shriveled.jpg" />
                                    <DefectCard title={t.defect3} desc={t.defect3Desc} image="/images/defect_cracked.jpg" />
                                    <DefectCard title={t.defect4} desc={t.defect4Desc} image="/images/defect_moldy.jpg" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Videos' && (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>{t.videoTitle}</h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                                <VideoEmbed
                                    title={t.v1}
                                    url="https://www.youtube.com/embed/R9pxFgJwxFE?si=4AvMt8a_IZZ-Z0j-"
                                    thumbnail="https://img.youtube.com/vi/R9pxFgJwxFE/maxresdefault.jpg"
                                />
                                <VideoEmbed
                                    title={t.v2}
                                    url="https://www.youtube.com/embed/5GF6Q5Qd67E?si=6wkjt4gHgKtFEvzF"
                                    thumbnail="https://img.youtube.com/vi/5GF6Q5Qd67E/maxresdefault.jpg"
                                />
                                <VideoEmbed
                                    title={t.v3}
                                    url="https://www.youtube.com/embed/ry94KCK6_pw?si=KPVyfV88pLHAjqIe"
                                    thumbnail="https://img.youtube.com/vi/ry94KCK6_pw/maxresdefault.jpg"
                                />
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Final CTA */}
            <div className="glass-panel" style={{ marginTop: '5rem', padding: '4rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--primary) 0%, #064e3b 100%)', color: 'white', borderRadius: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem' }}>{t.ctaTitle || "Ready to Start?"}</h2>
                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                    <button onClick={() => navigate('/detect')} className="btn" style={{ background: 'white', color: 'var(--primary)', padding: '1.25rem 3rem' }}>{t.launchBtn || "Start Inspection"}</button>
                    <button onClick={() => navigate('/reports')} className="btn" style={{ border: '1px solid white', color: 'white', padding: '1.25rem 3rem' }}>{t.historyBtn || "View Reports"}</button>
                </div>
            </div>
        </div>
    );
};

const GradeRow = ({ color, title, desc, icon }) => (
    <div style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', borderRadius: '1.5rem', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ color: color }}>{icon}</div>
        <div>
            <div style={{ fontWeight: 950, fontSize: '1.1rem', color: color }}>{title}</div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginTop: '0.25rem' }}>{desc}</div>
        </div>
    </div>
);

const TipBox = ({ icon, title, val }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
        <div style={{ color: 'var(--primary)' }}>{icon}</div>
        <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{title}</div>
            <div style={{ fontWeight: 700 }}>{val}</div>
        </div>
    </div>
);

const DefectCard = ({ title, desc, image }) => (
    <motion.div whileHover={{ y: -5 }} className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{
            height: '140px', background: '#f1f5f9', borderRadius: '1rem',
            marginBottom: '1.25rem', display: 'flex', alignItems: 'center',
            justifyContent: 'center', overflow: 'hidden'
        }}>
            {image ? (
                <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                <Zap size={32} opacity={0.2} />
            )}
        </div>
        <div style={{ fontWeight: 950, fontSize: '1rem', marginBottom: '0.75rem' }}>{title}</div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: 1.6 }}>{desc}</p>
    </motion.div>
);

const VideoEmbed = ({ title, url, thumbnail }) => (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ position: 'relative', paddingTop: '56.25%', marginBottom: '1.25rem' }}>
            {thumbnail && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundImage: `url(${thumbnail})`, backgroundSize: 'cover',
                    borderRadius: '1rem', zIndex: 0
                }} />
            )}
            <iframe
                src={url}
                title={title}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '1rem', border: 'none', zIndex: 1 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
        <div style={{ fontWeight: 900, textAlign: 'center' }}>{title}</div>
    </div>
);

export default FarmerGuidePage;
