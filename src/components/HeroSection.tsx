import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FadeIn } from './Reusable';

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=1920&q=80",
    title: "SRM AUTOMOTIVES",
    subtitle: "The premium destination for mechanical repairs, teflon coating, and luxury vehicle restoration in Tirupati."
  },
  {
    image: "https://images.unsplash.com/photo-1635425032549-065a3962b13c?auto=format&fit=crop&w=1920&q=80",
    title: "EXPERT DETAILING",
    subtitle: "State-of-the-art facilities equipped to handle everything from routine maintenance to complex engine rebuilds."
  },
  {
    image: "https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=1920&q=80",
    title: "PRECISION REPAIRS",
    subtitle: "Highly skilled, certified technicians handling every repair with precision and genuine spare parts."
  }
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <section id="hero" className="relative h-[100dvh] w-full flex flex-col bg-[#0C0C0C] overflow-hidden">
      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.img
            key={currentSlide}
            src={heroSlides[currentSlide].image}
            alt={heroSlides[currentSlide].title}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 via-50% to-[#0C0C0C]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      </div>

      {/* Header / Navbar (Z-30) */}
      <header className="w-full z-30 relative pointer-events-auto border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="flex justify-between items-center px-4 md:px-10 py-3 max-w-7xl mx-auto">
          {/* Logo / Brand */}
          <div className="flex items-center">
             <a href="#" className="text-white font-black text-xl md:text-2xl tracking-widest uppercase">
               SRM
             </a>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex gap-8 items-center">
            {["Home", "Services", "Gallery", "Contact"].map((item) => (
              <a 
                key={item} 
                href={item === 'Home' ? '#' : `#${item.toLowerCase()}`}
                className="text-white/70 font-medium uppercase tracking-wider text-sm hover:text-white transition-colors duration-200 nav-link-premium"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Quick Contact Actions */}
          <div className="flex items-center gap-4">
            <a href="tel:+918919594039" className="hover:scale-110 transition-transform drop-shadow-md flex items-center justify-center" title="Call Us">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6 text-white">
                  <path fill="currentColor" d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                </svg>
              </div>
            </a>
            <a href="https://wa.me/918919594039" target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform drop-shadow-md flex items-center justify-center" title="WhatsApp Us">
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-8 h-8 md:w-9 md:h-9 object-contain" />
            </a>
            <a href="#contact" className="hover:scale-110 transition-transform drop-shadow-md hidden sm:flex items-center justify-center" title="Location">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg" alt="Location" className="w-8 h-8 md:w-9 md:h-9 object-contain" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Content (Z-30) */}
      <div className="flex-1 flex flex-col justify-end pb-32 sm:pb-40 px-6 md:px-10 w-full relative z-30 pointer-events-none max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="w-full text-left pointer-events-auto"
          >
            <h1 className="hero-heading font-black uppercase text-[clamp(2.5rem,8vw,110px)] leading-[0.9] tracking-tighter text-white drop-shadow-2xl">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-[#D7E2EA] font-light text-[clamp(1rem,2vw,1.3rem)] max-w-2xl leading-relaxed mt-4 sm:mt-6 drop-shadow-md">
              {heroSlides[currentSlide].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
        
        <FadeIn delay={0.8} className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6 pointer-events-auto">
          <a href="#services" className="inline-block text-center bg-brand text-black font-semibold tracking-wider uppercase px-8 py-3.5 rounded-full hover:bg-brand-dark shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            Explore Services
          </a>
          <a href="#contact" className="inline-block text-center bg-transparent border-2 border-brand/50 text-brand font-semibold tracking-wider uppercase px-8 py-3.5 rounded-full hover:bg-brand/10 hover:border-brand transition-all duration-300">
            Contact Us
          </a>
        </FadeIn>
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 z-30 flex justify-between items-center px-6 md:px-10 max-w-7xl mx-auto pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-12 slide-dot-active' : 'w-6 bg-white/20 hover:bg-white/40'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        
        <div className="flex gap-3 pointer-events-auto">
          <button onClick={prevSlide} className="p-2 sm:p-3 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors border border-white/10 hover:border-brand/50">
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button onClick={nextSlide} className="p-2 sm:p-3 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors border border-white/10 hover:border-brand/50">
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
