import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

const ALL_LANDS = [
  // Page 1
  {
    id: 'LV-48201',
    name: 'Neon Zenith Heights',
    price: 2.5,
    usdPrice: 5840.00,
    owner: '0x4a...3e92',
    fullOwner: '0x4a8b753c90e290f11db89000a12e3e92',
    area: 4200,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzWoZ9XHdraHuKsruDVenKnSg_ljRD5f0lRNXEjjLR7tSpnuOtOOZz8F_E65O3fbgrqjyg2cvPjYN9gXKsdi2K7laBqBzOlCEStDqImeBVxad-b5FFabjx5qqbkYONfWFM_PMuVtnjc3SWF6lLp3xWtu1VR78HOwzO5khV1Llw48JiE5MQnKXYG_m7ELz_xznqQJlo_P9XgRUcI9U32w-qnGqnqg5zcBOupXp3O5Eg1nH64z4WfLmYXk9ft0Idvmz16LKO1qWFvobi',
    verified: true,
    region: 'Heights',
    coordinates: '42.3601° N, 71.0589° W',
    description: 'A stellar architectural zenith plot featuring futuristic high-density residential towers reflecting glowing neon-cyan hues. Zoned for premium residential expansion.',
    history: [
      { event: 'Minted by Bhoomi Genesis', date: 'January 12, 2024 • 04:22 PM', priceText: 'Origin', type: 'mint' },
      { event: 'Transferred to 0x4f1...99c', date: 'February 05, 2024 • 11:10 AM', priceText: '1.2 ETH', type: 'transfer' },
      { event: 'Acquired by Current Owner', date: 'March 20, 2024 • 08:45 PM', priceText: '2.1 ETH', type: 'purchase' }
    ]
  },
  {
    id: 'LV-91223',
    name: 'Obsidian Rift Valley',
    price: 4.8,
    usdPrice: 11210.00,
    owner: '0x9b...1f12',
    fullOwner: '0x9b5d21fe829aa1828cb0f124b89e1f12',
    area: 8500,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeau8hkXkDNK6Nr_BaFj2SyJ330UjDaguDZzZI4EDVxsB-2t2iQWd9U6eeuDzTUnlzLdu6BISKgVoxLEFA_IvMyqsaR5x0nxhjeINeQPMetg8IskIDpUDFfUYCBLGSzRb7WhidQ9xep2byXLLzvh_NFv-JaVlCixFaGJLDsbHeYuY-eFV0Cqn1Vg8YZWCHF6rJb_X9CoOOdpH3t2LWkG3QHgidwPUxD74hGtmPbOm0lSzRrXvO1xwkDjpWBE9g6ZeycQbozg9P9P8x',
    verified: true,
    region: 'Valley',
    coordinates: '34.0522° N, 118.2437° W',
    description: 'A high-density commercial nexus plot with direct skyway access. Zoned for Level 5 architectural complexity and immersive holographic broadcasting.',
    history: [
      { event: 'Minted by Bhoomi Genesis', date: 'January 12, 2024 • 04:22 PM', priceText: 'Origin', type: 'mint' },
      { event: 'Transferred to 0x4f1...99c', date: 'February 05, 2024 • 11:10 AM', priceText: '2.4 ETH', type: 'transfer' },
      { event: 'Acquired by Current Owner', date: 'March 20, 2024 • 08:45 PM', priceText: '4.2 ETH', type: 'purchase' }
    ]
  },
  {
    id: 'LV-12005',
    name: 'Ethereal Plain III',
    price: 1.2,
    usdPrice: 2800.00,
    owner: '0xcc...aa88',
    fullOwner: '0xecca88bf99ee32ab12f6cd99aa888c3a',
    area: 2100,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmRKc4pCgz7fZznE2gFWXS-usBIQe6SISRZ-q_1d0AlNO3BqHdM-Ek7mgF9a6Lnrgsjuq9fg8802UHAXmZ6HtB_lTxxklafsv1NNEM_az2r3ysTHByqXXjhckZ4odMhx5f_82Z5FnFPDpqTlBEdHUlhlp97hfB7yu5vP2O7fAUmCgwvxivvBAS_eFY7rTNc6ERW-mNB7POHuZ321nTClhqDAqFtRGqtGsDWcPGugjI7sCYpw7LB8pyxnD4bPW2m-RlaeACXDfsB82f',
    verified: true,
    region: 'Plain',
    coordinates: '51.5074° N, 0.1278° W',
    description: 'A minimalist architectural landscape featuring clean white monoliths. Perfect for serene high-end residential estates or futuristic retreats.',
    history: [
      { event: 'Minted by Bhoomi Genesis', date: 'January 12, 2024 • 04:22 PM', priceText: 'Origin', type: 'mint' },
      { event: 'Acquired by Current Owner', date: 'March 20, 2024 • 08:45 PM', priceText: '0.9 ETH', type: 'purchase' }
    ]
  },
  {
    id: 'LV-66710',
    name: 'Prism Coast District',
    price: 6.4,
    usdPrice: 14950.00,
    owner: '0xfe...0031',
    fullOwner: '0xfe0031cb67aa229ef5e003120199aa12',
    area: 12000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHzAkNxPPcKNNMuaEyROjKLqWjPzsVaVFAi60oe6YgOLdExaku-jDlM1tVHlcNzLK6A7-IuAbM-6VeMuhpqOGOBCphPxiK8AEq-lJ_SJdnqA2iIjTAYIidIQDjVymwqvz9CnW-3gv9qF_BDI5K0bvCwAzawntJggewdAebLiTtrGQdHT869EM1qE1FRzuh77dbaCCAf86vxnZTAH-1H9xkmQ9Ei8IvCrqg_o3ckbdnYw74ONrlgSe4q4atSpbnwCpXfg_5wPqE6QkV',
    verified: true,
    region: 'Coast',
    coordinates: '48.8566° N, 2.3522° E',
    description: 'A majestic digital shoreline containing floating bridges and data-stream waves. Zoned for luxury cybernetic estates and premium network nodes.',
    history: [
      { event: 'Minted by Bhoomi Genesis', date: 'January 12, 2024 • 04:22 PM', priceText: 'Origin', type: 'mint' },
      { event: 'Transferred to 0x4f1...99c', date: 'February 05, 2024 • 11:10 AM', priceText: '4.8 ETH', type: 'transfer' },
      { event: 'Acquired by Current Owner', date: 'March 20, 2024 • 08:45 PM', priceText: '5.9 ETH', type: 'purchase' }
    ]
  },
  {
    id: 'LV-33044',
    name: 'Cyan Silence Core',
    price: 3.2,
    usdPrice: 7480.00,
    owner: '0x21...bbcc',
    fullOwner: '0x21bbcc8d2345ef01bbcc99eeffaaccb2',
    area: 5600,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDV0f9wP-mhetL0XIljeDJLkZtDOQjp4nMUrK98hydadxYfExv4y7g9UYIJsTBRTCHCpQhPxfBAyBAYTOagsZeRAqXhhNIIaSu0TY6O0K8ALuEtO9lae90U-9w00PP31Ud0yC7e6J3Xhhj0rcuF6OFlNzlthveJ91MO-tq9AEjz0dbXE7xyNkY-FQhFPR94ps-XUFVr9L_7D9owgF7vGKqrPBYGDQ8A9uCpM1ELwUBXh_vm7MNwc4Zfuho4Zp76GSd5E_21JJhql5yK',
    verified: true,
    region: 'Core',
    coordinates: '35.6762° N, 139.6503° E',
    description: 'An asymmetrical minimalist research core highlighting sharp white lines and bright cyan glowing bars. Validated for secure ledger computing and VR node arrays.',
    history: [
      { event: 'Minted by Bhoomi Genesis', date: 'January 12, 2024 • 04:22 PM', priceText: 'Origin', type: 'mint' },
      { event: 'Acquired by Current Owner', date: 'March 20, 2024 • 08:45 PM', priceText: '2.8 ETH', type: 'purchase' }
    ]
  },
  {
    id: 'LV-00921',
    name: 'Data Stream Gardens',
    price: 1.9,
    usdPrice: 4440.00,
    owner: '0x99...eeff',
    fullOwner: '0x99eeffaa88dd99cc11bbaacc99eeffee',
    area: 3300,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS1e9KqS5yTjO9eAk46VTX042jTNNLqN3Z4LSdsZElWSLbAzjzcY2l2ksl-OB9DjMqcdpZzfvfJyZr_O0wFeAtx8hbbwpmKlhLEJPWsQbzsa2MkL4ZqSlJP7pjuBrlQWc-aqDDacfR81KREHsDIizTFfMTkqMWdwMYUFq513mRqacPDlE08fx3rqi3uiPpTskpJQ2moyNb8r_VbB5fst1TB3hHtiAYHk1rUUgLiTgUB0wXuX80OdG1mAaGQQX2mP7VDE558lqy4zkd',
    verified: true,
    region: 'Gardens',
    coordinates: '25.2048° N, 55.2708° E',
    description: 'A luxury grid garden featuring flowing codes and translucent panels. Zoned for low-density digital residences with high-fidelity network connectivity.',
    history: [
      { event: 'Minted by Bhoomi Genesis', date: 'January 12, 2024 • 04:22 PM', priceText: 'Origin', type: 'mint' },
      { event: 'Transferred to 0x4f1...99c', date: 'February 05, 2024 • 11:10 AM', priceText: '1.5 ETH', type: 'transfer' },
      { event: 'Acquired by Current Owner', date: 'March 20, 2024 • 08:45 PM', priceText: '1.8 ETH', type: 'purchase' }
    ]
  }
];

