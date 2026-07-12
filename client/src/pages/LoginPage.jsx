import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      const user = data.user;
      if (!user) throw new Error('No user profile found.');

      // Fetch profile from db to get user's role and wallet
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error('User profile does not exist. Ensure your registration is complete and database migrations are run.');
      }

      // Determine redirect path
      let dashboardPath = '';
      if (profile.role === 'authority') {
        dashboardPath = '/authority-dashboard';
      } else if (profile.role === 'seller') {
        dashboardPath = '/dashboard';
      } else {
        dashboardPath = '/buyer-dashboard';
      }

      // Redirect path
      if (!profile.wallet_address) {
        navigate('/connect-wallet', { state: { redirectTo: dashboardPath } });
      } else {
        navigate(dashboardPath);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
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
          
          <div className="glass-panel p-10 md:p-14 rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-outline-variant/10 hover-glow-border bg-surface-container-low/80 backdrop-blur-md">
            <div className="mb-10">
              <div className="flex items-center space-x-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label text-[10px] tracking-[0.2em] uppercase text-on-surface-variant">Secure Identity</span>
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-on-surface">Welcome Back</h1>
              <p className="text-on-surface-variant text-sm mt-2">Sign in with your credentials to access your land registry dashboard.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-md bg-error/10 border border-error/20 flex items-center gap-3 text-error text-sm">
                <span className="material-symbols-outlined text-lg">warning</span>
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg">mail</span>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-surface-container border border-outline/20 rounded-md text-on-surface placeholder:text-outline/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant" htmlFor="password">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg">lock</span>
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-surface-container border border-outline/20 rounded-md text-on-surface placeholder:text-outline/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 bg-primary text-on-primary font-bold rounded-md hover:bg-primary-dim active:scale-95 transition-all text-sm disabled:opacity-50"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-outline/10 text-center">
              <span className="text-xs text-on-surface-variant">New to Bhoomi? </span>
              <Link to="/register" className="text-xs text-primary font-bold hover:underline">
                Create an Account
              </Link>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

