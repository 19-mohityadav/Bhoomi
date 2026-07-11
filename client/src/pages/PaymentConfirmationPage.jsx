import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function PaymentConfirmationPage() {
  const navigate = useNavigate();
  const [confirmState, setConfirmState] = useState('idle'); // 'idle' | 'processing' | 'complete'
  const [copiedSeller, setCopiedSeller] = useState(false);

  const handleCopySeller = () => {
    navigator.clipboard.writeText('0x9fE4...a83a8bd57fbe');
    setCopiedSeller(true);
    setTimeout(() => setCopiedSeller(false), 2000);
  };

  const simulateConfirmation = () => {
    if (confirmState !== 'idle') return;
    setConfirmState('processing');
    setTimeout(() => {
      setConfirmState('complete');
      // Redirect to /transfer-success after a short delay so the user sees the completed state
      setTimeout(() => {
        navigate('/transfer-success');
      }, 1000);
    }, 3000);
  };

  return (
    <div className="font-body text-on-surface min-h-screen flex flex-col overflow-x-hidden bg-background page-enter">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-surface/40 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-12">
          <Link to="/dashboard" className="font-display font-bold text-2xl tracking-tighter text-primary">
            Bhoomi
          </Link>
          <div className="hidden md:flex gap-8">
            <Link to="/dashboard" className="text-on-surface-variant font-medium hover:text-primary-dim transition-colors duration-300">
              Marketplace
            </Link>
            <Link to="/dashboard" className="text-on-surface-variant font-medium hover:text-primary-dim transition-colors duration-300">
              Ledger
            </Link>
            <Link to="/dashboard" className="text-on-surface-variant font-medium hover:text-primary-dim transition-colors duration-300">
              Map
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
            notifications
          </span>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
            account_balance_wallet
          </span>
          <button className="bg-primary-container/10 border border-primary/20 text-primary px-5 py-2 rounded-md font-display font-bold active:scale-95 transition-transform">
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* Main Content Canvas (Focused Screen Overlay) */}
      <main className="flex-grow flex items-center justify-center p-6 mt-20 relative">
        {/* Background Decorative Element */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-float-slow"></div>
          <div className="absolute -bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] animate-float"></div>
        </div>

        {/* Payment Modal/Card */}
        <div className="glass-panel w-full max-w-xl rounded-lg overflow-hidden border border-outline-variant/15 flex flex-col relative z-10 shadow-2xl">
          {/* Header Image Segment */}
          <div className="h-48 w-full relative">
            <img
              alt="Land Parcel View"
              className="w-full h-full object-cover grayscale opacity-60"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBekiQfUPBlTVLIw_LHQUUlOoKKzBXIgT3pmTbnoID6sDCkMnb0T17jzp0vqlVbYM6G-g8Tmp-edbnnzEWHi1vS03ld4_lcMsz0LQQaK6Tg2Ma1EG50EUo2Cugnm3eE08XRFObhxo-hQjA45BJ7ur-tM0BKVqQckuWDOvhIEAl3ayD25PwSUITtzHnd_DFd8Jdr7jbaIz-knCJVFFEje8TKtQ0uAg9dt3ad7HbExlJkhv3vRHaFMuEqK-G8Py__PDz6cGnjVMAQW8fR"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-8">
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container mb-1 block">
                Transaction Authorization
              </span>
              <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface">Confirm Purchase</h1>
            </div>
            <div className="absolute top-6 right-8 bg-surface-container-highest/80 backdrop-blur-md px-4 py-2 rounded-md border border-outline-variant/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary-dim text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified_user
              </span>
              <span className="font-label text-[11px] font-bold tracking-widest uppercase text-on-surface">Verified Asset</span>
            </div>
          </div>

          {/* Transaction Body */}
          <div className="p-8 space-y-8 bg-surface-container">
            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Property ID</p>
                <p className="font-display font-bold text-lg text-primary tracking-tight">#LV-91223</p>
              </div>
              <div className="space-y-1">
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Transaction Amount</p>
                <p className="font-display font-extrabold text-2xl text-on-surface tracking-tighter">4.8 ETH</p>
              </div>
            </div>

            {/* Wallet Addresses Section */}
            <div className="space-y-4">
              <div
                onClick={handleCopySeller}
                className="bg-surface-container-low p-4 rounded-md border border-outline-variant/10 group hover:border-primary/20 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Seller Address</span>
                  <span className="material-symbols-outlined text-on-surface-variant text-sm hover:text-primary">
                    {copiedSeller ? 'check' : 'content_copy'}
                  </span>
                </div>
                <p className="font-body text-xs font-medium text-on-surface truncate">0x9fE4...a83a8bd57fbe</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-md border border-outline-variant/10 group hover:border-primary/20 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Buyer (Your Wallet)</span>
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">wallet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse"></div>
                  <p className="font-body text-xs font-medium text-on-surface truncate">0x3f22...1719231d1f2a</p>
                </div>
              </div>
            </div>

            {/* Fees & Status */}
            <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/10">
              <div className="flex justify-between items-center">
                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  Estimated Gas Fee
                  <span className="material-symbols-outlined text-[14px]">info</span>
                </p>
                <p className="text-xs font-bold text-on-surface">~ 0.0042 ETH ($10.24)</p>
              </div>
              <div className="flex items-center gap-3 py-2">
                {confirmState === 'complete' ? (
                  <>
                    <span className="material-symbols-outlined text-tertiary-dim" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    <p className="text-[11px] font-medium text-tertiary-dim tracking-wide">Smart Contract Validation Confirmed</p>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-primary pulse-contract" style={{ fontVariationSettings: "'FILL' 1" }}>
                      contract
                    </span>
                    <p className="text-[11px] font-medium text-primary tracking-wide">
                      {confirmState === 'processing' ? 'Validating Contract...' : 'Smart Contract Validation Pending...'}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Final Action */}
            <div className="space-y-4 pt-4">
              {confirmState === 'idle' && (
                <button
                  onClick={simulateConfirmation}
                  className="glow-button w-full py-5 rounded-md bg-gradient-to-br from-primary to-primary-container text-on-primary font-display font-extrabold text-lg uppercase tracking-widest active:scale-95 btn-shimmer"
                >
                  Confirm Payment
                </button>
              )}

              {confirmState === 'processing' && (
                <button
                  disabled
                  className="w-full py-5 rounded-md bg-primary-container/80 text-on-primary font-display font-extrabold text-lg uppercase tracking-widest flex items-center gap-3 justify-center opacity-85 cursor-not-allowed"
                >
                  <svg className="animate-spin h-5 w-5 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  PROCESSING TRANSACTION...
                </button>
              )}

              {confirmState === 'complete' && (
                <button
                  disabled
                  className="w-full py-5 rounded-md bg-gradient-to-br from-tertiary-container to-tertiary-dim text-on-tertiary font-display font-extrabold text-lg uppercase tracking-widest flex items-center gap-2 justify-center"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  TRANSACTION COMPLETE
                </button>
              )}

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 text-on-surface-variant font-label text-[11px] uppercase tracking-[0.3em] hover:text-error transition-colors"
              >
                {confirmState === 'complete' ? 'Back to Dashboard' : 'Cancel Transaction'}
              </button>
            </div>
          </div>

          {/* Footer Compliance */}
          <div className="px-8 py-4 bg-surface-container-lowest flex justify-center items-center">
            <p className="font-label text-[9px] text-outline tracking-widest uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[12px]">security</span>
              Encrypted via Ethereal Ledger Protocol
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface-container-lowest mt-auto relative z-10">
        <div className="flex flex-col gap-2">
          <span className="font-display text-primary font-bold">Bhoomi</span>
          <p className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant">
            © 2024 Bhoomi Ethereal Ledger. All Rights Reserved.
          </p>
        </div>
        <div className="flex gap-8">
          <a
            className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant hover:text-tertiary-fixed transition-colors opacity-80 hover:opacity-100"
            href="#"
          >
            Smart Contracts
          </a>
          <a
            className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant hover:text-tertiary-fixed transition-colors opacity-80 hover:opacity-100"
            href="#"
          >
            Governance
          </a>
          <a
            className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant hover:text-tertiary-fixed transition-colors opacity-80 hover:opacity-100"
            href="#"
          >
            Privacy Protocol
          </a>
          <a
            className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant hover:text-tertiary-fixed transition-colors opacity-80 hover:opacity-100"
            href="#"
          >
            API Documentation
          </a>
        </div>
      </footer>
    </div>
  );
}

export default PaymentConfirmationPage;
