import React from "react";
import { Briefcase, Heart, Rocket, Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Careers = () => {
  const jobs = [
    { title: "Senior Archery Coach", type: "Full-Time", location: "Bengaluru, HQ", desc: "Lead our elite squad training and develop world-class athletes." },
    { title: "Sports Physiotherapist", type: "Full-Time", location: "Bengaluru, HQ", desc: "Specialize in archery biomechanics and athlete recovery." },
    { title: "Academy Operations Manager", type: "Contract", location: "Remote", desc: "Oversee scheduling and international event logistics." }
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Outfit', sans-serif", color: '#0F172A', overflowX: 'hidden' }}>
      {/* HERO */}
      <section style={{ 
          position: 'relative', 
          minHeight: '80vh', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'white',
          padding: '120px 5% 80px',
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(30, 64, 175, 0.5)), url('/ref-banner.png')`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
      }}>
        <div style={{ animation: 'fadeInDown 0.8s ease', maxWidth: '900px' }}>
           <div style={{ 
               display: 'inline-block',
               backgroundColor: 'rgba(59, 130, 246, 0.15)',
               padding: '8px 24px',
               borderRadius: '100px',
               backdropFilter: 'blur(10px)',
               border: '1px solid rgba(59, 130, 246, 0.3)',
               marginBottom: '20px'
           }}>
              <span style={{ fontSize: '12px', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase', color: '#3ABEF9' }}>JOIN THE ELITE</span>
           </div>
           <h1 style={{ fontSize: 'clamp(36px, 8vw, 72px)', fontWeight: '900', margin: '0 0 20px', letterSpacing: '-2px', lineHeight: '1.1' }}>BUILD YOUR CAREER <br className="desktop-only"/> WITH US</h1>
           <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.8)', maxWidth: '750px', margin: '0 auto' }}>Help us shape the future of competitive archery on a global stage. We are looking for passionate individuals to join our world-class team.</p>
        </div>
      </section>

      {/* REASONS */}
      <section className="section-wrapper" style={{ backgroundColor: '#f8fafc' }}>
         <div className="site-container">
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
               <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '900', marginBottom: '15px' }}>Why Join Archery Academy?</h2>
               <p style={{ color: '#64748B', maxWidth: '600px', margin: '0 auto' }}>We offer more than just a job; we offer a path to excellence in sports management and coaching.</p>
            </div>
            <div className="grid-3-2-1">
               {[
                  { icon: <Briefcase size={32} />, title: "Elite Mentorship", desc: "Work alongside Olympic-level coaches and industry experts." },
                  { icon: <Heart size={32} />, title: "Athlete First", desc: "Impact the lives of thousands of aspiring archers globally." },
                  { icon: <Rocket size={32} />, title: "Global Scale", desc: "Contribute to a platform redefining international archery standards." }
               ].map((v, i) => (
                  <div key={i} style={{ backgroundColor: 'white', padding: '40px 30px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                     <div style={{ color: '#1E40AF', marginBottom: '25px' }}>{v.icon}</div>
                     <h4 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '15px' }}>{v.title}</h4>
                     <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.7', margin: 0 }}>{v.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* OPEN POSITIONS */}
      <section className="section-wrapper">
         <div className="site-container" style={{ maxWidth: '1000px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '900', marginBottom: '50px', textAlign: 'center' }}>Open Positions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               {jobs.map((job, i) => (
                  <div key={i} style={{ 
                      backgroundColor: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #f1f5f9', 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                      flexWrap: 'wrap', gap: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                      transition: 'all 0.3s'
                  }}>
                     <div style={{ flex: '1', minWidth: '250px' }}>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px' }}>
                           <span style={{ fontSize: '10px', fontWeight: '900', color: '#1E40AF', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '4px', letterSpacing: '1px' }}>{job.type}</span>
                           <span style={{ fontSize: '10px', fontWeight: '900', color: '#64748B', letterSpacing: '1px' }}>{job.location}</span>
                        </div>
                        <h4 style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', marginBottom: '10px' }}>{job.title}</h4>
                        <p style={{ color: '#64748B', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>{job.desc}</p>
                     </div>
                     <button style={{ backgroundColor: '#1E40AF', color: 'white', padding: '15px 40px', borderRadius: '4px', border: 'none', fontWeight: '900', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', width: window.innerWidth < 640 ? '100%' : 'auto', justifyContent: 'center' }}>
                        APPLY NOW <ArrowRight size={18} />
                     </button>
                  </div>
               ))}
            </div>
         </div>
      </section>

      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Careers;
