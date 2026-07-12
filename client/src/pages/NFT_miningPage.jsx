import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ESTATES = [
  {
    id: '#8821',
    name: 'Digital Estate Alpha-8',
    price: '12.5 ETH',
    gasFee: 0.0024,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDj4RIKwiyQI0sNM7aTDOXbqe4AM5RL0Od_FTZtXmXp2tAcnhTdSyXR29dZP10aU1LhNNaQZMYkz9ksIg50dIoF15nphvKfdslpNOOnwRY2bG-2xCPZl4FHEeyjJC2X7D65t4j5dNVQfCd7kOmolOOtti_GgQgfx0veZDVS5yYB91e-ye1K-A_IZlbUqBltl-nFmG5-dO7j_n_kMwWAXpWBYyTH2JHdNx3zusXtiBqn_p3yWMTVI30E10MSRoXNq_zz3U2piDaOr1Pi',
    uri: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh3pxg3aeqqol22dd',
    region: 'Heights',
    validated: true
  },
  {
    id: '#4409',
    name: 'Digital Estate Beta-3',
    price: '6.8 ETH',
    gasFee: 0.0019,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzWoZ9XHdraHuKsruDVenKnSg_ljRD5f0lRNXEjjLR7tSpnuOtOOZz8F_E65O3fbgrqjyg2cvPjYN9gXKsdi2K7laBqBzOlCEStDqImeBVxad-b5FFabjx5qqbkYONfWFM_PMuVtnjc3SWF6lLp3xWtu1VR78HOwzO5khV1Llw48JiE5MQnKXYG_m7ELz_xznqQJlo_P9XgRUcI9U32w-qnGqnqg5zcBOupXp3O5Eg1nH64z4WfLmYXk9ft0Idvmz16LKO1qWFvobi',
    uri: 'ipfs://bafybeiaa32dsafee334bbvcc8d22feaa0928dfy234a',
    region: 'Valley',
    validated: true
  },
  {
    id: '#9042',
    name: 'Digital Estate Gamma-12',
    price: '18.2 ETH',
    gasFee: 0.0028,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbPIpKmurIl87B6L9xfw4UZa_t1qgVbg09uLe8zs5Rlp9WWUc5kFK5nA-ruQNtJHN3fKhK-QKOca6gY56wvPWwwIXJn-JxPSO9DqNgtrkjDUv4QPjx_6fgK2YsR3a3b_XSVqfmfnhLDVpj5gHZ7nMdqJrVz_2ZjhXmlJ3Yi_UkKd6_exPaeSFGybCYeu2voJ_EkuPtGeqL14FAoYXEJwRzhKlnzNEMngA0j3DQ93jDaKT7YzD5kM-8gt53biGaeXv4QrYKZi0xfh1a',
    uri: 'ipfs://bafybeicwz298dfy234asfe1123aafedda1123bbcc9',
    region: 'Coast',
    validated: true
  }
];

const styles = `
  @keyframes pulseGlow {
    0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(233, 255, 185, 0.4); }
    70% { transform: scale(1.2); opacity: 0.5; box-shadow: 0 0 0 10px rgba(233, 255, 185, 0); }
    100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(233, 255, 185, 0); }
  }
  .ledger-pulse-animated {
    animation: pulseGlow 2s infinite;
  }
  .mint-glow-active:hover {
    box-shadow: 0 0 25px rgba(143, 245, 255, 0.5);
  }
  @keyframes holoSpin {
    0% { transform: rotateY(0deg) rotateX(10deg); }
    50% { transform: rotateY(180deg) rotateX(-10deg); }
    100% { transform: rotateY(360deg) rotateX(10deg); }
  }
  .holo-card-spin {
    animation: holoSpin 8s infinite linear;
    perspective: 1000px;
    transform-style: preserve-3d;
  }
`;

