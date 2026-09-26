import { FadeIn, ContactButton } from './Reusable';
import { motion } from 'framer-motion';
import { Phone, MessageCircle } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="hero" className="h-screen flex flex-col overflow-x-clip relative bg-[#0C0C0C]">
      
      {/* Soft spotlight behind the car */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-gradient-to-tr from-[#7621B0]/30 to-[#BE4C00]/20 rounded-full blur-[100px] z-0 pointer-events-none"
      />

      {/* The Car */}
      <div className="absolute inset-0 z-10 flex items-center justify-center sm:justify-end sm:pr-[5%] pointer-events-none">
        <motion.div
          initial={{ x: '50vw', opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-[120%] sm:w-[70vw] max-w-[1200px] flex items-center justify-center mt-32 sm:mt-10 overflow-hidden"
        >
          {/* Light sweep overlay */}
          <motion.div
            initial={{ left: '-100%' }}
            animate={{ left: '200%' }}
            transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
            className="absolute top-0 bottom-0 w-[50%] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-30deg] z-20 pointer-events-none mix-blend-overlay"
          />
          
          <motion.img 
            src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80"
            alt="Luxury Car"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
            className="w-full h-auto object-contain mix-blend-screen opacity-90 drop-shadow-2xl"
            style={{ maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}
          />
        </motion.div>
      </div>

      {/* Navbar (Z-30) */}
      <FadeIn delay={0} y={-20} className="w-full z-30 relative pointer-events-auto">
        <nav className="flex justify-between items-center px-6 md:px-10 pt-6 md:pt-8 w-full">
          {["About", "Why Us", "Pricing", "Contact"].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm md:text-lg lg:text-[1.4rem] hover:opacity-70 transition-opacity duration-200"
            >
              {item}
            </a>
          ))}
        </nav>
      </FadeIn>

      {/* Hero Content (Z-30) */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-10 w-full relative z-30 pointer-events-none">
        {/* Stagger text AFTER car animation (delay ~1.4s) */}
        <FadeIn delay={1.4} y={30}>
          <h1 className="hero-heading font-black uppercase text-[clamp(4rem,12vw,180px)] leading-[0.85] tracking-tighter w-full text-left pointer-events-auto drop-shadow-xl">
            SRM <br /> MOTORS
          </h1>
        </FadeIn>

        <FadeIn delay={1.6} y={30} className="mt-6 md:mt-8 pointer-events-auto">
          <p className="text-[#D7E2EA] font-light text-[clamp(1rem,2vw,1.5rem)] max-w-xl leading-relaxed opacity-90 drop-shadow-md">
            The premium destination for mechanical repairs, teflon coating, and luxury vehicle restoration in Tirupati.
          </p>
        </FadeIn>
        
        <FadeIn delay={1.8} y={30} className="mt-10 md:mt-12 flex gap-4 md:gap-6 pointer-events-auto">
          <ContactButton />
          <a 
            href="tel:+918919594039" 
            className="flex items-center justify-center rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] p-3 md:p-4 hover:bg-[rgba(215,226,234,0.1)] transition-colors duration-300 outline-none active:scale-95"
            title="Call Us"
          >
            <Phone className="w-5 h-5 md:w-6 md:h-6" />
          </a>
          <a 
            href="https://wa.me/918919594039" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center justify-center rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] p-3 md:p-4 hover:bg-[rgba(215,226,234,0.1)] transition-colors duration-300 outline-none active:scale-95"
            title="WhatsApp Us"
          >
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
          </a>
        </FadeIn>
      </div>
    </section>
  );
};

export default HeroSection;
