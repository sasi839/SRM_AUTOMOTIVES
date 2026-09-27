import { FadeIn, AnimatedText, ContactButton } from './Reusable';

const AboutSection = () => {
  return (
    <section id="about" className="min-h-screen relative flex flex-col items-center justify-center px-4 sm:px-8 md:px-10 py-16 md:py-20 overflow-hidden">
      
      {/* Decorative Images */}
      <FadeIn delay={0.1} x={-80} y={0} duration={0.9} className="absolute top-[2%] sm:top-[4%] left-1 sm:left-[2%] md:left-[4%]">
        <img 
          src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=300&q=80" 
          alt="Garage" 
          className="w-[50px] sm:w-[160px] md:w-[210px] rounded-xl sm:rounded-[30px] object-cover aspect-square opacity-30 sm:opacity-60 mix-blend-luminosity hover:ring-2 hover:ring-brand/30 transition-all duration-300"
        />
      </FadeIn>
      
      <FadeIn delay={0.15} x={80} y={0} duration={0.9} className="absolute top-[2%] sm:top-[4%] right-1 sm:right-[2%] md:right-[4%]">
        <img 
          src="https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=300&q=80" 
          alt="Engine" 
          className="w-[50px] sm:w-[160px] md:w-[210px] rounded-xl sm:rounded-[30px] object-cover aspect-square opacity-30 sm:opacity-60 mix-blend-luminosity hover:ring-2 hover:ring-brand/30 transition-all duration-300"
        />
      </FadeIn>
      
      <FadeIn delay={0.25} x={-80} y={0} duration={0.9} className="absolute bottom-[4%] sm:bottom-[8%] left-1 sm:left-[6%] md:left-[10%]">
        <img 
          src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=300&q=80" 
          alt="Wheel" 
          className="w-[45px] sm:w-[140px] md:w-[180px] rounded-xl sm:rounded-[30px] object-cover aspect-square opacity-30 sm:opacity-60 mix-blend-luminosity hover:ring-2 hover:ring-brand/30 transition-all duration-300"
        />
      </FadeIn>
      
      <FadeIn delay={0.3} x={80} y={0} duration={0.9} className="absolute bottom-[4%] sm:bottom-[8%] right-1 sm:right-[6%] md:right-[10%]">
        <img 
          src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=300&q=80" 
          alt="Tools" 
          className="w-[60px] sm:w-[170px] md:w-[220px] rounded-xl sm:rounded-[30px] object-cover aspect-square opacity-30 sm:opacity-60 mix-blend-luminosity hover:ring-2 hover:ring-brand/30 transition-all duration-300"
        />
      </FadeIn>

      {/* Content */}
      <div className="flex flex-col items-center text-center z-10 w-full max-w-4xl mx-auto">
        <FadeIn delay={0} y={40} className="mb-10 sm:mb-14 md:mb-16 w-full">
          <h2 className="hero-heading section-accent section-accent-center font-black uppercase leading-none tracking-tight text-[clamp(2.5rem,12vw,160px)]">
            About Us
          </h2>
        </FadeIn>
        
        {/* Short punchy Animated Text */}
        <AnimatedText 
          text="SRM Automotives began with a simple idea: car care shouldn't feel like a hassle." 
          className="text-white font-medium leading-relaxed max-w-2xl text-[clamp(1.1rem,2.5vw,1.8rem)] mb-10"
        />

        {/* Clear detailed paragraphs using FadeIn to prevent browser lag from thousands of spans */}
        <div className="flex flex-col gap-6 text-[#D7E2EA]/80 font-light leading-relaxed text-[clamp(0.9rem,1.5vw,1.1rem)] max-w-3xl mb-16 sm:mb-20 md:mb-24 px-4 text-left md:text-center">
          <FadeIn delay={0.1}>
            <p>
              Based in Autonagar, Tirupati, we've grown into a full-service garage that car owners trust. Our team handles the full spectrum of car care under one roof. Mechanical repairs are our foundation — engine diagnostics, servicing, and fixes done right the first time.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <p>
              For bodywork, our tinkering and painting services restore your car's look with precision finishing. We also help you protect your investment long-term with teflon coating that shields your paint from scratches. When parts need replacing, we only use genuine spare parts so you get reliability that lasts.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.3}>
            <p>
              Accidents and breakdowns rarely happen at a good time. That's why we run a <strong className="text-brand">24/7 emergency roadside towing service</strong> — one call, and we're on our way to get you and your car back on track, day or night.
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="text-white font-medium italic">
              At SRM Automotives, we're not just fixing cars — we're building trust with every customer who walks through our doors. We're here to keep you moving.
            </p>
          </FadeIn>
        </div>
        
        <FadeIn delay={0.5} y={30}>
          <ContactButton />
        </FadeIn>
      </div>
    </section>
  );
};

export default AboutSection;
