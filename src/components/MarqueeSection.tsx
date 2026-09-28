import { useEffect, useRef, useCallback } from 'react';

const imagesRow1 = [
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

const imagesRow2 = [
  { src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80", label: "Classic Restore" },
  { src: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80", label: "SUV Service" },
  { src: "https://images.unsplash.com/photo-1504222490345-c075b6008014?auto=format&fit=crop&w=800&q=80", label: "Garage View" },
  { src: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=800&q=80", label: "Interior Care" },
  { src: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80", label: "Emergency Ready" },
  { src: "https://images.unsplash.com/photo-1600707328902-60144d18728d?auto=format&fit=crop&w=800&q=80", label: "Premium Polish" },
  { src: "https://images.unsplash.com/photo-1598506847895-71be8eb84a3b?auto=format&fit=crop&w=800&q=80", label: "Paint Studio" },
  { src: "https://images.unsplash.com/photo-1635425032549-065a3962b13c?auto=format&fit=crop&w=800&q=80", label: "Quality Parts" },
  { src: "https://images.unsplash.com/photo-1563720225384-9c0f129710b7?auto=format&fit=crop&w=800&q=80", label: "Track Ready" }
];

const tripledRow1 = [...imagesRow1, ...imagesRow1, ...imagesRow1];
const tripledRow2 = [...imagesRow2, ...imagesRow2, ...imagesRow2];

/* Individual marquee card with scroll-triggered reveal for mobile */
function MarqueeCard({ item }: { item: { src: string; label: string } }) {
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
      threshold: 0.3,
      rootMargin: '0px 0px -5% 0px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect]);

  return (
    <div
      ref={cardRef}
      className="marquee-card group flex-shrink-0 w-[200px] h-[140px] sm:w-[280px] sm:h-[190px] md:w-[320px] md:h-[210px] cursor-pointer"
    >
      <img
        src={item.src}
        alt={item.label}
        className="marquee-card-image"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
      <div className="absolute bottom-0 left-0 p-2 sm:p-4 z-20">
        <p className="text-white text-[10px] sm:text-xs md:text-sm font-medium tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {item.label}
        </p>
      </div>
    </div>
  );
}

const MarqueeSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !row1Ref.current || !row2Ref.current) return;
      const sectionTop = sectionRef.current.offsetTop;
      const offset = (window.scrollY - sectionTop + window.innerHeight) * 0.3;
      
      row1Ref.current.style.transform = `translate3d(${offset - 200}px, 0, 0)`;
      row2Ref.current.style.transform = `translate3d(${-(offset - 200)}px, 0, 0)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#141418] pt-24 sm:pt-32 md:pt-40 pb-10 overflow-hidden flex flex-col gap-4 sm:gap-5">
      <div ref={row1Ref} className="flex gap-3 sm:gap-4 w-max" style={{ willChange: 'transform' }}>
        {tripledRow1.map((item, i) => (
          <MarqueeCard key={i} item={item} />
        ))}
      </div>
      <div ref={row2Ref} className="flex gap-3 sm:gap-4 w-max" style={{ willChange: 'transform' }}>
        {tripledRow2.map((item, i) => (
          <MarqueeCard key={i} item={item} />
        ))}
      </div>
    </section>
  );
};

export default MarqueeSection;
