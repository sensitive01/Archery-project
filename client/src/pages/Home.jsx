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
                     <p style={{ color: '#64748B', lineHeight: '1.6', fontSize: '15px', marginBottom: '35px', flexGrow: 1 }}>{p.description || p.desc}</p>
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
