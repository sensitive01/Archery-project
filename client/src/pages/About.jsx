import React from "react";
import { Target, Award, Users, Shield, CheckCircle, ArrowRight, Star, Heart } from "lucide-react";
import { Link } from "react-router-dom";

// ASSETS
const heroImg = "/ref-banner.png";
const storyImg = "/ref-prog3.png";

const About = () => {
  const stats = [
    { label: "Students Trained", value: "5,000+" },
    { label: "Medals Won", value: "120+" },
    { label: "Expert Coaches", value: "15+" },
    { label: "Years Experience", value: "10+" }, 
  ];

  const values = [
    { icon: <Target size={30} />, title: "Precision", desc: "Every technical detail is measured for absolute consistency." },
    { icon: <Heart size={30} />, title: "Passion", desc: "Building a lifelong dedication to the art of the bow." },
    { icon: <Users size={30} />, title: "Community", desc: "A supportive ecosystem of athletes at every level." },
    { icon: <Star size={30} />, title: "Excellence", desc: "Holding our standards to the global podium level." }
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0F172A', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' }}>
      
      {/* ================================================================ */}
      {/* 1. HERO SECTION (RESPONSIVE)                                    */}
      {/* ================================================================ */}
      <section style={{ 
          position: 'relative', 
          minHeight: '60vh', 
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(30, 64, 175, 0.4)), url('${heroImg}')`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          textAlign: 'center',
          color: 'white',
          padding: '80px 5%'
      }}>
        <div style={{ animation: 'fadeInDown 0.8s ease' }}>
           <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '4px', textTransform: 'uppercase', color: '#3B82F6' }}>FOUNDED 2014</span>
           <h1 style={{ fontSize: 'clamp(36px, 8vw, 72px)', fontWeight: '900', margin: '15px 0', letterSpacing: '-2px' }}>OUR LEGACY</h1>
           <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', maxWidth: '600px', margin: '0 auto', opacity: 0.9 }}>Building champions through the science of precision and absolute discipline.</p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 2. STATS (RESPONSIVE OVERLAP)                                   */}
      {/* ================================================================ */}
      <section className="section-wrapper" style={{ marginTop: '-80px', position: 'relative', zIndex: 10 }}>
        <div className="site-container" style={{ 
            backgroundColor: 'white', 
            borderRadius: '24px', 
            boxShadow: '0 40px 100px rgba(0,0,0,0.08)', 
            padding: 'clamp(30px, 5vw, 60px)', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            textAlign: 'center',
            border: '1px solid #f1f5f9',
            gap: '30px'
        }}>
           {stats.map((stat, i) => (
             <div key={i} style={{ padding: '10px' }}>
                <h4 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', color: '#1E40AF', margin: 0 }}>{stat.value}</h4>
                <p style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '10px' }}>{stat.label}</p>
             </div>
           ))}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 3. STORY SECTION (RESPONSIVE)                                   */}
      {/* ================================================================ */}
      <section className="section-wrapper">
         <div className="site-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '80px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
               <img src={storyImg} alt="Story" style={{ width: '100%', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} />
               <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', backgroundColor: '#1E40AF', color: 'white', padding: '30px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                  <Award size={32} style={{ marginBottom: '10px' }} />
                  <p style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '2px', lineHeight: '1.4', margin: 0 }}>10+ YEARS<br/>OF MASTERY</p>
               </div>
            </div>
            
            <div>
               <span style={{ fontSize: '12px', fontWeight: '800', color: '#1E40AF', letterSpacing: '4px', textTransform: 'uppercase' }}>The Institution</span>
               <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '900', margin: '20px 0 30px', lineHeight: '1.1' }}>BUILDING CHAMPIONS <br/> <span style={{ color: '#3B82F6' }}>SINCE DAY ONE.</span></h2>
               <p style={{ color: '#64748B', lineHeight: '1.8', fontSize: '16px', marginBottom: '25px' }}>
                  Founded by a collective of former Olympic coaches, our academy was built on a single conviction: Archery is a science of the mind as much as the body. 
               </p>
               <p style={{ color: '#64748B', lineHeight: '1.8', fontSize: '16px', marginBottom: '35px' }}>
                  From a small regional club to a world-class training center, we have spent the last decade refining our biomechanical training models to help every student achieve their highest possible score.
               </p>
               <Link to="/gallery" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#1E40AF', fontWeight: '800', textDecoration: 'none', fontSize: '15px' }}>
                  EXPLORE OUR FACILITIES <ArrowRight size={20} />
               </Link>
            </div>
         </div>
      </section>

      {/* ================================================================ */}
      {/* 4. VALUES (RESPONSIVE GRID)                                     */}
      {/* ================================================================ */}
      <section className="section-wrapper" style={{ backgroundColor: '#f8fafc' }}>
         <div className="site-container">
            <h2 className="section-title" style={{ fontWeight: '900', textAlign: 'center', marginBottom: '60px' }}>CORE PRINCIPLES</h2>
            <div className="grid-4-2-1">
               {values.map((v, i) => (
                  <div key={i} style={{ backgroundColor: 'white', padding: '40px 30px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                     <div style={{ color: '#1E40AF', marginBottom: '25px' }}>{v.icon}</div>
                     <h4 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '15px' }}>{v.title}</h4>
                     <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.7', margin: 0 }}>{v.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* ================================================================ */}
      {/* 5. SAFETY & AFFILIATIONS (RESPONSIVE)                          */}
      {/* ================================================================ */}
      <section className="section-wrapper">
         <div className="site-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '80px', alignItems: 'center' }}>
            <div>
               <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(30, 64, 175, 0.05)', color: '#1E40AF', padding: '10px 20px', borderRadius: '4px', fontWeight: '800', fontSize: '11px', letterSpacing: '2px', marginBottom: '30px', textTransform: 'uppercase' }}>
                  <Shield size={16} /> Certified Protocols
               </div>
               <h3 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', marginBottom: '30px', lineHeight: '1.2' }}>SAFETY FIRST. <br/> ALWAYS.</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    "Certified Safety Officers on all ranges",
                    "Mandatory safety orientation for all levels",
                    "Quarterly equipment structural inspections",
                    "International range safety compliance"
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#64748B', fontWeight: '600', fontSize: '14px' }}>
                       <CheckCircle size={18} color="#1E40AF" style={{ flexShrink: 0 }} /> {s}
                    </div>
                  ))}
               </div>
            </div>
            
            <div style={{ backgroundColor: '#0F172A', padding: 'clamp(40px, 5vw, 60px)', borderRadius: '16px', color: 'white', boxShadow: '0 40px 100px rgba(0,0,0,0.1)' }}>
               <h4 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '40px', letterSpacing: '-1px' }}>Global Affiliations</h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    { name: 'World Archery', detail: 'Member Federation' },
                    { name: 'Olympic Council', detail: 'Affiliate Partner' },
                    { name: 'SafeSport USA', detail: 'Certified Center' }
                  ].map((a, i) => (
                    <div key={i} style={{ padding: '20px 25px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                       <div style={{ fontSize: '18px', fontWeight: '800', color: '#3B82F6' }}>{a.name}</div>
                       <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px', marginTop: '8px' }}>{a.detail}</div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* ================================================================ */}
      {/* 6. FINAL CTA (RESPONSIVE)                                      */}
      {/* ================================================================ */}
      <section style={{ backgroundColor: '#1E40AF', padding: '100px 5%', textAlign: 'center', color: 'white' }}>
         <h2 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: '900', letterSpacing: '-2px', marginBottom: '40px' }}>FORGE YOUR LEGACY.</h2>
         <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ backgroundColor: '#0F172A', color: 'white', padding: '18px 50px', borderRadius: '4px', fontWeight: '800', textDecoration: 'none', fontSize: '15px' }}>Enroll Now</Link>
            <Link to="/contact" style={{ border: '2px solid white', color: 'white', padding: '16px 50px', borderRadius: '4px', fontWeight: '800', textDecoration: 'none', fontSize: '15px' }}>Enquire Now</Link>
         </div>
      </section>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default About;
