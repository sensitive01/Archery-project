import React from "react";
import { MapPin, Mail, Phone, CheckCircle, Star, Briefcase, Target, Medal, BookOpen } from "lucide-react";

// ASSETS
const heroImg = "/ref-banner.png";
const coachImg = "/coach-profile.png";

const Coaches = () => {
   return (
      <div style={{ backgroundColor: '#ffffff', color: '#0F172A', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' }}>

         {/* HERO SECTION */}
         <section style={{
            position: 'relative',
            minHeight: '50vh',
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(30, 64, 175, 0.5)), url('${heroImg}')`,
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
               <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '4px', color: '#3B82F6', textTransform: 'uppercase' }}>Expert Mentorship</span>
               <h1 style={{ fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: '900', margin: '15px 0' }}>MEET OUR COACH</h1>
               <p style={{ fontSize: '18px', opacity: 0.8 }}>Guided by National Medallists and World-Class Technical Experts.</p>
            </div>
         </section>

         {/* PRIMARY COACH PROFILE: KEERTHANA . L */}
         <section className="section-wrapper" style={{ marginTop: '-100px', position: 'relative', zIndex: 10 }}>
            <div className="site-container" style={{
               backgroundColor: 'white',
               borderRadius: '24px',
               boxShadow: '0 40px 100px rgba(0,0,0,0.08)',
               display: 'grid',
               gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
               overflow: 'hidden',
               border: '1px solid #f1f5f9'
            }}>
               {/* LEFT: PHOTO & CONTACT */}
               <div style={{ backgroundColor: '#f8fafc', padding: 'clamp(20px, 5vw, 60px)', borderRight: '1px solid #f1f5f9' }}>
                  <div style={{ width: '100%', aspectRatio: '4/5', maxHeight: '450px', borderRadius: '16px', overflow: 'hidden', marginBottom: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                     <img src={coachImg} alt="Keerthana . L" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  {/* <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#1E40AF', marginBottom: '25px', letterSpacing: '1px' }}>CONTACT INFORMATION</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '15px' }}>
                     <MapPin size={18} color="#1E40AF" style={{ flexShrink: 0 }} />
                     <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                        No 187, 46th D Cross, MKS Layout, Lingadeeranahalli, 4th Block, BSK 6th Stage, Bengaluru, Karnataka 560062
                     </p>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <Mail size={18} color="#1E40AF" />
                     <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>klingaraj1928@gmail.com</p>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <Phone size={18} color="#1E40AF" />
                     <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>+91 9353897319</p>
                  </div>
               </div> */}
                  <div>
                     <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#1E40AF', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Star size={20} /> COACHING PHILOSOPHY
                     </h4>
                     <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                           "Provide positive coaching experience",
                           "Drive technical, tactical, and mental development",
                           "Scientific coaching methodology",
                           "Safe, social, fun and fair environment"
                        ].map((item, i) => (
                           <li key={i} style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.6' }}>• {item}</li>
                        ))}
                     </ul>
                  </div>

                  {/* EDUCATION */}
                  <div style={{ marginTop: '50px', backgroundColor: '#eff6ff', padding: '30px', borderRadius: '12px' }}>
                     <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#1E40AF', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BookOpen size={20} /> EDUCATION
                     </h4>
                     <p style={{ margin: '0 0 5px', fontSize: '14px', fontWeight: '800' }}>Master of Commerce (Finance) - Bangalore University</p>
                     <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#64748B' }}>ICWAI (Inter), Institute of Cost and Management Accountants</p>
                  </div>


               </div>

               {/* RIGHT: CONTENT */}
               <div style={{ padding: 'clamp(30px, 5vw, 80px)' }}>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: 'red', letterSpacing: '2px', textTransform: 'uppercase' }}>National Medallist & National Coach  </span>
                  <h2 style={{ fontSize: 'clamp(24px, 8vw, 50px)', fontWeight: '700', color: '#0F172A', margin: '10px 0 40px', lineHeight: '1.1', whiteSpace: 'nowrap' }}>KEERTHANA . L</h2>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '50px' }}>
                     <div >
                        <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#1E40AF', marginBottom: '25px', letterSpacing: '1px' }}>CREDENTIALS</h3>
                        <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                           {[
                              "World Archery Level 1 Coach",
                              "AAI – Level 2 Coach",
                              "NSNIS Diploma in Sports Coaching 2021-22, SAI, Grade A",
                              "Six-Week Certificate Course in Archery from SAI NS NIS – Grade A"
                           ].map((item, i) => (
                              <li key={i} style={{ fontSize: '13px', color: '#475569', fontWeight: '700', display: 'flex', gap: '10px' }}>
                                 <CheckCircle size={14} color="#3B82F6" style={{ marginTop: '2px', flexShrink: 0 }} /> {item}
                              </li>
                           ))}
                        </ul>
                     </div>


                     {/* EXPERTISE */}
                     <div>
                        <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#1E40AF', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                           <Briefcase size={20} /> EXPERTISE
                        </h4>
                        <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                           {[
                              "25+ years of Archery experience",
                              "5+ years of  coaching experience",
                              "Coached at NCOE, Manipur",
                              "Officiated state level & Khelo India competitions"
                           ].map((item, i) => (
                              <li key={i} style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.6' }}>• {item}</li>
                           ))}
                        </ul>
                     </div>
                  </div>

                  {/* RELATED SKILLS */}
                  <div style={{ marginTop: '50px' }}>
                     <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#1E40AF', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Target size={20} /> RELATED SKILLS
                     </h4>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
                        {[
                           "Training periodization", "Performance analysis",
                           "Technical video Lab", "Bio-mechanics",
                           "Strength & Flexibility", "Mental training",
                           "World Archery rules", "Range Management"
                        ].map((item, i) => (
                           <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#475569', fontWeight: '700' }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3B82F6', flexShrink: 0 }}></div>
                              {item}
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* ACCOMPLISHMENTS */}
                  <div style={{ marginTop: '50px' }}>
                     <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#1E40AF', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Medal size={22} /> ACCOMPLISHMENTS
                     </h4>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[
                           { title: "All India University 2003-04", icon: "Gold, Silver, Bronze" },
                           { title: "Sub Junior National 2000", icon: "Overall Champion" },
                           { title: "Karnataka State Olympics", icon: "Multi-Medallist" },
                           { title: "National Games Participation", icon: "National Represent" }
                        ].map((item, i) => (
                           <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                              <span style={{ fontWeight: '700', fontSize: '14px' }}>{item.title}</span>
                              <span style={{ fontSize: '12px', color: '#3B82F6', fontWeight: '800' }}>{item.icon}</span>
                           </div>
                        ))}
                     </div>
                  </div>


               </div>
            </div>
         </section>

         <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      </div>
   );
};

export default Coaches;
