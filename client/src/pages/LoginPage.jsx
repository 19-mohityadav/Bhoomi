import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
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

  const handleRoleLogin = (role) => {
    // Determine the dashboard path and display name based on role
    let dashboardPath = '';
    let fullName = '';
    
    if (role === 'authority') {
      dashboardPath = '/authority-dashboard';
      fullName = 'Inspector General';
    } else if (role === 'seller') {
      dashboardPath = '/dashboard';
      fullName = 'Alex Sterling (Seller)';
    } else {
      dashboardPath = '/buyer-dashboard';
      fullName = 'Guest Buyer';
    }
                        
    // Set mock user in localStorage
    localStorage.setItem('mockUser', JSON.stringify({
      role: role,
      id: `mock-${role}-${Date.now()}`,
      full_name: fullName,
      wallet_address: null // To be set when they connect wallet
    }));

    // Redirect to connect wallet first, passing the intended destination
    navigate('/connect-wallet', { state: { redirectTo: dashboardPath } });
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
                <span className="font-label text-[10px] tracking-[0.2em] uppercase text-on-surface-variant">Dev Mode Enabled</span>
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-on-surface">Select Role</h1>
              <p className="text-on-surface-variant text-sm mt-2">Authentication bypassed for easy testing.</p>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={() => handleRoleLogin('seller')}
                className="w-full flex items-center justify-between p-5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">real_estate_agent</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-on-surface">Enter as Seller</h3>
                    <p className="text-xs text-on-surface-variant">Upload & manage land assets</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
              </button>

              <button 
                onClick={() => handleRoleLogin('buyer')}
                className="w-full flex items-center justify-between p-5 rounded-lg border border-secondary/30 bg-secondary/5 hover:bg-secondary/10 hover:border-secondary/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">shopping_cart</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-on-surface">Enter as Buyer</h3>
                    <p className="text-xs text-on-surface-variant">Purchase land NFTs</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
              </button>

              <button 
                onClick={() => handleRoleLogin('authority')}
                className="w-full flex items-center justify-between p-5 rounded-lg border border-tertiary/30 bg-tertiary/5 hover:bg-tertiary/10 hover:border-tertiary/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">gavel</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-on-surface">Enter as Authority</h3>
                    <p className="text-xs text-on-surface-variant">Verify & approve applications</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-tertiary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
              </button>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
