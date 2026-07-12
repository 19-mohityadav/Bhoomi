import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { buyLandNFT, getWalletBalance } from '../utils/blockchain';
import MapDraw from '../components/MapDraw';
import { formatCoordinates, parsePolygon } from '../utils/helpers';

const TABS = ['Marketplace', 'My Wallet', 'Transaction History'];
const TAB_ICONS = {
  'Marketplace': 'store',
  'My Wallet': 'account_balance_wallet',
  'Transaction History': 'receipt_long',
};

const StatusBadge = ({ status }) => {
  const map = {
    upload: 'bg-slate-100 text-slate-600',
    approved: 'bg-green-100 text-green-700',
    minted: 'bg-indigo-100 text-indigo-700',
    sold: 'bg-teal-100 text-teal-700',
    listed: 'bg-purple-100 text-purple-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  );
};

const BuyerDashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Marketplace');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [buying, setBuying] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    const mockUserStr = localStorage.getItem('mockUser');
    if (!mockUserStr) { navigate('/login'); return; }
    const data = JSON.parse(mockUserStr);
    setProfile(data);
    setLoading(false);
    return data;
  }, [navigate]);

  const loadListings = useCallback(async () => {
    // Show only approved lands with an NFT minted and listed for sale
    const { data } = await supabase
      .from('land_parcels')
      .select('*')
      .eq('status', 'approved')
      .not('nft_tx_hash', 'is', null)
      .eq('is_for_sale', true)
      .order('created_at', { ascending: false });
    if (data) setListings(data);
  }, []);

  const loadTransactions = useCallback(async (walletAddress) => {
    if (!walletAddress) return;
    const { data } = await supabase
      .from('land_transactions')
      .select('*')
      .or(`buyer_address.eq.${walletAddress},seller_address.eq.${walletAddress}`)
      .order('created_at', { ascending: false });
    if (data) setTransactions(data);
  }, []);

  useEffect(() => {
    const init = async () => {
      const prof = await loadProfile();
      await loadListings();
      if (prof?.wallet_address) await loadTransactions(prof.wallet_address);
    };
    init();
  }, [loadProfile, loadListings, loadTransactions]);

  const handleLogout = async () => {
    localStorage.removeItem('mockUser');
    navigate('/login');
  };

  const goConnectWallet = () => {
    navigate('/connect-wallet', { state: { redirectTo: '/buyer-dashboard' } });
  };

  const formatWallet = (addr) =>
    addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';

  const simulatedEth = profile?.wallet_address
    ? (parseInt(profile.wallet_address.slice(-4), 16) / 1500).toFixed(3)
    : '0.000';

  // ─── Load Real ETH Balance ────────────────────────────────────────────────────
  const [ethBalance, setEthBalance] = useState(null);
  useEffect(() => {
    if (profile?.wallet_address) {
      getWalletBalance(profile.wallet_address).then(setEthBalance);
    }
  }, [profile]);

  // ─── Buy Handler (Real Blockchain) ───────────────────────────────────────────
  const handleBuy = async () => {
    if (!profile?.wallet_address) {
      alert('Please connect your wallet first.');
      return;
    }
    if (!selectedProperty) return;
    setBuying(true);
    try {
      // Call real smart contract buyLand()
      const { txHash } = await buyLandNFT({
        tokenId: selectedProperty.token_id,
        priceEth: selectedProperty.price || '0',
      });

      // Log transaction to Supabase
      await supabase.from('land_transactions').insert({
        land_parcel_id: selectedProperty.id,
        seller_address: selectedProperty.owner_address,
        buyer_address: profile.wallet_address,
        event_type: 'sold',
        amount_eth: parseFloat(selectedProperty.price) || 0,
      });

      // Update land parcel ownership and status in DB
      await supabase.from('land_parcels').update({
        owner_address: profile.wallet_address,
        is_for_sale: false,
        status: 'sold'
      }).eq('id', selectedProperty.id);

      // Refresh balance
      getWalletBalance(profile.wallet_address).then(setEthBalance);

      alert(`🎉 Purchase Confirmed on Sepolia Blockchain!\n\nNFT #${selectedProperty.token_id} is now yours.\n\nTx: ${txHash.substring(0, 20)}...\n\nhttps://sepolia.etherscan.io/tx/${txHash}`);
      setSelectedProperty(null);
      await loadListings();
      await loadTransactions(profile.wallet_address);
    } catch (err) {
      alert('❌ Purchase failed: ' + err.message);
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-indigo-400 animate-spin">progress_activity</span>
      </div>
    );
  }

  // ─── Marketplace Tab ──────────────────────────────────────────────────────────
  const renderMarketplace = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900">Land NFT Marketplace</h3>
        <p className="text-slate-500 text-sm mt-1">Browse government-verified, blockchain-minted land NFTs.</p>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">store</span>
          <p className="text-slate-500 font-medium">No verified listings available yet</p>
          <p className="text-slate-400 text-sm mt-1">Check back after sellers upload and get land approved.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(prop => (
            <div key={prop.id}
              className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group"
              onClick={() => setSelectedProperty(prop)}>
              <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-7xl text-white/20">landscape</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <p className="text-xs font-semibold opacity-60 uppercase tracking-widest">NFT</p>
                    <p className="text-3xl font-bold">#{prop.token_id}</p>
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">verified</span> Gov Verified
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">
                    {prop.land_name || `Property #${prop.token_id}`}
                  </h3>
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg text-sm">
                    {prop.price || 0} ETH
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-xs">location_on</span>
                  {formatCoordinates(prop.coordinates)}
                </p>
                {prop.area_sqft && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                    <span className="material-symbols-outlined text-xs">square_foot</span>
                    {prop.area_sqft.toLocaleString()} sq. ft
                  </p>
                )}
                <div className="w-full py-2 bg-indigo-600 text-white text-center rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors group-hover:scale-[1.01]">
                  Buy This NFT
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── My Wallet Tab ────────────────────────────────────────────────────────────
  const renderWallet = () => (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">My Wallet</h3>
        <p className="text-slate-500 text-sm mt-1">Your connected wallet and portfolio overview</p>
      </div>

      {!profile?.wallet_address ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">account_balance_wallet</span>
          <p className="text-slate-600 font-semibold">No wallet connected</p>
          <p className="text-slate-400 text-sm mt-1 mb-5">Connect your wallet to see your balance and portfolio.</p>
          <button onClick={goConnectWallet}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">link</span> Connect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Wallet Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">Connected Wallet</p>
            <p className="font-mono text-lg font-bold">{formatWallet(profile.wallet_address)}</p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">Balance</p>
                <p className="text-3xl font-bold font-mono">{simulatedEth} ETH</p>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs font-semibold text-indigo-100">Mainnet</span>
              </div>
            </div>
          </div>

          {/* Full Address */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Wallet Address</p>
            <p className="font-mono text-sm text-slate-700 break-all">{profile.wallet_address}</p>
          </div>

          {/* NFTs Owned */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Portfolio</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-indigo-700">{transactions.filter(t => t.event_type === 'sold' && t.buyer_address === profile.wallet_address).length}</p>
                <p className="text-xs text-indigo-500 font-medium mt-0.5">NFTs Purchased</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-700">
                  {transactions.filter(t => t.event_type === 'sold' && t.buyer_address === profile.wallet_address)
                    .reduce((sum, t) => sum + (t.amount_eth || 0), 0).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">ETH Spent</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Transaction History Tab ───────────────────────────────────────────────────
  const renderTransactions = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">Transaction History</h3>
        <p className="text-slate-500 text-sm mt-1">All your purchases and interactions on the platform</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-3 opacity-30">receipt_long</span>
            <p className="text-sm font-medium">No transactions yet</p>
            <p className="text-xs mt-1">Buy a land NFT from the marketplace to see history here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {['Event', 'Land ID', 'Amount', 'With', 'Date'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4"><StatusBadge status={tx.event_type} /></td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">#{tx.land_parcel_id || '—'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {tx.amount_eth > 0 ? `${tx.amount_eth} ETH` : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {tx.buyer_address === profile?.wallet_address
                        ? `Seller: ${tx.seller_address?.substring(0, 8)}...`
                        : tx.buyer_address ? `Buyer: ${tx.buyer_address?.substring(0, 8)}...` : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{new Date(tx.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Top Nav */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-20">
        <div className="flex items-center gap-10">
          <h1 className="text-xl font-bold text-indigo-700 tracking-tight">Bhoomi</h1>
          <nav className="hidden md:flex gap-1">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}>
                <span className={`material-symbols-outlined text-base ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {TAB_ICONS[tab]}
                </span>
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full border border-teal-200">
            Buyer
          </span>
          {profile?.wallet_address ? (
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="font-mono text-xs font-semibold text-slate-700">
                {ethBalance !== null ? `${ethBalance} ETH` : `${simulatedEth} ETH`}
              </span>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-xs text-slate-500">{formatWallet(profile.wallet_address)}</span>
            </div>
          ) : (
            <button onClick={goConnectWallet}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
              <span className="material-symbols-outlined text-sm">link</span> Connect Wallet
            </button>
          )}
          <button onClick={handleLogout} className="text-sm font-medium text-slate-400 hover:text-red-500 transition-colors pl-2 border-l border-slate-200">
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'Marketplace' && renderMarketplace()}
        {activeTab === 'My Wallet' && renderWallet()}
        {activeTab === 'Transaction History' && renderTransactions()}
      </main>

      {/* Buy Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProperty(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="font-bold text-lg text-slate-900">Purchase Land NFT</h3>
              <button onClick={() => setSelectedProperty(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-4 mb-5">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  #{selectedProperty.token_id}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{selectedProperty.land_name || `NFT #${selectedProperty.token_id}`}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    {formatCoordinates(selectedProperty.coordinates)}
                  </p>
                  <p className="font-mono font-bold text-indigo-600 mt-1 text-lg">{selectedProperty.price || 0} ETH</p>
                </div>
              </div>

              {/* Map View */}
              {parsePolygon(selectedProperty.coordinates) && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Land Outline Map</p>
                  <MapDraw 
                    isInteractive={false} 
                    existingPolygonCoords={parsePolygon(selectedProperty.coordinates)} 
                    height="200px" 
                  />
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-200 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">NFT Token ID</span>
                  <span className="font-mono font-semibold">#{selectedProperty.token_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Network Fee (est.)</span>
                  <span className="font-mono">0.005 ETH</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                  <span>Total</span>
                  <span className="font-mono text-indigo-700">
                    {((parseFloat(selectedProperty.price) || 0) + 0.005).toFixed(3)} ETH
                  </span>
                </div>
              </div>

              {!profile?.wallet_address && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  Connect your wallet first to purchase.
                </p>
              )}

              <button
                onClick={handleBuy}
                disabled={buying || !profile?.wallet_address}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 shadow-md disabled:opacity-50">
                {buying ? (
                  <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Processing...</>
                ) : (
                  <><span className="material-symbols-outlined text-sm">lock</span> Confirm Purchase</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboardPage;
