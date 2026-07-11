import React, { useState } from 'react';

const LandRegistrationPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const handleFocus = (name) => setFocusedInput(name);
  const handleBlur = () => setFocusedInput(null);

  return (
    <div className="text-on-surface selection:bg-primary/30 selection:text-primary min-h-screen mesh-bg overflow-x-hidden page-enter">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/40 backdrop-blur-xl flex justify-between items-center px-8 h-20 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-headline font-bold tracking-tighter text-primary">Bhoomi</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 font-display tracking-wide">
          <a className="text-on-surface-variant hover:text-primary-container transition-colors duration-300" href="#">Dashboard</a>
          <a className="text-primary border-b-2 border-primary pb-1" href="#">Registry</a>
          <a className="text-on-surface-variant hover:text-primary-container transition-colors duration-300" href="#">Map Explorer</a>
          <a className="text-on-surface-variant hover:text-primary-container transition-colors duration-300" href="#">Ledger</a>
        </nav>
        <div className="flex items-center gap-6">
          <div className="flex gap-4">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary active:scale-95 transition-all" data-icon="account_balance_wallet">account_balance_wallet</button>
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary active:scale-95 transition-all" data-icon="notifications">notifications</button>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30">
            <img alt="User Architect Profile" className="w-full h-full object-cover" data-alt="A professional close-up avatar of a modern digital architect, wearing sleek futuristic glasses with a subtle blue neon reflection. The lighting is moody and cinematic with deep shadows and soft cyan rim lighting against a dark navy background. The style is hyper-realistic and polished, matching a high-end luxury tech interface." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdz6z4LmoX25_P4uh1PTay4148rS4U9WNcADcm1ZvsMwAXFcC2YSej5AiOvSlt9DKu9q8LN3ppa-R6UlK8upLeBMGEUGeulLXN4jfOY2_mx8C0Uce0r4DPRqEXc392bKgfvful2AAQduSDB-kgUn3H0Kbf-MDdA9atW4HtsLiL7KLW8Sy-V1CiINPYxuMOnKEFk4W7cfFN0BoiCHZ5DPQKkkiQmU2zus142qSMYhm73IvzAqaPlUnRplRXNywfEV3SshVIFYX-uqLS"/>
          </div>
        </div>
      </header>
      
      <div className="flex pt-20">
        {/* SideNavBar */}
        <aside className="hidden lg:flex flex-col py-8 px-4 gap-6 h-screen w-72 bg-surface-container-low flex-shrink-0 sticky top-20">
          <div className="px-4 mb-4">
            <h2 className="font-headline text-primary-container text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              The Ledger
            </h2>
            <p className="font-body text-sm font-medium text-on-surface-variant opacity-70">Syncing Live...</p>
          </div>
          <div className="flex flex-col gap-1">
            <a className="text-primary font-bold border-r-4 border-primary bg-surface-container-high/50 flex items-center gap-3 py-3 px-4 rounded-l-lg hover:bg-surface-container-highest/30 transition-all duration-200" href="#">
              <span className="material-symbols-outlined" data-icon="edit_document">edit_document</span>
              <span className="font-body text-sm font-medium">Registration</span>
            </a>
            <a className="text-on-surface-variant flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-surface-container-highest/30 hover:text-on-surface transition-all duration-200" href="#">
              <span className="material-symbols-outlined" data-icon="map">map</span>
              <span className="font-body text-sm font-medium">Geospatial</span>
            </a>
            <a className="text-on-surface-variant flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-surface-container-highest/30 hover:text-on-surface transition-all duration-200" href="#">
              <span className="material-symbols-outlined" data-icon="gavel">gavel</span>
              <span className="font-body text-sm font-medium">Smart Contracts</span>
            </a>
            <a className="text-on-surface-variant flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-surface-container-highest/30 hover:text-on-surface transition-all duration-200" href="#">
              <span className="material-symbols-outlined" data-icon="inventory_2">inventory_2</span>
              <span className="font-body text-sm font-medium">Archives</span>
            </a>
          </div>
          <div className="mt-8 mb-4 px-4">
            <button className="w-full py-3 px-4 bg-secondary text-on-secondary rounded-lg font-bold text-sm hover:brightness-110 active:scale-95 transition-all">
              Register New Land
            </button>
          </div>
          <div className="mt-auto flex flex-col gap-1 px-4 border-t border-outline-variant/10 pt-6">
            <a className="text-on-surface-variant flex items-center gap-3 py-2 hover:text-on-surface transition-colors" href="#">
              <span className="material-symbols-outlined text-xl" data-icon="settings">settings</span>
              <span className="text-xs font-label uppercase tracking-widest">Settings</span>
            </a>
            <a className="text-on-surface-variant flex items-center gap-3 py-2 hover:text-on-surface transition-colors" href="#">
              <span className="material-symbols-outlined text-xl" data-icon="help_center">help_center</span>
              <span className="text-xs font-label uppercase tracking-widest">Support</span>
            </a>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <main className="flex-grow p-8 md:p-12 lg:p-16 relative overflow-hidden">
          <div className="absolute inset-0 dot-grid -z-10"></div>
          <div className="max-w-5xl mx-auto">
            <header className="mb-12 relative">
              <h1 className="text-5xl md:text-6xl font-headline font-bold text-on-surface tracking-tighter mb-4">
                Secure Your <span className="text-primary italic">Digital Frontier</span>
              </h1>
              <p className="text-on-surface-variant text-lg max-w-2xl font-body leading-relaxed">
                Initiate the immutable registration of your land assets on the decentralized ledger. Complete the architectural specifications below to mint your property deed.
              </p>
            </header>

            {/* Registration Form Card */}
            <div className="bg-surface-variant/40 glass-effect rounded-lg p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-outline-variant/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10 rounded-full"></div>
              <form className="space-y-12" onSubmit={handleSubmit}>
                
                {/* Technical Specifications Section */}
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined" data-icon="architecture">architecture</span>
                    </div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">Technical Specifications</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={`space-y-2 ${focusedInput === 'survey' ? 'scale-[1.01]' : ''}`} style={{ transition: 'all 0.3s ease' }}>
                      <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Survey Number</label>
                      <input 
                        className="w-full bg-surface-container-lowest border-none rounded-md p-4 text-on-surface focus:ring-1 focus:ring-primary-dim shadow-inner" 
                        placeholder="e.g. SN-402-9X" 
                        type="text"
                        onFocus={() => handleFocus('survey')}
                        onBlur={handleBlur}
                      />
                    </div>
                    <div className={`space-y-2 ${focusedInput === 'plot' ? 'scale-[1.01]' : ''}`} style={{ transition: 'all 0.3s ease' }}>
                      <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Plot Number</label>
                      <input 
                        className="w-full bg-surface-container-lowest border-none rounded-md p-4 text-on-surface focus:ring-1 focus:ring-primary-dim shadow-inner" 
                        placeholder="e.g. PL-881" 
                        type="text"
                        onFocus={() => handleFocus('plot')}
                        onBlur={handleBlur}
                      />
                    </div>
                    <div className={`md:col-span-2 space-y-2 ${focusedInput === 'area' ? 'scale-[1.01]' : ''}`} style={{ transition: 'all 0.3s ease' }}>
                      <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Land Area</label>
                      <div className="flex gap-0 rounded-md overflow-hidden bg-surface-container-lowest focus-within:ring-1 focus-within:ring-primary-dim transition-all">
                        <input 
                          className="flex-grow bg-transparent border-none p-4 text-on-surface" 
                          placeholder="Enter total area" 
                          type="number"
                          onFocus={() => handleFocus('area')}
                          onBlur={handleBlur}
                        />
                        <select 
                          className="bg-surface-container-high border-none text-on-surface px-6 font-display font-medium focus:ring-0"
                          onFocus={() => handleFocus('area')}
                          onBlur={handleBlur}
                        >
                          <option>SQ. FT</option>
                          <option>ACRES</option>
                          <option>HECTARES</option>
                          <option>SQ. METERS</option>
                        </select>
                      </div>
                    </div>
                    <div className={`md:col-span-2 space-y-2 ${focusedInput === 'address' ? 'scale-[1.01]' : ''}`} style={{ transition: 'all 0.3s ease' }}>
                      <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Land Address</label>
                      <textarea 
                        className="w-full bg-surface-container-lowest border-none rounded-md p-4 text-on-surface focus:ring-1 focus:ring-primary-dim shadow-inner resize-none" 
                        placeholder="Enter complete physical address and legal landmarks..." 
                        rows="4"
                        onFocus={() => handleFocus('address')}
                        onBlur={handleBlur}
                      ></textarea>
                    </div>
                  </div>
                </section>

                {/* Geospatial Selection */}
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined" data-icon="location_on">location_on</span>
                    </div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">Geospatial Mapping</h3>
                  </div>
                  <button className="group relative w-full h-48 rounded-lg overflow-hidden border border-outline-variant/20 hover:border-primary/50 transition-all duration-500" type="button">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all z-10 flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-primary mb-2 animate-bounce" data-icon="place">place</span>
                      <span className="font-display font-bold text-lg text-white">Select Location on Map</span>
                      <span className="text-xs font-label text-on-surface-variant uppercase tracking-tighter mt-1 opacity-80">Syncing GPS Coordinates</span>
                    </div>
                    <img alt="Map View" className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" data-alt="A dark, sophisticated satellite topographic map of a modern urban land plot. The map features elegant cyan neon boundary lines and glowing GPS coordinate markers. The aesthetic is clean and futuristic, using a deep midnight blue and grey color scheme with subtle glowing elements that emphasize digital precision and geospatial accuracy." data-location="Satellite Topographic Map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdKOlwEZklPHLlh550iXhh_LD10GEWNgvLFKlPQD2kUx0tm39TO_pT3Tr1kw4VIrUas4cgLwldQHGG1bxC0a8samzFMcItBPR0v3IqKfcbsGACzK1heRjr3qSR6o49I4Psc6OHw_I1rzf6OQBHUlwczpbDr5XFDi1pSLVQu-aAXBTSBWjNzdF55EySuRx9QGy0WrGSYe1kerqWTT0qhHyfC8AD6dQTVLW-CdZscr5Kcye6mALV_e4gtCMNT9tzF41aLidgEwaXcXuJ"/>
                  </button>
                </section>

                {/* Document Verification */}
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                      <span className="material-symbols-outlined" data-icon="verified_user">verified_user</span>
                    </div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">Upload Legal Documents</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Title Deed Upload */}
                    <div className="group cursor-pointer">
                      <div className="h-40 bg-surface-container-low rounded-md border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center p-6 text-center group-hover:border-primary group-hover:bg-surface-container-high transition-all duration-300">
                        <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-primary mb-3" data-icon="upload_file">upload_file</span>
                        <p className="font-display font-medium text-on-surface">Title Deed</p>
                        <p className="text-xs font-label text-on-surface-variant mt-1">PDF, JPG up to 10MB</p>
                      </div>
                    </div>
                    {/* Ownership Proof Upload */}
                    <div className="group cursor-pointer">
                      <div className="h-40 bg-surface-container-low rounded-md border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center p-6 text-center group-hover:border-secondary group-hover:bg-surface-container-high transition-all duration-300">
                        <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-secondary mb-3" data-icon="description">description</span>
                        <p className="font-display font-medium text-on-surface">Ownership Proof</p>
                        <p className="text-xs font-label text-on-surface-variant mt-1">Certified Notary Docs</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Final CTA */}
                <div className="pt-8 border-t border-outline-variant/10">
                  <button 
                    className={`w-full font-headline font-bold text-xl py-6 rounded-lg cyan-glow transition-all active:scale-[0.98] flex items-center justify-center gap-4 group ${
                      isSubmitted 
                        ? 'bg-gradient-to-r from-tertiary to-tertiary-fixed text-on-tertiary-container'
                        : 'bg-gradient-to-r from-primary to-primary-container text-on-primary-container'
                    }`}
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin" data-icon="sync">sync</span> Processing...
                      </>
                    ) : isSubmitted ? (
                      <>
                        <span className="material-symbols-outlined" data-icon="check_circle">check_circle</span> Request Sent
                      </>
                    ) : (
                      <>
                        Submit Land Request
                        <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform" data-icon="arrow_forward">arrow_forward</span>
                      </>
                    )}
                  </button>
                  <p className="text-center mt-6 text-xs font-label text-on-surface-variant/60 tracking-widest uppercase">
                    Verified by Ethereum Mainnet & IPFS Storage
                  </p>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
      
      {/* BottomNavBar */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-surface-variant/40 backdrop-blur-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.3)] rounded-t-lg">
        <a className="flex flex-col items-center justify-center text-on-surface-variant p-2 active:scale-90 transition-all hover:text-primary" href="#">
          <span className="material-symbols-outlined" data-icon="home">home</span>
          <span className="text-[10px] font-label tracking-widest uppercase mt-1">Home</span>
        </a>
        <a className="flex flex-col items-center justify-center bg-primary-container/20 text-primary rounded-xl p-2 active:scale-90 transition-all" href="#">
          <span className="material-symbols-outlined" data-icon="add_box" style={{ fontVariationSettings: "'FILL' 1" }}>add_box</span>
          <span className="text-[10px] font-label tracking-widest uppercase mt-1">Register</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant p-2 active:scale-90 transition-all hover:text-primary" href="#">
          <span className="material-symbols-outlined" data-icon="location_on">location_on</span>
          <span className="text-[10px] font-label tracking-widest uppercase mt-1">Map</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant p-2 active:scale-90 transition-all hover:text-primary" href="#">
          <span className="material-symbols-outlined" data-icon="person">person</span>
          <span className="text-[10px] font-label tracking-widest uppercase mt-1">Profile</span>
        </a>
      </nav>
    </div>
  );
};

export default LandRegistrationPage;
