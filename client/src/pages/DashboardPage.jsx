import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { mintLandNFT, getWalletBalance, listLandNFT } from '../utils/blockchain';
import MapDraw from '../components/MapDraw';
import { formatCoordinates } from '../utils/helpers';

// ─── Pinata Upload ────────────────────────────────────────────────────────────
const pinataUpload = async (file, name) => {
  const jwt = import.meta.env.VITE_PINATA_JWT;
  const form = new FormData();
  form.append('file', file);
  form.append('pinataMetadata', JSON.stringify({ name }));
  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Pinata upload failed for ${name}`);
  const data = await res.json();
  return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
};

const pinataUploadJSON = async (jsonObj, name) => {
  const jwt = import.meta.env.VITE_PINATA_JWT;
  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pinataMetadata: { name }, pinataContent: jsonObj }),
  });
  if (!res.ok) throw new Error('Pinata JSON upload failed');
  const data = await res.json();
  return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
};

// ─── Navigation ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', id: 'dashboard' },
  { icon: 'landscape', label: 'My Lands', id: 'my-lands' },
  { icon: 'cloud_upload', label: 'Upload Land', id: 'upload-land' },
  { icon: 'token', label: 'NFT Holdings', id: 'nft-holdings' },
  { icon: 'receipt_long', label: 'Transaction History', id: 'tx-history' },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:  { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    approved: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    rejected: { bg: 'bg-red-500/20',   text: 'text-red-400',   border: 'border-red-500/30'   },
    minted:   { bg: 'bg-purple-500/20',text: 'text-purple-400',border: 'border-purple-500/30'},
    upload:   { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
    sold:     { bg: 'bg-teal-500/20',  text: 'text-teal-400',  border: 'border-teal-500/30'  },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${s.bg} ${s.text} ${s.border}`}>
      {status}
    </span>
  );
};

