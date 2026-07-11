import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// ─────────────────────────────────────────────
// Mock IPFS upload – replace with real Pinata /
// web3.storage call when ready
// ─────────────────────────────────────────────
const uploadToIPFS = (file) =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve(`ipfs://Qm${Math.random().toString(36).slice(2).toUpperCase()}${file.name.replace(/\W/g, '')}`);
    }, 900)
  );

// ─── Step indicator ──────────────────────────
const steps = ['Account', 'Documents', 'Selfie'];

const StepBar = ({ current }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {steps.map((s, i) => (
      <div key={s} className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
          ${i < current ? 'bg-primary text-on-primary-container' : i === current ? 'bg-primary/20 text-primary border border-primary' : 'bg-surface-container text-on-surface-variant'}`}>
          {i < current ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
        </div>
        <span className={`text-xs font-semibold hidden sm:block ${i === current ? 'text-primary' : 'text-on-surface-variant'}`}>{s}</span>
        {i < steps.length - 1 && <div className={`w-8 h-px ${i < current ? 'bg-primary' : 'bg-surface-container'}`} />}
      </div>
    ))}
  </div>
);

// ─── File Drop Zone ───────────────────────────
const FileZone = ({ id, label, file, onFile, accept = 'image/*,.pdf' }) => (
  <div className="space-y-2">
    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant" htmlFor={id}>{label}</label>
    <label
      htmlFor={id}
      className={`flex flex-col items-center justify-center w-full h-28 rounded-md border-2 border-dashed cursor-pointer transition-all duration-200
        ${file ? 'border-primary/60 bg-primary/5' : 'border-surface-container-high hover:border-primary/40 bg-surface-container-lowest'}`}
    >
      {file ? (
        <div className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-primary text-2xl">task</span>
          <span className="text-xs text-primary font-medium truncate max-w-[180px]">{file.name}</span>
          <span className="text-xs text-on-surface-variant">Click to replace</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-on-surface-variant text-2xl">upload_file</span>
          <span className="text-xs text-on-surface-variant">Click to upload</span>
          <span className="text-xs text-outline/60">JPG, PNG or PDF</span>
        </div>
      )}
      <input id={id} type="file" accept={accept} className="hidden" onChange={(e) => onFile(e.target.files[0])} />
    </label>
  </div>
);

// ─── Live Selfie Widget ───────────────────────
const SelfieWidget = ({ onCapture }) => {
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stage, setStage] = useState('idle'); // idle | camera | verifying | done
  const [captured, setCaptured] = useState(null);

  // Attach stream once the <video> element is in the DOM (after stage = 'camera')
  useEffect(() => {
    if (stage === 'camera' && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [stage]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;   // save stream before stage change
      setStage('camera');           // now React renders <video>, useEffect attaches stream
    } catch (err) {
      console.error('Camera error:', err);
      const msg = err?.name === 'NotAllowedError'
        ? 'Camera permission denied. Please allow camera access in your browser settings.'
        : err?.name === 'NotReadableError'
        ? 'Camera is already in use by another application.'
        : `Camera error: ${err?.message || 'Unknown error'}`;
      alert(msg);
    }
  };

  const stopStream = () => {
    const s = videoRef.current?.srcObject;
    s?.getTracks().forEach((t) => t.stop());
  };

  const capture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    stopStream();
    setStage('verifying');
    const dataUrl = canvas.toDataURL('image/jpeg');
    // simulate face verification delay
    setTimeout(() => {
      canvas.toBlob((blob) => {
        const file = new File([blob], 'live_selfie.jpg', { type: 'image/jpeg' });
        setCaptured(dataUrl);
        setStage('done');
        onCapture(file);
      }, 'image/jpeg');
    }, 1800);
  };

  const retake = () => {
    setCaptured(null);
    onCapture(null);
    setStage('idle');
  };

  return (
    <div className="space-y-3">
      <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant block">Live Selfie — Face Verification</label>
      <div className="rounded-md border-2 border-dashed border-surface-container-high bg-surface-container-lowest flex flex-col items-center justify-center min-h-[220px] p-4 gap-4 transition-all duration-300">

        {/* idle */}
        {stage === 'idle' && (
          <button type="button" onClick={start}
            className="flex items-center gap-2 py-3 px-6 bg-primary/10 text-primary font-bold rounded-full hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined">photo_camera</span>
            Start Camera
          </button>
        )}

        {/* camera */}
        {stage === 'camera' && (
          <div className="w-full flex flex-col items-center gap-3">
            {/* oval face guide overlay */}
            <div className="relative w-full max-w-xs">
              <video ref={videoRef} autoPlay playsInline muted
                className="w-full rounded-md bg-black" style={{ aspectRatio: '4/3', transform: 'scaleX(-1)' }} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-28 h-36 rounded-full border-4 border-primary/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
              </div>
              <p className="absolute bottom-2 w-full text-center text-xs text-white/70">Align your face in the oval</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={capture}
                className="py-2 px-6 bg-primary text-on-primary-container font-bold rounded-full hover:shadow-[0_0_15px_rgba(143,245,255,0.4)] transition-all">
                Capture Face
              </button>
              <button type="button" onClick={() => { stopStream(); setStage('idle'); }}
                className="py-2 px-5 bg-surface-container-high text-on-surface font-bold rounded-full hover:bg-surface-variant transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* verifying */}
        {stage === 'verifying' && (
          <div className="flex flex-col items-center gap-3 text-primary">
            <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
            <p className="font-bold animate-pulse">Verifying Face…</p>
          </div>
        )}

        {/* done */}
        {stage === 'done' && (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img src={captured} alt="selfie" className="w-24 h-24 rounded-full object-cover border-2 border-primary" style={{ transform: 'scaleX(-1)' }} />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">check</span>
              </div>
            </div>
            <p className="font-bold text-green-400 text-sm">Face Verified Successfully</p>
            <button type="button" onClick={retake} className="text-xs text-primary hover:underline">Retake Selfie</button>
          </div>
        )}

        {/* hidden canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const RegisterPage = () => {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState('owner');

  // step 0
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // step 1
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);

  // step 2
  const [selfieFile, setSelfieFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fn = (e) => {
      const mx = (e.clientX - window.innerWidth / 2) / 50;
      const my = (e.clientY - window.innerHeight / 2) / 50;
      document.querySelectorAll('.glass-card-interactive').forEach((c) => {
        c.style.transform = `translate(${mx}px, ${my}px)`;
      });
    };
    document.addEventListener('mousemove', fn);
    return () => document.removeEventListener('mousemove', fn);
  }, []);

  const nextStep = (e) => {
    e.preventDefault();
    setError('');
    if (step === 0) {
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    }
    if (step === 1) {
      if (!aadhaarFile || !panFile) { setError('Please upload both Aadhaar and PAN card.'); return; }
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selfieFile) { setError('Please complete face verification.'); return; }
    setLoading(true);

    try {
      // ── IPFS uploads (mock) ──────────────────
      const [aadhaarHash, panHash, selfieHash] = await Promise.all([
        uploadToIPFS(aadhaarFile),
        uploadToIPFS(panFile),
        uploadToIPFS(selfieFile),
      ]);
      console.log('IPFS hashes (mock):', { aadhaarHash, panHash, selfieHash });
      // TODO: store hashes in user metadata / DB when IPFS is wired up

      // ── Supabase sign-up ─────────────────────
      const walletAddress = '0x' + Array.from({ length: 39 }, () =>
        Math.floor(Math.random() * 16).toString(16)).join('');

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            phone,
            wallet_address: walletAddress,
            // ipfs_aadhaar: aadhaarHash,  // uncomment when IPFS ready
            // ipfs_pan: panHash,
            // ipfs_selfie: selfieHash,
          },
        },
      });

      if (signUpError) throw signUpError;
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col selection:bg-primary selection:text-on-primary-container bg-mesh page-enter">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface-variant/40 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] h-20 px-8 flex justify-between items-center">
        <Link to="/" className="text-2xl font-headline font-bold tracking-widest text-primary">Bhoomi</Link>
        <Link to="/login" className="text-primary font-bold hover:text-primary-dim transition-colors duration-300">Login</Link>
      </header>

      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden">
        {/* Decorative Ambient Elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-float-slow" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

        <section className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 glass-card glass-card-interactive rounded-lg overflow-hidden relative z-10 shadow-2xl hover-glow-border">
          {/* Left panel */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-surface-container-low relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="font-display text-5xl font-bold leading-tight mb-6 tracking-tight">Join the Digital <span className="text-primary">Frontier</span></h1>
              <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
                Step into a decentralised ecosystem where property rights are immutable. Register to start managing or acquiring digital land on the Ethereal Ledger.
              </p>
            </div>
            <div className="relative z-10 space-y-6">
              {[
                { icon: 'verified_user', color: 'text-primary', title: 'Immutable Ownership', sub: 'Secured by the protocol ledger.' },
                { icon: 'account_balance_wallet', color: 'text-secondary', title: 'Seamless Transactions', sub: 'Direct peer-to-peer digital land exchange.' },
                { icon: 'fingerprint', color: 'text-primary', title: 'KYC Secured', sub: 'Documents stored on IPFS, verified on-chain.' },
              ].map(({ icon, color, title, sub }) => (
                <div key={title} className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full bg-surface-container flex items-center justify-center ${color}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">{title}</p>
                    <p className="text-sm text-on-surface-variant">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <img alt="Digital Frontier Artwork"
              className="absolute bottom-0 right-0 w-3/4 h-3/4 object-cover mix-blend-overlay opacity-30"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgpi-EOwxtEqcEMKa_9q3sOt5gm-5VYAyicL7ksblq2wo05_5j8x3qcr4vAzfrpcIUTCsz9eq6R5tO69LKI_erjalMmddYAUckHojxoz-gA4IVMZTGjZBZMCrI9eTGLYEHyYfeIvZgAmOYw2tN57lEuW_mmS_4LSJ6PRhon5qiaxlnOI16_NJ_tvrJ8QXDOL5gJusAtvh9YnZsH_DB4__G-TGupHO2MHxXF0pkI8IyfJa8XmE7vrJ5PgFyk2XfjjSC3nij2jvJ_y5O"
            />
          </div>

          {/* Right panel */}
          <div className="p-8 md:p-12 overflow-y-auto">
            <div className="mb-6">
              <h2 className="font-display text-3xl font-bold mb-1">Create Account</h2>
              <p className="text-on-surface-variant text-sm">Provide your details to initiate registry access.</p>
            </div>

            <StepBar current={step} />

            {error && (
              <div className="mb-5 bg-error/10 text-error border border-error/20 p-3 rounded-md text-sm font-medium">
                {error}
              </div>
            )}

            {/* ── Step 0: Account Details ───────── */}
            {step === 0 && (
              <form className="space-y-5" onSubmit={nextStep}>
                <div className="space-y-3">
                  <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Identity Role</label>
                  <div className="flex p-1 bg-surface-container-lowest rounded-md space-x-1">
                    {['owner', 'buyer'].map((r) => (
                      <button key={r} type="button" onClick={() => setRole(r)}
                        className={`flex-1 py-3 rounded-sm text-sm font-bold transition-all duration-300 ${role === r ? 'active-role' : 'text-on-surface-variant hover:text-on-surface'}`}>
                        {r === 'owner' ? 'Land Owner' : 'Buyer'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant" htmlFor="name">Full Name</label>
                    <input className="w-full bg-surface-container-lowest border-none rounded-sm px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary-dim placeholder:text-outline/40"
                      id="name" placeholder="Alex Sterling" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant" htmlFor="phone">Phone Number</label>
                    <input className="w-full bg-surface-container-lowest border-none rounded-sm px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary-dim placeholder:text-outline/40"
                      id="phone" placeholder="+91 98765 43210" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant" htmlFor="email">Email Address</label>
                  <input className="w-full bg-surface-container-lowest border-none rounded-sm px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary-dim placeholder:text-outline/40"
                    id="email" placeholder="alex@protocol.eth" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant" htmlFor="password">Password</label>
                    <input className="w-full bg-surface-container-lowest border-none rounded-sm px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary-dim placeholder:text-outline/40"
                      id="password" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant" htmlFor="confirm">Confirm Password</label>
                    <input className="w-full bg-surface-container-lowest border-none rounded-sm px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary-dim placeholder:text-outline/40"
                      id="confirm" placeholder="••••••••" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>

                <div className="pt-4 flex flex-col space-y-4">
                  <button className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-headline font-bold text-lg rounded-md hover:shadow-[0_0_20px_rgba(143,245,255,0.3)] transition-all duration-300 active:scale-[0.98]">
                    Continue →
                  </button>
                  <p className="text-center text-xs text-on-surface-variant">
                    Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
                  </p>
                </div>
              </form>
            )}

            {/* ── Step 1: KYC Documents ─────────── */}
            {step === 1 && (
              <form className="space-y-5" onSubmit={nextStep}>
                <p className="text-sm text-on-surface-variant mb-2">
                  Upload your government-issued documents. They will be securely stored on <span className="text-primary font-semibold">IPFS</span>.
                </p>
                <FileZone id="aadhaar" label="Aadhaar Card" file={aadhaarFile} onFile={setAadhaarFile} />
                <FileZone id="pan" label="PAN Card" file={panFile} onFile={setPanFile} />
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(0)}
                    className="flex-1 py-3 bg-surface-container-high text-on-surface font-bold rounded-md hover:bg-surface-variant transition-colors">
                    ← Back
                  </button>
                  <button className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-headline font-bold rounded-md hover:shadow-[0_0_20px_rgba(143,245,255,0.3)] transition-all duration-300 active:scale-[0.98]">
                    Continue →
                  </button>
                </div>
              </form>
            )}

            {/* ── Step 2: Live Selfie ───────────── */}
            {step === 2 && (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <p className="text-sm text-on-surface-variant mb-2">
                  Take a live selfie to confirm your identity. Your face will be matched and verified before submission.
                </p>
                <SelfieWidget onCapture={setSelfieFile} />
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-3 bg-surface-container-high text-on-surface font-bold rounded-md hover:bg-surface-variant transition-colors">
                    ← Back
                  </button>
                  <button disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-headline font-bold rounded-md hover:shadow-[0_0_20px_rgba(143,245,255,0.3)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Registering…' : 'Register Account'}
                  </button>
                </div>
                <p className="text-center text-xs text-on-surface-variant">
                  By registering you agree to our <a className="text-primary hover:underline" href="#">Terms of Service</a> and <a className="text-primary hover:underline" href="#">Privacy Protocol</a>.
                </p>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default RegisterPage;
