import { useScrollAnimation, useStaggerAnimation } from '../hooks/useScrollAnimation';

const TRUST_ITEMS = [
  { icon: 'hub', label: 'Built on Blockchain' },
  { icon: 'verified_user', label: 'Secure & Transparent' },
  { icon: 'account_balance', label: 'Government-ready Infrastructure' },
];

const TrustSection = () => {
  const [sectionRef, sectionVisible] = useScrollAnimation({ threshold: 0.2 });
  const visibleItems = useStaggerAnimation(TRUST_ITEMS.length, 200, sectionVisible);

  return (
    <section className="py-20 bg-surface-container-low overflow-hidden" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-wrap justify-center gap-12">
          {TRUST_ITEMS.map((item, i) => (
            <div
              key={item.label}
              className={`flex items-center space-x-3 group cursor-default scroll-reveal ${
                visibleItems.includes(i) ? 'visible' : ''
              }`}
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              <span className="material-symbols-outlined text-2xl text-on-surface-variant/50 group-hover:text-primary transition-colors duration-500" data-icon={item.icon}>
                {item.icon}
              </span>
              <span className="font-headline font-bold uppercase tracking-widest text-xs text-on-surface-variant/50 group-hover:text-on-surface transition-colors duration-500">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