// ─── GlassCard ────────────────────────────────────────────────────────────────
const GlassCard = ({ children, className = '' }) => {
  const ref = useRef(null);
  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    ref.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };
  return (
    <div ref={ref} onMouseMove={handleMouseMove} className={`glass-card rounded-lg ${className}`}>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Auth & Profile ──
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Wallet ──
  const [walletAddress, setWalletAddress] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);
  const [walletConnecting, setWalletConnecting] = useState(false);

  // ── Data ──
  const [myLands, setMyLands] = useState([]);
  const [myNFTs, setMyNFTs] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // ── Upload Form ──
  const [form, setForm] = useState({ landName: '', description: '', areaSqft: '', coordinates: '', price: '' });
  const [pointInputs, setPointInputs] = useState(['', '', '', '']);
  const [files, setFiles] = useState({ image: null, deed: null, agreement: null, registry: null });
  const [uploadStep, setUploadStep] = useState(''); // status message
  const [uploading, setUploading] = useState(false);
  const [listingToken, setListingToken] = useState(null); // tracking token being listed

  const points = pointInputs.map(str => {
    if (!str) return null;
    const parts = str.split(',').map(p => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] };
    }
    return null;
  });

  // ─── Load Profile ─────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    
    // Read from localStorage instead of Supabase Auth
    const mockUserStr = localStorage.getItem('mockUser');
    if (!mockUserStr) { navigate('/login'); return; }
    
    const mockUser = JSON.parse(mockUserStr);
    setUserProfile(mockUser);

    const addr = mockUser.wallet_address;
    if (addr) {
      setWalletAddress(addr);
      getWalletBalance(addr).then(setEthBalance);

      // Load lands
      const { data: lands } = await supabase
        .from('land_parcels').select('*').eq('owner_address', addr).order('created_at', { ascending: false });
      if (lands) {
        setMyLands(lands);
        setMyNFTs(lands.filter(l => l.status === 'approved' && l.nft_tx_hash));
      }

      // Load transactions
      const { data: txs } = await supabase
        .from('land_transactions').select('*').eq('seller_address', addr).order('created_at', { ascending: false });
      if (txs) setTransactions(txs);
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ─── Connect MetaMask Wallet ──────────────────────────────────────────────────
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed. Please install it from metamask.io');
      return;
    }
    setWalletConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const addr = accounts[0];

      // Save to mock profile
      const mockUserStr = localStorage.getItem('mockUser');
      if (mockUserStr) {
        const mockUser = JSON.parse(mockUserStr);
        mockUser.wallet_address = addr;
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        setUserProfile(mockUser);
      }

      setWalletAddress(addr);
      getWalletBalance(addr).then(setEthBalance);

      // Reload lands
      const { data: lands } = await supabase
        .from('land_parcels').select('*').eq('owner_address', addr).order('created_at', { ascending: false });
      if (lands) {
        setMyLands(lands);
        setMyNFTs(lands.filter(l => l.status === 'approved' && l.nft_tx_hash));
      }
    } catch (err) {
      console.error(err);
      alert('Wallet connection failed: ' + err.message);
    } finally {
      setWalletConnecting(false);
    }
  };

  // ─── Logout ───────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    localStorage.removeItem('mockUser');
    navigate('/login');
  };

  // ─── Format wallet ────────────────────────────────────────────────────────────
  const fmt = (addr) => addr ? `${addr.substring(0, 6)}...${addr.slice(-4)}` : '';

  // ─── Upload Land Handler ──────────────────────────────────────────────────────
  const handleUploadLand = async (e) => {
    e.preventDefault();
    if (!walletAddress) { alert('Please connect your wallet first.'); return; }
    if (!files.image || !files.deed) { alert('Land photo and Title Deed are required.'); return; }

    setUploading(true);
    try {
      setUploadStep('📤 Uploading land photo to IPFS...');
      const imageUrl = await pinataUpload(files.image, `land-image-${Date.now()}`);

      setUploadStep('📄 Uploading Title Deed to IPFS...');
      const deedUrl = await pinataUpload(files.deed, `deed-${Date.now()}`);

      let agreementUrl = null, registryUrl = null;

      if (files.agreement) {
        setUploadStep('📄 Uploading Agreement to IPFS...');
        agreementUrl = await pinataUpload(files.agreement, `agreement-${Date.now()}`);
      }
      if (files.registry) {
        setUploadStep('📄 Uploading Registry Paper to IPFS...');
        registryUrl = await pinataUpload(files.registry, `registry-${Date.now()}`);
      }

      setUploadStep('🔗 Creating NFT metadata on IPFS...');
      const metadata = {
        name: form.landName,
        description: form.description,
        coordinates: form.coordinates,
        area_sqft: parseFloat(form.areaSqft) || 0,
        image: imageUrl,
        attributes: [
          { trait_type: 'Status', value: 'Pending Verification' },
          { trait_type: 'Area', value: `${form.areaSqft} sqft` },
        ],
      };
      const metadataUrl = await pinataUploadJSON(metadata, `metadata-${Date.now()}`);

      setUploadStep('💾 Saving to database...');
      const tokenId = Math.floor(Math.random() * 900000) + 100000;
      const { data: inserted, error } = await supabase.from('land_parcels').insert({
        owner_address: walletAddress,
        coordinates: form.coordinates, // Now storing stringified JSON array
        ipfs_metadata_url: metadataUrl,
        price: parseFloat(form.price) || 0,
        is_for_sale: false,
        token_id: tokenId,
        land_name: form.landName,
        description: form.description,
        area_sqft: parseFloat(form.areaSqft) || 0,
        land_image_url: imageUrl,
        deed_url: deedUrl,
        agreement_url: agreementUrl,
        registry_url: registryUrl,
        status: 'pending',
      }).select().single();

      if (error) throw error;

      await supabase.from('land_transactions').insert({
        land_parcel_id: inserted.id,
        seller_address: walletAddress,
        event_type: 'upload',
        amount_eth: 0,
      });

      setUploadStep('✅ Submitted! Awaiting authority review.');
      setForm({ landName: '', description: '', areaSqft: '', coordinates: '', price: '' });
      setPointInputs(['', '', '', '']);
      setFiles({ image: null, deed: null, agreement: null, registry: null });

      await loadAll();
      setTimeout(() => { setUploadStep(''); setActiveNav('my-lands'); }, 2500);
    } catch (err) {
      console.error(err);
      setUploadStep(`❌ Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // ─── Stats ────────────────────────────────────────────────────────────────────
  const stats = {
    total: myLands.length,
    nfts: myNFTs.length,
    pending: myLands.filter(l => l.status === 'pending').length,
  };

  // ─── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
          <p className="text-on-surface-variant mt-3 text-sm font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // TAB RENDERERS
  // ═══════════════════════════════════════════════════════════════════════════════

  // ── Dashboard Overview ────────────────────────────────────────────────────────
  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Wallet Not Connected Banner */}
      {!walletAddress && (
        <div className="glass-card rounded-lg p-6 border border-primary/20 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-3xl text-primary">account_balance_wallet</span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-bold text-on-surface text-lg">Connect Your Wallet</h4>
            <p className="text-on-surface-variant text-sm mt-0.5">Connect MetaMask to upload lands, receive NFTs, and track your portfolio.</p>
          </div>
          <button onClick={connectWallet} disabled={walletConnecting}
            className="primary-gradient text-on-primary-container px-6 py-3 rounded-md font-bold flex items-center gap-2 whitespace-nowrap btn-shimmer disabled:opacity-60">
            {walletConnecting ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">link</span>}
            {walletConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Lands Registered', value: stats.total, sub: 'Active Assets', color: 'primary' },
          { label: 'NFTs Minted', value: stats.nfts, sub: 'On-Chain Deeds', color: 'secondary' },
          { label: 'Pending Verifications', value: stats.pending, sub: 'Awaiting Authority', color: 'tertiary' },
        ].map(s => (
          <GlassCard key={s.label} className="p-8 relative overflow-hidden group hover-lift">
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${s.color}/10 rounded-full blur-3xl transition-all group-hover:bg-${s.color}/20`} />
            <p className="text-on-surface-variant font-label text-xs uppercase tracking-[0.2em] mb-2">{s.label}</p>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-display font-bold text-on-surface">{s.value}</span>
              <span className={`text-${s.color}-dim font-label text-sm mb-2`}>{s.sub}</span>
            </div>
            <div className="mt-6 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className={`h-full ${s.value > 0 ? 'w-3/4' : 'w-0'} bg-${s.color} rounded-full transition-all duration-700`} />
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Recent Lands */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-2xl font-display font-bold">Recent Lands</h3>
          <button onClick={() => setActiveNav('upload-land')}
            className="primary-gradient text-on-primary-container px-5 py-2.5 rounded-md font-bold flex items-center gap-2 text-sm btn-shimmer">
            <span className="material-symbols-outlined text-sm">add</span> Upload New Land
          </button>
        </div>
        {myLands.length === 0 ? (
          <GlassCard className="p-16 text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">landscape</span>
            <p className="text-on-surface-variant font-medium">You haven't registered any land yet.</p>
            <button onClick={() => setActiveNav('upload-land')} className="mt-4 text-primary text-sm font-bold hover:underline">
              Upload your first land →
            </button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myLands.slice(0, 6).map(land => <LandCard key={land.id} land={land} />)}
          </div>
        )}
      </div>
    </div>
  );

  // ── My Lands ──────────────────────────────────────────────────────────────────
  const LandCard = ({ land }) => (
    <GlassCard className="overflow-hidden group hover-lift">
      <div className="h-40 relative overflow-hidden bg-surface-container">
        {land.land_image_url ? (
          <img src={land.land_image_url} alt={land.land_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">landscape</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <StatusBadge status={land.status || 'pending'} />
        </div>
        {land.status === 'approved' && land.nft_tx_hash && (
          <div className="absolute top-3 left-3 bg-primary/80 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-bold text-on-primary flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">token</span> NFT
          </div>
        )}
      </div>
      <div className="p-5">
        <h5 className="font-display font-bold text-lg text-on-surface truncate mb-0.5">{land.land_name || `Land #${land.token_id}`}</h5>
        <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined text-xs">location_on</span>{formatCoordinates(land.coordinates)}
        </p>
        {land.area_sqft > 0 && (
          <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-3">
            <span className="material-symbols-outlined text-xs">square_foot</span>{land.area_sqft.toLocaleString()} sq. ft
          </p>
        )}
        {land.status === 'rejected' && land.authority_notes && (
          <p className="text-xs text-red-400 bg-red-500/10 rounded p-2 mb-3">{land.authority_notes}</p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10">
          <span className="text-primary font-bold text-sm">{land.price || 0} ETH</span>
          <div className="flex items-center gap-2">
            {land.deed_url && (
              <a href={land.deed_url} target="_blank" rel="noreferrer" className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-0.5">
                Deed <span className="material-symbols-outlined text-xs">open_in_new</span>
              </a>
            )}
            {land.nft_tx_hash && (
              <a href={`https://sepolia.etherscan.io/tx/${land.nft_tx_hash}`} target="_blank" rel="noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-0.5">
                Etherscan <span className="material-symbols-outlined text-xs">open_in_new</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );

  const renderMyLands = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-3xl font-display font-bold">My Lands</h3>
          <p className="text-on-surface-variant text-sm mt-1">{myLands.length} land{myLands.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button onClick={() => setActiveNav('upload-land')}
          className="primary-gradient text-on-primary-container px-5 py-2.5 rounded-md font-bold flex items-center gap-2 text-sm btn-shimmer">
          <span className="material-symbols-outlined text-sm">add</span> Upload Land
        </button>
      </div>

      {myLands.length === 0 ? (
        <GlassCard className="p-20 text-center">
          <span className="material-symbols-outlined text-7xl text-on-surface-variant/20 mb-4">landscape</span>
          <p className="text-on-surface-variant text-lg font-medium">You don't have any land yet.</p>
          <p className="text-on-surface-variant/50 text-sm mt-1 mb-5">Upload your first land to get started.</p>
          <button onClick={() => setActiveNav('upload-land')} className="primary-gradient text-on-primary-container px-6 py-3 rounded-md font-bold btn-shimmer">
            Upload Land
          </button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myLands.map(land => <LandCard key={land.id} land={land} />)}
        </div>
      )}
    </div>
  );

  // ── Upload Land ────────────────────────────────────────────────────────────────
  const renderUploadLand = () => {
    if (!walletAddress) {
      return (
        <div className="max-w-lg mx-auto mt-20 text-center">
          <GlassCard className="p-12">
            <span className="material-symbols-outlined text-6xl text-primary/50 mb-4">account_balance_wallet</span>
            <h3 className="text-2xl font-display font-bold mb-2">Wallet Required</h3>
            <p className="text-on-surface-variant text-sm mb-6">Connect your MetaMask wallet to upload and register land.</p>
            <button onClick={connectWallet} disabled={walletConnecting}
              className="primary-gradient text-on-primary-container px-8 py-3 rounded-md font-bold btn-shimmer flex items-center gap-2 mx-auto">
              <span className="material-symbols-outlined text-sm">link</span>
              Connect MetaMask
            </button>
          </GlassCard>
        </div>
      );
    }

    return (
      <form onSubmit={handleUploadLand} className="max-w-2xl mx-auto">
        <GlassCard className="overflow-hidden">
          <div className="px-8 py-6 border-b border-outline-variant/10 bg-primary/5">
            <h3 className="text-2xl font-display font-bold text-on-surface">Register New Land</h3>
            <p className="text-on-surface-variant text-sm mt-1">Submit your land details and documents to the Government Authority for verification.</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-primary bg-primary/10 rounded px-3 py-1.5 w-fit border border-primary/20">
              <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
              {fmt(walletAddress)}
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Text Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Land Name *</label>
                <input required type="text" value={form.landName}
                  onChange={e => setForm(f => ({ ...f, landName: e.target.value }))}
                  placeholder="e.g. Green Valley Plot"
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/40" />
              </div>
              <div>
                <label className="block text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Area (sq. ft) *</label>
                <input required type="number" value={form.areaSqft}
                  onChange={e => setForm(f => ({ ...f, areaSqft: e.target.value }))}
                  placeholder="e.g. 5000"
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/40" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Plotted Coordinates (Click Map to Populate) *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {pointInputs.map((str, idx) => (
                  <div key={idx} className="relative">
                    <label className="block text-[9px] font-label font-semibold text-primary uppercase tracking-wider mb-1">Point {idx + 1}</label>
                    <input 
                      type="text" 
                      value={str}
                      onChange={(e) => {
                        const nextInputs = [...pointInputs];
                        nextInputs[idx] = e.target.value;
                        setPointInputs(nextInputs);
                        
                        // Dynamically update coordinates JSON
                        const parsedPoints = nextInputs.map(s => {
                          if (!s) return null;
                          const parts = s.split(',').map(p => parseFloat(p.trim()));
                          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return { lat: parts[0], lng: parts[1] };
                          return null;
                        }).filter(p => p !== null);
                        
                        setForm(f => ({ ...f, coordinates: parsedPoints.length >= 3 ? JSON.stringify(parsedPoints) : '' }));
                      }}
                      placeholder="e.g. 28.6139, 77.2090"
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/30 font-mono"
                    />
                    {str && (
                      <button 
                        type="button" 
                        onClick={() => {
                          const nextInputs = [...pointInputs];
                          nextInputs[idx] = '';
                          setPointInputs(nextInputs);
                          
                          const parsedPoints = nextInputs.map(s => {
                            if (!s) return null;
                            const parts = s.split(',').map(p => parseFloat(p.trim()));
                            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return { lat: parts[0], lng: parts[1] };
                            return null;
                          }).filter(p => p !== null);
                          
                          setForm(f => ({ ...f, coordinates: parsedPoints.length >= 3 ? JSON.stringify(parsedPoints) : '' }));
                        }}
                        className="absolute right-2 top-6 text-on-surface-variant/60 hover:text-red-400"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="relative">
                <MapDraw 
                  isInteractive={true} 
                  points={points}
                  onMapClick={(latlng) => {
                    const nextInputs = [...pointInputs];
                    const emptyIndex = nextInputs.findIndex(s => !s.trim());
                    if (emptyIndex !== -1) {
                      nextInputs[emptyIndex] = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
                      setPointInputs(nextInputs);
                      
                      const parsedPoints = nextInputs.map(s => {
                        if (!s) return null;
                        const parts = s.split(',').map(p => parseFloat(p.trim()));
                        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return { lat: parts[0], lng: parts[1] };
                        return null;
                      }).filter(p => p !== null);
                      
                      setForm(f => ({ ...f, coordinates: parsedPoints.length >= 3 ? JSON.stringify(parsedPoints) : '' }));
                    }
                  }}
                />
              </div>
              <p className="text-[10px] text-on-surface-variant/70 mt-1.5">Click up to 4 different spots on the map to define the corners. They will automatically connect.</p>
            </div>

            <div>
              <label className="block text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Description</label>
              <textarea rows={3} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the land: type, location, features..."
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/40 resize-none" />
            </div>

            <div>
              <label className="block text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Asking Price (ETH)</label>
              <input type="number" step="0.01" value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="e.g. 2.5"
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/40" />
            </div>

            {/* Document Uploads */}
            <div>
              <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest mb-3">Documents</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'image', label: '📸 Land Photo *', required: true, accept: 'image/*' },
                  { key: 'deed', label: '📄 Title Deed *', required: true, accept: '.pdf,.jpg,.jpeg,.png' },
                  { key: 'agreement', label: '📋 Sale Agreement', required: false, accept: '.pdf,.jpg,.jpeg,.png' },
                  { key: 'registry', label: '🏛️ Registry Paper', required: false, accept: '.pdf,.jpg,.jpeg,.png' },
                ].map(({ key, label, required, accept }) => (
                  <label key={key}
                    className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center ${files[key] ? 'border-primary/50 bg-primary/5' : 'border-outline-variant/20 hover:border-primary/30 hover:bg-primary/5'}`}>
                    <span className="text-sm font-medium text-on-surface-variant mb-1">{label}</span>
                    {files[key] ? (
                      <span className="text-xs text-primary font-semibold">{files[key].name}</span>
                    ) : (
                      <span className="text-xs text-on-surface-variant/50">Click to upload</span>
                    )}
                    <input type="file" accept={accept} className="hidden"
                      onChange={e => setFiles(f => ({ ...f, [key]: e.target.files[0] }))} />
                  </label>
                ))}
              </div>
            </div>

            {/* Authority Notice */}
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <span className="material-symbols-outlined text-amber-400 text-xl mt-0.5">info</span>
              <p className="text-xs text-amber-200/80">All 4 documents are uploaded to IPFS (permanent, decentralized). The Government Authority will review your submission and approve NFT minting. You will see the NFT in your Holdings once approved.</p>
            </div>

            {/* Status Message */}
            {uploadStep && (
              <div className={`text-sm font-medium text-center py-3 rounded-lg border ${
                uploadStep.startsWith('✅') ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                uploadStep.startsWith('❌') ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                'bg-primary/10 text-primary border-primary/20'
              }`}>
                {uploadStep}
              </div>
            )}

            <button type="submit" disabled={uploading}
              className="w-full py-4 primary-gradient text-on-primary-container rounded-md font-bold btn-shimmer flex items-center justify-center gap-2 disabled:opacity-60 shadow-[0_10px_30px_rgba(0,238,252,0.15)]">
              {uploading ? (
                <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Uploading to IPFS...</>
              ) : (
                <><span className="material-symbols-outlined text-sm">send</span> Submit to Authority</>
              )}
            </button>
          </div>
        </GlassCard>
      </form>
    );
  };

  // ── NFT Holdings ──────────────────────────────────────────────────────────────
  const renderNFTHoldings = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-3xl font-display font-bold">NFT Holdings</h3>
        <p className="text-on-surface-variant text-sm mt-1">Government-verified, blockchain-minted land NFTs on Sepolia</p>
      </div>

      {myNFTs.length === 0 ? (
        <GlassCard className="p-20 text-center">
          <span className="material-symbols-outlined text-7xl text-on-surface-variant/20 mb-4">token</span>
          <p className="text-on-surface-variant text-lg font-medium">No NFTs minted yet.</p>
          <p className="text-on-surface-variant/50 text-sm mt-1">Upload land and wait for authority approval to receive your NFT.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myNFTs.map(nft => (
            <GlassCard key={nft.id} className="overflow-hidden group hover-lift border border-primary/10">
              <div className="h-44 bg-gradient-to-br from-primary/20 via-secondary/10 to-tertiary/20 flex items-center justify-center relative">
                {nft.land_image_url ? (
                  <img src={nft.land_image_url} alt={nft.land_name} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs font-label text-primary/70 uppercase tracking-widest">Bhoomi NFT</p>
                    <p className="text-4xl font-display font-bold text-primary">#{nft.token_id}</p>
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-secondary-container/90 text-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">verified</span> Verified
                </div>
              </div>
              <div className="p-5">
                <h5 className="font-display font-bold text-lg text-on-surface truncate mb-1">{nft.land_name || `Land NFT #${nft.token_id}`}</h5>
                <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-3">
                  <span className="material-symbols-outlined text-xs">location_on</span>{formatCoordinates(nft.coordinates)}
                </p>
                <div className="bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/10 mb-3">
                  <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-1">Transaction Hash</p>
                  <p className="font-mono text-xs text-primary break-all">{nft.nft_tx_hash?.substring(0, 22)}...</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold">{nft.price || 0} ETH</span>
                  <a href={`https://sepolia.etherscan.io/tx/${nft.nft_tx_hash}`} target="_blank" rel="noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-0.5 font-label font-bold">
                    Etherscan <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                </div>
                {nft.nft_minted_at && (
                  <p className="text-[10px] text-on-surface-variant/50 mt-2">Minted {new Date(nft.nft_minted_at).toLocaleDateString()}</p>
                )}
                
                {/* List on Marketplace Button */}
                {!nft.is_for_sale && (
                  <button
                    onClick={async () => {
                      try {
                        setListingToken(nft.token_id);
                        await listLandNFT({ tokenId: nft.token_id, priceEth: nft.price || 0 });
                        
                        // Update in Supabase
                        await supabase
                          .from('land_parcels')
                          .update({ is_for_sale: true })
                          .eq('id', nft.id);
                          
                        // Log event
                        await supabase.from('land_transactions').insert({
                          land_parcel_id: nft.id,
                          seller_address: walletAddress,
                          event_type: 'listed',
                          amount_eth: nft.price || 0
                        });
                        
                        alert('✅ NFT successfully listed on the Marketplace!');
                        await loadAll();
                      } catch (err) {
                        alert('❌ Failed to list on marketplace: ' + err.message);
                      } finally {
                        setListingToken(null);
                      }
                    }}
                    disabled={listingToken === nft.token_id}
                    className="w-full mt-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-md font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {listingToken === nft.token_id ? (
                      <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Listing...</>
                    ) : (
                      <><span className="material-symbols-outlined text-sm">storefront</span> List for Sale</>
                    )}
                  </button>
                )}
                {nft.is_for_sale && (
                  <div className="w-full mt-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md font-bold text-sm text-center flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span> Listed on Marketplace
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );

  // ── Transaction History ────────────────────────────────────────────────────────
  const renderTransactions = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-3xl font-display font-bold">Transaction History</h3>
        <p className="text-on-surface-variant text-sm mt-1">All your land registration events and transfers</p>
      </div>

      <GlassCard className="overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-20 text-center">
            <span className="material-symbols-outlined text-7xl text-on-surface-variant/20 mb-4">receipt_long</span>
            <p className="text-on-surface-variant text-lg font-medium">You haven't done any transactions yet.</p>
            <p className="text-on-surface-variant/50 text-sm mt-1">Upload your first land to start your transaction history.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-outline-variant/10">
              <thead className="bg-surface-container-lowest">
                <tr>
                  {['Event', 'Land ID', 'Amount', 'Counterparty', 'Date'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="px-6 py-4"><StatusBadge status={tx.event_type} /></td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant font-mono">#{tx.land_parcel_id || '—'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface">
                      {tx.amount_eth > 0 ? `${tx.amount_eth} ETH` : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant font-mono">
                      {tx.buyer_address ? `${tx.buyer_address.substring(0, 8)}...` : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant">{new Date(tx.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );

  // ─── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen relative page-enter">
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />

      {/* ─── Sidebar ─── */}
      <nav className={`fixed left-0 top-0 h-screen w-72 bg-surface-variant/40 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)]
        flex flex-col py-8 px-6 z-50 overflow-hidden transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

        {/* Brand */}
        <div className="mb-10">
          <h1 className="text-2xl font-display font-bold tracking-tighter text-primary">Bhoomi</h1>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5 font-label">Land Registry</p>
        </div>

        {/* Wallet in Sidebar */}
        <div className="mb-6">
          {walletAddress ? (
            <div className="glass-card rounded-lg p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <p className="text-[10px] font-label font-bold text-green-400 uppercase tracking-widest">Wallet Connected</p>
              </div>
              <p className="font-mono text-sm text-on-surface font-bold">{fmt(walletAddress)}</p>
              {ethBalance && (
                <p className="text-xs text-primary font-bold mt-1">{ethBalance} ETH <span className="text-on-surface-variant font-normal">(Sepolia)</span></p>
              )}
            </div>
          ) : (
            <button onClick={connectWallet} disabled={walletConnecting}
              className="w-full primary-gradient text-on-primary-container px-4 py-3 rounded-md font-bold flex items-center justify-center gap-2 text-sm btn-shimmer disabled:opacity-60">
              {walletConnecting ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">link</span>}
              {walletConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>

        {/* Nav */}
        <div className="flex flex-col gap-1 flex-grow">
          {NAV_ITEMS.map(item => (
            <button key={item.id}
              onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
              className={`flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-300 active:scale-95 text-left w-full
                ${activeNav === item.id
                  ? 'text-primary font-bold border-r-2 border-primary bg-primary/5'
                  : 'text-on-surface-variant font-medium hover:text-primary hover:bg-primary/5'}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-headline tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>

        {/* User Profile */}
        <div className="mt-6 pt-6 border-t border-outline-variant/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">
            {(userProfile?.full_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">{userProfile?.full_name || 'User'}</p>
            <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-tight capitalize">{userProfile?.role || 'seller'}</p>
          </div>
          <button onClick={handleLogout} title="Logout" className="text-on-surface-variant hover:text-error transition-colors">
            <span className="material-symbols-outlined text-sm">logout</span>
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ─── Main Content ─── */}
      <main className="md:ml-72 min-h-screen relative z-10">
        {/* Top Bar */}
        <header className="sticky top-0 w-full h-20 bg-surface/60 backdrop-blur-md flex justify-between items-center px-6 md:px-10 z-40 border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-on-surface-variant hover:text-primary transition-colors" onClick={() => setSidebarOpen(v => !v)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-xl font-headline font-black text-primary tracking-tight">
              {NAV_ITEMS.find(n => n.id === activeNav)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Wallet button in top bar */}
            {walletAddress ? (
              <div className="hidden sm:flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full border border-outline-variant/10">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                <span className="font-mono text-sm font-medium text-on-surface-variant">{ethBalance ? `${ethBalance} ETH` : '...'}</span>
                <span className="text-outline-variant/40">|</span>
                <span className="font-mono text-xs text-on-surface-variant">{fmt(walletAddress)}</span>
              </div>
            ) : (
              <button onClick={connectWallet} disabled={walletConnecting}
                className="hidden sm:flex items-center gap-2 primary-gradient text-on-primary-container px-4 py-2 rounded-full text-sm font-bold btn-shimmer disabled:opacity-60">
                <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                Connect Wallet
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {activeNav === 'dashboard' && renderDashboard()}
          {activeNav === 'my-lands' && renderMyLands()}
          {activeNav === 'upload-land' && renderUploadLand()}
          {activeNav === 'nft-holdings' && renderNFTHoldings()}
          {activeNav === 'tx-history' && renderTransactions()}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
