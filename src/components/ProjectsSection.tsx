import { useRef, useEffect, useCallback } from 'react';
import { FadeIn } from './Reusable';
import { useSiteData } from '../context/SiteDataContext';
import type { PublicGalleryItem } from '../context/SiteDataContext';

/* Individual gallery card with scroll-triggered reveal for mobile (same as ServiceCard) */
function GalleryCard({ item, index }: { item: PublicGalleryItem; index: number }) {
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
    <FadeIn delay={0.1 + (index * 0.05)} y={20} className="w-full h-full">
      <div
        ref={cardRef}
        className="service-card group relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-[#D7E2EA]/5 border border-border hover:border-border-hover transition-all duration-300 gold-glow cursor-pointer"
      >
        <img 
          src={item.imageUrl} 
          alt={item.caption} 
          className="service-card-image"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141418] via-[#141418]/40 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 p-3 sm:p-6 z-20">
          <p className="text-brand text-[10px] sm:text-sm font-semibold tracking-widest uppercase mb-1">
            {item.category}
          </p>
          <p className="text-white text-sm sm:text-lg md:text-xl font-medium leading-tight sm:leading-normal">
            {item.caption}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}

export default function ProjectsSection() {
  const { galleryItems } = useSiteData();

  return (
    <section id="gallery" className="w-full bg-[#141418] py-12 sm:py-20 md:py-32 px-4 sm:px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <FadeIn delay={0} y={40} className="mb-16">
          <h2 className="hero-heading section-accent font-black uppercase leading-none tracking-tight text-[clamp(2.25rem,8vw,100px)] text-white">
            Our Work
          </h2>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
          {galleryItems.map((item, index) => (
            <GalleryCard key={item.id || index} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
