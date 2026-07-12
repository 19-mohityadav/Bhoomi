import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ConnectWalletPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo || '/dashboard';
  
  const [hoveredButton, setHoveredButton] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleWalletConnect = async (walletName) => {
    setIsConnecting(walletName);
    
    // If MetaMask is selected and available, use real wallet, else mock
    let address = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
    
    if (walletName === 'MetaMask' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) address = accounts[0];
      } catch (err) {
        console.error("MetaMask connection failed:", err);
        setIsConnecting(null);
        return;
      }
    } else {
      // Simulate connection delay for others
      await new Promise(resolve => setTimeout(resolve, 1400));
    }
    
    try {
      // 1. Try to update the real Supabase Auth user profile if logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ wallet_address: address })
          .eq('id', user.id);
      }
      
      // 2. Local fallback for demo state
      const mockUserStr = localStorage.getItem('mockUser');
      if (mockUserStr) {
        const mockUser = JSON.parse(mockUserStr);
        mockUser.wallet_address = address;
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
      }
    } catch (err) {
      console.error("Error saving wallet address:", err);
    }
    
    setIsConnecting(null);
    setConnectedWallet(walletName);
  };

  useEffect(() => {
    // Smooth reveal on load
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="font-body selection:bg-primary-container selection:text-on-primary-container bg-surface text-on-surface min-h-screen flex flex-col overflow-x-hidden page-enter">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-surface-variant/40 backdrop-blur-xl shadow-2xl shadow-primary/5">
        <nav className="flex justify-between items-center px-8 py-4 max-w-full mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-headline text-2xl font-bold tracking-tighter text-primary">Bhoomi</Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="font-headline tracking-wide uppercase text-sm text-on-surface-variant hover:text-on-surface transition-colors">Explore</Link>
              <a className="font-headline tracking-wide uppercase text-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">How It Works</a>
              <a className="font-headline tracking-wide uppercase text-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Features</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="active:scale-95 duration-200 primary-gradient text-on-primary-container px-6 py-2 rounded-full font-headline font-bold tracking-wide uppercase text-sm shadow-xl shadow-primary/20">
              Connect Wallet
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-grow py-12 flex flex-col items-center justify-center relative px-6 overflow-hidden">
        {/* Atmospheric Background Elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none z-0" />
        
        {/* Central Connection Card */}
        <div 
          className={`w-full max-w-md glass-panel rounded-lg p-6 relative z-10 border border-outline-variant/15 shadow-2xl ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        >
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-surface-container rounded-2xl flex items-center justify-center mb-4 border border-outline-variant/10">
              <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
            <h1 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-2">Connect your wallet</h1>
            <p className="text-on-surface-variant text-sm max-w-sm">Select your preferred provider to access the digital land registry.</p>
          </div>
          
          {/* Wallet Options */}
          <div className="space-y-4">
            {/* MetaMask */}
            <button
              onClick={() => handleWalletConnect('MetaMask')}
              onMouseEnter={() => setHoveredButton('metamask')}
              onMouseLeave={() => setHoveredButton(null)}
              disabled={!!connectedWallet || !!isConnecting}
              className={`group w-full flex items-center justify-between p-5 rounded-md transition-all duration-300 border active:scale-[0.98]
                ${connectedWallet === 'MetaMask'
                  ? 'bg-primary/10 border-primary/40'
                  : 'bg-surface-container-low hover:bg-surface-container-high border-transparent hover:border-primary/20'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-surface-container-highest rounded-xl group-hover:scale-110 transition-transform">
                  <img alt="MetaMask Logo" className="w-8 h-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBdIVsUarpd3oBH5AZZuR_4UMzbKWu-M5Zr_KRm5ePRiQsNa1uhNbRt1yH6VwDJarboZpyKfMrhMX2hHCDbPf3rBiPuPensyN4HoE_p1q13VjqwO6Upl5CHLzRtaxY8PnDNibHoucurwcltrPi4GsOykYDYb0HUF7f1boH7IOWv9-1sxyytEuGDqgpeJIg_AB4S-S-vvyT1WY3Bq9cx1GddD8Vy5tWeDxgJcHF-hBfJSbYr4OKn1NsLsfVMl2hZ4uG4wExVXDspwJ4"/>
                </div>
                <div className="text-left">
                  <span className="block font-headline font-bold text-lg text-on-surface">MetaMask</span>
                  <span className="block text-xs text-on-surface-variant font-label tracking-wider uppercase">Browser Extension / Mobile</span>
                </div>
              </div>
              <div className="flex items-center gap-2 transition-opacity">
                {isConnecting === 'MetaMask' ? (
                  <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                ) : connectedWallet === 'MetaMask' ? (
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                ) : (
                  <>
                    <span className="text-xs font-label uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100">Connect</span>
                    <span className="material-symbols-outlined text-primary text-sm opacity-0 group-hover:opacity-100">arrow_forward_ios</span>
                  </>
                )}
              </div>
            </button>
            
            {/* WalletConnect */}
            <button
              onClick={() => handleWalletConnect('WalletConnect')}
              onMouseEnter={() => setHoveredButton('walletconnect')}
              onMouseLeave={() => setHoveredButton(null)}
              disabled={!!connectedWallet || !!isConnecting}
              className={`group w-full flex items-center justify-between p-5 rounded-md transition-all duration-300 border active:scale-[0.98]
                ${connectedWallet === 'WalletConnect'
                  ? 'bg-primary/10 border-primary/40'
                  : 'bg-surface-container-low hover:bg-surface-container-high border-transparent hover:border-primary/20'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-surface-container-highest rounded-xl group-hover:scale-110 transition-transform">
                  <img alt="WalletConnect Logo" className="w-8 h-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFqj55C6ThgASkZOyZmTUTIWd5RcSRKQxQ_Xlnq6aC2sgfwf9wVlOw_NetENBjyuLgEhflOQ6eqNNx7qbiYwnUWX-w1S8NcrmHE5eFmuqCTVi6iNrP5JAYdA52wcHON74ZpQWiZeZbcj1HIKCa5wN4uwgcfvxzilGt4gswZ0QrVvezHaFVr4AKVpmFl9iIHTpvkKBuYvGsSgzBjyBE5q0ll-rbR79bYm5k0yJwJWtqNRpHdwzbalFn7qLTF4tzCEAyFwoUQg1cAiW8"/>
                </div>
                <div className="text-left">
                  <span className="block font-headline font-bold text-lg text-on-surface">WalletConnect</span>
                  <span className="block text-xs text-on-surface-variant font-label tracking-wider uppercase">Scan QR Code / Mobile App</span>
                </div>
              </div>
              <div className="flex items-center gap-2 transition-opacity">
                {isConnecting === 'WalletConnect' ? (
                  <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                ) : connectedWallet === 'WalletConnect' ? (
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                ) : (
                  <>
                    <span className="text-xs font-label uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100">Connect</span>
                    <span className="material-symbols-outlined text-primary text-sm opacity-0 group-hover:opacity-100">arrow_forward_ios</span>
                  </>
                )}
              </div>
            </button>
            
            {/* Coinbase Wallet */}
            <button
              onClick={() => handleWalletConnect('Coinbase')}
              onMouseEnter={() => setHoveredButton('coinbase')}
              onMouseLeave={() => setHoveredButton(null)}
              disabled={!!connectedWallet || !!isConnecting}
              className={`group w-full flex items-center justify-between p-5 rounded-md transition-all duration-300 border active:scale-[0.98]
                ${connectedWallet === 'Coinbase'
                  ? 'bg-primary/10 border-primary/40'
                  : 'bg-surface-container-low hover:bg-surface-container-high border-transparent hover:border-primary/20'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-surface-container-highest rounded-xl group-hover:scale-110 transition-transform overflow-hidden">
                  <div className="w-8 h-8 bg-[#0052ff] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl leading-none">C</span>
                  </div>
                </div>
                <div className="text-left">
                  <span className="block font-headline font-bold text-lg text-on-surface">Coinbase Wallet</span>
                  <span className="block text-xs text-on-surface-variant font-label tracking-wider uppercase">Direct Connection</span>
                </div>
              </div>
              <div className="flex items-center gap-2 transition-opacity">
                {isConnecting === 'Coinbase' ? (
                  <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                ) : connectedWallet === 'Coinbase' ? (
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                ) : (
                  <>
                    <span className="text-xs font-label uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100">Connect</span>
                    <span className="material-symbols-outlined text-primary text-sm opacity-0 group-hover:opacity-100">arrow_forward_ios</span>
                  </>
                )}
              </div>
            </button>
          </div>
          
          <div className="mt-8 pt-8 border-t border-outline-variant/15 flex flex-col items-center">
            <p className="text-sm text-on-surface-variant mb-4">New to blockchain wallets?</p>
            <a className="text-primary font-headline font-medium hover:underline flex items-center gap-2 transition-all" href="#">
              Learn how to connect
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          </div>
          
          {/* Continue to Dashboard CTA */}
          {connectedWallet && (
            <div className="mt-6 flex flex-col items-center gap-3 animate-fade-in">
              <p className="text-xs text-on-surface-variant">
                <span className="text-primary font-semibold">{connectedWallet}</span> connected successfully.
              </p>
              <button
                onClick={() => navigate(redirectTo)}
                className="w-full primary-gradient text-on-primary-container py-4 rounded-md font-headline font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(0,238,252,0.3)] transition-all active:scale-[0.98] btn-shimmer"
              >
                Continue to Dashboard
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Background Image/Graphic */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(143, 245, 255, 0.1) 0%, transparent 70%)' }}></div>
          <img alt="Abstract Blockchain Visualization" className="w-full h-full object-cover scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCr8RKR5AW9AIh5dyE5u-hVEaXr7Eq_WXWaJqNKMKxfwZmWnk1rzkSmgUTTM_7uY60VMSVkBLnXKQeHILigsCUBm9SlFeueEU0NobU1H6FHqy_d6w15NWTRBKK3NJaBKRNDtPA_h1p94zUnk8vwDefQTFu9QstxnI_k1pe9D8ZkSSdH8eiAPymeqtOFb2j-AAXmRMnD1YG1EKaz4ltRKDhPHzn1nkgNI12UIC7ErB0VXUq2FDzxcvb53mIi_rKzOoJ84SiTtMINqoCy"/>
        </div>
      </main>
    </div>
  );
};

export default ConnectWalletPage;
