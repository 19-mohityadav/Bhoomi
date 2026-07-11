import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const STAT_CARDS = [
  {
    id: 'kyc',
    icon: 'how_to_reg',
    label: 'Pending KYC Requests',
    value: '1,284',
    change: '+12%',
    status: 'up',
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
  },
  {
    id: 'land',
    icon: 'verified_user',
    label: 'Pending Land Verifications',
    value: '456',
    change: 'STABLE',
    status: 'stable',
    colorClass: 'text-secondary',
    bgClass: 'bg-secondary/10',
  },
  {
    id: 'fraud',
    icon: 'report_problem',
    label: 'Fraud Detection Alerts',
    value: '21',
    change: 'URGENT',
    status: 'urgent',
    colorClass: 'text-error',
    bgClass: 'bg-error/10',
  },
];

const SIDEBAR_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', id: 'dashboard' },
  { icon: 'how_to_reg', label: 'KYC Requests', id: 'kyc' },
  { icon: 'verified_user', label: 'Land Verifications', id: 'land' },
  { icon: 'report_problem', label: 'Fraud Alerts', id: 'fraud' },
  { icon: 'terminal', label: 'System Logs', id: 'logs' },
];

function AuthorityDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [caseStatus, setCaseStatus] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'changes'

  const [adminDetails, setAdminDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        // Get active auth user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.warn('No active session, redirecting to /login');
          navigate('/login');
          return;
        }

        // Query adminstartator table
        const { data: admin, error: adminError } = await supabase
          .from('adminstartator')
          .select('*')
          .eq('id', user.id)
          .single();

        if (adminError || !admin) {
          console.log('Admin record not found in adminstartator, searching profiles as fallback', adminError);
          // Query profiles as fallback
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile && profile.role === 'authority') {
            setAdminDetails({
              full_name: profile.full_name,
              role: profile.role,
              email: user.email
            });
          } else {
            console.error('User is not authorized as authority in profiles', profileError);
            setError('Access Denied: You do not have authority privileges.');
            await supabase.auth.signOut();
            navigate('/login');
            return;
          }
        } else {
          setAdminDetails(admin);
        }
      } catch (err) {
        console.error('Error fetching admin profile:', err);
        setError('Error establishing server connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Error during sign out:', err);
      navigate('/login');
    }
  };

  const handleAction = (status) => {
    setCaseStatus(status);
    setTimeout(() => {
      alert(`Case Registry Decision: ${status.toUpperCase()}`);
    }, 100);
  };

  return (
    <div className="bg-background text-on-surface font-body overflow-x-hidden selection:bg-primary/30 min-h-screen flex page-enter">
      {/* SideNavBar Shell */}
      <aside className="fixed left-0 top-0 h-screen w-72 flex flex-col z-40 bg-surface-container shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        <div className="p-8">
          <Link to="/dashboard" className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
            Bhoomi
          </Link>
          <p className="font-label uppercase tracking-widest text-[0.65rem] text-on-surface-variant mt-1">Registry Authority</p>
        </div>
        <nav className="flex-1 mt-4">
          <div className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-8 py-4 transition-colors duration-200 text-left
                    ${isActive 
                      ? 'bg-primary/10 text-primary border-r-4 border-primary font-bold' 
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    }`}
                >
                  <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                  <span className="font-headline tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
        <div className="p-6">
          <button className="w-full py-4 rounded-md bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold shadow-[0_4px_20px_rgba(143,245,255,0.2)] active:scale-95 transition-transform duration-150">
            New Entry
          </button>
          <div className="mt-8 flex items-center justify-between px-2 w-full">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <img
                  alt="Admin User Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-primary/20"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9hvVavHZPZy4sIdE-YmZwBGRvoZfxz6Vl-Jpfb5V7_oiRLmPOFr53wq414lM9ImLTpeGKxDgizvlgDQVxCHefit2WVW5XNaDG-1FGMXqep0p55l7BXWgpyUmzAc4bevNVFuoK45bVboiOzhb4irzA71FQHpKnIkcAAbflS87hrMZGGEDhAmzKTr_Es3ne533ZBNlJjsK23f9tC25ODTSZeybLPDjulD16eFXaK0YLDg1h-mlxX_9Yfu5g2Jf60pyImgnaTpqdhJm6"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-tertiary rounded-full border-2 border-surface-container shadow-sm animate-pulse"></div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-on-surface truncate pr-1" title={loading ? 'Loading...' : (adminDetails?.full_name || 'Admin User')}>
                  {loading ? 'Loading...' : (adminDetails?.full_name || 'Admin User')}
                </p>
                <p className="text-[0.7rem] text-on-surface-variant uppercase tracking-tighter truncate" title={loading ? 'Registrar' : (adminDetails?.role === 'authority' ? 'Chief Registrar' : adminDetails?.role || 'Registrar')}>
                  {loading ? 'Registrar' : (adminDetails?.role === 'authority' ? 'Chief Registrar' : adminDetails?.role || 'Registrar')}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              title="Sign Out"
              className="text-on-surface-variant hover:text-error transition-all p-2 rounded-full hover:bg-error/10 flex items-center justify-center cursor-pointer flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>

        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-72 flex-grow min-h-screen flex flex-col">
        {/* TopNavBar Shell */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-12 h-20 bg-surface/40 backdrop-blur-xl">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
              <input
                className="w-full bg-surface-container-lowest border-none rounded-sm py-2.5 pl-12 pr-4 text-sm focus:ring-1 focus:ring-primary/50 text-on-surface placeholder:text-on-surface-variant/50 transition-all outline-none"
                placeholder="Search transactions, properties, or identities..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6">
              <button className="text-on-surface-variant hover:text-primary transition-all relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-surface-dim"></span>
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-all">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant/20"></div>
            <div className="flex items-center gap-3">
              <span className="font-headline text-lg font-bold gradient-text">Authority Panel</span>
              <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center ghost-border">
                <span className="material-symbols-outlined text-sm">shield</span>
              </div>
            </div>
          </div>
        </header>

        <section className="p-12 space-y-12 max-w-7xl mx-auto flex-grow">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STAT_CARDS.map((card) => (
              <div
                key={card.id}
                className="surface-container-low p-8 rounded-lg relative overflow-hidden group hover:bg-surface-container-high transition-all duration-300 border border-outline-variant/15 cursor-pointer hover-lift"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 ${card.bgClass} rounded-md`}>
                    <span className={`material-symbols-outlined ${card.colorClass}`}>{card.icon}</span>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-[0.7rem] font-label
                      ${card.status === 'up' ? 'text-tertiary' : card.status === 'urgent' ? 'text-error' : 'text-on-surface-variant'}`}
                  >
                    {card.status === 'up' && <span className="material-symbols-outlined text-[1rem]">trending_up</span>}
                    {card.change}
                  </span>
                </div>
                <p className="font-label uppercase text-[0.7rem] text-on-surface-variant tracking-[0.2em]">{card.label}</p>
                <h3 className="text-4xl font-display font-bold mt-2">{card.value}</h3>
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className={`material-symbols-outlined text-8xl ${card.colorClass}`}>{card.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Land Review Panel */}
          <div className="space-y-6">
            <div className="flex items-end justify-between px-2">
              <div>
                <span className="text-primary font-label text-[0.7rem] tracking-widest uppercase">Critical Action Required</span>
                <h2 className="text-3xl font-display font-bold mt-1">Land Review Panel</h2>
              </div>
              <div className="flex items-center gap-4 text-on-surface-variant text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
                  Live Ledger Sync
                </div>
                <span>Case #REV-00912</span>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-8">
              {/* Left Content: Property & Details */}
              <div className="col-span-12 lg:col-span-8 glass-card rounded-lg p-10 border border-primary/5">
                <div className="flex flex-col md:flex-row justify-between gap-12">
                  <div className="space-y-10 flex-1">
                    {/* Owner Section */}
                    <div className="flex items-center gap-6">
                      <img
                        alt="Alex Sterling Avatar"
                        className="w-16 h-16 rounded-full object-cover border border-outline-variant/15"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm7gAMTnBgnEoGSIlB1WXRjNlzvLmP98IuvjRK1s5pGm-A_VpvKKZjTZDI43rR-SWsA2mkZUyzcVcbqyHbPUoooILnYDyvDNE4ofoe8lVN-9ZQVuyVcf4DCoUGvOpRscPgP1DMPfHu_zVhsmscVKTi3t3Te8TOyxDMsN7MZMnPd1yQI-xNDM17AskdsJt8AjUeKgkFG2a2zctRfJCJWzlHGq5oCJEyVD5BOODxiec7gzM0g2XWPvyzaZq-1kjyJyvpbrh5yecpOPEn"
                      />
                      <div>
                        <p className="font-label uppercase text-[0.6rem] text-on-surface-variant tracking-[0.2em]">Owner Details</p>
                        <h4 className="text-2xl font-display font-bold">Alex Sterling</h4>
                        <p className="font-label text-xs font-mono text-primary/70 mt-1">ID: OX82F...A1E</p>
                      </div>
                    </div>
                    {/* Specs Section */}
                    <div className="grid grid-cols-2 gap-8 py-8 border-y border-outline-variant/10">
                      <div>
                        <p className="font-label uppercase text-[0.6rem] text-on-surface-variant tracking-[0.2em]">Plot Reference</p>
                        <p className="text-xl font-headline font-bold mt-1">#PL-881</p>
                      </div>
                      <div>
                        <p className="font-label uppercase text-[0.6rem] text-on-surface-variant tracking-[0.2em]">Total Area</p>
                        <p className="text-xl font-headline font-bold mt-1">1,250 SQ. FT.</p>
                      </div>
                    </div>
                    {/* Documents Section */}
                    <div>
                      <p className="font-label uppercase text-[0.6rem] text-on-surface-variant tracking-[0.2em] mb-4">Document Gallery</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="surface-container p-4 rounded-md flex items-center justify-between border border-outline-variant/15 hover:bg-surface-container-highest transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-primary/5 flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary">description</span>
                            </div>
                            <span className="text-sm font-medium">Title Deed</span>
                          </div>
                          <button onClick={() => alert('Viewing Title Deed')} className="text-[0.7rem] uppercase font-label font-bold text-primary hover:underline">
                            View File
                          </button>
                        </div>
                        <div className="surface-container p-4 rounded-md flex items-center justify-between border border-outline-variant/15 hover:bg-surface-container-highest transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-secondary/5 flex items-center justify-center">
                              <span className="material-symbols-outlined text-secondary">verified</span>
                            </div>
                            <span className="text-sm font-medium">Ownership Proof</span>
                          </div>
                          <button onClick={() => alert('Viewing Ownership Proof')} className="text-[0.7rem] uppercase font-label font-bold text-secondary hover:underline">
                            View File
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Map Section */}
                  <div className="w-full md:w-80 space-y-4">
                    <p className="font-label uppercase text-[0.6rem] text-on-surface-variant tracking-[0.2em]">Geospatial Preview</p>
                    <div className="aspect-square w-full rounded-lg overflow-hidden relative group border border-outline-variant/20">
                      <img
                        alt="Geospatial Map"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOJOGV7JNQXaM0gwFdcXYg4QgXeqeICK4swRAx5_GT5BAONNpVbxaJ8ppuqepbPOkOdwoAKKGj_jlBlIMyJJB1uiwKDGnIugbHrGFELbZEJTWrZPCah6T15gTZCo7o3kZbZBNWtqyfooZgSV7--U7G0jUkw_3DNHrbj0ASFE3vdDFGgnWr4hb9yFfJK7IB9vEoy75pWyMyzUf9dsvzxNkUnDfG4pL8PhMAmmjrOffgML38gD3_JYa02qDhMlg31q8qbuXLgAO02LxX"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                      <button className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-surface-bright/90 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 hover:bg-primary hover:text-on-primary transition-all">
                        Open Map
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[0.6rem] font-mono text-on-surface-variant justify-center bg-surface-container-lowest py-2 rounded">
                      51.5074° N, 0.1278° W
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Sidebar: Decision Hub */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                <div className="surface-container p-8 rounded-lg border border-outline-variant/15 flex-grow flex flex-col justify-center space-y-6">
                  <h3 className="text-xl font-display font-bold">Registry Decision</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Review all associated metadata and blockchain hash verification before final submission. Approved records are immutable on the MainNet.
                  </p>
                  <div className="space-y-4 pt-4">
                    <button
                      onClick={() => handleAction('approved')}
                      className="w-full py-4 rounded-md bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold shadow-[0_4px_30px_rgba(0,238,252,0.3)] hover:brightness-110 active:scale-95 transition-all btn-shimmer"
                    >
                      Approve Property
                    </button>
                    <button
                      onClick={() => handleAction('changes')}
                      className="w-full py-4 rounded-md border border-outline-variant/15 text-on-surface font-bold hover:bg-surface-variant active:scale-95 transition-all"
                    >
                      Request Changes
                    </button>
                    <button
                      onClick={() => handleAction('rejected')}
                      className="w-full py-4 rounded-md bg-error/10 text-error border border-error/20 font-bold hover:bg-error hover:text-on-error active:scale-95 transition-all"
                    >
                      Reject Entry
                    </button>
                  </div>
                </div>
                {/* Secondary Info Card */}
                <div className="surface-container-low p-6 rounded-lg border-l-4 border-secondary/50">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-secondary text-sm">info</span>
                    <p className="text-xs font-bold uppercase tracking-widest text-secondary">Provisional Alert</p>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Cross-reference with the Department of Urban Development (DUD) suggests a minor boundary overlap with Plot #PL-880. Proceed with caution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Background Decorator Auras */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] pointer-events-none rounded-full animate-float-slow"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/5 blur-[100px] pointer-events-none rounded-full animate-float"></div>
    </div>
  );
}

export default AuthorityDashboardPage;