const NFT_miningPage = () => {
  // --- STATE ---
  const [selectedEstateIndex, setSelectedEstateIndex] = useState(0);
  const [mintedStates, setMintedStates] = useState({ '#8821': false, '#4409': false, '#9042': false });
  
  // Wallet State
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState(2.45);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Minting Flow state
  const [isMinting, setIsMinting] = useState(false);
  const [mintStep, setMintStep] = useState('signature'); // 'signature' | 'mining' | 'success'
  const [mintProgress, setMintProgress] = useState(0);
  const [mintStatusText, setMintStatusText] = useState('');

  // Copy Feedback State
  const [copyFeedbacks, setCopyFeedbacks] = useState({ id: false, address: false, uri: false });
  // Toasts
  const [toasts, setToasts] = useState([]);

  const activeEstate = ESTATES[selectedEstateIndex];
  const isCurrentlyMinted = mintedStates[activeEstate.id];

  // --- ACTIONS & TOASTS ---
  const triggerToast = (message, type = 'success') => {
    const newToast = { id: Date.now(), message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const handleConnectWallet = () => {
    setIsConnectingWallet(true);
    triggerToast('Connecting Web3 Wallet...', 'info');  
    setTimeout(() => {
      setWalletConnected(true);
      setWalletAddress('0x82f0a1e3e920d3f2c5d144888fca02d18492031');
      setWalletBalance(12.45);
      setIsConnectingWallet(false);
      triggerToast('Wallet sync complete!', 'success');
    }, 1200);
  };

  const handleDisconnectWallet = () => {
    setShowConfirmModal(true);
  };

  const executeDisconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setWalletBalance(0);
    setWalletDropdownOpen(false);
    triggerToast('Wallet disconnected', 'info');
  };

  const handleCopyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopyFeedbacks((prev) => ({ ...prev, [key]: true }));
    triggerToast(`Copied metadata field to clipboard`, 'success');
    setTimeout(() => {
      setCopyFeedbacks((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleMintNFT = () => {
    if (!walletConnected) {
      handleConnectWallet();
      return;
    }
    if (walletBalance < activeEstate.gasFee) {
      triggerToast('Insufficient funds for gas!', 'error');
      return;
    }

    setIsMinting(true);
    setMintStep('signature');
    setMintProgress(5);
    setMintStatusText('Requesting cryptographic wallet signature...');

    // Phase 1: Request signature
    setTimeout(() => {
      setMintStep('mining');
      setMintProgress(30);
      setMintStatusText('Broadcasting ERC-721 mint transaction to consensus layer...');

      // Phase 2: Mining block
      setTimeout(() => {
        setMintProgress(65);
        setMintStatusText('Constructing immutable metadata block & verifying asset boundary...');

        // Phase 3: Consensus sync
        setTimeout(() => {
          setMintProgress(100);
          setMintStep('success');
          
          // Deduct gas fee
          setWalletBalance((prev) => parseFloat((prev - activeEstate.gasFee).toFixed(4)));
          
          // Mark as minted
          setMintedStates((prev) => ({ ...prev, [activeEstate.id]: true }));
          triggerToast(`Successfully minted ${activeEstate.name}!`, 'success');
        }, 1200);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen relative overflow-x-hidden page-enter">
      <style>{styles}</style>
      <div className="fixed inset-0 grid-bg pointer-events-none z-0 opacity-40" />

      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-surface/40 backdrop-blur-xl border-b border-outline-variant/10">
        <Link to="/" className="font-display text-2xl font-bold tracking-tighter text-primary hover:text-primary-dim transition-colors">
          Bhoomi
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link className="font-headline tracking-wide uppercase text-sm text-on-surface-variant hover:text-primary transition-colors duration-300" to="/marketplace">
            Marketplace
          </Link>
          <Link className="font-headline tracking-wide uppercase text-sm text-primary border-b-2 border-primary pb-1" to="/mint">
            Mint NFT
          </Link>
          <Link className="font-headline tracking-wide uppercase text-sm text-on-surface-variant hover:text-primary transition-colors duration-300" to="/dashboard">
            Portfolio
          </Link>
          <a className="font-headline tracking-wide uppercase text-sm text-on-surface-variant hover:text-primary transition-colors duration-300" href="#">
            Ledger
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors" onClick={() => triggerToast('Ledger state is synchronized.', 'info')}>
            notifications
          </button>
          
          {walletConnected && (
            <div className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant/20">
              <span className="material-symbols-outlined text-sm text-primary">account_balance_wallet</span>
              <span className="text-xs font-label font-medium text-primary-dim">{walletBalance} ETH</span>
            </div>
          )}

          {walletConnected ? (
            <div className="relative">
              <button
                onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                className="bg-gradient-to-br from-primary/20 to-primary-container/20 border border-primary/40 text-primary font-headline text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 hover:bg-primary/10 transition-all"
              >
                <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                <span>{walletAddress.substring(0, 6)}...{walletAddress.substring(38)}</span>
              </button>
              {walletDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-high border border-outline-variant/20 rounded-md shadow-2xl py-1 z-50 animate-fade-in">
                  <button onClick={handleDisconnectWallet} className="w-full px-4 py-3 text-left text-xs font-headline font-bold text-error hover:bg-error-container/10 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Disconnect Wallet
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={handleConnectWallet}
              disabled={isConnectingWallet}
              className="bg-primary text-on-primary px-6 py-2 rounded-full font-headline text-sm font-bold scale-95 active:scale-90 transition-all hover:shadow-[0_0_20px_rgba(143,245,255,0.4)] btn-shimmer"
            >
              {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </nav>

      {/* --- MAIN SECTION --- */}
      <main className="min-h-screen pt-32 pb-20 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto relative z-10">
        
        {/* --- HERO SECTION / HEADER --- */}
        <header className="mb-12 flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-tertiary/10 text-tertiary px-4 py-1 rounded-full text-xs font-label tracking-widest uppercase border border-tertiary/20">
                Protocol Active
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary ledger-pulse-animated" />
                <span className="text-on-surface-variant text-xs font-label">Network Syncing</span>
              </div>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-on-surface mb-2 leading-none tracking-tight">
              Land NFT Minting
            </h1>
            <p className="text-on-surface-variant text-lg max-w-2xl font-light">
              The architecture of ownership is changing. Formalize your digital estate within the Bhoomi ecosystem through our secure minting gateway.
            </p>
          </div>

          {/* Dynamic Selector Dropdown */}
          <div className="bg-surface-container-high p-4 rounded-lg border border-outline-variant/20 min-w-[280px]">
            <label className="block text-[10px] font-label text-primary uppercase tracking-widest mb-1.5">Select Land Parcel</label>
            <select 
              value={selectedEstateIndex}
              onChange={(e) => setSelectedEstateIndex(parseInt(e.target.value))}
              className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant/30 rounded py-2 px-3 text-sm focus:border-primary outline-none transition-colors"
            >
              {ESTATES.map((est, i) => (
                <option key={est.id} value={i}>
                  {est.name} ({est.id})
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* --- GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* NFT PREVIEW BENTO (LEFT) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="relative group rounded-lg overflow-hidden aspect-[16/10] bg-surface-container-low border border-outline-variant/10 shadow-xl">
              <img 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src={activeEstate.image}
                alt={activeEstate.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60 pointer-events-none" />
              
              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                <div>
                  <h3 className="font-headline text-2xl font-bold text-white text-shadow">{activeEstate.name}</h3>
                  <p className="font-label text-xs text-primary tracking-widest uppercase">Verified Land Parcel</p>
                </div>
                <div className="glass-panel p-4 rounded-md border border-outline-variant/15 text-right">
                  <span className="block text-[10px] text-on-surface-variant uppercase tracking-tighter">Current Value</span>
                  <span className="font-headline text-xl font-bold text-white">{activeEstate.price}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ownership Card */}
              <div className="bg-surface-container p-8 rounded-lg border border-outline-variant/5 shadow-md">
                <h4 className="font-label text-xs text-on-surface-variant tracking-widest uppercase mb-4">Ownership Status</h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center border border-white/5">
                    <span className="material-symbols-outlined text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isCurrentlyMinted ? 'workspace_premium' : 'verified'}
                    </span>
                  </div>
                  <div>
                    <p className="text-on-surface font-headline font-bold">
                      {isCurrentlyMinted ? 'Minted Successfully' : 'Land Verified Successfully'}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {isCurrentlyMinted ? 'ERC-721 Deed Generated' : 'Validated by Smart Contract'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Blockchain Card */}
              <div className="bg-surface-container p-8 rounded-lg border border-outline-variant/5 shadow-md">
                <h4 className="font-label text-xs text-on-surface-variant tracking-widest uppercase mb-4">Blockchain Status</h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant/10">
                    <span className={`material-symbols-outlined ${isCurrentlyMinted ? 'text-primary' : 'text-tertiary'}`}>
                      {isCurrentlyMinted ? 'verified_user' : 'sync'}
                    </span>
                  </div>
                  <div>
                    <p className="text-on-surface font-headline font-bold">
                      {isCurrentlyMinted ? 'Secured Registry' : 'Confirmed'}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {isCurrentlyMinted ? 'Active on Ethereum Mainnet' : 'Synced with Ethereum'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* METADATA TECHNICAL PANEL (RIGHT) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-surface-container p-8 rounded-lg border border-outline-variant/5 shadow-lg hover-glow-border">
              <h2 className="font-headline text-2xl font-bold mb-8 text-on-surface">Asset Metadata</h2>
              
              <div className="space-y-6">
                {/* Token ID field */}
                <div>
                  <label className="font-label text-[10px] text-on-surface-variant tracking-[0.2em] uppercase mb-2 block">Token ID</label>
                  <div className="bg-surface-container-lowest p-4 rounded-md flex justify-between items-center group border border-outline-variant/5">
                    <span className="font-headline text-lg font-medium text-primary">{activeEstate.id}</span>
                    <button 
                      onClick={() => handleCopyToClipboard(activeEstate.id, 'id')}
                      className="text-outline group-hover:text-primary transition-colors flex items-center"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {copyFeedbacks.id ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Owner Wallet Address Field */}
                <div>
                  <label className="font-label text-[10px] text-on-surface-variant tracking-[0.2em] uppercase mb-2 block">Owner Wallet Address</label>
                  <div className="bg-surface-container-lowest p-4 rounded-md flex justify-between items-center group border border-outline-variant/5">
                    <span className="font-body text-sm font-medium text-on-surface truncate pr-4">
                      {walletConnected ? walletAddress : '0x82f0a1e3e920d3f2c5d144888fca02d18492031 (Simulation)'}
                    </span>
                    <button 
                      onClick={() => handleCopyToClipboard(walletConnected ? walletAddress : '0x82f0a1e3e920d3f2c5d144888fca02d18492031', 'address')}
                      className="text-outline group-hover:text-primary transition-colors flex items-center"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {copyFeedbacks.address ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Metadata URI */}
                <div>
                  <label className="font-label text-[10px] text-on-surface-variant tracking-[0.2em] uppercase mb-2 block">Metadata URI</label>
                  <div className="bg-surface-container-lowest p-4 rounded-md flex justify-between items-center group overflow-hidden border border-outline-variant/5">
                    <span className="font-body text-xs font-medium text-on-surface-variant truncate pr-4">
                      {activeEstate.uri}
                    </span>
                    <button 
                      onClick={() => handleCopyToClipboard(activeEstate.uri, 'uri')}
                      className="text-outline group-hover:text-primary transition-colors flex items-center"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {copyFeedbacks.uri ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mint Trigger buttons */}
              <div className="mt-12 space-y-4">
                {isCurrentlyMinted ? (
                  <button 
                    disabled
                    className="w-full bg-surface-container-high border border-outline-variant/20 text-outline py-5 rounded-md font-headline font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">lock</span>
                    Already Minted
                  </button>
                ) : (
                  <button 
                    onClick={handleMintNFT}
                    className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-5 rounded-md font-headline font-bold tracking-widest uppercase text-sm mint-glow-active transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] shadow-lg shadow-primary/10 btn-shimmer"
                  >
                    Mint NFT
                  </button>
                )}
                <p className="text-center text-[10px] text-on-surface-variant uppercase tracking-widest font-label">
                  Estimated Gas: {activeEstate.gasFee} ETH
                </p>
              </div>
            </div>

            {/* Context standard block */}
            <div className="bg-primary/5 p-8 rounded-lg border border-primary/10">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary">info</span>
                <div>
                  <h4 className="font-headline font-bold text-on-surface mb-1">Architectural Standard</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Minting this parcel generates an ERC-721 token that acts as a legal deed within the Bhoomi registry. All data is immutably stored on the Ethereum blockchain.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-outline-variant/15 bg-surface relative z-10">
        <div className="font-headline text-lg text-primary-container font-bold">Bhoomi</div>
        <div className="font-body text-xs text-on-surface-variant opacity-80">© 2026 Bhoomi Digital Architect. Verified on Ethereum.</div>
        <div className="flex gap-8">
          <a className="font-body text-xs text-on-surface-variant hover:text-on-surface transition-colors" href="#">Terms of Registry</a>
          <a className="font-body text-xs text-on-surface-variant hover:text-on-surface transition-colors" href="#">Smart Contracts</a>
          <a className="font-body text-xs text-on-surface-variant hover:text-on-surface transition-colors" href="#">Privacy</a>
          <a className="font-body text-xs text-on-surface-variant hover:text-on-surface transition-colors" href="#">API</a>
        </div>
      </footer>

      {/* --- BOTTOM MOBILE NAVIGATION --- */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-3 md:hidden bg-surface-container-high/60 backdrop-blur-2xl rounded-t-xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)] border-t border-outline-variant/10">
        <Link className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-variant transition-all duration-500 ease-out" to="/marketplace">
          <span className="material-symbols-outlined">storefront</span>
          <span className="font-label text-[10px] tracking-widest uppercase mt-1">Market</span>
        </Link>
        <Link className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-xl p-2 transition-all duration-500 ease-out" to="/mint">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>token</span>
          <span className="font-label text-[10px] tracking-widest uppercase mt-1">Mint</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-variant transition-all duration-500 ease-out" to="/dashboard">
          <span className="material-symbols-outlined">account_balance</span>
          <span className="font-label text-[10px] tracking-widest uppercase mt-1">Assets</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-variant transition-all duration-500 ease-out" to="/dashboard">
          <span className="material-symbols-outlined">person</span>
          <span className="font-label text-[10px] tracking-widest uppercase mt-1">Profile</span>
        </Link>
      </nav>


      {/* ======================================================== */}
      {/* ======================== MODALS ======================== */}
      {/* ======================================================== */}

      {/* WEB3 NFT MINTING FLOW OVERLAY */}
      {isMinting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-surface-container-high border border-outline-variant/30 rounded-xl p-6 w-full max-w-md shadow-2xl relative animate-scaleUp">
            
            {/* Close button (only available if success or confirm) */}
            {mintStep === 'success' && (
              <button 
                onClick={() => setIsMinting(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}

            {/* MINT SIGNATURE REQUEST SCREEN */}
            {mintStep === 'signature' && (
              <div className="text-center py-6 space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center animate-bounce">
                    <span className="material-symbols-outlined text-3xl text-primary">draw</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-bold text-primary">Sign Consensus Request</h3>
                  <p className="text-xs text-on-surface-variant font-body px-4 leading-relaxed">
                    Confirm ownership signature in your connected wallet provider to build immutable NFT metadata block.
                  </p>
                </div>

                <div className="bg-surface-container lowest p-4 rounded text-left border border-outline-variant/10 text-xs font-body text-on-surface-variant">
                  <div className="flex justify-between mb-1">
                    <span>Protocol Deed</span>
                    <span className="text-on-surface font-bold">{activeEstate.name}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Token ID</span>
                    <span className="text-on-surface font-bold">{activeEstate.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Standard</span>
                    <span className="text-on-surface font-bold">ERC-721</span>
                  </div>
                </div>

                <div className="w-full h-1 bg-surface-container-lowest rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-pulse" style={{ width: '45%' }} />
                </div>

                <p className="text-[10px] font-label text-primary-dim uppercase tracking-widest animate-pulse">
                  {mintStatusText}
                </p>
              </div>
            )}

            {/* MINING MINT BLOCK SCREEN */}
            {mintStep === 'mining' && (
              <div className="text-center py-6 space-y-6">
                <div className="flex justify-center items-center">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-primary animate-pulse">token</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-lg font-bold text-primary">Deploying Immutable Ledger Block...</h3>
                  <p className="text-xs text-on-surface-variant font-body px-4 leading-relaxed">
                    Broadcasting transaction parameters to Ethereum miners. Awaiting consensus-level state confirmation.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-300"
                      style={{ width: `${mintProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-label text-primary-dim uppercase tracking-wider">{mintStatusText}</p>
                </div>
              </div>
            )}

            {/* SUCCESS Holographic Receipt SCREEN */}
            {mintStep === 'success' && (
              <div className="text-center py-6 space-y-6">
                
                {/* holographic Spinning card check */}
                <div className="flex justify-center items-center py-4">
                  <div className="w-48 h-32 rounded-lg bg-gradient-to-br from-primary/30 to-secondary-container/30 border border-primary/50 shadow-[0_0_40px_rgba(0,238,252,0.25)] relative overflow-hidden flex flex-col justify-between p-4 holo-card-spin">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(143,245,255,0.4),transparent)]" />
                    <div className="flex justify-between items-start z-10">
                      <span className="text-[9px] font-label tracking-widest text-primary uppercase font-bold">Bhoomi Registry</span>
                      <span className="material-symbols-outlined text-sm text-primary">token</span>
                    </div>
                    <div className="text-left z-10">
                      <p className="text-[9px] text-white/50 uppercase tracking-tighter">{activeEstate.id}</p>
                      <h4 className="font-headline font-bold text-xs text-white truncate">{activeEstate.name}</h4>
                      <p className="text-[8px] text-primary-dim tracking-wider font-label mt-0.5">ERC-721 MINTED</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-xl font-bold text-primary">Consensus Deed Generated!</h3>
                  <p className="text-xs text-on-surface-variant font-body px-4">
                    Congratulations! The digital estate has been immutably minted as an ERC-721 NFT and successfully secured on the blockchain registry.
                  </p>
                </div>

                <div className="p-4 rounded bg-surface/50 border border-outline-variant/10 text-left space-y-2 text-[10px] font-body text-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Registry Token Contract</span>
                    <span className="font-label text-primary cursor-pointer hover:underline" onClick={() => triggerToast('Copied Address!', 'info')}>
                      0x742d35Cc...38f44e
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Block Height</span>
                    <span className="font-label text-on-surface">#18,492,034</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Price Paid</span>
                    <span className="font-label text-on-surface">{activeEstate.gasFee} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Registry Signature Hash</span>
                    <span className="font-label text-primary-dim truncate w-40 block text-right">
                      0x82f99a1122eedaacc334ff99eebb
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsMinting(false)}
                    className="flex-1 py-3 rounded border border-outline-variant/30 text-on-surface font-headline text-xs font-bold hover:bg-surface-variant transition-all"
                  >
                    Mint Another
                  </button>
                  <Link 
                    to="/dashboard"
                    className="flex-1 py-3 rounded bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline text-xs font-bold shadow-lg shadow-primary/10 hover:shadow-primary/30 transition-all text-center flex items-center justify-center"
                  >
                    View Portfolio
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ======================== TOASTS ======================== */}
      {/* ======================================================== */}
      <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-3 w-80 max-w-full">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`p-4 rounded-lg shadow-2xl flex items-start gap-3 border animate-slideIn backdrop-blur-md
              ${toast.type === 'success' 
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' 
                : toast.type === 'error'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                  : toast.type === 'info'
                    ? 'bg-surface-container-high/90 border-primary/30 text-primary-dim'
                    : 'bg-surface-container-high/90 border-outline-variant/30 text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5">
              {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : 'chat'}
            </span>
            <p className="text-xs font-body font-medium leading-relaxed">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* MetaMask Connection Overlay */}
      {isConnectingWallet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="bg-surface-container-high border border-outline-variant/20 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBdIVsUarpd3oBH5AZZuR_4UMzbKWu-M5Zr_KRm5ePRiQsNa1uhNbRt1yH6VwDJarboZpyKfMrhMX2hHCDbPf3rBiPuPensyN4HoE_p1q13VjqwO6Upl5CHLzRtaxY8PnDNibHoucurwcltrPi4GsOykYDYb0HUF7f1boH7IOWv9-1sxyytEuGDqgpeJIg_AB4S-S-vvyT1WY3Bq9cx1GddD8Vy5tWeDxgJcHF-hBfJSbYr4OKn1NsLsfVMl2hZ4uG4wExVXDspwJ4" 
                alt="MetaMask Logo" 
                className="w-16 h-16 object-contain animate-bounce" 
              />
            </div>
            <div>
              <h3 className="font-headline font-bold text-xl text-on-surface">Connecting MetaMask</h3>
              <p className="text-on-surface-variant text-sm mt-2">
                Opening MetaMask extension. Please approve the connection request in the popup window.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              <span>Awaiting connection...</span>
            </div>
          </div>
        </div>
      )}
      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-high border border-outline-variant/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">link_off</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">Disconnect Wallet</h3>
              <p className="text-on-surface-variant text-sm mt-2">
                Are you sure you want to disconnect your MetaMask wallet?
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <button 
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-outline-variant/20 text-xs font-semibold hover:bg-surface-container-highest transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  executeDisconnectWallet();
                }}
                className="flex-1 py-2.5 rounded-lg bg-error text-on-error text-xs font-semibold hover:bg-error-dim transition-colors"
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

export default NFT_miningPage;
