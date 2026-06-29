import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Calendar, ArrowRight, User, Target, Zap, Shield, Users, Globe, Star, CheckCircle, Award, Briefcase, Phone } from "lucide-react";
import { motion } from "framer-motion";
import BannersDisplay from "../components/BannersDisplay";
import { getAllPrograms } from "../services/programService";

// ASSETS
const heroImg = "/ref-hero.png";
const p1 = "/ref-prog1.png";
const p2 = "/ref-prog2.png";
const p3 = "/ref-prog3.png";

const curriculum = [
  { title: "Book a Demo", desc: "Experience the precision firsthand with a guided assessment.", icon: <Target size={24} /> },
  { title: "Pay and Play", desc: "Flexible access to world-class ranges on your terms.", icon: <Zap size={24} /> },
  { title: "Discovery Program", desc: "Your first step into the science of elite archery.", icon: <Globe size={24} /> },
  { title: "Beginners Program", desc: "Mastering the fundamentals for a lifetime of accuracy.", icon: <Shield size={24} /> },
  { title: "Intermediate Program", desc: "Refining form and transition to competitive standards.", icon: <Star size={24} /> },
  { title: "Advance Program", desc: "Elite technical training for state and national aspirants.", icon: <CheckCircle size={24} /> },
  { title: "Elite Squad", desc: "Hyper-focused international competition conditioning.", icon: <Award size={24} /> },
  { title: "Corporate Engagements", desc: "Elite team performance metrics through archery discipline.", icon: <Users size={24} /> },
  { title: "Other Engagements", desc: "Custom facilitations for schools and private groups.", icon: <Briefcase size={24} /> },
  { title: "Request a Call", desc: "Speak with our consultants for a custom training path.", icon: <Phone size={24} />, path: "/contact" },
];

