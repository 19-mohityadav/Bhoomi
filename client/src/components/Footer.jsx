import { useScrollAnimation } from '../hooks/useScrollAnimation';

const FOOTER_LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Security Audit', href: '#' },
  { label: 'Documentation', href: '#' },
];

const Footer = () => {
  const [footerRef, footerVisible] = useScrollAnimation({ threshold: 0.1 });

  return (
    <footer
      ref={footerRef}
      className="bg-[#0c0e16] full-width py-16 border-t border-[#464751]/15 relative overflow-hidden"
    >
      {/* Ambient gradient */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary/5 blur-[100px] pointer-events-none" />

      <div
        className={`flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-8 relative z-10 scroll-reveal ${
          footerVisible ? 'visible' : ''
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center overflow-hidden">
            <img src="/favicon.png" alt="Bhoomi Logo" className="w-full h-full object-contain p-0.5" />
          </div>
          <span className="text-lg font-bold text-white font-headline">Bhoomi</span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-8">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.label}
              className="nav-link-animated font-['Manrope'] text-xs tracking-widest uppercase text-slate-500 hover:text-primary transition-all duration-300 opacity-80 hover:opacity-100"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className="font-['Manrope'] text-xs tracking-widest uppercase text-slate-600">
          © 2024 Bhoomi. The Digital Architect. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
