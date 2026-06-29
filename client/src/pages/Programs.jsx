import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, Target, Globe, Star, Users, Zap, Phone, ArrowRight, BookOpen, Clock } from "lucide-react";
import { getAllPrograms } from "../services/programService";

// ASSETS
const heroImg = "/ref-banner.png";

const programsList = [
   { title: "Elite Discovery", level: "ORIENTATION", desc: "A curated 3-day orientation to the physics and biomechanics of modern archery.", icon: Globe },
   { title: "Flexi-Train", level: "ADAPTIVE", desc: "For professionals who need to maintain form without 24/7 attendance. High-stakes drop-in focus.", icon: Target },
   { title: "Junior Core", level: "FOUNDATION", desc: "Building the perfect biomechanical fundamentals from the first arrow. Focus on skeletal alignment.", icon: Users },
   { title: "Olympic Track", level: "PERFORMANCE", desc: "Transitioning to consistency. Mastering the 70m Olympic range with digital scoring analysis.", icon: Star },
   { title: "Data Refinement", level: "TECHNICAL", desc: "High-speed camera tracking for biomechanical refinement. For the serious contender.", icon: Zap },
   { title: "Podium Squad", level: "THE 1%", desc: "The inner circle. National & International level training for the podium-bound athlete.", icon: Check },
   { title: "Corporate Performance", level: "LEADERSHIP", desc: "Elite team building leveraging the discipline and pressure of competition archery.", icon: Users },
   { title: "Bespoke Consult", level: "CONSULTATION", desc: "Consult directly with our Olympic coaches for a custom training and equipment roadmap.", icon: Phone }
];

const getIcon = (level) => {
   switch (level?.toUpperCase()) {
      case "ORIENTATION":
      case "BEGINNER":
         return Globe;
      case "ADAPTIVE":
      case "INTERMEDIATE":
         return Target;
      case "FOUNDATION":
         return Users;
      case "PERFORMANCE":
      case "ADVANCED":
         return Star;
      case "TECHNICAL":
         return Zap;
      case "THE 1%":
         return Check;
      case "LEADERSHIP":
         return Users;
      case "CONSULTATION":
         return Phone;
      default:
         return BookOpen;
   }
};

