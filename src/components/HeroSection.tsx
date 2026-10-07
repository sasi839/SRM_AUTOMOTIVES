import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';

const HeroSection = () => {
  const { heroSlides, businessContent } = useSiteData();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeSlides = heroSlides.length > 0 ? heroSlides : [
    {
      image: "https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=1920&q=80",
      title: "SREE RAJA RAJESWARI MOTORS",
      subtitle: "The premium destination for mechanical repairs, teflon coating, and luxury vehicle restoration in Tirupati."
    }
  ];

  const safeSlideIndex = currentSlide % activeSlides.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);

  const phoneHref = `tel:${businessContent.primary_phone || '+918919594039'}`;
  const whatsappHref = `https://api.whatsapp.com/send?phone=${businessContent.whatsapp_number || '918919594039'}`;

  return (
    <section id="hero" className="relative aspect-[4/3] sm:aspect-video md:aspect-auto md:h-[100dvh] min-h-[360px] md:min-h-0 w-full flex flex-col bg-[#1c1c21] overflow-hidden">
      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.img
            key={safeSlideIndex}
            src={activeSlides[safeSlideIndex].image}
            alt={activeSlides[safeSlideIndex].title}
            loading="eager"
            fetchPriority="high"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-[#20222a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
      </div>

      {/* Header / Navbar (Z-30) */}
      <header className="w-full z-30 relative pointer-events-auto border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="flex justify-between items-center px-4 md:px-10 py-3 max-w-7xl mx-auto">
          {/* Logo / Brand */}
          <a href="/" className="flex items-center gap-3 group" aria-label="SREE RAJA RAJESWARI MOTORS Homepage">
            <img src="/srm-logo.png" width="180" height="48" alt="SREE RAJA RAJESWARI MOTORS Logo - Car Service Center in Tirupati" className="h-9 sm:h-11 md:h-12 w-auto object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300" />
            <span className="font-black text-lg sm:text-2xl tracking-tighter text-white uppercase group-hover:text-red-500 transition-colors hidden sm:inline">
              {businessContent.business_name || 'SREE RAJA RAJESWARI MOTORS'}
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {["Home", "Services", "Gallery", "Contact"].map((item) => (
              <a
                key={item}
                href={item === 'Home' ? '/' : `#${item.toLowerCase()}`}
                className="text-white/80 hover:text-[#E5B549] text-sm uppercase tracking-widest font-medium transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Quick Contact Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a href={phoneHref} className="hover:scale-110 transition-transform drop-shadow-md flex items-center justify-center" title="Call Us" aria-label="Call SREE RAJA RAJESWARI MOTORS">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white">
                  <path fill="currentColor" d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                </svg>
              </div>
            </a>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform drop-shadow-md flex items-center justify-center" title="WhatsApp Us" aria-label="Chat with SREE RAJA RAJESWARI MOTORS on WhatsApp">
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="36" height="36" alt="Contact SREE RAJA RAJESWARI MOTORS on WhatsApp" className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain" />
            </a>
            <a 
              href={businessContent.google_maps_url || 'https://maps.app.goo.gl/dnHpFsgdPKao7ALk7'} 
              target="_blank" 
              rel="noreferrer" 
              className="hover:scale-110 transition-transform drop-shadow-md flex items-center justify-center" 
              title="Open Location in Google Maps"
              aria-label="View SREE RAJA RAJESWARI MOTORS location on Google Maps"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg" width="36" height="36" alt="SREE RAJA RAJESWARI MOTORS Location on Google Maps" className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain" />
            </a>
            
            {/* Hamburger Button */}
            <button 
              className="md:hidden text-white ml-2 hover:text-brand transition-colors p-1"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="w-7 h-7" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 bg-[#1c1c21] z-50 flex flex-col justify-between p-8 border-l border-white/10 md:hidden"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
              <div className="flex items-center gap-3">
                <img src="/srm-logo.png" alt="SREE RAJA RAJESWARI MOTORS Logo" className="h-10 sm:h-12 w-auto object-contain drop-shadow-lg" />
                <span className="font-black text-xl tracking-tighter text-white uppercase">
                  {businessContent.business_name || 'SREE RAJA RAJESWARI MOTORS'}
                </span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-brand transition-colors p-2"
                aria-label="Close navigation menu"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <nav className="flex flex-col gap-6 items-center my-auto">
              {["Home", "Services", "Gallery", "Contact"].map((item, idx) => (
                <motion.a 
                  key={item} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  href={item === 'Home' ? '/' : `#${item.toLowerCase()}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white text-3xl font-medium uppercase tracking-wider hover:text-brand transition-colors duration-200"
                >
                  {item}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Content */}
      <div className="absolute bottom-14 sm:bottom-20 md:bottom-28 left-4 md:left-10 z-30 pointer-events-none max-w-[70%] sm:max-w-md md:max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={safeSlideIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.6 }}
            className="text-left pointer-events-auto"
          >
            <h1 className="hero-heading font-black uppercase text-xl sm:text-3xl md:text-[clamp(3rem,8vw,110px)] leading-[1.1] md:leading-[0.9] tracking-tighter text-white drop-shadow-2xl">
              {activeSlides[safeSlideIndex].title}
            </h1>
            <p className="text-[#D7E2EA] font-light text-[11px] sm:text-sm md:text-[clamp(0.95rem,2vw,1.3rem)] leading-snug md:leading-relaxed mt-1.5 sm:mt-4 drop-shadow-md line-clamp-2 sm:line-clamp-none">
              {activeSlides[safeSlideIndex].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
        
        <div className="mt-3 sm:mt-6 flex flex-row gap-2 sm:gap-4 pointer-events-auto">
          <a href="#services" aria-label="Explore our automotive services" className="inline-block text-center bg-brand text-black font-semibold tracking-widest uppercase text-[9px] sm:text-xs md:text-sm px-3 py-1.5 sm:px-6 sm:py-2.5 md:px-8 md:py-3.5 rounded-full hover:bg-brand-dark shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            Explore
          </a>
          <a href="#contact" aria-label="Contact SREE RAJA RAJESWARI MOTORS" className="inline-block text-center bg-transparent border border-brand/50 text-brand font-semibold tracking-widest uppercase text-[9px] sm:text-xs md:text-sm px-3 py-1.5 sm:px-6 sm:py-2.5 md:px-8 md:py-3.5 rounded-full hover:bg-brand/10 hover:border-brand transition-all duration-300">
            Contact
          </a>
        </div>
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 z-30 flex justify-between items-center px-4 md:px-10 max-w-7xl mx-auto pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${safeSlideIndex === idx ? 'w-12 slide-dot-active' : 'w-6 bg-white/20 hover:bg-white/40'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        
        <div className="flex gap-3 pointer-events-auto">
          <button onClick={prevSlide} aria-label="Previous hero slide" className="p-2 sm:p-3 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors border border-white/10 hover:border-brand/50">
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button onClick={nextSlide} aria-label="Next hero slide" className="p-2 sm:p-3 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors border border-white/10 hover:border-brand/50">
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
