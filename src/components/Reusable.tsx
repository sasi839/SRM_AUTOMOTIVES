import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const ContactButton = () => {
  return (
    <a 
      href="#contact"
      className="inline-flex items-center justify-center rounded-full text-white font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base outline-none transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 active:scale-95"
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #C8A44E 50%, #9A7B35 100%)',
        boxShadow: '0 4px 15px rgba(200, 164, 78, 0.3)'
      }}
    >
      Contact Us
    </a>
  );
};

export const LiveProjectButton = () => {
  return (
    <button 
      className="rounded-full border-2 border-brand text-brand font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base hover:bg-brand/10 transition-colors duration-300 active:scale-95"
    >
      Learn More
    </button>
  );
};

export const FadeIn = ({ children, delay = 0, duration = 0.7, x = 0, y = 30, className = '', as = 'div' }: any) => {
  const Component = motion.create(as as any);
  
  return (
    <Component
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </Component>
  );
};

export const Magnet = ({ children, padding = 150, strength = 3, activeTransition = "transform 0.3s ease-out", inactiveTransition = "transform 0.6s ease-in-out", className = '' }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const { left, top, width, height } = ref.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < width / 2 + padding) {
        setIsActive(true);
        setPosition({ x: distanceX / strength, y: distanceY / strength });
      } else {
        setIsActive(false);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [padding, strength]);

  return (
    <div 
      ref={ref} 
      className={className}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: isActive ? activeTransition : inactiveTransition,
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  );
};

export const AnimatedText = ({ text, className = '' }: { text: string, className?: string }) => {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.2']
  });

  const characters = text.split('');

  return (
    <p ref={containerRef} className={className + " relative flex flex-wrap justify-center"}>
      {characters.map((char, i) => {
        const start = i / characters.length;
        const end = start + (1 / characters.length);
        const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);
        return (
          <span key={i} className="relative">
            <span className="invisible">{char === ' ' ? '\u00A0' : char}</span>
            <motion.span className="absolute top-0 left-0" style={{ opacity }}>
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          </span>
        );
      })}
    </p>
  );
};
