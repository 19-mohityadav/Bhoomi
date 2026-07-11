import { useScrollAnimation, useStaggerAnimation } from '../hooks/useScrollAnimation';

const STEPS = [
  {
    number: '01',
    title: 'Upload Land',
    description: 'Submit deeds and documentation for digital intake.',
    borderColor: 'border-primary/40',
    shadowColor: 'shadow-[0_0_15px_rgba(143,245,255,0.2)]',
    textColor: 'text-primary',
    isFeatured: false,
  },
  {
    number: '02',
    title: 'Verify',
    description: 'De-centralized verification of legal boundaries.',
    borderColor: 'border-secondary/40',
    shadowColor: 'shadow-[0_0_15px_rgba(172,137,255,0.2)]',
    textColor: 'text-secondary',
    isFeatured: false,
  },
  {
    number: null,
    title: 'Mint NFT',
    description: 'Your land is now a secure on-chain asset.',
    isFeatured: true,
  },
  {
    number: '04',
    title: 'Buy/Sell',
    description: 'Trade instantly on the Bhoomi marketplace.',
    borderColor: 'border-secondary/40',
    shadowColor: 'shadow-[0_0_15px_rgba(172,137,255,0.2)]',
    textColor: 'text-secondary',
    isFeatured: false,
  },
  {
    number: '05',
    title: 'Transfer',
    description: 'Seamless ownership migration via smart-contract.',
    borderColor: 'border-primary/40',
    shadowColor: 'shadow-[0_0_15px_rgba(143,245,255,0.2)]',
    textColor: 'text-primary',
    isFeatured: false,
  },
];

const HowItWorks = () => {
  const [sectionRef, sectionVisible] = useScrollAnimation({ threshold: 0.1 });
  const visibleSteps = useStaggerAnimation(STEPS.length, 180, sectionVisible);

  return (
    <section id="how-it-works" className="py-32 bg-surface-container-low overflow-hidden">
      <div className="max-w-7xl mx-auto px-8" ref={sectionRef}>
        {/* Section Header */}
        <div
          className={`text-center mb-20 scroll-reveal ${sectionVisible ? 'visible' : ''}`}
        >
          <span className="font-label text-xs tracking-[0.25em] uppercase text-secondary mb-4 block">
            The Process
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-bold mb-4">The Digital Transformation</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-secondary to-primary mx-auto rounded-full" />
        </div>

        <div className="relative">
          {/* Connection Line (Desktop) with animated gradient */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px -translate-y-1/2 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-transparent via-primary/40 to-transparent transition-all duration-1000 ${
                sectionVisible ? 'w-full' : 'w-0'
              }`}
              style={{ transitionDelay: '0.5s' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 relative z-10">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className={`flex flex-col items-center text-center scroll-reveal ${
                  visibleSteps.includes(i) ? 'visible' : ''
                }`}
                style={{ transitionDelay: `${i * 0.12}s` }}
              >
                {step.isFeatured ? (
                  /* Featured central step */
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(143,245,255,0.4)] -mt-2 animate-glow-pulse group hover:scale-110 transition-transform duration-300">
                    <span
                      className="material-symbols-outlined text-on-primary text-3xl"
                      data-icon="auto_awesome"
                    >
                      auto_awesome
                    </span>
                  </div>
                ) : (
                  <div
                    className={`w-12 h-12 rounded-full bg-surface-container-highest border ${step.borderColor} flex items-center justify-center mb-6 ${step.shadowColor} hover:scale-110 transition-all duration-300 group`}
                  >
                    <span className={`font-headline font-bold ${step.textColor}`}>
                      {step.number}
                    </span>
                  </div>
                )}

                <h4 className="font-headline font-bold mb-2">{step.title}</h4>
                <p
                  className={`text-xs text-on-surface-variant px-4 ${
                    step.isFeatured ? 'font-bold' : ''
                  }`}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
