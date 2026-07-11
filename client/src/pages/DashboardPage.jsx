import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', id: 'dashboard' },
  { icon: 'landscape', label: 'My Lands', id: 'my-lands' },
  { icon: 'cloud_upload', label: 'Upload Land', id: 'upload-land' },
  { icon: 'token', label: 'NFT Holdings', id: 'nft-holdings' },
  { icon: 'shopping_cart', label: 'Marketplace', id: 'marketplace' },
  { icon: 'history', label: 'Transaction History', id: 'tx-history' },
];

const GlassCard = ({ children, className = '' }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`glass-card rounded-lg ${className}`}
    >
      {children}
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Supabase states
  const [userProfile, setUserProfile] = useState({
    fullName: 'Alex Sterling',
    role: 'seller',
    walletAddress: '0x82f0a1e3e920d3f2c5d144888fca02d18492031',
    id: null
  });
  const [stats, setStats] = useState({
    totalLands: 12,
    nftsOwned: 8,
    pendingVerifications: 2
  });
  const [myProperties, setMyProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return; // Fallback to mock data
      }

      // Fetch user profile from Supabase profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserProfile({
          fullName: profile.full_name || 'Anonymous User',
          role: profile.role || 'buyer',
          walletAddress: profile.wallet_address || '0x0000000000000000000000000000000000000000',
          id: profile.id
        });

        // Query property counts
        const { count: landsCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id);

        // Query active NFT holdings count
        const { count: nftsCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id)
          .not('token_id', 'is', null);

        // Query pending application verifications
        const { count: pendingCount } = await supabase
          .from('land_applications')
          .select('*', { count: 'exact', head: true })
          .eq('applicant_id', user.id)
          .eq('status', 'pending');

        setStats({
          totalLands: landsCount || 0,
          nftsOwned: nftsCount || 0,
          pendingVerifications: pendingCount || 0
        });

        // Retrieve the list of owned properties
        const { data: props } = await supabase
          .from('properties')
          .select('*')
          .eq('owner_id', user.id);

        if (props && props.length > 0) {
          setMyProperties(props);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    // Tick the block number up subtly
    const el = document.getElementById('block-ticker');
    if (!el) return;
    let n = 18492031;
    const iv = setInterval(() => {
      n += Math.floor(Math.random() * 3);
      if (el) el.textContent = `#${n.toLocaleString()}`;
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen selection:bg-primary/20 relative page-enter">
      {/* Grid Background */}
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />

      {/* ─── Sidebar ─── */}
      <nav
        className={`fixed left-0 top-0 h-screen w-72 bg-surface-variant/40 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)]
          flex flex-col py-8 px-6 z-50 overflow-hidden
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand */}
        <div className="mb-12">
          <h1 className="text-2xl font-display font-bold tracking-tighter text-primary">Bhoomi</h1>
        </div>

        {/* Nav Links */}
        <div className="flex flex-col gap-1 flex-grow">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
              className={`flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-300 active:scale-95 text-left w-full
                ${activeNav === item.id
                  ? 'text-primary font-bold border-r-2 border-primary-container bg-primary/5'
                  : 'text-on-surface-variant font-medium hover:text-primary hover:bg-primary/5'}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-headline tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Settings */}
        <button
          onClick={() => setActiveNav('settings')}
          className={`flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-300 active:scale-95 text-left w-full mt-4
            ${activeNav === 'settings'
              ? 'text-primary font-bold border-r-2 border-primary-container bg-primary/5'
              : 'text-on-surface-variant font-medium hover:text-primary hover:bg-primary/5'}`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-headline tracking-wide">Settings</span>
        </button>

        {/* User Profile display card */}
        <div className="mt-8 pt-8 border-t border-outline-variant/20 flex items-center gap-4">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-DjRoCwQ23L6FPeXQfBrHiZhyhQ2HKW18NqSbIULJuhkZ1u3mpwDC2xy-O40IE_VNJxHsURMtxo3UPOxtDOQlKzIJPZgqC2Gbfw3TC09-4ihB7UmDbChB6PDe2cL9pbUSznRuShAq6bDFBK1cd10fa0cn7awvU_FqrN9EFoD02CRN_os4NvlZDhlTuUS4AYLTvFM13SC4g1P-6Iq71HJNTlafN7NfCPoVwxW4mgonsDKrfwTyppUZzHnPaIgIbyAuswh2RnB4A9gc"
            alt="User Profile Avatar"
            className="w-10 h-10 rounded-full border border-primary/30 flex-shrink-0"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-on-surface truncate">{userProfile.fullName}</p>
            <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-tighter">
              ID: {userProfile.walletAddress ? `${userProfile.walletAddress.substring(0, 7)}...${userProfile.walletAddress.substring(37)}` : 'No Wallet'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="ml-auto text-on-surface-variant hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
          </button>
        </div>
      </nav>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Main Canvas ─── */}
      <main className="md:ml-72 min-h-screen relative z-10">

        {/* Top App Bar */}
        <header className="sticky top-0 right-0 w-full h-20 bg-surface/60 backdrop-blur-md flex justify-between items-center px-6 md:px-10 z-40 border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            {/* Hamburger for mobile */}
            <button
              className="md:hidden text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setSidebarOpen(v => !v)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-xl font-headline font-black text-primary tracking-tight">
              {userProfile.role === 'seller' ? 'Land Owner Dashboard' : 'Property Buyer Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Search */}
            <div className="relative group hidden sm:block">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-sm">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search lands, NFTs, coordinates..."
                className="bg-surface-container-lowest border-none rounded-md pl-10 pr-4 py-2 w-60 md:w-80 text-sm focus:ring-1 focus:ring-primary transition-all text-on-surface placeholder:text-on-surface-variant/50 outline-none"
              />
            </div>

            {/* Notification bell */}
            <button className="relative w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-all">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error"></span>
            </button>

            {/* ETH Balance */}
            <button className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full text-on-surface-variant hover:text-primary transition-all border border-outline-variant/10">
              <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
              <span className="text-sm font-label font-medium tracking-tight">2.45 ETH</span>
            </button>
          </div>
        </header>

        {/* ─── Content Body ─── */}
        <div className="p-6 md:p-10 max-w-7xl mx-auto">

          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
            {/* Card 1 — Total Lands */}
            <GlassCard className="p-8 relative overflow-hidden group hover-lift">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl transition-all group-hover:bg-primary/20" />
              <p className="text-on-surface-variant font-label text-xs uppercase tracking-[0.2em] mb-2">Total Lands Registered</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-display font-bold text-on-surface">{stats.totalLands}</span>
                {userProfile.id ? (
                  <span className="text-primary-dim font-label text-sm mb-2">Active Assets</span>
                ) : (
                  <span className="text-primary-dim font-label text-sm mb-2">+2 this month</span>
                )}
              </div>
              <div className="mt-6 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full w-3/4 primary-gradient rounded-full" />
              </div>
            </GlassCard>

            {/* Card 2 — NFTs Owned */}
            <GlassCard className="p-8 relative overflow-hidden group hover-lift">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/10 rounded-full blur-3xl transition-all group-hover:bg-secondary/20" />
              <p className="text-on-surface-variant font-label text-xs uppercase tracking-[0.2em] mb-2">NFTs Owned</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-display font-bold text-on-surface">{stats.nftsOwned}</span>
                {userProfile.id ? (
                  <span className="text-secondary font-label text-sm mb-2">Immutable Deeds</span>
                ) : (
                  <span className="text-secondary font-label text-sm mb-2">Portfolio Value: 12.4 ETH</span>
                )}
              </div>
              <div className="mt-6 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-secondary rounded-full" />
              </div>
            </GlassCard>

            {/* Card 3 — Pending Verifications */}
            <GlassCard className="p-8 relative overflow-hidden group hover-lift">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/10 rounded-full blur-3xl transition-all group-hover:bg-tertiary/20" />
              <p className="text-on-surface-variant font-label text-xs uppercase tracking-[0.2em] mb-2">Pending Verifications</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-display font-bold text-on-surface">{stats.pendingVerifications}</span>
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                  <span className="text-tertiary font-label text-sm">Syncing Ledger</span>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <div className="h-1 flex-grow bg-tertiary rounded-full" />
                <div className="h-1 flex-grow bg-surface-container-highest rounded-full" />
              </div>
            </GlassCard>
          </div>

          {/* ── Section Header ── */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
            <div className="space-y-1">
              <h3 className="text-3xl font-display font-bold">
                {myProperties.length > 0 ? 'Your Portfolio Assets' : 'Recent Land Assets'}
              </h3>
              <p className="text-on-surface-variant font-body">Manage and monitor your decentralized real estate portfolio.</p>
            </div>
            {userProfile.role === 'seller' && (
              <Link
                to="/kyc"
                className="primary-gradient text-on-primary-container px-8 py-4 rounded-md font-display font-bold flex items-center gap-3 transition-all active:scale-95 shadow-[0_10px_30px_rgba(0,238,252,0.2)] hover:shadow-[0_10px_40px_rgba(0,238,252,0.35)] whitespace-nowrap btn-shimmer"
              >
                <span className="material-symbols-outlined">add</span>
                Upload New Land
              </Link>
            )}
          </div>

          {/* ── Asymmetric Land Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {myProperties.length > 0 ? (
              <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                {myProperties.map((prop) => (
                  <div key={prop.id} className="group">
                    <GlassCard className="overflow-hidden flex flex-col h-[420px] relative border border-outline-variant/15 shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                      <div className="h-48 relative overflow-hidden bg-surface-container">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTHk7S3F-bKLRTsMlCOiK5FUTfl8k2N26eG-MDNkrV0joDJ118dj4NHEf6fXxpKOvX70afNwVuQviouu5zdxZjOFXWQkiFu7ngIPRUkMivdlGQycPsg5CS-3gniKxDjTPFn1S51kPrMWrGIoCnaygPJZa5swDiAdvURqesOlGYrK4ISJShcgwurx1xSd0XnBT-W5YoGeDmJlr_u8wS2Xma3NODFsTUEw_mAHxUKN7CqG_5tTU1Nrly40U4FOhwPmleiscK9U2cCyut"
                          alt={prop.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className={`absolute top-4 right-4 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-wider border border-white/10
                          ${prop.status === 'approved' ? 'bg-secondary-container/90 text-on-secondary-container' : 'bg-tertiary-container/90 text-on-tertiary-container'}`}>
                          {prop.status}
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="text-2xl font-display font-bold">{prop.name}</h5>
                          <span className="bg-primary/10 text-primary text-[10px] font-label font-bold px-2 py-0.5 rounded">
                            {prop.area_unit}
                          </span>
                        </div>
                        <p className="text-[10px] text-on-surface-variant mb-4 font-label uppercase tracking-widest">
                          CODE: {prop.property_code} | SURVEY: {prop.survey_number}
                        </p>
                        <p className="text-sm text-on-surface-variant font-body mb-4 line-clamp-2">
                          {prop.description || prop.physical_address}
                        </p>
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-outline-variant/10">
                          <span className="text-primary-dim font-mono text-[10px]">{prop.latitude}° N, {prop.longitude}° W</span>
                          <Link to={`/property/${prop.id}`} className="text-primary hover:underline font-label text-xs uppercase font-bold flex items-center gap-1">
                            Manage Asset
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </Link>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Featured Card (Large) - Fallback Mock */}
                <div className="lg:col-span-8 group">
                  <GlassCard className="relative overflow-hidden h-[400px]">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTHk7S3F-bKLRTsMlCOiK5FUTfl8k2N26eG-MDNkrV0joDJ118dj4NHEf6fXxpKOvX70afNwVuQviouu5zdxZjOFXWQkiFu7ngIPRUkMivdlGQycPsg5CS-3gniKxDjTPFn1S51kPrMWrGIoCnaygPJZa5swDiAdvURqesOlGYrK4ISJShcgwurx1xSd0XnBT-W5YoGeDmJlr_u8wS2Xma3NODFsTUEw_mAHxUKN7CqG_5tTU1Nrly40U4FOhwPmleiscK9U2cCyut"
                      alt="Metropolis Sector 7G"
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-secondary-container/80 backdrop-blur-md text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-wider">
                            Verified NFT
                          </span>
                          <span className="bg-primary/20 backdrop-blur-md text-primary px-3 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-wider">
                            Sector 7G
                          </span>
                        </div>
                        <h4 className="text-4xl font-display font-bold mb-2">Metropolis Sector 7G</h4>
                        <p className="text-on-surface-variant font-body flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          Coordinates: 42.3601° N, 71.0589° W
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <button className="w-12 h-12 rounded-full border border-outline-variant/30 flex items-center justify-center backdrop-blur-md hover:bg-white/10 transition-colors">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                        <button className="w-12 h-12 rounded-full border border-outline-variant/30 flex items-center justify-center backdrop-blur-md hover:bg-white/10 transition-colors text-primary">
                          <span className="material-symbols-outlined">share</span>
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* Right stacked cards - Fallback Mock */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* Azure Heights Card */}
                  <GlassCard className="overflow-hidden group flex flex-col flex-1">
                    <div className="h-40 relative overflow-hidden">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbPIpKmurIl87B6L9xfw4UZa_t1qgVbg09uLe8zs5Rlp9WWUc5kFK5nA-ruQNtJHN3fKhK-QKOca6gY56wvPWwwIXJn-JxPSO9DqNgtrkjDUv4QPjx_6fgK2YsR3a3b_XSVqfmfnhLDVpj5gHZ7nMdqJrVz_2ZjhXmlJ3Yi_UkKd6_exPaeSFGybCYeu2voJ_EkuPtGeqL14FAoYXEJwRzhKlnzNEMngA0j3DQ93jDaKT7YzD5kM-8gt53biGaeXv4QrYKZi0xfh1a"
                        alt="Azure Heights Parcel B"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-tertiary-container/90 text-on-tertiary-container px-2 py-1 rounded text-[8px] font-label font-black uppercase">
                        Minting Now
                      </div>
                    </div>
                    <div className="p-6">
                      <h5 className="text-xl font-display font-bold mb-1">Azure Heights Parcel B</h5>
                      <p className="text-xs text-on-surface-variant mb-4 font-label tracking-tighter">HASH: 0x92f...e76c</p>
                      <div className="flex justify-between items-center mt-auto">
                        <span className="text-primary font-bold">4.2 ETH</span>
                        <Link to="/payment" className="text-on-surface-variant hover:text-on-surface transition-colors font-label text-xs uppercase font-bold flex items-center gap-2">
                          View Details
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </>
            )}
          </div>

        </div>{/* /content */}
      </main>
    </div>
  );
};

export default DashboardPage;
