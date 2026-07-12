import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { mintLandNFT } from '../utils/blockchain';
import MapDraw from '../components/MapDraw';
import { formatCoordinates, parsePolygon } from '../utils/helpers';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:  'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wide ${map[status] || map.pending}`}>
      {status}
    </span>
  );
};

const TABS = ['Verification Queue', 'Approved Lands', 'Rejected'];
const TAB_ICONS = {
  'Verification Queue': 'pending_actions',
  'Approved Lands': 'verified',
  'Rejected': 'gpp_bad',
};

// ═══════════════════════════════════════════════════════════════════════════════
const AuthorityDashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Verification Queue');
  const [allLands, setAllLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // land id being actioned
  const [mintStatus, setMintStatus] = useState('');
  const [authorityName, setAuthorityName] = useState('Inspector General');
  const [mapModalLand, setMapModalLand] = useState(null);
  const [activeLandDocs, setActiveLandDocs] = useState(null);
  const [activePersonalDocs, setActivePersonalDocs] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loadLands = useCallback(async () => {
    setLoading(true);
    const { data: lands, error: landsError } = await supabase
      .from('land_parcels')
      .select('*')
      .order('created_at', { ascending: false });

    if (landsError || !lands) {
      setLoading(false);
      return;
    }

    // Fetch profiles of the owners
    const ownerAddresses = lands.map(l => l.owner_address).filter(Boolean);
    if (ownerAddresses.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('wallet_address', ownerAddresses);

      if (profiles && !profilesError) {
        const mappedLands = lands.map(land => {
          const ownerProfile = profiles.find(p => p.wallet_address?.toLowerCase() === land.owner_address?.toLowerCase());
          return {
            ...land,
            owner_profile: ownerProfile || null
          };
        });
        setAllLands(mappedLands);
        setLoading(false);
        return;
      }
    }

    setAllLands(lands.map(l => ({ ...l, owner_profile: null })));
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        navigate('/login');
        return;
      }

      // Fetch profile to verify role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error || !profile || profile.role !== 'authority') {
        console.error("Access denied. Not an authority account.");
        alert("Access denied. You do not have permission to access the Authority Dashboard.");
        navigate('/login');
        return;
      }

      if (profile.full_name) setAuthorityName(profile.full_name);
      loadLands();
    };
    init();
  }, [loadLands, navigate]);

  const handleLogout = () => {
    setShowConfirmModal(true);
  };

  const executeLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // ─── Approve Land (Real Blockchain Mint) ─────────────────────────────────────
  const handleApprove = async (land) => {
    if (!window.ethereum) {
      alert('MetaMask is required to mint NFTs. Please install MetaMask and connect the contract owner wallet.');
      return;
    }

    setActionLoading(land.id);
    setMintStatus('Connecting to MetaMask...');

    try {
      setMintStatus('Sending transaction to Sepolia blockchain...');

      // Call real smart contract registerLand()
      const { txHash, tokenId } = await mintLandNFT({
        citizenAddress: land.owner_address,
        ipfsMetadataUrl: land.ipfs_metadata_url || land.document_url || '',
        coordinates: land.coordinates,
      });

      setMintStatus('Transaction confirmed! Updating database...');

      // Save tx hash + token id to Supabase
      const { error } = await supabase
        .from('land_parcels')
        .update({
          status: 'approved',
          nft_tx_hash: txHash,
          nft_minted_at: new Date().toISOString(),
          token_id: tokenId,
        })
        .eq('id', land.id);

      if (error) throw error;

      // Log events
      await supabase.from('land_transactions').insert([
        { land_parcel_id: land.id, seller_address: land.owner_address, event_type: 'approved', amount_eth: 0 },
        { land_parcel_id: land.id, seller_address: land.owner_address, event_type: 'minted', amount_eth: 0 },
      ]);

      setMintStatus('');
      alert(`✅ NFT Minted on Sepolia!\n\nToken ID: ${tokenId}\nTx Hash: ${txHash.substring(0, 20)}...\n\nView on Etherscan: https://sepolia.etherscan.io/tx/${txHash}`);
      await loadLands();
    } catch (err) {
      console.error('Approve/Mint error:', err);
      setMintStatus('');
      alert('❌ Minting failed: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Reject Land ──────────────────────────────────────────────────────────────
  const handleReject = async (land) => {
    const reason = prompt('Enter rejection reason (optional):');
    setActionLoading(land.id);
    try {
      const { error } = await supabase
        .from('land_parcels')
        .update({ status: 'rejected', authority_notes: reason || 'Rejected by authority' })
        .eq('id', land.id);

      if (error) throw error;

      await supabase.from('land_transactions').insert({
        land_parcel_id: land.id,
        seller_address: land.owner_address,
        event_type: 'rejected',
        amount_eth: 0,
      });

      await loadLands();
    } catch (err) {
      console.error('Reject error:', err);
      alert('Failed to reject: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Filter Lands by Tab ──────────────────────────────────────────────────────
  const filteredLands = allLands.filter(l => {
    if (activeTab === 'Verification Queue') return !l.status || l.status === 'pending';
    if (activeTab === 'Approved Lands') return l.status === 'approved';
    if (activeTab === 'Rejected') return l.status === 'rejected';
    return true;
  });

  // ─── Land Card ────────────────────────────────────────────────────────────────
  const LandCard = ({ land }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
        <span className="material-symbols-outlined text-5xl text-slate-300">landscape</span>
        <div className="absolute top-3 right-3">
          <StatusBadge status={land.status || 'pending'} />
        </div>
      </div>
      <div className="p-5">
        <h4 className="font-bold text-slate-900 mb-0.5">{land.land_name || `Property #${land.token_id}`}</h4>
        <p className="text-xs text-slate-400 mb-3">{new Date(land.created_at).toLocaleString()}</p>

        <div className="space-y-1.5 text-xs text-slate-600 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-xs text-slate-400">account_balance_wallet</span>
            <span className="font-mono">{land.owner_address.substring(0, 10)}...{land.owner_address.slice(-6)}</span>
          </div>
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="material-symbols-outlined text-xs text-slate-400">location_on</span>
              <span className="truncate">{formatCoordinates(land.coordinates)}</span>
            </div>
            {parsePolygon(land.coordinates) && (
              <button 
                onClick={() => setMapModalLand(land)}
                className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 bg-indigo-50 px-2 py-1 rounded">
                <span className="material-symbols-outlined text-[10px]">map</span> Map
              </button>
            )}
          </div>
          {land.area_sqft && (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs text-slate-400">square_foot</span>
              <span>{land.area_sqft.toLocaleString()} sq. ft</span>
            </div>
          )}
          {land.description && (
            <div className="flex items-start gap-1.5">
              <span className="material-symbols-outlined text-xs text-slate-400 mt-0.5">notes</span>
              <span className="line-clamp-2">{land.description}</span>
            </div>
          )}
        </div>

        {/* Document Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4 mb-4">
          <button 
            onClick={() => setActiveLandDocs(land)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 border border-indigo-200 transition-colors">
            <span className="material-symbols-outlined text-sm">folder_open</span>
            Land Docs
          </button>
          <button 
            onClick={() => setActivePersonalDocs(land)}
            disabled={!land.owner_profile}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined text-sm">account_box</span>
            Personal Docs
          </button>
        </div>

        {/* NFT info if approved */}
        {land.status === 'approved' && land.nft_tx_hash && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-xs font-semibold text-green-700 mb-1">✅ NFT Minted on Sepolia</p>
            <p className="font-mono text-xs text-green-600 break-all mb-1">{land.nft_tx_hash.substring(0, 28)}...</p>
            <a href={`https://sepolia.etherscan.io/tx/${land.nft_tx_hash}`} target="_blank" rel="noreferrer"
              className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5">
              View on Etherscan <span className="material-symbols-outlined text-xs">open_in_new</span>
            </a>
          </div>
        )}

        {/* Rejection reason */}
        {land.status === 'rejected' && land.authority_notes && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason</p>
            <p className="text-xs text-red-600">{land.authority_notes}</p>
          </div>
        )}

        {/* Action Buttons - only for pending */}
        {(!land.status || land.status === 'pending') && (
          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => handleApprove(land)}
              disabled={actionLoading === land.id}
              className="flex-1 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
              {actionLoading === land.id ? (
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              ) : (
                <><span className="material-symbols-outlined text-sm">verified</span> Approve & Mint NFT</>
              )}
            </button>
            <button
              onClick={() => handleReject(land)}
              disabled={actionLoading === land.id}
              className="flex-1 py-2 bg-red-50 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">gpp_bad</span> Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 relative">
      {/* Blockchain Minting Status Toast */}
      {mintStatus && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-fade-up-in">
          <span className="material-symbols-outlined text-indigo-400 animate-spin text-sm">progress_activity</span>
          <span className="text-sm font-semibold">{mintStatus}</span>
        </div>
      )}

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

      {/* Land Documents Modal */}
      {activeLandDocs && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">landscape</span>
                Land Documents
              </h3>
              <button onClick={() => setActiveLandDocs(null)} className="text-slate-400 hover:text-slate-600 flex items-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-sm font-semibold text-slate-700 mb-2">
                Property: {activeLandDocs.land_name || `Property #${activeLandDocs.token_id}`}
              </div>
              <div className="grid grid-cols-1 gap-3">
                {/* 1. Land Photo */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-600">image</span>
                    <span className="text-sm font-medium text-slate-700">Land Photo / Image</span>
                  </div>
                  {activeLandDocs.land_image_url ? (
                    <a href={activeLandDocs.land_image_url} target="_blank" rel="noreferrer"
                      className="py-1.5 px-3 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition-colors flex items-center gap-1">
                      View <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Not Uploaded</span>
                  )}
                </div>

                {/* 2. Title Deed */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-600">description</span>
                    <span className="text-sm font-medium text-slate-700">Title Deed</span>
                  </div>
                  {(activeLandDocs.deed_url || activeLandDocs.document_url) ? (
                    <a href={activeLandDocs.deed_url || activeLandDocs.document_url} target="_blank" rel="noreferrer"
                      className="py-1.5 px-3 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition-colors flex items-center gap-1">
                      View <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Not Uploaded</span>
                  )}
                </div>

                {/* 3. Sale Agreement */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-600">handshake</span>
                    <span className="text-sm font-medium text-slate-700">Sale Agreement</span>
                  </div>
                  {activeLandDocs.agreement_url ? (
                    <a href={activeLandDocs.agreement_url} target="_blank" rel="noreferrer"
                      className="py-1.5 px-3 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition-colors flex items-center gap-1">
                      View <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Not Uploaded</span>
                  )}
                </div>

                {/* 4. Land Registry Copy */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-600">app_registration</span>
                    <span className="text-sm font-medium text-slate-700">Land Registry Copy</span>
                  </div>
                  {activeLandDocs.registry_url ? (
                    <a href={activeLandDocs.registry_url} target="_blank" rel="noreferrer"
                      className="py-1.5 px-3 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition-colors flex items-center gap-1">
                      View <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Not Uploaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personal Documents Modal */}
      {activePersonalDocs && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">badge</span>
                Personal Documents (KYC)
              </h3>
              <button onClick={() => setActivePersonalDocs(null)} className="text-slate-400 hover:text-slate-600 flex items-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-sm font-semibold text-slate-700 mb-2">
                Seller: {activePersonalDocs.owner_profile?.full_name || 'Unnamed Seller'}
              </div>
              <div className="grid grid-cols-1 gap-3">
                {/* 1. Aadhaar Card */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-600">badge</span>
                    <span className="text-sm font-medium text-slate-700">Aadhaar Card</span>
                  </div>
                  {activePersonalDocs.owner_profile?.aadhaar_url ? (
                    <a href={activePersonalDocs.owner_profile.aadhaar_url} target="_blank" rel="noreferrer"
                      className="py-1.5 px-3 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition-colors flex items-center gap-1">
                      View <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Not Uploaded</span>
                  )}
                </div>

                {/* 2. PAN Card */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-600">credit_card</span>
                    <span className="text-sm font-medium text-slate-700">PAN Card</span>
                  </div>
                  {activePersonalDocs.owner_profile?.pan_url ? (
                    <a href={activePersonalDocs.owner_profile.pan_url} target="_blank" rel="noreferrer"
                      className="py-1.5 px-3 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition-colors flex items-center gap-1">
                      View <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Not Uploaded</span>
                  )}
                </div>

                {/* 3. Selfie Photo */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-600">face</span>
                    <span className="text-sm font-medium text-slate-700">Selfie Verification</span>
                  </div>
                  {activePersonalDocs.owner_profile?.selfie_url ? (
                    <a href={activePersonalDocs.owner_profile.selfie_url} target="_blank" rel="noreferrer"
                      className="py-1.5 px-3 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition-colors flex items-center gap-1">
                      View <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Not Uploaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex fixed left-0 top-0 h-screen z-30">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Bhoomi</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Authority Portal</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                activeTab === tab
                  ? 'bg-slate-100 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}>
              <span className={`material-symbols-outlined text-lg ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400'}`}>
                {TAB_ICONS[tab]}
              </span>
              {tab}
              {tab === 'Verification Queue' && (
                <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {allLands.filter(l => !l.status || l.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
              {authorityName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{authorityName}</p>
              <p className="text-xs text-slate-400">Authority</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">logout</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen md:ml-64">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-400">{TAB_ICONS[activeTab]}</span>
            <h2 className="text-lg font-semibold text-slate-900">{activeTab}</h2>
            <span className="text-xs text-slate-400">({filteredLands.length})</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200">
              Authority
            </span>
            <button onClick={loadLands}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-lg">refresh</span>
            </button>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <span className="material-symbols-outlined text-4xl text-indigo-400 animate-spin">progress_activity</span>
            </div>
          ) : filteredLands.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">{TAB_ICONS[activeTab]}</span>
              <p className="text-slate-500 font-medium">No lands in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLands.map(land => <LandCard key={land.id} land={land} />)}
            </div>
          )}
        </div>
      </main>
      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">logout</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-slate-900">Sign Out</h3>
              <p className="text-slate-500 text-sm mt-2">Are you sure you want to sign out of your account?</p>
            </div>
            <div className="flex gap-3 mt-2">
              <button 
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  executeLogout();
                }}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityDashboardPage;
