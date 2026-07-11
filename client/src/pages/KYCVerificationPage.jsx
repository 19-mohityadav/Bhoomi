import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const KYCVerificationPage = () => {
  const navigate = useNavigate();
  const [idFrontFile, setIdFrontFile] = useState(null);
  const [idBackFile, setIdBackFile] = useState(null);
  const [addressFile, setAddressFile] = useState(null);
  const [addressDocNumber, setAddressDocNumber] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);

    // Atmospheric parallax on scroll
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const glassPanels = document.querySelectorAll('.glass-panel-kyc');
      glassPanels.forEach(panel => {
        const speed = 0.04;
        panel.style.transform = `translateY(${scrolled * speed}px)`;
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleOpenCamera = async () => {
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setCameraOpen(false);
    }
  };

  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 2200);
  };

  const FileUploadSlot = ({ id, label, sublabel, file, onFileChange }) => (
    <div
      className={`group relative rounded-md border-2 border-dashed transition-all p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px]
        ${file
          ? 'border-primary/60 bg-primary/5'
          : 'border-outline-variant/30 hover:border-primary/50 bg-surface-container-lowest'
        }`}
    >
      <input
        id={id}
        type="file"
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        onChange={e => onFileChange(e.target.files[0] || null)}
      />
      {file ? (
        <>
          <span className="material-symbols-outlined text-4xl text-primary mb-4">check_circle</span>
          <span className="text-sm font-medium text-primary break-all px-2">{file.name}</span>
          <span className="text-xs text-on-surface-variant mt-1">Click to replace</span>
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4 group-hover:text-primary transition-colors">
            add_photo_alternate
          </span>
          <span className="text-sm font-medium text-on-surface">{label}</span>
          <span className="text-xs text-on-surface-variant mt-1">{sublabel}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen custom-scrollbar selection:bg-primary/30 page-enter">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-surface-variant/40 backdrop-blur-xl shadow-2xl shadow-primary/5 flex justify-between items-center px-8 py-4">
        <Link to="/" className="font-headline text-2xl font-bold tracking-tighter text-primary">
          Bhoomi
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="font-headline tracking-wide uppercase text-sm text-on-surface-variant hover:text-on-surface transition-colors">Explore</Link>
          <a href="#how" className="font-headline tracking-wide uppercase text-sm text-on-surface-variant hover:text-on-surface transition-colors">How It Works</a>
          <a href="#features" className="font-headline tracking-wide uppercase text-sm text-on-surface-variant hover:text-on-surface transition-colors">Features</a>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/connect-wallet"
            className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-md font-headline text-sm tracking-wide uppercase hover:bg-primary/20 transition-all active:scale-95 duration-200"
          >
            <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
            Connect Wallet
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

        {/* Header Section */}
        <header className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-on-surface mb-4">
                KYC Verification
              </h1>
              <p className="text-on-surface-variant max-w-xl text-lg">
                Complete your identity verification to unlock full access to the Bhoomi ledger and secure your digital assets.
              </p>
            </div>

            {/* Status Display */}
            <div className="glass-panel p-6 rounded-lg border border-outline-variant/15 flex items-center gap-6">
              <div className="flex flex-col">
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-1">Current Status</span>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(233,255,185,0.5)] ${submitted ? 'bg-primary' : 'bg-tertiary'}`}></span>
                  <span className={`font-headline font-bold text-xl ${submitted ? 'text-primary' : 'text-tertiary'}`}>
                    {submitted ? 'Submitted' : 'Pending Verification'}
                  </span>
                </div>
              </div>
              <div className="h-10 w-[1px] bg-outline-variant/20"></div>
              <div className={`flex flex-col ${!submitted && 'opacity-40'}`}>
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-1">Verified On</span>
                <span className="font-headline font-medium text-on-surface-variant">
                  {submitted ? new Date().toLocaleDateString('en-IN') : '-- / -- / --'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Bento Grid */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-8">

              {/* Identity Proof */}
              <section className="glass-panel-kyc glass-panel p-8 rounded-lg border border-outline-variant/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-md bg-primary-container/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">badge</span>
                  </div>
                  <div>
                    <h2 className="font-headline text-2xl font-semibold">Upload Identity Proof</h2>
                    <p className="text-sm text-on-surface-variant">Submit your government-issued ID card (Aadhaar or PAN).</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUploadSlot
                    id="id-front"
                    label="Upload ID Front"
                    sublabel="PNG, JPG or PDF up to 5MB"
                    file={idFrontFile}
                    onFileChange={setIdFrontFile}
                  />
                  <FileUploadSlot
                    id="id-back"
                    label="Upload ID Back"
                    sublabel="Required for Aadhaar"
                    file={idBackFile}
                    onFileChange={setIdBackFile}
                  />
                </div>
              </section>

              {/* Address Proof */}
              <section className="glass-panel-kyc glass-panel p-8 rounded-lg border border-outline-variant/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-md bg-secondary-container/20 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div>
                    <h2 className="font-headline text-2xl font-semibold">Address Proof</h2>
                    <p className="text-sm text-on-surface-variant">Electricity bill, Bank Statement, or Passport.</p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-md p-2 flex flex-col md:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Document Number (Optional)"
                    value={addressDocNumber}
                    onChange={e => setAddressDocNumber(e.target.value)}
                    className="flex-grow bg-transparent border-none focus:ring-0 text-on-surface px-4 py-3 font-body outline-none"
                  />
                  <div className={`relative rounded-md px-6 py-3 flex items-center justify-center gap-2 cursor-pointer transition-colors
                    ${addressFile ? 'bg-primary/10 text-primary' : 'bg-surface-container-high hover:bg-surface-container-highest'}`}
                  >
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={e => setAddressFile(e.target.files[0] || null)}
                    />
                    <span className="material-symbols-outlined text-sm">{addressFile ? 'check' : 'upload'}</span>
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {addressFile ? addressFile.name.slice(0, 14) + '…' : 'Choose File'}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">info</span>
                  Document must be less than 3 months old
                </p>
              </section>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-8">

              {/* Selfie Photo */}
              <section className="glass-panel-kyc glass-panel p-8 rounded-lg border border-outline-variant/5 h-auto">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-md bg-tertiary-container/20 flex items-center justify-center text-tertiary mb-6">
                    <span className="material-symbols-outlined">face</span>
                  </div>
                  <h2 className="font-headline text-2xl font-semibold mb-2">Selfie Photo</h2>
                  <p className="text-sm text-on-surface-variant mb-8">Look straight into the camera for a live facial scan.</p>

                  {/* Camera / Image Area */}
                  <div className="w-full aspect-square max-w-[280px] rounded-full border-4 border-outline-variant/10 relative flex items-center justify-center overflow-hidden bg-surface-container-lowest group">
                    {cameraOpen ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB54TF-l3xHAytBT4eKgF1Z9iBNpN9yhS1E071_N-h_Mecw5Kj0LvKSLnX2KvPqiuGqRjDwENjiTld7vY4_rlEz7z1wjgxOke-AcGk2o0RveEprNVJIz42jSGoIGVcIHnZYQjx574ok6iGQFmG6Rfj5qdU4miajkwhZ-gWz-qkezCzmj9RxoMgFE0aA1HbBobWLYyIaGlBykBLHqJ736ttDh4Lu1UWAnyDdMfQof9sNID7-h9EJGLwYxOaiiv_bsQv1j0JuCMx188Jh"
                        alt="Selfie Placeholder"
                        className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    )}
                    <div className="absolute inset-0 bg-primary/10 mix-blend-overlay pointer-events-none"></div>
                    <div className="absolute inset-0 border-[1px] border-primary/20 rounded-full animate-pulse pointer-events-none"></div>

                    {!cameraOpen ? (
                      <button
                        type="button"
                        onClick={handleOpenCamera}
                        className="absolute bottom-6 bg-primary text-on-primary-container px-6 py-2 rounded-full font-headline text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/20 active:scale-95 transition-transform"
                      >
                        <span className="material-symbols-outlined text-sm">photo_camera</span>
                        Open Camera
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCloseCamera}
                        className="absolute bottom-6 bg-error text-on-error px-6 py-2 rounded-full font-headline text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-error/20 active:scale-95 transition-transform"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                        Close
                      </button>
                    )}
                  </div>

                  <ul className="mt-8 text-left space-y-3 w-full">
                    <li className="flex items-start gap-3 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                      Good lighting and clear face
                    </li>
                    <li className="flex items-start gap-3 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                      No glasses or hats
                    </li>
                  </ul>
                </div>
              </section>

              {/* Submit Card */}
              <div className="bg-surface-container-high p-8 rounded-lg border border-primary/10 shadow-2xl shadow-black/40">
                <h3 className="font-headline text-xl font-bold mb-4">Final Submission</h3>
                <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                  By clicking submit, you confirm that the information provided is accurate and belongs to you.
                </p>
                <div className="flex items-center gap-3 mb-8 bg-surface-container-low p-4 rounded-md">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className="rounded border-outline-variant bg-transparent text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-on-surface-variant leading-tight cursor-pointer">
                    I agree to the Bhoomi Privacy Policy and Smart Contract Terms.
                  </label>
                </div>

                {submitted ? (
                  <div className="w-full bg-primary/10 border border-primary/30 text-primary py-4 rounded-md font-headline font-bold uppercase tracking-widest flex items-center justify-center gap-3 text-sm">
                    <span className="material-symbols-outlined">verified</span>
                    KYC Submitted!
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={!agreed || isSubmitting}
                    className={`w-full py-4 rounded-md font-headline font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98]
                      ${agreed
                        ? 'bg-gradient-to-r from-primary to-primary-container text-on-primary-container hover:shadow-[0_0_30px_rgba(0,238,252,0.3)] cursor-pointer btn-shimmer'
                        : 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit KYC
                        <span className="material-symbols-outlined">send</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Verification Status Examples */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
          <div className="glass-panel p-6 rounded-md border-l-4 border-tertiary">
            <span className="font-label text-[10px] uppercase text-on-surface-variant block mb-2">Example: Pending State</span>
            <p className="text-sm">Your documents are currently being processed by our decentralized validators.</p>
          </div>
          <div className="glass-panel p-6 rounded-md border-l-4 border-primary">
            <span className="font-label text-[10px] uppercase text-on-surface-variant block mb-2">Example: Approved State</span>
            <p className="text-sm">Success! Your account is now fully verified for on-chain land purchases.</p>
          </div>
          <div className="glass-panel p-6 rounded-md border-l-4 border-error">
            <span className="font-label text-[10px] uppercase text-on-surface-variant block mb-2">Example: Rejected State</span>
            <p className="text-sm">Verification failed. The uploaded document was blurry or expired.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-surface-container-lowest flex flex-col md:flex-row justify-between items-center px-12 border-t border-outline-variant/15">
        <div className="mb-6 md:mb-0">
          <span className="font-headline text-lg text-on-surface block mb-2">Bhoomi Ledger</span>
          <span className="font-body text-xs text-on-surface-variant">© 2024 Bhoomi Ledger. All Rights Reserved.</span>
        </div>
        <div className="flex gap-8">
          <a href="#" className="font-body text-xs text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100">Privacy Policy</a>
          <a href="#" className="font-body text-xs text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100">Terms of Service</a>
          <a href="#" className="font-body text-xs text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100">Smart Contracts</a>
        </div>
      </footer>
    </div>
  );
};

export default KYCVerificationPage;
