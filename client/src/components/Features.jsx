import { useState, useEffect } from 'react';
import { useScrollAnimation, useStaggerAnimation } from '../hooks/useScrollAnimation';
import { fetchFeatures } from '../services/supabaseService';

const DEFAULT_FEATURE_CARDS = [
  {
    icon: 'token',
    colorClass: 'bg-primary/10 text-primary',
    title: 'NFT-based Land Ownership',
    description: 'Each land parcel is minted as a unique NFT, providing verifiable proof of ownership directly on the ledger.',
  },
  {
    icon: 'contract',
    colorClass: 'bg-secondary/10 text-secondary',
    title: 'Smart Contract Transactions',
    description: 'Execute escrow and title transfers automatically with self-verifying protocols that eliminate middlemen.',
  },
  {
    icon: 'admin_panel_settings',
    colorClass: 'bg-tertiary/10 text-tertiary',
    title: 'Tamper-proof Records',
    description: 'Our distributed ledger ensures that records cannot be altered, providing absolute security for your assets.',
  },
  {
    icon: 'distance',
    colorClass: 'bg-primary-fixed/10 text-primary-fixed',
    title: 'Geo-tagged Verification',
    description: 'Precise GPS integration allows for instant verification of land boundaries through decentralized oracle networks.',
  },
];

const Features = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionRef, sectionVisible] = useScrollAnimation({ threshold: 0.1 });
  const visibleItems = useStaggerAnimation(features.length || DEFAULT_FEATURE_CARDS.length, 150, sectionVisible);

  useEffect(() => {
    async function loadFeatures() {
      try {
        const data = await fetchFeatures();
        if (data && data.length > 0) {
          // Normalize names from database schema to fit front-end
          const formatted = data.map(item => ({
            icon: item.icon,
            colorClass: item.color_class || 'bg-primary/10 text-primary',
            title: item.title,
            description: item.description
          }));
          setFeatures(formatted);
        } else {
          setFeatures(DEFAULT_FEATURE_CARDS);
        }
      } catch (err) {
        console.error("Error loading features, using default:", err);
        setFeatures(DEFAULT_FEATURE_CARDS);
      } finally {
        setLoading(false);
      }
    }
    loadFeatures();
  }, []);

  const cardsToRender = features.length > 0 ? features : DEFAULT_FEATURE_CARDS;

  return (
    <section id="features" className="py-32 bg-surface relative overflow-hidden">
      {/* Subtle ambient gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 relative" ref={sectionRef}>
        {/* Section header */}
        <div
          className={`text-center mb-16 scroll-reveal ${sectionVisible ? 'visible' : ''}`}
        >
          <span className="font-label text-xs tracking-[0.25em] uppercase text-primary mb-4 block">
            Core Technology
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-bold mb-4">
            Built for the Future
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-primary to-primary-container mx-auto rounded-full" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cardsToRender.map((card, i) => (
              <div
                key={card.title}
                className={`glass-card hover-lift hover-glow-border p-8 rounded-lg group transition-all duration-500 scroll-reveal ${
                  visibleItems.includes(i) ? 'visible' : ''
                } stagger-${i + 1}`}
              >
                <div
                  className={`w-14 h-14 rounded-md ${card.colorClass} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                >
                  <span className="material-symbols-outlined text-3xl" data-icon={card.icon}>
                    {card.icon}
                  </span>
                </div>
                <h3 className="font-headline text-xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                  {card.title}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Features;
