import { useEffect, useRef } from 'react';

const imagesRow1 = [
  "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=800&q=80"
];

const imagesRow2 = [
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1504222490345-c075b6008014?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600707328902-60144d18728d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1598506847895-71be8eb84a3b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1635425032549-065a3962b13c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1563720225384-9c0f129710b7?auto=format&fit=crop&w=800&q=80"
];

const tripledRow1 = [...imagesRow1, ...imagesRow1, ...imagesRow1];
const tripledRow2 = [...imagesRow2, ...imagesRow2, ...imagesRow2];

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
    <section ref={sectionRef} className="bg-[#0C0C0C] pt-24 sm:pt-32 md:pt-40 pb-10 overflow-hidden flex flex-col gap-3">
      <div ref={row1Ref} className="flex gap-3 w-max" style={{ willChange: 'transform' }}>
        {tripledRow1.map((src, i) => (
          <img key={i} src={src} alt="Project Preview" className="w-[280px] h-[180px] sm:w-[420px] sm:h-[270px] rounded-2xl object-cover" loading="lazy" />
        ))}
      </div>
      <div ref={row2Ref} className="flex gap-3 w-max" style={{ willChange: 'transform' }}>
        {tripledRow2.map((src, i) => (
          <img key={i} src={src} alt="Project Preview" className="w-[280px] h-[180px] sm:w-[420px] sm:h-[270px] rounded-2xl object-cover" loading="lazy" />
        ))}
      </div>
    </section>
  );
};

export default MarqueeSection;
