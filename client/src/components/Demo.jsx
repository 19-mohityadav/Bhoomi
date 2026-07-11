import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Demo = () => {
  const [sectionRef, sectionVisible] = useScrollAnimation({ threshold: 0.1 });

  return (
    <section id="demo" className="py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-8" ref={sectionRef}>
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left Copy */}
          <div className={`lg:w-1/3 scroll-reveal-left ${sectionVisible ? 'visible' : ''}`}>
            <span className="font-label text-xs tracking-[0.25em] uppercase text-primary mb-4 block">
              Dashboard Preview
            </span>
            <h2 className="font-headline text-4xl font-bold mb-6">Manage Your Portfolio</h2>
            <p className="text-on-surface-variant mb-8 leading-relaxed">
              Experience the most intuitive land management dashboard ever created. Real-time
              valuation, transaction history, and one-click minting at your fingertips.
            </p>
            <ul className="space-y-4 mb-10">
              {[
                'Owner/Buyer specific portal roles',
                'Real-time valuation analytics',
                'Legal document IPFS storage',
              ].map((item, i) => (
                <li
                  key={item}
                  className={`flex items-center space-x-3 scroll-reveal ${sectionVisible ? 'visible' : ''}`}
                  style={{ transitionDelay: `${0.3 + i * 0.1}s` }}
                >
                  <span
                    className="material-symbols-outlined text-primary text-xl"
                    data-icon="check_circle"
                  >
                    check_circle
                  </span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <button className="px-8 py-3 bg-surface-container-high rounded-full border border-outline-variant/30 text-sm font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all duration-300 group">
              <span className="inline-flex items-center gap-2">
                Launch Dashboard
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform duration-300">
                  arrow_forward
                </span>
              </span>
            </button>
          </div>

          {/* Right Mockup */}
          <div className={`lg:w-2/3 w-full relative scroll-reveal-right ${sectionVisible ? 'visible' : ''}`} style={{ transitionDelay: '0.2s' }}>
            {/* Glassmorphic Mockup */}
            <div className="aspect-[16/10] bg-surface-container-highest rounded-lg overflow-hidden shadow-2xl relative border border-outline-variant/10 hover-lift">
              {/* Mockup Map Background */}
              <div className="absolute inset-0 opacity-40">
                <img
                  className="w-full h-full object-cover grayscale brightness-50"
                  data-alt="Dark stylized satellite map visualization of a modern city grid with glowing neon blue property outlines"
                  data-location="Singapore"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNYAd5QCAxgu8TpMT6TAQ30rUcLiPP8SKNq8FPRilehHeuTQJK8YwOO8ElJBpgyV1mL-wFBBzZZn98lW5py-OcH0P4ztAnjYDUw4RWmX1JanTfcyT7kJPGL1NZthBvgjm1TlnwQwqNv__-vKaYiBbRoBhAb3v8hIT1bIJJmYjZFQFbKhKR172sT0n5DY_Olk_0SfhpAjOUZVb3QkaMaJwxuiwjuuJWqOQBIdQHdhJeThZphjyfhMQ1YtcyMCKWnbSGvQB8C_12olvf"
                  alt="Dashboard map background"
                />
              </div>
              {/* Dashboard Overlay */}
              <div className="absolute inset-4 glass-card rounded-md flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-16 md:w-48 bg-surface-dim/80 p-4 flex flex-col border-r border-outline-variant/10">
                  <div className="flex items-center space-x-3 mb-10">
                    <div className="w-8 h-8 rounded-full bg-primary/20 animate-glow-pulse"></div>
                    <span className="hidden md:block font-bold text-xs uppercase tracking-tighter">
                      Bhoomi UI
                    </span>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 text-primary">
                      <span className="material-symbols-outlined text-xl" data-icon="dashboard">
                        dashboard
                      </span>
                      <span className="hidden md:block text-xs font-bold">Overview</span>
                    </div>
                    <div className="flex items-center space-x-3 text-on-surface-variant">
                      <span
                        className="material-symbols-outlined text-xl"
                        data-icon="account_balance_wallet"
                      >
                        account_balance_wallet
                      </span>
                      <span className="hidden md:block text-xs">Wallet</span>
                    </div>
                    <div className="flex items-center space-x-3 text-on-surface-variant">
                      <span className="material-symbols-outlined text-xl" data-icon="history">
                        history
                      </span>
                      <span className="hidden md:block text-xs">History</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <button className="w-full py-2 bg-primary text-on-primary rounded-sm text-[10px] font-bold uppercase tracking-widest hidden md:block hover:shadow-[0_0_15px_rgba(143,245,255,0.4)] transition-shadow btn-shimmer">
                      Mint NFT
                    </button>
                  </div>
                </div>
                {/* Main Content Area */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="flex justify-between items-center mb-8">
                    <h5 className="font-headline font-bold text-lg">Portfolio Assets</h5>
                    <div className="flex space-x-2">
                      <div className="px-3 py-1 bg-tertiary/10 text-tertiary text-[10px] rounded-full flex items-center animate-glow-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary mr-2"></span>
                        LIVE LEDGER
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-surface-container p-4 rounded-md border border-outline-variant/10 hover:border-primary/20 transition-colors duration-300">
                      <div className="text-[10px] text-on-surface-variant uppercase mb-2">
                        Asset ID: #LV-9832
                      </div>
                      <div className="text-sm font-bold mb-4">Metropolis Sector 7G</div>
                      <div className="flex justify-between items-end">
                        <span className="text-primary font-headline font-bold">142.5 ETH</span>
                        <span
                          className="material-symbols-outlined text-lg opacity-40"
                          data-icon="open_in_new"
                        >
                          open_in_new
                        </span>
                      </div>
                    </div>
                    <div className="bg-surface-container p-4 rounded-md border border-outline-variant/10 hover:border-primary/20 transition-colors duration-300">
                      <div className="text-[10px] text-on-surface-variant uppercase mb-2">
                        Asset ID: #LV-1104
                      </div>
                      <div className="text-sm font-bold mb-4">Azure Heights Parcel B</div>
                      <div className="flex justify-between items-end">
                        <span className="text-primary font-headline font-bold">89.0 ETH</span>
                        <span
                          className="material-symbols-outlined text-lg opacity-40"
                          data-icon="open_in_new"
                        >
                          open_in_new
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 bg-surface-container-low p-4 rounded-md border border-outline-variant/5">
                    <div className="text-[10px] text-on-surface-variant uppercase mb-4">
                      Recent Ledger Activity
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[11px] pb-2 border-b border-outline-variant/5">
                        <span>Title Transfer #901</span>
                        <span className="text-secondary">Success</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] pb-2 border-b border-outline-variant/5">
                        <span>Validation Check</span>
                        <span className="text-tertiary">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating Accents */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 blur-3xl rounded-full animate-float-slow"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary/10 blur-3xl rounded-full animate-float"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;
