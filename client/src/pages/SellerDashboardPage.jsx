import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import MapDraw from '../components/MapDraw';
import { formatCoordinates, parsePolygon } from '../utils/helpers';

// ─── Pinata Upload Helper ────────────────────────────────────────────────────
const uploadToPinata = async (file) => {
  const jwt = import.meta.env.VITE_PINATA_JWT;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('pinataMetadata', JSON.stringify({ name: file.name }));
  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Pinata upload failed');
  const data = await res.json();
  return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
};

// ─── Simulated NFT Mint ──────────────────────────────────────────────────────
const simulateNFTMint = () => {
  const hash = '0x' + Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  const tokenId = Math.floor(Math.random() * 90000) + 10000;
  return { hash, tokenId };
};

// ─── Tab Icons ────────────────────────────────────────────────────────────────
const TAB_ICONS = {
  'Overview': 'dashboard',
  'Upload Land': 'upload',
  'My Lands': 'landscape',
  'My NFTs': 'token',
  'Transaction History': 'receipt_long',
};

const TABS = ['Overview', 'Upload Land', 'My Lands', 'My NFTs', 'Transaction History'];

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    pending:  'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    minted:   'bg-indigo-50 text-indigo-700 border-indigo-200',
    upload:   'bg-slate-50 text-slate-600 border-slate-200',
    listed:   'bg-purple-50 text-purple-700 border-purple-200',
    sold:     'bg-teal-50 text-teal-700 border-teal-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wide ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const SellerDashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');

  // ── User State ──
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Data State ──
  const [myLands, setMyLands] = useState([]);
  const [myNFTs, setMyNFTs] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // ── Upload Form State ──
  const [form, setForm] = useState({
    landName: '', description: '', areaSqft: '', coordinates: '',
    price: '',
  });
  const [pointInputs, setPointInputs] = useState(['', '', '', '']);
  const [docFile, setDocFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  const points = pointInputs.map(str => {
    if (!str) return null;
    const parts = str.split(',').map(p => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] };
    }
    return null;
  });
  
  // ── Modal State ──
  const [mapModalLand, setMapModalLand] = useState(null);

  // ─── Load Profile ────────────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    setLoading(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { navigate('/login'); return; }
    setUser(authUser);

    const { data: prof } = await supabase
      .from('profiles')
      .select('full_name, wallet_address, role')
      .eq('id', authUser.id)
      .single();

    setProfile(prof);
    setLoading(false);
  }, [navigate]);

  // ─── Load Lands ──────────────────────────────────────────────────────────────
  const loadLands = useCallback(async (walletAddress) => {
    if (!walletAddress) return;
    const { data } = await supabase
      .from('land_parcels')
      .select('*')
      .eq('owner_address', walletAddress)
      .order('created_at', { ascending: false });
    if (data) {
      setMyLands(data);
      setMyNFTs(data.filter(l => l.status === 'approved' && l.nft_tx_hash));
    }
  }, []);

  // ─── Load Transactions ───────────────────────────────────────────────────────
  const loadTransactions = useCallback(async (walletAddress) => {
    if (!walletAddress) return;
    const { data } = await supabase
      .from('land_transactions')
      .select('*')
      .eq('seller_address', walletAddress)
      .order('created_at', { ascending: false });
    if (data) setTransactions(data);
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  useEffect(() => {
    if (profile?.wallet_address) {
      loadLands(profile.wallet_address);
      loadTransactions(profile.wallet_address);
    }
  }, [profile, loadLands, loadTransactions]);

  // ─── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // ─── Connect Wallet Redirect ─────────────────────────────────────────────────
  const goConnectWallet = () => {
    navigate('/connect-wallet', { state: { redirectTo: '/seller-dashboard' } });
  };

  // ─── Upload Land Submit ───────────────────────────────────────────────────────
  const handleUploadLand = async (e) => {
    e.preventDefault();
    if (!profile?.wallet_address) { alert('Please connect your wallet first.'); return; }
    if (!docFile) { alert('Please select a document to upload.'); return; }

    setUploading(true);
    setUploadMsg('Uploading document to IPFS...');

    try {
      const ipfsUrl = await uploadToPinata(docFile);
      setUploadMsg('Saving to database...');

      const tokenId = Math.floor(Math.random() * 90000) + 10000;
      const { data: inserted, error } = await supabase.from('land_parcels').insert({
        owner_address: profile.wallet_address,
        coordinates: form.coordinates,
        ipfs_metadata_url: ipfsUrl,
        price: parseFloat(form.price) || 0,
        is_for_sale: false,
        token_id: tokenId,
        land_name: form.landName,
        description: form.description,
        area_sqft: parseFloat(form.areaSqft) || 0,
        document_url: ipfsUrl,
        status: 'pending',
      }).select().single();

      if (error) throw error;

      // Log transaction
      await supabase.from('land_transactions').insert({
        land_parcel_id: inserted.id,
        seller_address: profile.wallet_address,
        event_type: 'upload',
        amount_eth: 0,
      });

      setUploadMsg('✅ Land submitted for authority review!');
      setForm({ landName: '', description: '', areaSqft: '', coordinates: '', price: '' });
      setPointInputs(['', '', '', '']);
      setDocFile(null);
      await loadLands(profile.wallet_address);
      await loadTransactions(profile.wallet_address);

      setTimeout(() => {
        setUploadMsg('');
        setActiveTab('My Lands');
      }, 2000);
    } catch (err) {
      console.error(err);
      setUploadMsg('❌ Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // ─── Wallet Display ──────────────────────────────────────────────────────────
  const formatWallet = (addr) =>
    addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';

  const simulatedEth = profile?.wallet_address
    ? (parseInt(profile.wallet_address.slice(-4), 16) / 1000).toFixed(3)
    : '0.000';

  // ─── Loading Screen ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-indigo-500 animate-spin">progress_activity</span>
          <p className="text-slate-500 text-sm font-medium">Loading your portal...</p>
        </div>
      </div>
    );
  }

  // ─── Overview Tab ─────────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Wallet Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl opacity-80">account_balance_wallet</span>
            <div>
              <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest">Connected Wallet</p>
              {profile?.wallet_address ? (
                <p className="font-mono text-lg font-bold mt-0.5">{formatWallet(profile.wallet_address)}</p>
              ) : (
                <p className="text-indigo-200 text-sm mt-0.5">No wallet connected</p>
              )}
            </div>
          </div>
          {profile?.wallet_address && (
            <div className="text-right">
              <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest">Balance</p>
              <p className="text-2xl font-bold font-mono mt-0.5">{simulatedEth} ETH</p>
            </div>
          )}
        </div>
        {!profile?.wallet_address ? (
          <button onClick={goConnectWallet}
            className="mt-2 w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">link</span>
            Connect Wallet
          </button>
        ) : (
          <div className="mt-2 flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <p className="font-mono text-xs text-indigo-100 break-all">{profile.wallet_address}</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Lands', value: myLands.length, icon: 'landscape', color: 'indigo' },
          { label: 'Pending Review', value: myLands.filter(l => l.status === 'pending').length, icon: 'pending_actions', color: 'amber' },
          { label: 'Approved', value: myLands.filter(l => l.status === 'approved').length, icon: 'verified', color: 'green' },
          { label: 'NFTs Minted', value: myNFTs.length, icon: 'token', color: 'purple' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-lg bg-${stat.color}-50 flex items-center justify-center mb-3`}>
              <span className={`material-symbols-outlined text-${stat.color}-600`}>{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Recent Activity</h3>
        </div>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-40">history</span>
            <p className="text-sm">No activity yet. Upload your first land!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex items-center gap-4 px-6 py-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-sm text-slate-500">
                    {tx.event_type === 'upload' ? 'upload' :
                     tx.event_type === 'approved' ? 'verified' :
                     tx.event_type === 'minted' ? 'token' : 'receipt_long'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 capitalize">{tx.event_type.replace('_', ' ')}</p>
                  <p className="text-xs text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={tx.event_type} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ─── Upload Land Tab ──────────────────────────────────────────────────────────
  const renderUploadLand = () => {
    if (!profile?.wallet_address) {
      return (
        <div className="max-w-md mx-auto mt-16 text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl text-indigo-400">account_balance_wallet</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Connect Your Wallet First</h3>
          <p className="text-slate-500 text-sm mb-6">You need to connect a wallet before you can upload land for registration.</p>
          <button onClick={goConnectWallet}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">link</span>
            Connect Wallet
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={handleUploadLand} className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">Register New Land</h3>
            <p className="text-slate-500 text-sm mt-1">Submit land details to authorities for verification & NFT minting.</p>
            <div className="flex items-center gap-2 mt-3 text-xs text-indigo-700 bg-indigo-100 rounded-lg px-3 py-2 w-fit">
              <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
              Wallet: {formatWallet(profile.wallet_address)}
            </div>
          </div>

          <div className="p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Land Name *</label>
                <input required type="text" value={form.landName}
                  onChange={e => setForm(f => ({ ...f, landName: e.target.value }))}
                  placeholder="e.g. Green Valley Plot"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Area (sq. ft) *</label>
                <input required type="number" value={form.areaSqft}
                  onChange={e => setForm(f => ({ ...f, areaSqft: e.target.value }))}
                  placeholder="e.g. 5000"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Plotted Coordinates (Click Map to Populate) *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {pointInputs.map((str, idx) => (
                  <div key={idx} className="relative">
                    <label className="block text-[9px] font-label font-semibold text-indigo-600 uppercase tracking-wider mb-1">Point {idx + 1}</label>
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
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-mono"
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
                        className="absolute right-2 top-6 text-slate-400 hover:text-red-500"
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
              <p className="text-xs text-slate-400 mt-1.5">Click up to 4 different spots on the map to define the corners. They will automatically connect.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
              <textarea value={form.description} rows={3}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the land location, type, and any notable features..."
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 resize-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Asking Price (ETH)</label>
              <input type="number" step="0.01" value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="e.g. 2.5"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" />
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Title Deed / Legal Document *</label>
              <label className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${docFile ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 hover:border-indigo-300 hover:bg-slate-50'}`}>
                <span className="material-symbols-outlined text-3xl mb-2 text-slate-400">upload_file</span>
                {docFile ? (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-indigo-700">{docFile.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{(docFile.size / 1024).toFixed(1)} KB · Will be uploaded to IPFS</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-600">Click to upload Title Deed</p>
                    <p className="text-xs text-slate-400 mt-0.5">PDF, JPG, PNG accepted · Stored on IPFS</p>
                  </div>
                )}
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                  onChange={e => setDocFile(e.target.files[0])} />
              </label>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <span className="material-symbols-outlined text-amber-500 text-xl mt-0.5">info</span>
              <p className="text-xs text-amber-800">Your land will be submitted to the Government Authority for verification. NFT minting will happen automatically once approved.</p>
            </div>

            {uploadMsg && (
              <div className={`text-sm font-medium text-center py-2 rounded-lg ${uploadMsg.startsWith('✅') ? 'bg-green-50 text-green-700' : uploadMsg.startsWith('❌') ? 'bg-red-50 text-red-700' : 'bg-indigo-50 text-indigo-700'}`}>
                {uploadMsg}
              </div>
            )}

            <button type="submit" disabled={uploading}
              className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm">
              {uploading ? (
                <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> {uploadMsg || 'Processing...'}</>
              ) : (
                <><span className="material-symbols-outlined text-sm">send</span> Submit to Authority</>
              )}
            </button>
          </div>
        </div>
      </form>
    );
  };

  // ─── My Lands Tab ─────────────────────────────────────────────────────────────
  const renderMyLands = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">My Lands</h3>
          <p className="text-slate-500 text-sm mt-0.5">{myLands.length} land{myLands.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button onClick={() => setActiveTab('Upload Land')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">add</span> Upload Land
        </button>
      </div>

      {myLands.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">landscape</span>
          <p className="text-slate-500 font-medium">No lands uploaded yet</p>
          <button onClick={() => setActiveTab('Upload Land')} className="mt-4 text-indigo-600 text-sm font-semibold hover:underline">
            Upload your first land →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myLands.map(land => (
            <div key={land.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-36 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-5xl text-slate-300">landscape</span>
                <div className="absolute top-3 right-3">
                  <StatusBadge status={land.status || 'pending'} />
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-slate-900 mb-1">{land.land_name || `Property #${land.token_id}`}</h4>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    {formatCoordinates(land.coordinates)}
                  </p>
                  {parsePolygon(land.coordinates) && (
                    <button 
                      onClick={() => setMapModalLand(land)}
                      className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 bg-indigo-50 px-2 py-1 rounded">
                      <span className="material-symbols-outlined text-[10px]">map</span> Map
                    </button>
                  )}
                </div>
                {land.area_sqft && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">square_foot</span>
                    {land.area_sqft.toLocaleString()} sq. ft
                  </p>
                )}
                <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between">
                  <span className="text-indigo-600 font-bold text-sm">{land.price || 0} ETH</span>
                  <a href={land.ipfs_metadata_url} target="_blank" rel="noreferrer"
                    className="text-xs text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-0.5">
                    IPFS <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── My NFTs Tab ──────────────────────────────────────────────────────────────
  const renderMyNFTs = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">My NFT Holdings</h3>
        <p className="text-slate-500 text-sm mt-0.5">Blockchain-minted land NFTs approved by government authority</p>
      </div>

      {myNFTs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-purple-200 rounded-2xl bg-purple-50/50">
          <span className="material-symbols-outlined text-5xl text-purple-300 mb-3">token</span>
          <p className="text-slate-600 font-semibold">No NFTs yet</p>
          <p className="text-slate-400 text-sm mt-1">Upload a land and wait for authority approval to get NFTs minted.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myNFTs.map(nft => (
            <div key={nft.id} className="bg-white rounded-xl border border-purple-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-6xl text-white/40">token</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="text-xs font-semibold opacity-70 uppercase tracking-widest">NFT</p>
                    <p className="text-2xl font-bold">#{nft.token_id}</p>
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-green-400 text-green-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  ✓ Verified
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-slate-900 mb-1">{nft.land_name || `Land NFT #${nft.token_id}`}</h4>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    {formatCoordinates(nft.coordinates)}
                  </p>
                  {parsePolygon(nft.coordinates) && (
                    <button 
                      onClick={() => setMapModalLand(nft)}
                      className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 bg-indigo-50 px-2 py-1 rounded">
                      <span className="material-symbols-outlined text-[10px]">map</span> Map
                    </button>
                  )}
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Tx Hash</p>
                  <p className="font-mono text-xs text-slate-600 break-all">{nft.nft_tx_hash?.substring(0, 30)}...</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold text-indigo-600">{nft.price || 0} ETH</span>
                  {nft.nft_minted_at && (
                    <p className="text-xs text-slate-400">
                      Minted {new Date(nft.nft_minted_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── Transaction History Tab ───────────────────────────────────────────────────
  const renderTransactions = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">Transaction History</h3>
        <p className="text-slate-500 text-sm mt-0.5">All your land registration events and transfers</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-3 opacity-30">receipt_long</span>
            <p className="text-sm font-medium">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {['Event', 'Land ID', 'Amount', 'Buyer', 'Date'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <StatusBadge status={tx.event_type} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                      #{tx.land_parcel_id || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {tx.amount_eth > 0 ? `${tx.amount_eth} ETH` : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {tx.buyer_address ? `${tx.buyer_address.substring(0, 8)}...` : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 relative">
      {/* Map Modal */}
      {mapModalLand && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Land Outline - {mapModalLand.land_name || `Property #${mapModalLand.token_id}`}</h3>
              <button onClick={() => setMapModalLand(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4">
              <MapDraw 
                isInteractive={false} 
                existingPolygonCoords={parsePolygon(mapModalLand.coordinates)} 
                height="400px" 
              />
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold tracking-tight text-indigo-700">Bhoomi</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Seller Portal</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                activeTab === tab
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}>
              <span className={`material-symbols-outlined text-lg ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400'}`}>
                {TAB_ICONS[tab]}
              </span>
              {tab}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
              {(profile?.full_name || 'S').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name || 'Seller'}</p>
              <p className="text-xs text-slate-400">Landowner</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">logout</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-400">{TAB_ICONS[activeTab]}</span>
            <h2 className="text-lg font-semibold text-slate-900">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
              Seller
            </span>
            {profile?.wallet_address ? (
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="font-mono text-xs text-slate-700">{formatWallet(profile.wallet_address)}</span>
              </div>
            ) : (
              <button onClick={goConnectWallet}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
                <span className="material-symbols-outlined text-sm">link</span>
                Connect Wallet
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          {activeTab === 'Overview' && renderOverview()}
          {activeTab === 'Upload Land' && renderUploadLand()}
          {activeTab === 'My Lands' && renderMyLands()}
          {activeTab === 'My NFTs' && renderMyNFTs()}
          {activeTab === 'Transaction History' && renderTransactions()}
        </div>
      </main>
    </div>
  );
};

export default SellerDashboardPage;