const styles = `
  @keyframes ripple {
    0% { transform: scale(0.95); opacity: 0.8; }
    50% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(0.95); opacity: 0.8; }
  }
  .map-pulse-animated {
    animation: ripple 2.5s infinite;
  }
`;

const PropertyDetailsPage = () => {
  const { id } = useParams();
  
  // Find properties dynamically or fallback to Obsidian Rift Valley
  const baseLand = ALL_LANDS.find((l) => l.id === id) || ALL_LANDS[1];
  
  // --- STATE ---
  const [land, setLand] = useState(baseLand);
  const [purchased, setPurchased] = useState(false);
  const [historyList, setHistoryList] = useState(baseLand.history);

  // Wallet
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState(2.45);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Modals & Overlay
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState('confirm'); // 'confirm' | 'processing' | 'success'
  const [purchaseProgress, setPurchaseProgress] = useState(0);
  const [purchaseStatusMsg, setPurchaseStatusMsg] = useState('');
  
  const [showBlockchainRecord, setShowBlockchainRecord] = useState(false);
  
  // copy feedbacks
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Price card radial mouse glow
  const priceCardRef = useRef(null);

  useEffect(() => {
    // Reset page states if the URL ID parameter changes
    const updatedBase = ALL_LANDS.find((l) => l.id === id) || ALL_LANDS[1];
    setLand(updatedBase);
    setHistoryList(updatedBase.history);
    setPurchased(false);
  }, [id]);

  useEffect(() => {
    const card = priceCardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      card.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(143, 245, 255, 0.12), transparent 70%), rgba(34, 37, 49, 0.4)`;
    };

    const handleMouseLeave = () => {
      card.style.background = '';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [land]);

  // --- ACTIONS ---
  const triggerToast = (message, type = 'success') => {
    const newToast = { id: Date.now(), message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const handleConnectWallet = () => {
    setIsConnectingWallet(true);
    triggerToast('Connecting Metamask Extension...', 'info');
    setTimeout(() => {
      setWalletConnected(true);
      setWalletAddress('0x82f0a1e3e920d3f2c5d144888fca02d18492031');
      setWalletBalance(12.45);
      setIsConnectingWallet(false);
      triggerToast('Wallet connected and synchronized!', 'success');
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

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    triggerToast('Copied wallet address to clipboard!', 'success');
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleInitiatePurchase = () => {
    if (!walletConnected) {
      handleConnectWallet();
      return;
    }
    if (walletBalance < land.price) {
      triggerToast('Insufficient ETH balance!', 'error');
      return;
    }

    setIsPurchasing(true);
    setPurchaseStep('confirm');
    setPurchaseProgress(0);
  };

  const handleConfirmPurchase = () => {
    setPurchaseStep('processing');
    setPurchaseProgress(15);
    setPurchaseStatusMsg('Requesting signature confirmation in wallet...');

    setTimeout(() => {
      setPurchaseProgress(50);
      setPurchaseStatusMsg('Awaiting block confirmation on Ethereum Consensus layer...');

      setTimeout(() => {
        setPurchaseProgress(85);
        setPurchaseStatusMsg('Updating Bhoomi Registry ledger smart contracts...');

        setTimeout(() => {
          setPurchaseProgress(100);
          setPurchaseStep('success');

          // update history chain list locally
          const nowStr = new Date().toLocaleString('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          const newHistory = [
            ...historyList,
            { event: 'Purchased by You', date: `${nowStr}`, priceText: `${land.price} ETH`, type: 'user_buy' }
          ];
          setHistoryList(newHistory);

          // deduct balance
          const totalCost = land.price + 0.0042; // gas
          setWalletBalance((prev) => parseFloat((prev - totalCost).toFixed(4)));
          
          setPurchased(true);
          triggerToast(`Purchase complete! You now own ${land.name}.`, 'success');
        }, 1200);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 min-h-screen relative overflow-x-hidden page-enter">
      <style>{styles}</style>
      <div className="fixed inset-0 grid-bg pointer-events-none z-0 opacity-40" />

      {/* --- TOP NAV BAR --- */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-surface/40 backdrop-blur-xl border-b border-outline-variant/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-display font-bold text-2xl tracking-tighter text-primary hover:text-primary-dim transition-colors">
            Bhoomi
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link className="text-on-surface-variant font-medium hover:text-primary-dim transition-colors duration-300" to="/marketplace">
              Marketplace
            </Link>
            <Link className="text-on-surface-variant font-medium hover:text-primary-dim transition-colors duration-300" to="/mint">
              Mint NFT
            </Link>
            <Link className="text-on-surface-variant font-medium hover:text-primary-dim transition-colors duration-300" to="/dashboard">
              Portfolio
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer" onClick={() => triggerToast('Notification ledger cleared', 'info')}>
              notifications
            </span>
            {walletConnected && (
              <div className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant/20">
                <span className="material-symbols-outlined text-sm text-primary">account_balance_wallet</span>
                <span className="text-xs font-label font-medium text-primary-dim">{walletBalance} ETH</span>
              </div>
            )}
          </div>

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
              className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold active:scale-95 transition-transform"
            >
              {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </header>

      {/* --- MAIN PROPERTY AREA --- */}
      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto min-h-screen relative z-10">
        
        {/* Dynamic Back button */}
        <Link 
          to="/marketplace"
          className="inline-flex items-center gap-2 text-xs font-headline text-on-surface-variant hover:text-primary transition-colors mb-8 uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT COLUMN: COVER & History chain */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Architectural Render */}
            <div className="relative rounded-lg overflow-hidden group aspect-[16/10] bg-surface-container shadow-2xl border border-outline-variant/10">
              <img 
                src={land.image}
                alt={land.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              
              {/* Geospatial Overlay */}
              <div className="absolute bottom-6 left-6 w-48 h-48 rounded-lg overflow-hidden border border-primary/20 shadow-2xl group/map bg-black">
                <div className="w-full h-full bg-surface-container-high relative overflow-hidden">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVjYmflHFOYyFM09TTUEQeZVOHtsPLTeDKFpYp8kpODBHjve29yB4CBCKS54GSD7DIxqVFCxYcjD1gDKIaJcG36f215ogCs3MIsF5u4tE21ZsVyf1ZbZkmqRKP2Cpl0F70P5yxRoP1_Zv8wbgV2fhU88Hf5AySunq_0aO6WyYeoUhvtmu87l9w2BhVpF5IPSoPjSVcvbOQAyBtXINQBXQD2saYYvPLO74z8srWgNJFjXQ5IRoApX0CTEERDLORlS6Ol4IAWiXxGHDl"
                    alt="Stylized maps grid"
                    className="w-full h-full object-cover opacity-60 grayscale brightness-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-primary rounded-full map-pulse-animated shadow-[0_0_10px_#8ff5ff]" />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className="bg-primary/20 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-label uppercase text-primary tracking-widest">
                      GPS: {land.coordinates.split(',')[0]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ownership history logs */}
            <section className="space-y-6 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_#e9ffb9]" />
                <h3 className="font-display text-xl font-bold tracking-tight text-on-surface">
                  Ethereal Chain of Title
                </h3>
              </div>

              <div className="space-y-px rounded-lg overflow-hidden border border-outline-variant/10 shadow-lg">
                {historyList.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-5 bg-surface-container-low hover:bg-surface-container/80 transition-colors border-b border-outline-variant/5 last:border-b-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                        ${item.type === 'mint' 
                          ? 'bg-secondary-container/20 text-secondary' 
                          : item.type === 'transfer'
                            ? 'bg-surface-variant text-on-surface-variant border border-outline-variant/10'
                            : item.type === 'user_buy'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-primary-container/20 text-primary'}`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {item.type === 'mint' ? 'verified_user' : item.type === 'transfer' ? 'swap_horiz' : 'shopping_cart'}
                        </span>
                      </div>
                      <div>
                        <p className="font-body font-bold text-sm text-on-surface">{item.event}</p>
                        <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">{item.date}</p>
                      </div>
                    </div>
                    <span className={`font-display text-xs px-3 py-1 rounded-full
                      ${item.type === 'mint' 
                        ? 'text-primary bg-primary/10' 
                        : item.type === 'user_buy'
                          ? 'text-emerald-400 bg-emerald-500/10 font-bold'
                          : 'text-on-surface-variant'}`}
                    >
                      {item.priceText}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: SIDE METADATA */}
          <aside className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="glass-panel p-8 rounded-lg border border-outline-variant/15 space-y-8 shadow-[0_40px_80px_rgba(0,0,0,0.5)] bg-surface-container-high/40">
              
              {/* Identity & Header tags */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-secondary-container text-on-secondary-container font-label text-[10px] px-2 py-1 rounded-sm uppercase tracking-widest font-bold">
                    Verified Title
                  </span>
                  <span className="text-on-surface-variant text-xs font-label">
                    {land.id.replace('LV-', '#')}
                  </span>
                </div>
                <h1 className="font-display text-4xl font-extrabold tracking-tighter text-on-surface">
                  {land.name}
                </h1>
                <p className="font-body text-on-surface-variant leading-relaxed text-sm">
                  {land.description}
                </p>
              </div>

              {/* Bento Grid parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-md space-y-1 border border-outline-variant/5">
                  <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Plot Number</span>
                  <p className="font-display font-bold text-primary">{land.id}</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-md space-y-1 border border-outline-variant/5">
                  <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">NFT Token ID</span>
                  <p className="font-display font-bold text-on-surface">{land.id.replace('LV-', '#')}</p>
                </div>
                <div 
                  onClick={() => handleCopyToClipboard(purchased ? (walletConnected ? walletAddress : '0x82f0a1e3e920d3f2c5d144888fca02d18492031') : land.fullOwner)}
                  className="bg-surface-container-low p-4 rounded-md col-span-2 space-y-1 group cursor-pointer hover:bg-surface-container-high transition-all border border-outline-variant/5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Owner Wallet</span>
                    <span className="material-symbols-outlined text-xs text-primary transition-opacity">
                      {copyFeedback ? 'check' : 'content_copy'}
                    </span>
                  </div>
                  <p className="font-display font-bold text-on-surface text-sm truncate">
                    {purchased 
                      ? (walletConnected ? walletAddress : '0x82f0a1e3e920d3f2c5d144888fca02d18492031') 
                      : land.fullOwner}
                  </p>
                </div>
              </div>

              {/* Listing Pricing block */}
              <div ref={priceCardRef} className="p-6 bg-surface-container rounded-lg border-l-4 border-primary transition-all duration-300 border border-outline-variant/10 shadow-lg">
                <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block mb-1">
                  Current Listing Price
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl font-extrabold text-primary tracking-tighter">{land.price}</span>
                  <span className="font-display text-2xl font-bold text-primary-dim">ETH</span>
                  <span className="text-on-surface-variant text-xs ml-auto">≈ ${land.usdPrice.toLocaleString()} USD</span>
                </div>
              </div>

              {/* Purchase and Record Actions */}
              <div className="flex flex-col gap-4">
                {purchased ? (
                  <button 
                    disabled
                    className="w-full bg-surface-container-high border border-outline-variant/10 text-outline py-5 rounded-full font-display font-extrabold text-base flex items-center justify-center gap-3 cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">lock</span>
                    Deed Owned By You
                  </button>
                ) : (
                  <button 
                    onClick={handleInitiatePurchase}
                    className="glow-button w-full bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed py-5 rounded-full font-display font-extrabold text-lg flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                    Initiate Purchase
                  </button>
                )}
                
                <button 
                  onClick={() => setShowBlockchainRecord(true)}
                  className="w-full border border-outline-variant/30 hover:bg-surface-container text-on-surface-variant py-4 rounded-full font-body font-bold transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">link</span>
                  View Blockchain Record
                </button>
              </div>

              {/* Features pills */}
              <div className="pt-4 border-t border-outline-variant/10">
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded-full border border-outline-variant/5">
                    <span className="material-symbols-outlined text-[14px] text-tertiary">bolt</span>
                    <span className="text-[11px] font-label text-on-surface-variant uppercase tracking-wider">Fast Access</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded-full border border-outline-variant/5">
                    <span className="material-symbols-outlined text-[14px] text-secondary">view_in_ar</span>
                    <span className="text-[11px] font-label text-on-surface-variant uppercase tracking-wider">VR Compatible</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded-full border border-outline-variant/5">
                    <span className="material-symbols-outlined text-[14px] text-error">workspace_premium</span>
                    <span className="text-[11px] font-label text-on-surface-variant uppercase tracking-wider">Prime Zone</span>
                  </div>
                </div>
              </div>

            </div>
          </aside>

        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface-container-lowest border-t border-outline-variant/5 relative z-10 mt-12">
        <div>
          <span className="font-display text-primary font-bold text-xl">Bhoomi</span>
          <p className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant mt-2">
            © 2026 Bhoomi Ethereal Ledger. All Rights Reserved.
          </p>
        </div>
        <div className="flex gap-8">
          <a className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant hover:text-primary transition-colors text-xs" href="#">Smart Contracts</a>
          <a className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant hover:text-primary transition-colors text-xs" href="#">Governance</a>
          <a className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant hover:text-primary transition-colors text-xs" href="#">Privacy Protocol</a>
          <a className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant hover:text-primary transition-colors text-xs" href="#">API Documentation</a>
        </div>
      </footer>


      {/* ======================================================== */}
      {/* ======================== MODALS ======================== */}
      {/* ======================================================== */}

      {/* 1. TRANSACTION PURCHASE SIMULATOR */}
      {isPurchasing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-surface-container-high border border-outline-variant/30 rounded-xl p-6 w-full max-w-md shadow-2xl relative animate-scaleUp">
            
            {/* Close button (only available if success or confirm) */}
            {purchaseStep !== 'processing' && (
              <button 
                onClick={() => setIsPurchasing(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}

            {/* CONFIRM SCREEN */}
            {purchaseStep === 'confirm' && (
              <div>
                <h3 className="font-display text-xl font-bold text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/15 pb-3">
                  <span className="material-symbols-outlined">payments</span>
                  Acquire Land Deed
                </h3>

                {/* Info Card */}
                <div className="flex gap-4 p-4 rounded bg-surface/50 border border-outline-variant/10 mb-6">
                  <img 
                    src={land.image} 
                    alt={land.name} 
                    className="w-20 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="text-[10px] text-primary uppercase font-label font-bold tracking-wider">{land.id}</p>
                    <p className="font-headline font-bold text-sm text-on-surface">{land.name}</p>
                    <p className="text-xs text-on-surface-variant font-body">{land.region} Zoned</p>
                  </div>
                </div>

                {/* details list */}
                <div className="space-y-3 text-xs font-body mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Plot Listing Price</span>
                    <span className="font-label text-on-surface font-bold">{land.price} ETH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Consensus Layer gas (Simulation)</span>
                    <span className="font-label text-on-surface-variant">0.0042 ETH</span>
                  </div>
                  <div className="h-px bg-outline-variant/15" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary font-headline font-bold">Total Payment</span>
                    <span className="font-label text-primary-container font-extrabold">{(land.price + 0.0042).toFixed(4)} ETH</span>
                  </div>
                </div>

                <div className="p-3 rounded bg-primary/5 border border-primary/20 flex justify-between items-center text-xs font-body mb-6">
                  <span className="text-on-surface-variant">Connected Wallet Balance:</span>
                  <span className="font-label text-primary font-bold">{walletBalance} ETH</span>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsPurchasing(false)}
                    className="flex-grow py-3 px-4 rounded border border-outline-variant/30 text-on-surface font-headline text-xs font-bold hover:bg-surface-variant transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmPurchase}
                    className="flex-grow py-3 px-4 rounded bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline text-xs font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.02]"
                  >
                    Confirm Purchase
                  </button>
                </div>
              </div>
            )}

            {/* PROCESSING TRANS SCREEN */}
            {purchaseStep === 'processing' && (
              <div className="text-center py-8 space-y-6">
                <div className="flex justify-center items-center">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-primary animate-pulse">account_balance_wallet</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-display text-lg font-bold text-primary font-black">Executing Ledger Transaction...</h4>
                  <p className="text-xs text-on-surface-variant font-body px-4 leading-relaxed">
                    Connecting to consensus node registry. Mining block data and updating digital deed signatures.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-300"
                      style={{ width: `${purchaseProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-label text-primary-dim uppercase tracking-wider">{purchaseStatusMsg}</p>
                </div>
              </div>
            )}

            {/* SUCCESS TRANSACTION SCREEN */}
            {purchaseStep === 'success' && (
              <div className="text-center py-6 space-y-6 animate-scaleUp">
                <div className="flex justify-center items-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary flex items-center justify-center shadow-[0_0_20px_rgba(0,238,252,0.3)] animate-pulse">
                    <span className="material-symbols-outlined text-3xl text-primary font-bold">done</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-xl font-bold text-primary">Purchase Complete!</h3>
                  <p className="text-xs text-on-surface-variant font-body px-4">
                    The transaction was securely minded in consensus block. The digital deed now resides in your connected wallet.
                  </p>
                </div>

                <div className="p-4 rounded bg-surface/50 border border-outline-variant/10 text-left space-y-2 text-[10px] font-body text-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Transaction Hash</span>
                    <span className="font-label text-primary-dim cursor-pointer hover:underline" onClick={() => triggerToast('Copied Hash!', 'info')}>
                      0x4df1bbcc8892aa3312cfaacc99aa
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Registry Standard</span>
                    <span className="font-label text-on-surface">ERC-721</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Validation Status</span>
                    <span className="font-label text-emerald-400 font-bold uppercase">Success (Confirmed)</span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsPurchasing(false)}
                  className="w-full py-3 rounded bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline text-sm font-bold shadow-lg shadow-primary/10 hover:shadow-primary/30 transition-all active:scale-95"
                >
                  Confirm and Close
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 2. BLOCKCHAIN RECORD RAW DETAIL MODAL */}
      {showBlockchainRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-surface-container-high border border-outline-variant/30 rounded-xl p-6 w-full max-w-2xl shadow-2xl relative animate-scaleUp">
            
            <button 
              onClick={() => setShowBlockchainRecord(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="font-display text-xl font-bold text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/15 pb-3">
              <span className="material-symbols-outlined">terminal</span>
              Etherscan Registry Ledger Contract
            </h3>

            <div className="space-y-4 text-xs font-mono">
              <div className="bg-surface p-4 rounded border border-outline-variant/10 text-on-surface-variant space-y-2 overflow-x-auto">
                <p className="text-primary font-bold">// Etherscan Bytecode for LandDeed Registry Contract</p>
                <p className="text-on-surface">Address: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e</p>
                <p className="text-outline-variant">
                  [Object] Standard Solidity ERC-721 Contract (v0.8.20)<br/>
                  Optimization Enabled: True (Runs: 200)<br/>
                  Bytecode Length: 4982 bytes
                </p>
                <div className="h-px bg-outline-variant/15 my-2" />
                <p className="text-emerald-400">
                  {`function mintProperty(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();
    _mint(recipient, newItemId);
    _setTokenURI(newItemId, tokenURI);
    emit PropertyRegistryMinted(newItemId, recipient, tokenURI);
    return newItemId;
}`}
                </p>
                <p className="text-amber-400">
                  {`function transferProperty(address from, address to, uint256 tokenId) public {
    require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
    _transfer(from, to, tokenId);
    emit PropertyRegistryTransferred(tokenId, from, to);
}`}
                </p>
              </div>

              <div className="bg-surface/50 p-4 rounded border border-outline-variant/10 space-y-2 text-[10px]">
                <p className="text-on-surface-variant font-bold uppercase tracking-wider">// CONTRACT VERIFICATION HASHES</p>
                <div className="grid grid-cols-2 gap-4 text-outline-variant">
                  <div>
                    <span>Solc Compiler Version:</span>
                    <span className="text-on-surface block">v0.8.20+commit.a1b2c3d4</span>
                  </div>
                  <div>
                    <span>Contract ABI Status:</span>
                    <span className="text-emerald-400 block font-bold">VERIFIED PUBLIC</span>
                  </div>
                  <div>
                    <span>Swarm Source Hash:</span>
                    <span className="text-on-surface block truncate">bzzr://4a92ffccaaccbbaadd3399eeddff</span>
                  </div>
                  <div>
                    <span>IPFS Metadata Root:</span>
                    <span className="text-on-surface block truncate">ipfs://bafybeigdyrzt5sfp7udm7hu76uh</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowBlockchainRecord(false)}
              className="w-full mt-6 py-3 rounded bg-surface border border-outline-variant/30 text-on-surface font-headline text-xs font-bold hover:bg-surface-variant transition-all active:scale-95"
            >
              Close Etherscan Ledger Console
            </button>
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

export default PropertyDetailsPage;
