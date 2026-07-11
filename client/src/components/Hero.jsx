import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

const ROTATING_TEXTS = [
  'Transparent Protocols',
  'Immutable Ledger Deeds',
  'Smart Contract Escrows',
  'Decentralized Trust'
];

const Hero = () => {
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [textIndex, setTextIndex] = useState(0);
  const [fadeState, setFadeState] = useState('fade-in');
  const heroRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 150);

    const handleMouse = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
      });
    };

    const el = heroRef.current;
    if (el) el.addEventListener('mousemove', handleMouse);
    return () => {
      clearTimeout(timer);
      if (el) el.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setFadeState('fade-out');
      setTimeout(() => {
        setTextIndex((prev) => (prev + 1) % ROTATING_TEXTS.length);
        setFadeState('fade-in');
      }, 300);
    }, 2800);

    return () => clearInterval(textInterval);
  }, []);

  return (
    <header
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-surface text-on-surface"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 opacity-20 bg-grid-pattern"></div>

      {/* Floating orbs that respond to mouse */}
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-float-slow pointer-events-none"
        style={{ transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px)` }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-[80px] animate-float pointer-events-none"
        style={{ transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)` }}
      />

      {/* Main Content Grid */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start text-left">
        
        {/* Left Column: Headline and actions */}
        <div className="flex flex-col items-start justify-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center space-x-2 bg-surface-container-high/50 px-4 py-1.5 rounded-full mb-8 border border-outline-variant/10 transition-all duration-700 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span className="font-label text-[10px] tracking-[0.2em] uppercase text-on-surface-variant">
              Blockchain Verified Registry
            </span>
          </div>

          {/* Headline */}
          <h1
            className={`font-headline text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.15] text-glow transition-all duration-1000 delay-200 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Bhoomi – Securing Land <br className="hidden md:inline" />
            Ownership through <br className="hidden md:inline" />
            <span className="relative inline-block text-primary italic w-full md:w-auto min-w-[320px] h-[1.25em]">
              <span
                className={`w-full transition-all duration-300 transform ${
                  fadeState === 'fade-in'
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 -translate-y-2 scale-95'
                }`}
              >
                {ROTATING_TEXTS[textIndex]}
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-on-surface-variant text-base md:text-lg mb-8 font-light max-w-xl transition-all duration-1000 delay-400 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
            Transforming physical land into trusted digital assets. Secure your future through automated, immutable blockchain architecture.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto transition-all duration-1000 delay-[600ms] ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Link
              to="/register"
              className="btn-shimmer w-full sm:w-auto px-10 py-4 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest text-sm hover:translate-y-[-3px] transition-all duration-300 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 text-center"
            >
              Login / Register
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto px-10 py-4 rounded-lg bg-transparent text-secondary border border-outline-variant/20 font-headline font-bold uppercase tracking-widest text-sm hover:bg-surface-container-high hover:border-secondary/40 transition-all duration-300 text-center group"
            >
              <div className='flex justify-center'>
                <span className="inline-flex items-center">
                View Demo
              </span>
              </div>
            </a>
          </div>
        </div>

        {/* Right Column: Spinning Globe */}
        <div 
          className={`flex items-center justify-center w-full mt-8 md:mt-0 order-2 md:order-1 transition-all duration-1000 delay-500 ${
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="relative w-72 h-72 md:w-[420px] md:h-[420px] flex items-center justify-center pointer-events-none">
            {/* Ambient background glow */}
            <div className="absolute w-64 h-64 rounded-full bg-primary/10 blur-[80px]" />
            
            {/* Outer spinning dashed ring */}
            <div className="absolute w-[95%] h-[95%] rounded-full border border-dashed border-primary/20 animate-spin-slow" />
            
            {/* Inner spinning dotted ring */}
            <div className="absolute w-[85%] h-[85%] rounded-full border border-dotted border-secondary/30 animate-spin-reverse" style={{ animationDuration: '14s' }} />

            {/* Globe Sphere */}
            <div className="absolute w-[70%] h-[70%] rounded-full border-2 border-primary/30 overflow-hidden bg-surface-container-low/40 shadow-[0_0_50px_rgba(198,139,89,0.15)] flex items-center justify-center">
              <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                
                {/* Spinning Earth continents underneath */}
                <div className="absolute inset-0 animate-globe-spin w-[200%] h-full flex">
                  <svg className="w-full h-full text-primary/30" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <g fill="currentColor" opacity="0.6">
                      {/* Map 1 */}
                      <path d="M 20,20 Q 35,15 50,30 Q 55,45 40,50 Q 30,50 25,40 Z" />
                      <path d="M 40,52 Q 50,60 45,75 Q 40,90 35,80 Q 30,70 40,52 Z" />
                      <path d="M 85,45 Q 105,40 100,60 Q 95,75 90,80 Q 80,75 80,65 Q 80,55 85,45 Z" />
                      <path d="M 75,20 Q 110,15 130,25 Q 140,40 120,45 Q 100,35 90,40 Q 80,30 75,20 Z" />
                      <path d="M 135,70 Q 145,68 148,78 Q 140,85 135,70 Z" />
                      {/* Map 2 (seamless repeat offset by 200px) */}
                      <path d="M 220,20 Q 235,15 250,30 Q 255,45 240,50 Q 230,50 225,40 Z" />
                      <path d="M 240,52 Q 250,60 245,75 Q 240,90 235,80 Q 230,70 240,52 Z" />
                      <path d="M 285,45 Q 305,40 300,60 Q 295,75 290,80 Q 280,75 280,65 Q 280,55 285,45 Z" />
                      <path d="M 275,20 Q 310,15 330,25 Q 340,40 320,45 Q 300,35 290,40 Q 280,30 275,20 Z" />
                      <path d="M 335,70 Q 345,68 348,78 Q 340,85 335,70 Z" />
                    </g>
                  </svg>
                </div>

                {/* Static Grid lines on top for 3D sphere depth */}
                <svg className="absolute inset-0 w-full h-full text-primary/20 pointer-events-none" viewBox="0 0 100 100">
                  <path d="M 50,0 Q 30,50 50,100 M 50,0 Q 70,50 50,100 M 50,0 Q 15,50 50,100 M 50,0 Q 85,50 50,100 M 50,0 L 50,100" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <path d="M 0,25 Q 50,35 100,25 M 0,50 L 100,50 M 0,75 Q 50,65 100,75" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </svg>
                
                {/* Sphere lighting gradient overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,transparent_40%,rgba(26,23,21,0.75)_95%)]" />
                <div className="absolute inset-0 border border-primary/20 rounded-full" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/40">
          Scroll to Explore
        </span>
        <div className="w-6 h-10 rounded-full border border-primary/30 flex items-start justify-center p-1.5">
          <div className="w-1 h-2.5 rounded-full bg-primary animate-scroll-indicator" />
        </div>
      </div>
    </header>
  );
};

export default Hero;
