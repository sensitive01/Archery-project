import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "/logo and white word mark (4).png";

const Home = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", backgroundColor: '#ffffff', overflowX: 'hidden' }}>

      {/* ================================================================ */}
      {/*  HERO SECTION: FULL-OVERLAP TOP-BAR RECONSTRUCTION (IMAGE 2)      */}
      {/* ================================================================ */}
      <section style={{
        position: 'relative',
        minHeight: 'calc(100vh - 70px)',
        width: '100%',
        backgroundColor: '#ffffff',
        overflow: 'visible', // Allows logo to truly break into the top nav
        backgroundImage: `
          linear-gradient(to right, #ffffff 42%, rgba(255,255,255,0.7) 65%, transparent 100%),
          url('/outdoor_hero.png')
        `,
        backgroundSize: '100% 100%, cover',
        backgroundPosition: 'left center, right center',
        backgroundRepeat: 'no-repeat',
      }}>
        
        {/* ── TOP DECORATIVE BLUE SWOOSH ─────────────────────────────── */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '65%',
          height: '240px', 
          zIndex: 3,
          pointerEvents: 'none',
        }}>
          <svg viewBox="0 0 1000 240" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path
              d="M1000,0 L320,0 C480,30 680,200 1000,90 Z"
              fill="#1E3A8A"
              fillOpacity="0.85"
            />
          </svg>
        </div>

        {/* ── THE MASTER 1:1 UNIT (EXTREME OFFSET FOR IMAGE 2 MATCH) ─── */}
        <div style={{
          position: 'relative',
          zIndex: 1100, // SIT ON TOP OF FIXED NAV BAR (1000)
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0px 60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}>
          
          {/* THE LOGO: Deep Overlap into Top Bar area (Image 2 Mirror) */}
          <div style={{
            opacity: scrolled ? 0 : 1,
            transform: scrolled ? 'scale(0.3) translateY(-140px)' : 'scale(1)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            transformOrigin: 'top left',
            marginTop: '-140px', // DEEP OVERLAP: Pulls the logo "body" into the nav area
            marginBottom: '0px',
          }}>
            <img
              src={logo}
              alt="ArcheryBranding"
              style={{ height: '420px', width: 'auto' }} // Massive premium scale
            />
          </div>

          {/* BRANDING UNIT (SHIFTED BESIDE LOGO) */}
          <div style={{ 
            marginTop: '-180px', // Pulls text up to follow the deeper logo overlap
            paddingLeft: '145px' // Clean side-by-side gap
          }}> 
            <h1 style={{ 
              margin: 0, padding: 0, lineHeight: '0.82', 
              textShadow: '0 0 50px rgba(255,255,255,0.7)' 
            }}>
              <span style={{
                display: 'block',
                color: '#E53935',
                fontSize: '68px',
                fontWeight: '1000',
                letterSpacing: '-2px',
                textTransform: 'uppercase',
              }}>
                WORLD-CLASS
              </span>
              <span style={{
                display: 'block',
                color: '#1E3A8A',
                fontSize: '54px',
                fontWeight: '950',
                letterSpacing: '-1.5px',
                textTransform: 'uppercase',
                marginTop: '12px',
              }}>
                ARCHERY COACHING
              </span>
            </h1>

            <p style={{
              color: '#374151',
              fontSize: '18px',
              lineHeight: '1.6',
              marginTop: '42px', // Slightly more vertical space as logo moved up
              marginBottom: '38px',
              maxWidth: '430px',
              fontWeight: '600',
            }}>
              Elevate your skills with international-level archery coaching and training.
            </p>

            <div style={{ display: 'flex', gap: '22px' }}>
              <Link to="/register" style={{
                backgroundColor: '#E53935',
                color: 'white',
                padding: '16px 44px',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '16px',
                textDecoration: 'none',
                boxShadow: '0 10px 24px rgba(229,57,53,0.3)',
              }}>
                Get Started
              </Link>
              <Link to="/programs" style={{
                backgroundColor: 'rgba(255,255,255,0.4)',
                color: '#1E3A8A',
                padding: '14px 42px',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '16px',
                textDecoration: 'none',
                border: '3.5px solid #1E3A8A',
                backdropFilter: 'blur(8px)',
              }}>
                Our Programs
              </Link>
            </div>
          </div>
        </div>

        {/* ── STEEP TRIPLE WAVES (RED PEAK) ───────────────────────────── */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '180px',
          zIndex: 40,
          pointerEvents: 'none',
        }}>
          <svg viewBox="0 0 1440 160" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
            <path d="M0,60 C400,180 800,-40 1200,80 C1320,110 1440,105 1440,100 L1440,160 L0,160 Z" fill="#FACC15" />
            <path d="M0,95 C400,215 800,-5 1200,115 C1320,145 1440,140 1440,135 L1440,160 L0,160 Z" fill="#1E3A8A" />
            <path d="M0,130 C400,250 800,30 1100,150 C1250,180 1400,60 1440,100 L1440,160 L0,160 Z" fill="#E53935" />
          </svg>
        </div>

      </section>

    </div>
  );
};

export default Home;
