import { useRef, useEffect, useCallback } from 'react';
import { FadeIn } from './Reusable';
import { useSiteData } from '../context/SiteDataContext';
import type { PublicServiceItem } from '../context/SiteDataContext';
import { ArrowRight } from 'lucide-react';

/* Individual card with scroll-triggered reveal for mobile */
function ServiceCard({ service, index }: { service: PublicServiceItem; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const IconComponent = service.icon;

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

    // Only observe on touch devices (no hover capability)
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
        className="service-card group relative overflow-hidden bg-surface border border-border rounded-2xl p-3 sm:p-8 aspect-square sm:aspect-auto sm:min-h-[220px] flex flex-col justify-end hover:-translate-y-1 hover:border-border-hover transition-all duration-300 gold-glow cursor-pointer"
      >
        <img src={service.image} className="service-card-image" loading="lazy" alt={service.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
        <div className="relative z-20">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-brand/10 flex items-center justify-center mb-2 sm:mb-4 group-hover:bg-brand/20 transition-colors duration-300">
            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
          </div>
          <h3 className="text-white text-sm sm:text-base md:text-xl font-semibold tracking-tight mb-1 sm:mb-2 leading-tight">
            {service.name}
          </h3>
          <p className="text-white/50 font-light text-[10px] sm:text-xs md:text-sm leading-[1.2] sm:leading-relaxed line-clamp-2 sm:line-clamp-none group-hover:text-white/70 transition-colors duration-300">
            {service.desc}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}

export default function ServicesSection() {
  const { services } = useSiteData();

  return (
    <section id="services" className="w-full bg-[#1c1c21] py-12 sm:py-16 md:py-32 px-4 sm:px-6 md:px-10 relative">
      <div className="max-w-7xl mx-auto flex flex-col gap-12 md:gap-16">
        
        {/* Header */}
        <div className="w-full text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <FadeIn delay={0.1} y={30}>
              <h2 className="section-accent hero-heading font-black uppercase text-[clamp(2rem,8vw,80px)] leading-[0.9] tracking-tight text-white">
                Our Services
              </h2>
            </FadeIn>
          </div>
          <FadeIn delay={0.3} className="hidden md:block">
            <a href="#contact" className="inline-flex items-center gap-2 text-brand border-b-2 border-brand pb-1 font-medium tracking-wider uppercase hover:text-brand-light hover:border-brand-light transition-colors">
              Book Appointment <ArrowRight className="w-4 h-4" />
            </a>
          </FadeIn>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 pt-4">
          {services.map((service, index) => (
            <ServiceCard key={service.name || index} service={service} index={index} />
          ))}
        </div>
        
        {/* Mobile CTA */}
        <div className="w-full flex justify-center md:hidden mt-4">
          <a href="#contact" className="inline-flex items-center gap-2 bg-brand text-black px-6 py-3 rounded-full font-medium tracking-wider uppercase shadow-lg">
            Book Appointment <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        
      </div>
    </section>
  );
}
