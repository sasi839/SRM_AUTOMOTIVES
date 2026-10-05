import { useRef, useCallback, useEffect } from 'react';
import { useSiteData } from '../context/SiteDataContext';
import { FadeIn } from './Reusable';

const defaultImagesRow1 = [
  { src: "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=800&q=80", label: "Engine Bay" },
  { src: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80", label: "Performance Tuning" },
  { src: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80", label: "Luxury Sedan" },
  { src: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80", label: "Custom Build" },
  { src: "https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=800&q=80", label: "Precision Work" },
  { src: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80", label: "Tech Systems" },
  { src: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80", label: "Detail Finish" },
  { src: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80", label: "Body Work" },
  { src: "https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=800&q=80", label: "Sport Edition" }
];

function StaticCard({ item, index }: { item: { src: string; label: string }; index: number }) {
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
    <FadeIn delay={0.1 + (index * 0.05)} y={20} className="w-full h-full">
      <div
        ref={cardRef}
        className="service-card group relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-[#D7E2EA]/5 border border-border hover:border-border-hover transition-all duration-300 gold-glow cursor-pointer"
      >
        <img 
          src={item.src} 
          alt={item.label} 
          className="service-card-image"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c21] via-[#1c1c21]/40 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 p-3 sm:p-6 z-20">
          <p className="text-white text-sm sm:text-lg md:text-xl font-medium leading-tight sm:leading-normal">
            {item.label}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}

const MarqueeSection = () => {
  const { marqueeItems } = useSiteData();

  // Combine dynamic items or fallback to defaults
  const displayItems = (!marqueeItems || marqueeItems.length === 0)
    ? defaultImagesRow1
    : marqueeItems.map(item => ({ src: item.imageUrl, label: item.caption }));

  return (
    <section id="highlights" className="bg-[#1c1c21] py-12 sm:py-20 md:py-32 px-4 sm:px-6 md:px-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <FadeIn delay={0} y={40} className="mb-12 sm:mb-16">
          <h2 className="hero-heading section-accent font-black uppercase leading-none tracking-tight text-[clamp(2.25rem,8vw,100px)] text-white">
            Highlights
          </h2>
        </FadeIn>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
          {displayItems.map((item, i) => (
            <StaticCard key={`marquee-${i}`} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarqueeSection;
