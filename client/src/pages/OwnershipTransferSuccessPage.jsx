import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function OwnershipTransferSuccessPage() {
  const navigate = useNavigate();
  const [copiedHash, setCopiedHash] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText('0x92f...e76c');
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="bg-background text-on-surface selection:bg-primary/30 min-h-screen overflow-x-hidden flex flex-col font-body page-enter">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-surface/40 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        <Link to="/dashboard" className="font-display font-bold text-2xl tracking-tighter text-primary">
          Bhoomi
        </Link>
        <nav className="hidden md:flex gap-8 items-center">
          <Link to="/dashboard" className="text-on-surface-variant font-medium hover:text-primary-dim transition-colors duration-300">
            Marketplace
          </Link>
          <Link to="/dashboard" className="text-on-surface-variant font-medium hover:text-primary-dim transition-colors duration-300">
            Ledger
          </Link>
          <Link to="/dashboard" className="text-on-surface-variant font-medium hover:text-primary-dim transition-colors duration-300">
            Map
          </Link>
        </nav>
        <div className="flex items-center gap-6">
          <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
            notifications
          </span>
          <button className="bg-primary text-on-primary font-bold px-6 py-2 rounded-full active:scale-95 transition-transform hover:shadow-[0_0_20px_rgba(0,238,252,0.4)]">
            Connect Wallet
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto flex flex-col items-center flex-grow">
        {/* Success Hero Section */}
        <section className="w-full flex flex-col items-center text-center mb-16 relative">
          {/* Atmospheric Glow */}
          <div className="absolute -top-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -z-10"></div>
          {/* Verified Hexagon Visual */}
          <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
            <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center border border-primary/30 success-glow">
              <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight mb-4 text-on-surface">
            NFT Successfully Transferred
          </h1>
          <p className="text-on-surface-variant text-lg max-w-xl font-light">
            The land title has been cryptographically recorded on the Ethereal Ledger. Ownership is now permanently attributed to the new recipient.
          </p>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
          {/* Land Preview Card */}
          <div className="lg:col-span-5 group">
            <div className="bg-surface-container rounded-lg overflow-hidden transition-all duration-500 hover:translate-y-[-8px] border border-outline-variant/15">
              <div className="h-80 w-full relative">
                <img
                  alt="Land NFT Preview"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOnIutMyndAq3MDufEo1X_w29PwGOdXJ3mMM9k3AiqIH4flDylhIt2OSEI9jr1PX2jiwJSghiDvGKITd5U2PsMxFQgkpuhY8gBbiAQvAzITTcaeUiiwD4xUEe5UC1ffx7Aa6Mf7bGoZOyh2AzmuNw-HtIUJvnCG1sjiU1SpElQmIBOxYrQodQfX8fJKxdfMLeX5iARaOVp75_nH8QH56QARqodlH0iinvcy9MXP3_ZFQmSF0hNCsuyw8mFoSGhELXaqz-SuAhfI8eJ"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full font-label text-[10px] uppercase tracking-widest font-bold backdrop-blur-md">
                    Verified Title
                  </span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-on-surface mb-1">Etheria Sector-7</h3>
                    <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Digital Estate #8,421</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-display font-bold text-lg">1.42 ETH</p>
                    <p className="text-on-surface-variant text-[10px] font-label uppercase">Final Price</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-surface-container-low rounded-lg p-8 border border-outline-variant/10">
              <h4 className="font-display text-sm font-bold text-primary mb-8 uppercase tracking-[0.2em]">Transaction Registry</h4>
              <div className="space-y-6">
                {/* Ledger Entry: Previous Owner */}
                <div className="flex justify-between items-center py-4 border-b border-outline-variant/5">
                  <div>
                    <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-1">Previous Owner</p>
                    <p className="font-body font-medium text-on-surface">Vault_0x82...32a1</p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
                  <div className="text-right">
                    <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-1">New Owner</p>
                    <p className="font-body font-medium text-secondary">Registrar_0x4f...882c</p>
                  </div>
                </div>
                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-8 pt-4">
                  <div>
                    <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-2">Transaction Hash</p>
                    <div onClick={handleCopyHash} className="flex items-center gap-2 group cursor-pointer">
                      <code className="text-on-surface font-body text-sm bg-surface-container-lowest px-2 py-1 rounded">
                        0x92f...e76c
                      </code>
                      <span className="material-symbols-outlined text-sm text-primary transition-opacity">
                        {copiedHash ? 'done' : 'content_copy'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-2">Block Number</p>
                    <div className="flex items-center gap-2">
                      <p className="font-body font-bold text-on-surface">#18,492,031</p>
                      <div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(233,255,185,0.6)]"></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-2">Gas Consumed</p>
                    <p className="font-body text-on-surface">21,042 Gwei</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-2">Timestamp</p>
                    <p className="font-body text-on-surface text-sm">Oct 24, 2024 • 14:02 UTC</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold rounded-lg transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,238,252,0.3)] active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">visibility</span>
                View NFT (Dashboard)
              </button>
              <button
                onClick={() => alert('Receipt downloaded!')}
                className="flex-1 h-14 bg-transparent border border-outline-variant/30 text-on-surface font-bold rounded-lg transition-all hover:bg-surface-container-high hover:border-primary/50 flex items-center justify-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined">receipt_long</span>
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface-container-lowest border-t border-outline-variant/5">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="font-display text-primary font-bold">Bhoomi</div>
          <p className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant">
            © 2024 Bhoomi Ethereal Ledger. All Rights Reserved.
          </p>
        </div>
        <div className="flex gap-8">
          <Link
            to="/dashboard"
            className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant hover:text-tertiary-fixed transition-colors"
          >
            Smart Contracts
          </Link>
          <Link
            to="/dashboard"
            className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant hover:text-tertiary-fixed transition-colors"
          >
            Governance
          </Link>
          <Link
            to="/dashboard"
            className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant hover:text-tertiary-fixed transition-colors"
          >
            Privacy Protocol
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default OwnershipTransferSuccessPage;