const Home = () => {
  const [displayPrograms, setDisplayPrograms] = useState([]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await getAllPrograms();
        if (Array.isArray(data) && data.length > 0) {
          setDisplayPrograms(data);
        }
      } catch (error) {
        console.error("Failed to fetch programs:", error);
      }
    };
    fetchPrograms();
  }, []);

  return (
    <div style={{ backgroundColor: '#ffffff', overflowX: 'hidden', fontFamily: "'Outfit', sans-serif" }}>
      <BannersDisplay placement="Home Page" position="Popup" />
      <div className="site-container">
        <BannersDisplay placement="Home Page" position="Top" />
      </div>
      
      {/* ================================================================ */}
      {/* 1. HERO SECTION (RESPONSIVE)                                    */}
      {/* ================================================================ */}
      <section style={{ 
        position: 'relative', 
        minHeight: '92vh', 
        width: '100%', 
        backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url('${heroImg}')`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        display: 'flex', 
        alignItems: 'center',
        color: 'white',
        padding: '0 5%'
      }}>
        <div className="site-container" style={{ animation: 'fadeInDown 0.8s ease' }}>
           <h1 className="hero-title" style={{ fontWeight: '900', marginBottom: '15px' }}>Precision. Focus. Victory.</h1>
           <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', marginBottom: '40px', opacity: 0.9, maxWidth: '600px' }}>Elevate your archery skills and hit your mark with confidence at our premier academy.</p>
           <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '15px 40px', borderRadius: '4px', fontWeight: '800', textDecoration: 'none', fontSize: '15px' }}>
                Join Now
              </Link>
              <Link to="/programs" style={{ border: '2px solid white', color: 'white', backgroundColor: 'rgba(255,255,255,0.1)', padding: '14px 40px', borderRadius: '4px', fontWeight: '800', textDecoration: 'none', fontSize: '15px' }}>
                Explore Training
              </Link>
           </div>
        </div>

        <div className="desktop-only" style={{ 
          position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100px', 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%23ffffff\' fill-opacity=\'1\' d=\'M0,224L60,192C120,160,240,96,360,101.3C480,107,600,181,720,213.3C840,245,960,235,1080,202.7C1200,171,1320,117,1380,90.7L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E")',
          backgroundSize: '100% 100%'
        }} />
      </section>

      {/* ================================================================ */}
      {/* MISSION STATEMENT                                                */}
      {/* ================================================================ */}
      <section className="section-wrapper" style={{ backgroundColor: '#ffffff', padding: '100px 20px', textAlign: 'center' }}>
         <div className="site-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#3B82F6', letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginBottom: '15px' }}>
               UNLEASH YOUR POTENTIAL. AIM WITH PURPOSE. ACHIEVE EXCELLENCE.
            </span>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', color: '#0F172A', marginBottom: '30px', letterSpacing: '-1px' }}>
               Where Passion Meets Precision
            </h2>
            <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.8', marginBottom: '20px', fontWeight: '600' }}>
               Every champion once stood on the shooting line as a beginner.
            </p>
            <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.8', marginBottom: '20px', textAlign: 'justify' }}>
               Whether you're discovering archery for the first time, striving to improve your technique, or pursuing excellence at the national and international level, your journey deserves expert guidance, structured development, and unwavering support.
            </p>
            <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.8', marginBottom: '20px', textAlign: 'justify' }}>
               Our academy combines international coaching standards with scientific training methodologies to develop confident, disciplined, and high-performing archers.
            </p>
             <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.8', marginBottom: '20px', textAlign: 'justify' }}>
              Our mission extends beyond producing skilled archers—we strive to nurture resilient individuals who embody focus, integrity, perseverance, and sportsmanship.
            </p>
            <p style={{ fontSize: '18px', color: '#1E40AF', lineHeight: '1.8', fontWeight: '800', marginTop: '30px' }}>
               Every arrow is a step towards becoming the best version of yourself.
            </p>
         </div>
      </section>

      {/* ================================================================ */}
      {/* MEET YOUR COACH                                                  */}
      {/* ================================================================ */}
      <section className="section-wrapper" style={{ backgroundColor: '#f8fafc', padding: '100px 20px' }}>
         <div className="site-container" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '50px', alignItems: 'center' }}>

            <div style={{ flex: '1 1 400px' }}>
               <span style={{ fontSize: '13px', fontWeight: '800', color: '#1E40AF', letterSpacing: '2px', textTransform: 'uppercase' }}>Meet Your Coach</span>
               <h2 style={{ fontSize: 'clamp(32px, 4vw, 42px)', fontWeight: '900', color: '#0F172A', margin: '10px 0 15px', letterSpacing: '-1px' }}>Coach Keerthana L</h2>
               <p style={{ color: '#3B82F6', fontWeight: '800', fontSize: '14px', marginBottom: '30px' }}>
                  National Medallist • World Archery Level 1 Coach • High Performance Coach
               </p>
               <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.8', marginBottom: '20px', textAlign: 'justify' }}>
                  With years of competitive experience and professional coaching education, I understand that success in archery is built on much more than natural talent.
               </p>
               <p style={{ color: '#0F172A', fontSize: '16px', lineHeight: '1.8', marginBottom: '20px', textAlign: 'justify', fontWeight: '800' }}>
                  It requires patience, discipline, proper guidance, scientific planning, and a coach who believes in every athlete's potential.
               </p>
               <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.8', marginBottom: '20px', textAlign: 'justify' }}>
                  Having competed at National Championships, National Games, State Olympics, and All India University Championships, I have experienced both the challenges and rewards of competitive archery. Today, my greatest achievement lies in helping athletes discover their abilities, overcome limitations, and achieve goals they once believed impossible.
               </p>
               <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', borderLeft: '4px solid #1E40AF', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', marginTop: '30px' }}>
                  <p style={{ fontWeight: '800', color: '#0F172A', marginBottom: '10px', fontSize: '16px' }}>My coaching philosophy is simple:</p>
                  <p style={{ fontWeight: '900', color: '#1E40AF', fontSize: '18px', fontStyle: 'italic', marginBottom: '15px' }}>"Develop the athlete before developing the champion."</p>
                  <p style={{ color: '#64748B', fontSize: '14px', lineHeight: '1.7' }}>
                     Every athlete receives personalised attention, structured progression, constructive feedback, and a positive environment where learning remains enjoyable while excellence becomes achievable.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* ================================================================ */}
      {/* VISION & WHY CHOOSE US                                           */}
      {/* ================================================================ */}
      <section className="section-wrapper" style={{ backgroundColor: '#ffffff', padding: '100px 20px' }}>
         <div className="site-container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '50px' }}>
            <div style={{ backgroundColor: '#0F172A', color: 'white', padding: '50px', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <span style={{ fontSize: '13px', fontWeight: '800', color: '#3B82F6', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '15px' }}>Our Vision</span>
               <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: '900', marginBottom: '30px', lineHeight: '1.3' }}>To develop technically proficient, mentally resilient, and physically prepared athletes.</h2>
               <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', lineHeight: '1.8' }}>
                  Capable of competing with confidence on the international stage and striving for podium finishes through sustained excellence and commitment.
               </p>
            </div>
            
            <div>
               <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: '900', color: '#0F172A', marginBottom: '20px' }}>Why Train With Us?</h2>
               <p style={{ color: '#64748B', fontSize: '15px', lineHeight: '1.7', marginBottom: '30px' }}>
                  Our coaching is built on internationally recognised best practices that place the athlete at the centre of every training decision. Every program incorporates:
               </p>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  {[
                     "Internationally Qualified Coaching", "National-Level Competitive Experience", "Scientific Coaching Methodology",
                     "Safe and Positive Learning Environment", "Individual Attention", "Progressive Athlete Development",
                     "Performance Monitoring", "Long-Term Athlete Development", "Character Building Through Sport", "Commitment to Excellence",
                     "Technical video analysis", "Mental performance and focus training", "Physical conditioning for archery"
                  ].map((item, idx) => (
                     <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <CheckCircle size={18} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ color: '#475569', fontSize: '14px', fontWeight: '600' }}>{item}</span>
                     </div>
                  ))}
               </div>
               <p style={{ color: '#0F172A', fontSize: '15px', fontWeight: '800', marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                  Our objective is not merely to teach archery, but to help athletes develop the confidence, discipline, and resilience required for success both on and off the field.
               </p>
            </div>
         </div>
      </section>

      {/* ================================================================ */}
      {/* PHILOSOPHY & PATHWAY                                             */}
      {/* ================================================================ */}
      <section className="section-wrapper" style={{ backgroundColor: '#f8fafc', padding: '100px 20px', textAlign: 'center' }}>
         <div className="site-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#1E40AF', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '15px', display: 'block' }}>Our Athlete Development Philosophy</span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: '900', color: '#0F172A', marginBottom: '25px', letterSpacing: '-0.5px' }}>Archery is a lifelong journey of continuous learning.</h2>
            <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', marginBottom: '15px', textAlign: 'justify' }}>
               Rather than rushing athletes towards competition, we believe in building strong fundamentals, reinforcing correct technique, and progressively developing physical, technical, tactical, and mental abilities.
            </p>
            <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', marginBottom: '15px', textAlign: 'justify' }}>
               Our structured pathway ensures every athlete advances with confidence, consistency, and purpose. Whether your ambition is recreational shooting, state championships, national competitions, or representing India internationally, every journey begins with mastering the fundamentals.
            </p>
            
            <div style={{ marginTop: '60px' }}>
               <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', marginBottom: '40px' }}>Athlete Development Pathway</h3>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', position: 'relative' }}>
                  {/* Line connecting steps */}
                  <div className="desktop-only" style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '3px', backgroundColor: '#e2e8f0', zIndex: 1 }}></div>
                  
                  {['Discover', 'Learn', 'Develop', 'Compete', 'Excel'].map((step, idx) => (
                     <div key={idx} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 100px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#1E40AF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px', marginBottom: '15px', border: '4px solid #f8fafc' }}>
                           {idx + 1}
                        </div>
                        <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>{step}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* ================================================================ */}
      {/* DETAILED PROGRAMS                                                */}
      {/* ================================================================ */}
      <section className="section-wrapper" style={{ backgroundColor: '#ffffff', padding: '100px 20px' }}>
         <div className="site-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
               <span style={{ fontSize: '13px', fontWeight: '800', color: '#3B82F6', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '15px' }}>Our Programs</span>
               <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', color: '#0F172A', marginBottom: '20px', letterSpacing: '-1px' }}>A Structured Pathway to Excellence.</h2>
               <p style={{ fontSize: '16px', color: '#64748B', maxWidth: '700px', margin: '0 auto' }}>Every athlete progresses through carefully designed stages of development, ensuring they acquire the right skills at the right time.</p>
            </div>

            <div style={{ display: 'grid', gap: '60px' }}>
               {/* Program 1 */}
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '40px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                  <div style={{ flex: '1 1 300px' }}>
                     <div style={{ backgroundColor: '#eff6ff', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E40AF', marginBottom: '20px' }}><Shield size={30} /></div>
                     <span style={{ color: '#1E40AF', fontWeight: '800', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>DURATION: 3 MONTHS</span>
                     <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', margin: '10px 0 15px' }}>Basic Beginners Program</h3>
                     <p style={{ color: '#0F172A', fontWeight: '700', fontSize: '16px', marginBottom: '20px' }}>Build Strong Fundamentals. Build Lifelong Confidence.</p>
                     <p style={{ color: '#64748B', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px', textAlign: 'justify' }}>
                        Designed for complete beginners, this program introduces the essential principles of archery in a safe, enjoyable, and structured environment. Athletes develop correct habits from the very beginning, creating a strong technical foundation that supports future progress.
                     </p>
                  </div>
                  <div style={{ flex: '1 1 300px', backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                     <h4 style={{ fontSize: '15px', fontWeight: '900', color: '#0F172A', marginBottom: '15px' }}>What You'll Learn</h4>
                     <ul style={{ color: '#475569', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '20px' }}>
                        <li>Introduction to Olympic-style archery</li>
                        <li>Range safety and etiquette</li>
                        <li>Proper shooting posture and alignment</li>
                        <li>11 Fundamentals steps & Bow handling</li>
                        <li>Basic scoring and target awareness</li>
                     </ul>
                     <h4 style={{ fontSize: '15px', fontWeight: '900', color: '#0F172A', marginBottom: '15px' }}>Best Suited For</h4>
                     <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.8' }}>Children (6+), Teenagers, Adults, and Absolute beginners.</p>
                  </div>
               </div>

               {/* Program 2 */}
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '40px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                  <div style={{ flex: '1 1 300px' }}>
                     <div style={{ backgroundColor: '#eff6ff', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E40AF', marginBottom: '20px' }}><Star size={30} /></div>
                     <span style={{ color: '#1E40AF', fontWeight: '800', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>DEVELOPMENT STAGE</span>
                     <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', margin: '10px 0 15px' }}>Intermediate Development</h3>
                     <p style={{ color: '#0F172A', fontWeight: '700', fontSize: '16px', marginBottom: '20px' }}>Transform Fundamentals into Consistency.</p>
                     <p style={{ color: '#64748B', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px', textAlign: 'justify' }}>
                        Once athletes establish a solid foundation, they progress to developing consistency, efficiency, and technical refinement. Training becomes more individualised, enabling athletes to understand not only how to shoot correctly but also why every movement matters.
                     </p>
                  </div>
                  <div style={{ flex: '1 1 300px', backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                     <h4 style={{ fontSize: '15px', fontWeight: '900', color: '#0F172A', marginBottom: '15px' }}>Program Highlights</h4>
                     <ul style={{ color: '#475569', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
                        <li>Advanced shooting mechanics & consistency</li>
                        <li>Video-assisted technical analysis</li>
                        <li>Equipment understanding and tuning</li>
                        <li>Strength, endurance, and coordination</li>
                        <li>Introduction to mental preparation</li>
                     </ul>
                  </div>
               </div>

               {/* Program 3 */}
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '40px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                  <div style={{ flex: '1 1 300px' }}>
                     <div style={{ backgroundColor: '#eff6ff', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E40AF', marginBottom: '20px' }}><CheckCircle size={30} /></div>
                     <span style={{ color: '#1E40AF', fontWeight: '800', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>COMPETITIVE TRACK</span>
                     <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', margin: '10px 0 15px' }}>Advanced Competition</h3>
                     <p style={{ color: '#0F172A', fontWeight: '700', fontSize: '16px', marginBottom: '20px' }}>Prepare. Compete. Perform.</p>
                     <p style={{ color: '#64748B', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px', textAlign: 'justify' }}>
                        Designed for athletes aspiring to compete at district, state, and national levels. Training focuses on transforming technically sound archers into confident competitors through structured preparation, tactical awareness, and performance optimisation.
                     </p>
                  </div>
                  <div style={{ flex: '1 1 300px', backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                     <h4 style={{ fontSize: '15px', fontWeight: '900', color: '#0F172A', marginBottom: '15px' }}>Program Highlights</h4>
                     <ul style={{ color: '#475569', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
                        <li>Competition-specific training plans</li>
                        <li>Tournament preparation & Match-play strategies</li>
                        <li>Performance data analysis</li>
                        <li>Advanced biomechanical corrections</li>
                        <li>Pressure simulation & Mental resilience</li>
                     </ul>
                  </div>
               </div>

               {/* Program 4 */}
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '40px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                  <div style={{ flex: '1 1 300px' }}>
                     <div style={{ backgroundColor: '#eff6ff', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E40AF', marginBottom: '20px' }}><Award size={30} /></div>
                     <span style={{ color: '#1E40AF', fontWeight: '800', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>HIGH PERFORMANCE</span>
                     <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', margin: '10px 0 15px' }}>Elite Performance</h3>
                     <p style={{ color: '#0F172A', fontWeight: '700', fontSize: '16px', marginBottom: '20px' }}>Developing Tomorrow's International Champions.</p>
                     <p style={{ color: '#64748B', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px', textAlign: 'justify' }}>
                        Our highest level of coaching is designed for dedicated athletes pursuing excellence at the national and international levels. This high-performance program combines sports science, advanced coaching methodologies, and individualised performance planning.
                     </p>
                  </div>
                  <div style={{ flex: '1 1 300px', backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                     <h4 style={{ fontSize: '15px', fontWeight: '900', color: '#0F172A', marginBottom: '15px' }}>Elite Coaching Includes</h4>
                     <ul style={{ color: '#475569', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
                        <li>Long-term performance planning</li>
                        <li>International-standard methodology</li>
                        <li>Individualised periodisation</li>
                        <li>Advanced biomechanics & Analytics</li>
                        <li>Peak performance preparation</li>
                     </ul>
                  </div>
               </div>
               
               {/* ================================================================ */}
               {/* CORPORATE ARCHERY EXPERIENCE                                     */}
               {/* ================================================================ */}
               <div style={{ backgroundColor: '#0F172A', color: 'white', padding: '60px', borderRadius: '24px', marginTop: '40px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
                     <div style={{ flex: '1 1 400px' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '20px' }}><Users size={30} /></div>
                        <h3 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: '900', marginBottom: '15px' }}>Corporate Archery Experience</h3>
                        <p style={{ color: '#3B82F6', fontWeight: '800', fontSize: '18px', marginBottom: '25px' }}>Inspiring Teams Through Focus, Precision, and Collaboration</p>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px', textAlign: 'justify' }}>
                           Looking for a unique and engaging team-building activity that goes beyond conventional corporate events? Our Corporate Archery Experience combines the excitement of archery with valuable lessons in focus, communication, leadership, decision-making, and teamwork.
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px', textAlign: 'justify' }}>
                           Designed and conducted by certified coaches, each session provides a safe, professionally managed environment where participants of all skill levels can learn, compete, and connect. Whether you're planning an employee engagement activity, leadership retreat, annual off-site, wellness initiative, or client appreciation event, our programmes are tailored to create memorable experiences while strengthening team dynamics.
                        </p>
                        <h4 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '15px', marginTop: '30px' }}>Why Choose Archery for Team Building?</h4>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px' }}>
                           Archery is more than just hitting a target. It develops qualities that are equally valuable in the workplace. Participants naturally experience and practise:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                           {["Focus under pressure", "Goal setting and execution", "Patience and self-discipline", "Strategic thinking", "Confidence building", "Effective communication", "Team collaboration", "Problem-solving", "Emotional control", "Continuous improvement"].map((item, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                                 <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3B82F6' }}></div>
                                 {item}
                              </div>
                           ))}
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: '1.7', marginBottom: '30px', textAlign: 'justify' }}>
                           Every arrow offers immediate feedback, helping participants understand how preparation, concentration, and consistency lead to better outcomes—both on the range and in the workplace.
                        </p>
                        <h4 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '15px', marginTop: '30px' }}>Create an Unforgettable Experience</h4>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px', textAlign: 'justify' }}>
                           Give your team the opportunity to step away from their daily routine, discover a new skill, and strengthen workplace relationships through an engaging and rewarding archery experience.
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: '1.7', marginBottom: '30px', textAlign: 'justify' }}>
                           Contact us today to design a customised Corporate Archery Event for your organisation.
                        </p>
                        <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: '#3B82F6', color: 'white', padding: '15px 30px', borderRadius: '4px', textDecoration: 'none', fontWeight: '800', fontSize: '15px' }}>
                           Contact Us <ArrowRight size={18} />
                        </Link>
                     </div>
                     <div style={{ flex: '1 1 300px' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '30px' }}>
                           <h4 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '15px', color: 'white' }}>Program Highlights</h4>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {[
                                 "Professionally conducted by internationally certified coaches",
                                 "Safe and structured sessions for beginners",
                                 "All equipment provided",
                                 "Fun individual and team-based challenges",
                                 "Leadership and communication activities",
                                 "Friendly competitions with scoring formats",
                                 "Indoor and outdoor event options",
                                 "Suitable for small teams and large corporate groups",
                                 "Customisable programmes based on event objectives",
                                 "Beginner-friendly instruction"
                              ].map((item, i) => (
                                 <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.5' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3B82F6', flexShrink: 0, marginTop: '7px' }}></div>
                                    <span>{item}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                           <h4 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '15px', color: 'white' }}>Ideal For</h4>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {[
                                 "Corporate Team Building",
                                 "Employee Engagement Activities",
                                 "Annual Day Celebrations",
                                 "Off-site Retreats",
                                 "Wellness and Stress Management Initiatives"
                              ].map((item, i) => (
                                 <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.5' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3B82F6', flexShrink: 0, marginTop: '7px' }}></div>
                                    <span>{item}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* ================================================================ */}
               {/* ARCHERY WORKSHOPS                                                */}
               {/* ================================================================ */}
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '40px', borderRadius: '24px', border: '1px solid #f1f5f9', marginTop: '60px' }}>
                  <div style={{ flex: '1 1 400px' }}>
                     <div style={{ backgroundColor: '#eff6ff', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E40AF', marginBottom: '20px' }}><Briefcase size={30} /></div>
                     <h3 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: '900', color: '#0F172A', marginBottom: '15px' }}>Archery Workshops & Skill Development</h3>
                     <p style={{ color: '#0F172A', fontWeight: '700', fontSize: '18px', marginBottom: '20px' }}>Learn from Experts. Improve with Purpose.</p>
                     <p style={{ color: '#64748B', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px', textAlign: 'justify' }}>
                        Our workshops are designed to provide focused learning experiences for athletes, coaches, educators, and sports enthusiasts. Each workshop combines practical training with scientific coaching principles, enabling participants to deepen their understanding of the sport and accelerate their development.
                     </p>
                     <p style={{ color: '#64748B', fontSize: '15px', lineHeight: '1.7', marginBottom: '30px', textAlign: 'justify' }}>
                        Whether you're new to archery or looking to refine advanced skills, our workshops deliver valuable insights that extend beyond regular coaching sessions.
                     </p>
                     <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: '#1E40AF', color: 'white', padding: '15px 30px', borderRadius: '4px', textDecoration: 'none', fontWeight: '800', fontSize: '15px' }}>
                        Explore Workshops <ArrowRight size={18} />
                     </Link>
                  </div>
                  <div style={{ flex: '1 1 300px' }}>
                     <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', marginBottom: '30px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '900', color: '#0F172A', marginBottom: '15px' }}>Workshop Topics</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                           {[
                              "Beginner Archery Workshops",
                              "Technical Skill Seminar",
                              "Sports Science for Archery",
                              "Strength and conditioning",
                              "Mental Performance Workshops",
                              "Equipment Workshops",
                              "Competition Preparation Clinics"
                           ].map((item, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
                                 <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1E40AF', flexShrink: 0, marginTop: '7px' }}></div>
                                 <span>{item}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                     <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '900', color: '#0F172A', marginBottom: '15px' }}>Who Can Attend?</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                           {[
                              "Beginners",
                              "Competitive archers",
                              "Coaches",
                              "Physical education teachers",
                              "Schools and colleges",
                              "Sports academies",
                              "Corporate groups",
                              "Parents interested in supporting young athletes"
                           ].map((item, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
                                 <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1E40AF', flexShrink: 0, marginTop: '7px' }}></div>
                                 <span>{item}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

            </div>
         </div>
      </section>

      {/* ================================================================ */}
      {/* FINAL CTA                                                        */}
      {/* ================================================================ */}
      <section className="section-wrapper" style={{ backgroundColor: '#1E40AF', padding: '100px 20px', textAlign: 'center', color: 'white' }}>
         <div className="site-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', marginBottom: '30px', letterSpacing: '-1px' }}>Begin Your Journey Today</h2>
            <p style={{ fontSize: '18px', lineHeight: '1.8', marginBottom: '20px', opacity: 0.9 }}>
               Every archer has a unique story. Some aspire to enjoy a rewarding recreational sport. Some dream of representing their state. Others aspire to wear the Indian colours on the world stage.
            </p>
            <p style={{ fontSize: '18px', lineHeight: '1.8', marginBottom: '40px', opacity: 0.9, fontWeight: '700' }}>
               Whatever your goal, we are committed to providing the knowledge, guidance, and encouragement to help you pursue it with confidence.
            </p>
            <p style={{ fontSize: '22px', fontWeight: '900', marginBottom: '40px' }}>
               Take the first step today. Train with purpose, grow with confidence, and discover what you are truly capable of.
            </p>
            <Link to="/register" style={{ backgroundColor: 'white', color: '#1E40AF', padding: '20px 50px', borderRadius: '4px', fontWeight: '900', fontSize: '16px', textDecoration: 'none', display: 'inline-block', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
               START TRAINING
            </Link>
         </div>
      </section>

      {/* ================================================================ */}
      {/* 2. RUNNING PROGRAM SLIDES (RESPONSIVE)                         */}
      {/* ================================================================ */}
      <section style={{ backgroundColor: '#f8fafc', padding: 'clamp(60px, 10vw, 120px) 0', overflow: 'hidden' }}>
         <div className="site-container" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#1E40AF', letterSpacing: '4px' }}>TRAINING PATHWAY</span>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '900', letterSpacing: '-0.02em', marginTop: '15px' }}>THE ARCHERY ELITE 10</h2>
         </div>
         
         <div style={{ position: 'relative', width: '100%' }}>
            <div className="slider-track" style={{ 
               display: 'flex', 
               gap: '30px', 
               padding: '0 5%',
               overflowX: 'auto',
               scrollSnapType: 'x mandatory',
               scrollbarWidth: 'none',
               msOverflowStyle: 'none',
               WebkitOverflowScrolling: 'touch'
            }}>
               {(displayPrograms.length > 0 ? displayPrograms : curriculum).map((p, i) => (
                  <div key={p._id || i} style={{ 
                      minWidth: 'clamp(280px, 85vw, 400px)', 
                      scrollSnapAlign: 'center',
                      backgroundColor: 'white', 
                      padding: 'clamp(24px, 6vw, 40px)', 
                      borderRadius: '24px', 
                      border: '1px solid #f1f5f9',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column'
                  }}>
                     <div style={{ backgroundColor: '#eff6ff', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px', color: '#1E40AF' }}>
                        {p.icon || <Globe size={24} />}
                     </div>
                     <h3 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '15px' }}>{p.title || p.name}</h3>
                     <p style={{ color: '#64748B', lineHeight: '1.4', fontSize: '15px', marginBottom: '35px', flexGrow: 1, textAlign: 'justify' }}>{p.description || p.desc}</p>
                     <Link to={`/register${p._id ? `?programId=${p._id}` : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: '#1E40AF', color: 'white', padding: '16px 35px', borderRadius: '4px', textDecoration: 'none', fontWeight: '800', fontSize: '14px', width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
                        Register here <ArrowRight size={18} />
                     </Link>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* ================================================================ */}
      {/* 3. UPCOMING EVENTS (RESPONSIVE)                                */}
      {/* ================================================================ */}
      <section className="section-wrapper" style={{ backgroundColor: '#ffffff' }}>
        <h2 className="section-title" style={{ fontWeight: '900', color: '#003366', marginBottom: '50px' }}>Upcoming Events</h2>
        <div className="grid-3-2-1">
          {[
            { img: p3, title: 'National Archery Championship', date: 'June 15, 2026' },
            { img: p1, title: 'Youth Archery Tournament', date: 'July 12, 2026' },
            { img: p2, title: 'International Open Cup', date: 'August 20, 2026' }
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
              <div style={{ height: '200px' }}><img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
              <div style={{ padding: '30px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#003366', marginBottom: '10px' }}>{item.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px', marginBottom: '20px' }}>
                  <Calendar size={16} /> {item.date}
                </div>
                <Link to="/contact" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '10px 20px', borderRadius: '4px', fontWeight: '800', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Learn More <ChevronDown size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 4. WORLD-CLASS INFRASTRUCTURE (RESPONSIVE)                   */}
      {/* ================================================================ */}
      <section className="section-wrapper" style={{ backgroundColor: '#fcfcfc' }}>
        <div className="infra-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(30px, 5vw, 80px)', alignItems: 'center' }}>
           <div style={{ position: 'relative' }}>
              <img src="/ref-hero.png" alt="Range" style={{ width: '100%', borderRadius: '16px', border: '1px solid #f1f5f9' }} />
              <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: '#1E40AF', color: 'white', padding: '12px 20px', borderRadius: '4px', fontSize: '11px', fontWeight: '900', letterSpacing: '2px' }}>OLYMPIC DISTANCE</div>
           </div>
           <div>
              <h3 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '900', marginBottom: '30px', lineHeight: '1.2' }}>SCIENTIFIC TRAINING <br/> <span style={{ color: '#3B82F6' }}>INFRASTRUCTURE.</span></h3>
           </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 5. TESTIMONIALS (RESPONSIVE)                                  */}
      {/* ================================================================ */}
      <section className="section-wrapper">
        <h2 className="section-title" style={{ fontWeight: '900', color: '#003366', marginBottom: '60px' }}>What Our Archers Say</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          {[
            { name: 'Emily R.', role: 'Professional Archer', quote: 'The best training experience I\'ve ever had. Truly elevated my game!' },
            { name: 'Mark T.', role: 'Competitive Shooter', quote: 'Top-notch coaching and fantastic equipment selection!' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '30px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
               <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#003366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                 <User size={40} />
               </div>
               <div>
                 <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#003366', marginBottom: '5px' }}>{item.name}</h4>
                 <p style={{ color: '#1E40AF', fontSize: '12px', fontWeight: '700', marginBottom: '10px' }}>{item.role}</p>
                 <p style={{ color: '#64748B', fontSize: '15px', fontStyle: 'italic' }}>"{item.quote}"</p>
               </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="site-container">
        <BannersDisplay placement="Home Page" position="Bottom" />
      </div>
    </div>
  );
};

export default Home;
