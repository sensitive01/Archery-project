import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
   Instagram, Linkedin, Mail, Phone, MapPin, Send, Menu, X,
   ArrowRight, Target, Users, BookOpen, Clock, Image, MessageCircle, Briefcase, ChevronRight, ShoppingBag, ChevronDown, LogOut, LayoutDashboard
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ASSETS
const logoImage = "/rchry.png";

const Layout = () => {
   const location = useLocation();
   const { user, logout } = useAuth();
   const [isScrolled, setIsScrolled] = useState(false);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

   useEffect(() => {
      const handleScroll = () => {
         setIsScrolled(window.scrollY > 20);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
   }, []);

   // Lock scroll when mobile menu is open
   useEffect(() => {
      if (isMobileMenuOpen) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "auto";
      }
   }, [isMobileMenuOpen]);

   const navLinks = [
      //  { label: "Home", path: "/", desc: "Return to our mission", icon: <Target size={20} /> },
      { label: "Programs", path: "/programs", desc: "The Elite 10 track", icon: <Target size={20} /> },
      { label: "Products", path: "/products", desc: "Elite archery gear & kits", icon: <ShoppingBag size={20} /> },
      { label: "Pay and Play", path: "/pay-and-play", desc: "Casual archery sessions", icon: <Target size={20} /> },
      { label: "Coaches", path: "/coaches", desc: "Olympic-level expertise", icon: <Users size={20} /> },
      { label: "Gallery", path: "/gallery", desc: "Visual record of victory", icon: <Image size={20} /> },
      { label: "Events", path: "/events", desc: "Our 10-year legacy", icon: <BookOpen size={20} /> },
      { label: "Schedule Your Class", path: "/schedule", desc: "Find your training slot", icon: <Clock size={20} /> },
      //  { label: "Contact", path: "/contact", desc: "Start your journey", icon: <MessageCircle size={20} /> },
      //  { label: "Careers", path: "/careers", desc: "Join our expert team", icon: <Briefcase size={20} /> }
   ];

   return (
      <div style={{ position: "relative", minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: "'Outfit', sans-serif" }}>

         {/* ================================================================ */}
         {/* 1. NAVIGATION HEADER (RESPONSIVE)                               */}
         {/* ================================================================ */}
         <header
            style={{
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               height: "80px",
               backgroundColor: (isScrolled || location.pathname !== '/') ? "rgba(255, 255, 255, 0.98)" : "transparent",
               backdropFilter: (isScrolled || location.pathname !== '/') ? "blur(15px)" : "none",
               borderBottom: (isScrolled || location.pathname !== '/') ? "1px solid rgba(15, 23, 42, 0.08)" : "none",
               display: "flex",
               alignItems: "center",
               zIndex: 3000,
               transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
         >
            <div className="site-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
               {/* BRANDING */}
               <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                  <img
                     src={logoImage}
                     alt="Logo"
                     style={{
                        height: isScrolled ? '40px' : '50px',
                        transition: 'all 0.5s ease',
                     }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                     <span style={{
                        fontSize: '14px',
                        fontWeight: '800',
                        color: (isScrolled || isMobileMenuOpen) ? 'blue' : (location.pathname === '/' ? 'blue' : 'blue'),
                        letterSpacing: '-0.5px',
                        lineHeight: '1.2'
                     }}>
                        Archery Coaching
                     </span>
                     <span
                        style={{
                           fontSize: '12px',
                           fontWeight: 'normal',
                           color: '#050505ff',
                           marginTop: '1px',
                           letterSpacing: '0.1px'
                        }}
                     >
                        Achieve your Target
                     </span>
                  </div>
               </Link>

               {/* DESKTOP NAVIGATION */}
               <nav className="desktop-only" style={{ gap: '15px', alignItems: 'center' }}>
                  {navLinks.map((link) => {
                     const isActive = location.pathname.startsWith(link.path);
                     const isSchedule = link.path === "/schedule";
                     return (
                        <Link
                           key={link.path}
                           to={link.path}
                           style={{
                              textDecoration: 'none',
                              fontSize: '14px',
                              fontWeight: isActive ? '700' : '600',
                              color: isActive 
                                 ? '#ef4444' // Brand red for active
                                 : (isScrolled ? '#0F172A' : (location.pathname === '/' ? 'rgba(255,255,255,0.9)' : '#0F172A')),
                              padding: '8px 12px',
                              borderRadius: '6px',
                              backgroundColor: isActive && !isSchedule ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                              transition: 'all 0.3s',
                              ...(isSchedule && {
                                 border: isScrolled ? '1.5px solid #1E40AF' : (location.pathname === '/' ? '1.5px solid rgba(255,255,255,0.8)' : '1.5px solid #1E40AF'),
                                 padding: '8px 18px',
                                 borderRadius: '4px',
                                 backgroundColor: isActive ? '#1E40AF' : 'transparent',
                                 color: isActive ? '#FFFFFF' : (isScrolled ? '#1E40AF' : (location.pathname === '/' ? '#FFFFFF' : '#1E40AF')),
                              })
                           }}
                        >
                           {link.label}
                        </Link>
                     );
                  })}
                  {!user && (
                     <Link to="/register" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '12px 30px', borderRadius: '4px', textDecoration: 'none', fontSize: '11px', fontWeight: '900', letterSpacing: '1px', boxShadow: '0 4px 15px rgba(30, 64, 175, 0.2)' }}>ENROLL NOW</Link>
                  )}
                  
                  {user ? (
                     <div style={{ position: 'relative' }} onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', borderRadius: '8px', backgroundColor: isScrolled ? '#f8fafc' : 'rgba(255,255,255,0.1)' }}>
                           <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1E40AF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', overflow: 'hidden' }}>
                              {user.profilePic ? (
                                 <img src={user.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                 <>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</>
                              )}
                           </div>
                           <span style={{ fontSize: '14px', fontWeight: '600', color: isScrolled ? '#0F172A' : (location.pathname === '/' ? 'white' : '#0F172A') }}>
                              {user.firstName}
                           </span>
                           <ChevronDown size={16} color={isScrolled ? '#0F172A' : (location.pathname === '/' ? 'white' : '#0F172A')} />
                        </div>
                        {isDropdownOpen && (
                           <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: '10px', zIndex: 5000 }}>
                              <div style={{ width: '200px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '8px', border: '1px solid #f1f5f9' }}>
                                 <Link to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', textDecoration: 'none', color: '#0F172A', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <LayoutDashboard size={16} color="#64748B" /> Dashboard
                                 </Link>
                                 <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '4px 0' }}></div>
                                 <button onClick={() => { logout(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', borderRadius: '8px', fontSize: '14px', fontWeight: '600', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <LogOut size={16} color="#ef4444" /> Logout
                                 </button>
                              </div>
                           </div>
                        )}
                     </div>
                  ) : (
                     <Link
                        to="/login"
                        style={{
                           textDecoration: 'none',
                           fontSize: '14px',
                           fontWeight: '600',
                           color: location.pathname === '/login' ? '#1E40AF' : (isScrolled ? '#0F172A' : (location.pathname === '/' ? 'rgba(255,255,255,0.9)' : '#0F172A')),
                           transition: 'all 0.3s'
                        }}
                     >
                        Archer Login
                     </Link>
                  )}
               </nav>

               {/* MOBILE MENU TOGGLE */}
               <button
                  className="mobile-only"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  style={{ background: 'none', border: 'none', color: (isScrolled || isMobileMenuOpen) ? '#0F172A' : (location.pathname === '/' ? 'white' : '#0F172A'), cursor: 'pointer', outline: 'none', padding: '10px' }}
               >
                  {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
               </button>
            </div>
         </header>

         {/* ================================================================ */}
         {/* 2. CINEMATIC MOBILE NAVIGATION OVERLAY                           */}
         {/* ================================================================ */}
         {isMobileMenuOpen && (
            <div style={{
               position: 'fixed',
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               backgroundColor: '#ffffff',
               zIndex: 2500,
               padding: '110px 5% 40px',
               display: 'flex',
               flexDirection: 'column',
               overflowY: 'auto',
               animation: 'fadeInOverlay 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {navLinks.map((link, i) => {
                     const isActive = location.pathname.startsWith(link.path);
                     return (
                        <Link
                           key={link.path}
                           to={link.path}
                           onClick={() => setIsMobileMenuOpen(false)}
                           style={{
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '15px 20px',
                              backgroundColor: isActive ? '#eff6ff' : '#f8fafc',
                              border: isActive ? '1px solid #bfdbfe' : '1px solid #f1f5f9',
                              borderRadius: '16px',
                              transition: 'all 0.2s',
                              animation: `slideInItem 0.4s ease forwards ${i * 0.05}s`,
                              opacity: 0,
                              transform: 'translateY(20px)'
                           }}
                        >
                           <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                              <div style={{ width: '40px', height: '40px', backgroundColor: isActive ? '#1E40AF' : 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? 'white' : '#1E40AF', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                                 {link.icon}
                              </div>
                              <div>
                                 <div style={{ fontSize: '18px', fontWeight: '900', color: isActive ? '#1E40AF' : '#0F172A', letterSpacing: '-0.5px' }}>{link.label}</div>
                                 <div style={{ fontSize: '11px', color: isActive ? '#3b82f6' : '#64748B', fontWeight: '500', marginTop: '2px' }}>{link.desc}</div>
                              </div>
                           </div>
                           <ChevronRight size={18} color={isActive ? '#3b82f6' : '#cbd5e1'} />
                        </Link>
                     );
                  })}

                  <div style={{ marginTop: '30px', padding: '0 10px', animation: 'fadeInUp 0.6s ease forwards 0.5s', opacity: 0 }}>
                     {!user && (
                        <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} style={{ backgroundColor: '#1E40AF', color: 'white', padding: '22px', borderRadius: '16px', textDecoration: 'none', fontSize: '15px', fontWeight: '900', textAlign: 'center', display: 'block', boxShadow: '0 15px 35px rgba(30, 64, 175, 0.25)', letterSpacing: '0.5px' }}>JOIN ELITE TRAINING</Link>
                     )}

                     <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '40px' }}>
                        <a href="#" style={{ color: '#64748B' }}><Instagram size={22} /></a>
                        <a href="#" style={{ color: '#64748B' }}><Linkedin size={22} /></a>
                        <a href="#" style={{ color: '#64748B' }}><Mail size={22} /></a>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* ================================================================ */}
         {/* 3. APP CONTENT                                                  */}
         {/* ================================================================ */}
         <main style={{ minHeight: '100vh', paddingTop: location.pathname === '/' ? '0' : '80px' }}>
            <Outlet />
         </main>

         {/* ================================================================ */}
         {/* 4. ARCHITECTURAL FOOTER                                         */}
         {/* ================================================================ */}
         <footer style={{ backgroundColor: '#0F172A', color: 'white', padding: '100px 0 40px', position: 'relative', zIndex: 10 }}>
            <div className="site-container">
               <div className="grid-4-2-1" style={{ gap: '60px' }}>
                  <div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                        <img src={logoImage} alt="Logo" style={{ height: '50px' }} />
                        <span style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px' }}>Archery Coaching</span>
                     </div>
                     <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', fontSize: '14px', maxWidth: '300px' }}>
                        The premier institution for professional archery training. Clinical precision for the modern athlete.
                     </p>
                  </div>

                  <div>
                     <h4 style={{ fontSize: '12px', fontWeight: '900', marginBottom: '30px', textTransform: 'uppercase', color: '#1E40AF', letterSpacing: '2px' }}>Explore</h4>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[
                           { label: 'About Us', path: '/about' },
                           { label: 'One on One Coaching', path: '/coaching' },
                           { label: 'Event Participation', path: '/events' },
                           { label: 'Blogs & Posts', path: '/blogs' },
                           { label: 'Competitions', path: '/competitions' }
                        ].map(link => (
                           <Link key={link.label} to={link.path} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px', fontWeight: '600', transition: 'color 0.3s' }}>{link.label}</Link>
                        ))}
                     </div>
                  </div>

                  <div>
                     <h4 style={{ fontSize: '12px', fontWeight: '900', marginBottom: '30px', textTransform: 'uppercase', color: '#1E40AF', letterSpacing: '2px' }}>Legal & Support</h4>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[
                           { label: 'Privacy Policy', path: '/privacy-policy' },
                           { label: 'Terms of Service', path: '/terms' },
                           { label: 'Safety Guidelines', path: '/safety' },
                           { label: 'Contact Us', path: '/contact' },
                           { label: 'Report Bugs', path: '/report-bugs' }
                        ].map(link => (
                           <Link key={link.label} to={link.path} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px', fontWeight: '600', transition: 'color 0.3s' }}>{link.label}</Link>
                        ))}
                     </div>
                  </div>

                  <div>
                     <h4 style={{ fontSize: '12px', fontWeight: '900', marginBottom: '30px', textTransform: 'uppercase', color: '#1E40AF', letterSpacing: '2px' }}>Contact</h4>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '15px' }}>
                           <MapPin size={18} color="#1E40AF" style={{ flexShrink: 0 }} />
                           <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>BSK 6th Stage, Bengaluru, KA 560062</p>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                           <Phone size={18} color="#1E40AF" />
                           <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>+91 93538 97319</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '80px', paddingTop: '30px', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>© 2026 Archery Academy. Designed by Sensitive Technologies</p>
               </div>
            </div>
         </footer>

         {/* WHATSAPP TETHER */}
         <a
            href="https://wa.me/919353897319"
            target="_blank"
            rel="noreferrer"
            style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#25D366', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 40px rgba(37, 211, 102, 0.3)', zIndex: 4000, transition: 'transform 0.3s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
         >
            <svg width="30" height="30" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
         </a>

         <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; transform: scale(1.05); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInItem {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      </div>
   );
};

export default Layout;
