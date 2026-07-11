import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0c0e16]/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] py-3'
          : 'bg-transparent backdrop-blur-md py-5'
      }`}
    >
      <div className="flex justify-between items-center w-full px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-black tracking-tighter text-primary font-headline flex items-center gap-2 group"
        >
          <span className="inline-block w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 overflow-hidden">
            <img src="/favicon.png" alt="Bhoomi Logo" className="w-full h-full object-contain p-0.5" />
          </span>
          <span className="transition-colors duration-300 group-hover:text-white">Bhoomi</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-10">
          <a
            className="nav-link-animated font-['Space_Grotesk'] tracking-wide uppercase text-sm font-bold text-primary pb-1"
            href="#hero"
          >
            Explore
          </a>
          <a
            className="nav-link-animated font-['Space_Grotesk'] tracking-wide uppercase text-sm font-bold text-slate-400 hover:text-white transition-colors duration-300"
            href="#how-it-works"
          >
            How It Works
          </a>
          <a
            className="nav-link-animated font-['Space_Grotesk'] tracking-wide uppercase text-sm font-bold text-slate-400 hover:text-white transition-colors duration-300"
            href="#features"
          >
            Features
          </a>
        </div>

        {/* CTA + Mobile Menu */}
        <div className="flex items-center gap-4">
          <a
            href="#demo"
            className="hidden sm:inline-flex btn-shimmer bg-gradient-to-r from-primary to-primary-container text-on-primary-container px-6 py-2.5 rounded-full font-headline font-bold text-sm tracking-wider uppercase active:scale-90 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,238,252,0.4)]"
          >
            View Demo
          </a>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-8 pb-6 pt-4 flex flex-col gap-4 bg-[#0c0e16]/95 backdrop-blur-2xl border-t border-outline-variant/10">
          <a className="font-['Space_Grotesk'] text-sm font-bold text-primary py-2" href="#hero" onClick={() => setMobileMenuOpen(false)}>Explore</a>
          <a className="font-['Space_Grotesk'] text-sm font-bold text-slate-400 hover:text-white py-2 transition-colors" href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
          <a className="font-['Space_Grotesk'] text-sm font-bold text-slate-400 hover:text-white py-2 transition-colors" href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#demo" className="btn-shimmer bg-gradient-to-r from-primary to-primary-container text-on-primary-container px-6 py-3 rounded-full font-headline font-bold text-sm tracking-wider uppercase text-center mt-2" onClick={() => setMobileMenuOpen(false)}>View Demo</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
