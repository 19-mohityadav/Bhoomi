import React, { useState, useEffect } from 'react';

const MapExplorerPage = () => {
  const [coords, setCoords] = useState({ lat: 35.6895, long: 139.6917 });

  useEffect(() => {
    const interval = setInterval(() => {
      const baseLat = 35.6895;
      const baseLong = 139.6917;
      const driftLat = (Math.random() - 0.5) * 0.001;
      const driftLong = (Math.random() - 0.5) * 0.001;
      
      setCoords({
        lat: baseLat + driftLat,
        long: baseLong + driftLong
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 overflow-hidden h-screen page-enter">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/40 backdrop-blur-xl flex justify-between items-center px-8 h-20 w-full shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-headline font-bold tracking-tighter text-primary">Bhoomi</span>
          <div className="hidden md:flex gap-6 items-center">
            <a className="text-on-surface-variant hover:text-primary-container transition-colors duration-300 font-display tracking-wide active:scale-95 transition-transform" href="#">Dashboard</a>
            <a className="text-on-surface-variant hover:text-primary-container transition-colors duration-300 font-display tracking-wide active:scale-95 transition-transform" href="#">Registry</a>
            <a className="text-primary border-b-2 border-primary pb-1 font-display tracking-wide active:scale-95 transition-transform" href="#">Map Explorer</a>
            <a className="text-on-surface-variant hover:text-primary-container transition-colors duration-300 font-display tracking-wide active:scale-95 transition-transform" href="#">Ledger</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">account_balance_wallet</button>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">notifications</button>
          <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/20">
            <img alt="User Architect Profile" data-alt="A professional close-up portrait of a digital architect in a high-tech studio. The person has a focused expression, wearing sleek modern glasses. Background features blurred glowing holographic interfaces with cyan and deep navy lighting. The overall style is premium, cinematic, and corporate-futuristic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRd3RNWaiEOWDvpOFmpxVp0F_lubj1p_I18Vc3VeuxWBSWkA2X9_Syvb6MoTTYTgMWpF6NyMxO4Efs8znwIsacD-HH9j6NvamgzXhglmseyhGU35k5SmscuRiqx-0H3loGN5mcjb7GUIevUdMupFb9IAQaKc4vZc49wQ7sEjj3t6LSEmng3pEsYbP1N_EtiR3sgGqstsoIr_YWjHIkoe6asSbK_ijdAryq8zf1qabIhSicaK3oBe2Aj1deDaOtLTfvs28Jt2GxHpH3"/>
          </div>
        </div>
      </nav>
      {/* SideNav (Large Screens Only) */}
      <aside className="hidden lg:flex fixed left-0 top-20 h-[calc(100vh-5rem)] w-72 flex-col py-8 px-4 gap-6 bg-surface-container-low z-40">
        <div className="px-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-tertiary pulse-tertiary"></div>
            <div>
              <h3 className="font-headline text-primary-container font-bold leading-none">The Ledger</h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Syncing Live...</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button className="flex items-center gap-4 px-4 py-3 rounded-md text-on-surface-variant hover:bg-surface-container-highest/30 hover:text-on-surface transition-all duration-200 ease-in-out font-medium text-sm">
            <span className="material-symbols-outlined">edit_document</span> Registration
          </button>
          <button className="flex items-center gap-4 px-4 py-3 rounded-l-lg text-primary font-bold border-r-4 border-primary bg-surface-container-high/50 transition-all duration-200 ease-in-out font-medium text-sm">
            <span className="material-symbols-outlined">map</span> Geospatial
          </button>
          <button className="flex items-center gap-4 px-4 py-3 rounded-md text-on-surface-variant hover:bg-surface-container-highest/30 hover:text-on-surface transition-all duration-200 ease-in-out font-medium text-sm">
            <span className="material-symbols-outlined">gavel</span> Smart Contracts
          </button>
          <button className="flex items-center gap-4 px-4 py-3 rounded-md text-on-surface-variant hover:bg-surface-container-highest/30 hover:text-on-surface transition-all duration-200 ease-in-out font-medium text-sm">
            <span className="material-symbols-outlined">inventory_2</span> Archives
          </button>
        </div>
        <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant/10 pt-6">
          <button className="flex items-center gap-4 px-4 py-3 rounded-md text-on-surface-variant hover:bg-surface-container-highest/30 transition-all text-sm">
            <span className="material-symbols-outlined">settings</span> Settings
          </button>
          <button className="flex items-center gap-4 px-4 py-3 rounded-md text-on-surface-variant hover:bg-surface-container-highest/30 transition-all text-sm">
            <span className="material-symbols-outlined">help_center</span> Support
          </button>
        </div>
      </aside>
      {/* Main Content Area: Map Interface */}
      <main className="relative lg:ml-72 pt-20 h-screen overflow-hidden">
        {/* Full Bleed Map Layer */}
        <div className="absolute inset-0 bg-surface z-0 overflow-hidden">
          <div className="absolute inset-0 map-grid-overlay opacity-30"></div>
          <img className="w-full h-full object-cover grayscale opacity-40 mix-blend-screen" data-alt="A sophisticated dark-mode satellite map view of a major city at night. The imagery is desaturated with deep blacks and subtle navy tones. Bright neon cyan lines trace the grid of the city streets and property boundaries, creating a futuristic architectural plan aesthetic. Minimalist topographic contours are visible in the terrain." data-location="Tokyo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLDARc_YRm7FGQ7DiRE_eK5ujVpav8AKAHpZQtSrWs3stFa-ETI_5yZE65JTpIwCSYod3sqqjQIN3JFVeLY585ETUaKvgVLDF7ZIpo0NS9S4r1SnoP_dbVNcKwkoBpKKREWfOqSb2nB1vYomFQhlU0aEgJeZHhkxplEH_vBwSeYWWj3U3nxqBy3gbznsPfXnSbVTR_3pjEVHtY9B3VlvjT34CdJj2OG55xsxn1mJeq6oppBQsJqrLdd-UYAgvVnRUW7yGQHV7-Zt6V"/>
        </div>
        {/* Overlaid Search Bar */}
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4">
          <div className="bg-surface-container-lowest glass-panel rounded-full flex items-center px-6 py-3 shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary-dim mr-3">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-on-surface w-full placeholder:text-on-surface-variant/50 font-body outline-none" placeholder="Search coordinates, parcel IDs, or architects..." type="text"/>
            <div className="h-6 w-px bg-outline-variant/30 mx-3"></div>
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">filter_list</button>
          </div>
        </div>
        {/* Floating Toolset: Pin Property Boundary */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
          <div className="flex flex-col bg-surface-container-high/80 glass-panel p-2 rounded-xl border border-outline-variant/20 shadow-xl">
            <button className="p-3 mb-1 rounded-lg text-primary bg-primary-container/20 active:scale-95 transition-all" title="Select Pointer">
              <span className="material-symbols-outlined">near_me</span>
            </button>
            <button className="p-3 mb-1 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-all" title="Add Pin">
              <span className="material-symbols-outlined">location_on</span>
            </button>
            <button className="p-3 mb-1 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-all" title="Draw Boundary">
              <span className="material-symbols-outlined">polyline</span>
            </button>
            <button className="p-3 mb-1 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-all" title="Polygon Area">
              <span className="material-symbols-outlined">pentagon</span>
            </button>
            <div className="h-px bg-outline-variant/20 my-2 mx-2"></div>
            <button className="p-3 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-all" title="Measure Distance">
              <span className="material-symbols-outlined">straighten</span>
            </button>
          </div>
          <div className="bg-surface-container-high/80 glass-panel p-2 rounded-xl border border-outline-variant/20 shadow-xl">
            <button className="p-3 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-all" title="Layers">
              <span className="material-symbols-outlined">layers</span>
            </button>
          </div>
        </div>
        {/* Real-time Info Panel */}
        <div className="absolute right-8 bottom-32 z-20 w-80">
          <div className="bg-surface-container-high/90 glass-panel rounded-lg p-6 border border-outline-variant/10 shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-headline text-lg font-bold text-on-surface tracking-tight">Parcel Metadata</h4>
                <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Active Selection</p>
              </div>
              <span className="material-symbols-outlined text-primary text-sm">sensors</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest/40 p-3 rounded-md">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter mb-1 font-label">Latitude</p>
                <p className="font-headline text-primary font-medium tracking-tight text-sm">{coords.lat.toFixed(4)}° N</p>
              </div>
              <div className="bg-surface-container-lowest/40 p-3 rounded-md">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter mb-1 font-label">Longitude</p>
                <p className="font-headline text-primary font-medium tracking-tight text-sm">{coords.long.toFixed(4)}° E</p>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Estimated Area</span>
                <span className="text-on-surface font-medium">4,250 m²</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Blockchain ID</span>
                <span className="text-primary font-mono truncate ml-4">0x4a...e9b2</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Status</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[9px] font-bold uppercase">Unclaimed</span>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-3 px-6 rounded-md shadow-[0_0_20px_rgba(143,245,255,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 btn-shimmer">
              <span className="material-symbols-outlined text-xl">save</span>
              Save Location
            </button>
          </div>
        </div>
        {/* Map Navigation Controls */}
        <div className="absolute right-8 top-8 z-20 flex flex-col gap-2">
          <div className="bg-surface-container-high/80 glass-panel rounded-lg border border-outline-variant/20 flex flex-col overflow-hidden">
            <button className="p-3 text-on-surface-variant hover:bg-primary/20 hover:text-primary transition-all">
              <span className="material-symbols-outlined">add</span>
            </button>
            <div className="h-px bg-outline-variant/20"></div>
            <button className="p-3 text-on-surface-variant hover:bg-primary/20 hover:text-primary transition-all">
              <span className="material-symbols-outlined">remove</span>
            </button>
          </div>
          <button className="bg-surface-container-high/80 glass-panel p-3 rounded-lg border border-outline-variant/20 text-on-surface-variant hover:text-primary transition-all">
            <span className="material-symbols-outlined">explore</span>
          </button>
        </div>
        {/* Custom Map Overlay Graphics (Simulated holographic elements) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Simulated Boundary */}
          <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px]" viewBox="0 0 400 300">
            <path d="M50 50 L350 70 L380 250 L80 280 Z" fill="rgba(143, 245, 255, 0.1)" stroke="#8ff5ff" strokeDasharray="8 4" strokeWidth="2"></path>
            <circle cx="50" cy="50" fill="#8ff5ff" r="5"></circle>
            <circle cx="350" cy="70" fill="#8ff5ff" r="5"></circle>
            <circle cx="380" cy="250" fill="#8ff5ff" r="5"></circle>
            <circle cx="80" cy="280" fill="#8ff5ff" r="5"></circle>
          </svg>
          {/* Animated Scanline */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/20 shadow-[0_0_15px_rgba(143,245,255,0.5)] animate-[scan_8s_linear_infinite]"></div>
        </div>
      </main>
      {/* BottomNavBar (Mobile Only) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-surface-variant/40 backdrop-blur-2xl rounded-t-lg shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:text-primary transition-all active:scale-90">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-label tracking-widest uppercase mt-1">Home</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:text-primary transition-all active:scale-90">
          <span className="material-symbols-outlined">add_box</span>
          <span className="text-[10px] font-label tracking-widest uppercase mt-1">Register</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-primary-container/20 text-primary rounded-xl p-2 active:scale-90 transition-all">
          <span className="material-symbols-outlined">location_on</span>
          <span className="text-[10px] font-label tracking-widest uppercase mt-1">Map</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:text-primary transition-all active:scale-90">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-label tracking-widest uppercase mt-1">Profile</span>
        </div>
      </nav>
    </div>
  );
};

export default MapExplorerPage;
