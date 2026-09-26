import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from './Reusable';
import { galleryData } from '../data/galleryData';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const services = [
  { name: 'Mechanical Repairs', price: 'Starts at ₹999' },
  { name: 'Tinkering', price: 'Starts at ₹1,499' },
  { name: 'Painting', price: 'Starts at ₹2,999' },
  { name: 'Teflon Coating', price: 'Starts at ₹3,499' },
  { name: 'Roadside Towing', price: 'Starts at ₹1,999' },
  { name: 'Spare Parts', price: 'Price on Inspection' }
];

export default function ServicesSection() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const filteredImages = selectedCategory 
    ? galleryData.filter(item => item.category === selectedCategory) 
    : [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCategory(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  return (
    <section id="pricing" className="w-full bg-[#0C0C0C] py-20 md:py-32 px-6 md:px-10 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 md:gap-20">
        
        {/* Sticky Header */}
        <div className="w-full md:w-1/3">
          <div className="sticky top-32">
            <FadeIn delay={0.1} y={30}>
              <h2 className="hero-heading font-black uppercase text-[clamp(2.5rem,8vw,100px)] leading-[0.9] tracking-tight">
                Our <br/> Services
              </h2>
            </FadeIn>
            <FadeIn delay={0.3} y={30}>
              <p className="mt-6 text-[#D7E2EA]/70 font-light text-lg">
                Tap on any service below to view our past work in the gallery.
              </p>
            </FadeIn>
          </div>
        </div>

        {/* Services List */}
        <div className="w-full md:w-2/3 flex flex-col pt-4 md:pt-10 border-t border-[#D7E2EA/20]">
          {services.map((service, index) => (
            <FadeIn key={index} delay={0.1 + (index * 0.1)} y={20}>
              <div 
                onClick={() => {
                  setSelectedCategory(service.name);
                  setCurrentImageIndex(0);
                }}
                className="group flex flex-col sm:flex-row sm:items-center justify-between py-8 border-b border-[#D7E2EA/20] cursor-pointer transition-all duration-300 hover:bg-[#D7E2EA/5] hover:px-4 -mx-4 px-4 rounded-xl"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="text-white text-2xl md:text-3xl font-medium tracking-tight group-hover:scale-[1.02] transition-transform origin-left">
                    {service.name}
                  </h3>
                  <span className="text-[#D7E2EA]/50 text-sm font-light uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Gallery ↗
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedCategory && filteredImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSelectedCategory(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C0C0C]/95 backdrop-blur-md p-4 md:p-10"
          >
            <button 
              onClick={() => setSelectedCategory(null)}
              className="absolute top-6 right-6 text-white/50 hover:text-white bg-[#D7E2EA/5] hover:bg-white/10 rounded-full p-3 transition-colors z-50"
            >
              <X size={24} />
            </button>

            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl aspect-video sm:aspect-[16/9] bg-[#D7E2EA/5] rounded-2xl overflow-hidden shadow-2xl border border-[#D7E2EA/20]"
            >
              <img 
                src={filteredImages[currentImageIndex].imageUrl}
                alt={filteredImages[currentImageIndex].caption}
                className="w-full h-full object-cover"
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 md:p-10">
                <p className="text-[#D7E2EA] font-bold uppercase tracking-widest text-sm mb-2">
                  {filteredImages[currentImageIndex].category}
                </p>
                <h3 className="text-white text-2xl md:text-4xl font-medium">
                  {filteredImages[currentImageIndex].caption}
                </h3>
              </div>

              {filteredImages.length > 1 && (
                <>
                  <button 
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-3 backdrop-blur-md transition-all border border-[#D7E2EA/20]"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-3 backdrop-blur-md transition-all border border-[#D7E2EA/20]"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md text-white/80 text-sm px-3 py-1 rounded-full border border-[#D7E2EA/20]">
                    {currentImageIndex + 1} / {filteredImages.length}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