const Programs = () => {
   const [programs, setPrograms] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchPrograms = async () => {
         try {
            const data = await getAllPrograms();
            if (Array.isArray(data) && data.length > 0) {
               setPrograms(data);
            }
         } catch (error) {
            console.error("Failed to fetch programs from API:", error);
         } finally {
            setLoading(false);
         }
      };
      fetchPrograms();
   }, []);

   const displayPrograms = programs.length > 0 ? programs : programsList;
   console.log(programs)

   return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Outfit', sans-serif", color: '#0F172A', overflowX: 'hidden' }}>

         {/* HERO */}
         <section style={{
            position: 'relative',
            minHeight: '50vh',
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
               <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '4px', textTransform: 'uppercase', color: '#3B82F6' }}>THE CURRICULUM</span>
               <h1 style={{ fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: '900', margin: '15px 0' }}>THE PATH TO PODIUM</h1>
               <p style={{ fontSize: 'clamp(16px, 2.5vw, 18px)', opacity: 0.9, maxWidth: '700px', margin: '0 auto' }}>From discovery to the Olympic stage. Every program is engineered with total precision.</p>
            </div>
         </section>

         {/* GRID */}
         <section className="section-wrapper">
            <div className="grid-3-2-1 site-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', margin: '0 auto', maxWidth: '1200px', padding: '0 20px' }}>
               {displayPrograms.map((p, i) => {
                  const title = p.title || p.name;
                  const level = p.level;
                  const desc = p.description || p.desc;
                  const hasImage = !!p.image;
                  const duration = p.duration || "N/A";
                  const totalClasses = p.totalClasses;
                  const fees = p.fees || p.amount;
                  const IconComponent = p.icon || getIcon(level);

                  return (
                     <div key={p._id || i} style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease'
                     }} >
                        {hasImage ? (
                           <img
                              src={p.image}
                              alt={title}
                              style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                           />
                        ) : (
                           <div style={{ height: '120px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', padding: '0 40px', color: '#1E40AF' }}>
                              <IconComponent size={36} />
                           </div>
                        )}
                        <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={{ color: '#1E40AF', fontWeight: '800', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>{level}</span>
                              {fees && <span style={{ fontWeight: '800', fontSize: '18px', color: '#0F172A' }}>₹{totalClasses ? `${Math.round(fees / totalClasses)} / session` : fees}</span>}
                           </div>
                           <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', marginBottom: '15px' }}>{title}</h3>
                           <p style={{ color: '#64748B', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', flexGrow: 1, textAlign: 'justify' }}>{desc}</p>

                           {(duration !== "N/A" || totalClasses || fees || p.schedule || p.sessionDuration || p.ageGroup || p.equipment || (p.kits && p.kits.length > 0)) && (
                              <div style={{
                                 backgroundColor: '#F0F6FF',
                                 borderRadius: '12px',
                                 padding: '20px',
                                 marginBottom: '20px',
                                 border: '1px solid #E2EAF8'
                              }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E40AF', fontWeight: '800', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '15px' }}>
                                    <Clock size={16} />
                                    <span>PROGRAM DETAILS</span>
                                 </div>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#475569' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                       <span style={{ fontWeight: '500' }}>Duration:</span>
                                       <span style={{ fontWeight: '700', color: '#0F172A' }}>{duration} {totalClasses ? `| ${totalClasses} Sessions` : ''}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                       <span style={{ fontWeight: '500' }}>Session Duration:</span>
                                       <span style={{ fontWeight: '700', color: '#0F172A' }}>{p.sessionDuration || 'N/A'}</span>
                                    </div>
                                    {p.schedule && (
                                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span style={{ fontWeight: '500' }}>Schedule:</span>
                                          <span style={{ fontWeight: '700', color: '#0F172A' }}>{p.schedule}</span>
                                       </div>
                                    )}
                                    {p.ageGroup && (
                                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span style={{ fontWeight: '500' }}>Age Group:</span>
                                          <span style={{ fontWeight: '700', color: '#0F172A' }}>{p.ageGroup}</span>
                                       </div>
                                    )}
                                    {p.equipment && (
                                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span style={{ fontWeight: '500' }}>Equipment:</span>
                                          <span style={{ fontWeight: '700', color: '#0F172A' }}>{p.equipment}</span>
                                       </div>
                                    )}
                                    {p.kits && p.kits.length > 0 && (
                                       <div style={{ borderTop: '1px solid #D2E1F8', paddingTop: '10px', marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>Equipment Kits:</span>
                                          {p.kits.map((kit, idx) => (
                                             <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                                <span>{kit.name}:</span>
                                                <span style={{ fontWeight: '700', color: '#0F172A' }}>
                                                   {kit.qty ? `Qty: ${kit.qty}` : 'Qty: 1'} {kit.price ? `| ₹${kit.price}` : ''}
                                                </span>
                                             </div>
                                          ))}
                                       </div>
                                    )}
                                 </div>
                              </div>
                           )}

                           {p.features && p.features.length > 0 && (
                              <div style={{ marginTop: '5px', borderTop: '1px solid #f1f5f9', paddingTop: '15px', marginBottom: '20px' }}>
                                 <span style={{ fontSize: '11px', fontWeight: '800', color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '8px' }}>Key Highlights:</span>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {p.features.map((feature, idx) => (
                                       <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                                          <Check size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                                          <span style={{ lineHeight: '1.2' }}>{feature}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}

                           <Link to={`/register?programId=${p._id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#1E40AF', fontWeight: '800', fontSize: '13px', textDecoration: 'none', marginTop: 'auto' }}>
                              ENROLL PROGRAM <ArrowRight size={16} />
                           </Link>
                        </div>
                     </div>
                  );
               })}
            </div>

            {/* CTA BOX */}
            <div className="site-container" style={{ margin: '100px auto 0', backgroundColor: '#1E40AF', padding: '80px 5%', borderRadius: '12px', textAlign: 'center', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '1200px' }}>
               <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', marginBottom: '20px', letterSpacing: '-2px' }}>READY TO MASTER THE BOW?</h2>
               <p style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto 40px', opacity: 0.9 }}>Our core programs for the competitive season are now open. Secure your evaluation today.</p>
               <Link to="/register" style={{ backgroundColor: '#0F172A', color: 'white', padding: '18px 50px', borderRadius: '4px', fontWeight: '900', fontSize: '14px', textDecoration: 'none' }}>START EVALUATION</Link>
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

export default Programs;
