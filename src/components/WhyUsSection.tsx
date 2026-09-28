import { useRef, useEffect, useCallback } from 'react';
import { FadeIn } from './Reusable';

const stats = [
  { number: "10+", label: "Years of Experience", desc: "Delivering top-tier automotive care with a legacy of trust.", image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80" },
  { number: "5000+", label: "Happy Customers", desc: "Consistently exceeding expectations for car owners across Tirupati.", image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80" },
  { number: "20+", label: "Expert Mechanics", desc: "Highly skilled, certified technicians handling every repair with precision.", image: "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=800&q=80" },
  { number: "24/7", label: "Emergency Support", desc: "Round-the-clock towing and roadside assistance when you need it most.", image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80" }
];

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    if (!isTouchDevice) return;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold: 0.4,
      rootMargin: '0px 0px -10% 0px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect]);

  return (
    <FadeIn delay={0.1 + (index * 0.05)} y={20} className="h-full">
      <div
        ref={cardRef}
        className="service-card group relative overflow-hidden bg-surface border border-border rounded-2xl p-3 sm:p-6 md:p-8 aspect-square sm:aspect-auto sm:min-h-[220px] flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:border-border-hover transition-all duration-300 gold-glow cursor-pointer"
      >
        <img src={stat.image} className="service-card-image" loading="lazy" alt={stat.label} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 z-10" />
        <div className="relative z-20">
          <span className="font-black text-3xl sm:text-4xl md:text-6xl lg:text-7xl mb-2 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-b from-brand-light to-brand block">
            {stat.number}
          </span>
          <h3 className="font-medium text-sm sm:text-base md:text-xl uppercase tracking-wider mb-1 sm:mb-3 text-white leading-tight">
            {stat.label}
          </h3>
          <p className="font-light text-[10px] sm:text-xs md:text-sm opacity-70 leading-snug line-clamp-2 sm:line-clamp-none text-white/70">
            {stat.desc}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}

const WhyUsSection = () => {
  return (
    <section id="why-us" className="bg-[#141418] text-[#D7E2EA] px-4 sm:px-6 md:px-10 py-12 sm:py-20 md:py-32 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        <FadeIn delay={0} y={40} className="mb-12 sm:mb-16 md:mb-20 text-center w-full">
          <h2 className="hero-heading section-accent section-accent-center font-black uppercase text-[clamp(2.5rem,10vw,140px)] leading-none text-center">
            Why Us
          </h2>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8 w-full">
          {stats.map((stat, idx) => (
            <StatCard key={stat.label} stat={stat} index={idx} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyUsSection;
