import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const LoginPage = () => {
  const navigate = useNavigate();
  const loginBtnRef = useRef(null);

  // States for login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);

    const handleMouseMove = (e) => {
      // Background parallax
      const blobs = document.querySelectorAll('.animate-pulse-slow');
      const x = (window.innerWidth / 2 - e.pageX) / 50;
      const y = (window.innerHeight / 2 - e.pageY) / 50;
      
      blobs.forEach(blob => {
        blob.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleBtnMouseMove = (e) => {
    if (!loginBtnRef.current) return;
    const rect = loginBtnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    loginBtnRef.current.style.setProperty('--mouse-x', `${x}px`);
    loginBtnRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: loginData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Query adminstartator table to check if the user is an admin
    const { data: admin } = await supabase
      .from('adminstartator')
      .select('role')
      .eq('id', loginData.user.id)
      .single();

    // Query profiles as fallback
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', loginData.user.id)
      .single();

    const isAuthority = (admin && admin.role === 'authority') || (profile && profile.role === 'authority');

    setLoading(false);
    if (isAuthority) {
      navigate('/authority-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden bg-surface text-on-surface page-enter">
      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center relative px-6 py-24">
        {/* Atmospheric Background Elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary-container/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        
        {/* Login Container */}
        <div className={`w-full max-w-lg relative z-10 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Asymmetric Accent Image */}
          <div className={`absolute -top-12 -right-12 w-32 h-32 md:w-48 md:h-48 z-20 transition-all duration-1000 delay-300 ${loaded ? 'opacity-100 translate-y-0 rotate-6' : 'opacity-0 translate-y-4 rotate-0'}`}>
            <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl border border-primary/20 bg-surface-container hover-lift">
              <img 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                data-alt="Futuristic digital plot of land" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5dn1Yv4qBwGKXj2k8O0qJU3hP0leFhCZ7tXnSus09ttl3zM9_t1rVnnMEof8TOlX9k4vQ56ol-lUN-zd9k2-2rxJHA12soXgaEk_lSLRIxnZS6WrfEgA_qGj4OhTaHXlFoUuTVFWH1kph4x4sWA1ln36ae51DxgokbymEXwq3didJFoUtB7qoW6hhrHTKGrUAvrrDOiRcPvOQMUjhBYNYv4VN_8LvGoGOkEDOzp5Jid48zMlTRgX2R1CpeijifHLZOCFd21EscJGV"
                alt="Digital land rendering"
              />
            </div>
          </div>
          
          <div className="glass-panel p-10 md:p-14 rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-outline-variant/10 hover-glow-border">
            <div className="mb-10">
              <div className="flex items-center space-x-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                <span className="font-label text-[10px] tracking-[0.2em] uppercase text-on-surface-variant">Secure Ledger Auth</span>
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-on-surface">Welcome Back</h1>
            </div>
            
            {/* Error Message Box */}
            {error && (
              <div className="mb-6 bg-error/10 text-error border border-error/20 p-4 rounded-md text-sm font-medium animate-fade-up-in flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Email/User ID Input */}
              <div className="space-y-2">
                <label className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant ml-1" htmlFor="username">Email Address</label>
                <div className="relative group">
                  <input className="w-full bg-surface-container-lowest border-none rounded-md px-5 py-4 text-on-surface focus:ring-1 focus:ring-primary-dim transition-all duration-300 placeholder:text-outline/50" id="username" placeholder="arch@bhoomi.xyz" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline/40 group-focus-within:text-primary-dim transition-colors duration-300">person</span>
                </div>
              </div>
              
              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant" htmlFor="password">Security Key</label>
                  <a className="text-[10px] tracking-widest uppercase text-primary hover:text-primary-dim transition-colors" href="#">Forgot Password?</a>
                </div>
                <div className="relative group">
                  <input className="w-full bg-surface-container-lowest border-none rounded-md px-5 py-4 text-on-surface focus:ring-1 focus:ring-primary-dim transition-all duration-300 placeholder:text-outline/50" id="password" placeholder="••••••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline/40 group-focus-within:text-primary-dim transition-colors duration-300">lock</span>
                </div>
              </div>
              
              {/* Login Button */}
              <div className="pt-4">
                <button 
                  ref={loginBtnRef}
                  onMouseMove={handleBtnMouseMove}
                  disabled={loading}
                  className="w-full primary-gradient text-on-primary-fixed py-5 rounded-md font-headline font-bold text-lg tracking-wide hover:shadow-[0_0_30px_rgba(143,245,255,0.4)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 btn-shimmer"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      Authenticating...
                    </span>
                  ) : 'Login to Registry'}
                </button>
              </div>
            </form>
            
            {/* Footer Links */}
            <div className="mt-12 pt-8 border-t border-outline-variant/10">
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:justify-between md:items-center">
                <Link to="/register" className="font-label text-xs tracking-wider text-on-surface-variant hover:text-secondary transition-colors duration-300 inline-flex items-center space-x-2 group">
                  <span>Register New Account</span>
                  <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
                </Link>
                <Link to="/authority-dashboard" className="font-label text-xs tracking-wider text-on-surface-variant opacity-60 hover:opacity-100 transition-all duration-300">
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
