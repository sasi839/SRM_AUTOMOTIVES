import React from 'react';
import { FadeIn } from './Reusable';
import { galleryData } from '../data/galleryData';

export default function ProjectsSection() {
  return (
    <section id="gallery" className="w-full bg-[#0C0C0C] py-20 md:py-32 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <FadeIn delay={0} y={40} className="mb-16">
          <h2 className="hero-heading font-black uppercase leading-none tracking-tight text-[clamp(3rem,8vw,100px)] text-white">
            Our Work
          </h2>
          <p className="text-[#D7E2EA] font-light mt-6 max-w-2xl text-lg opacity-80">
            A visual showcase of our premium automotive repair, detailing, and restoration services.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {galleryData.map((item, index) => (
            <FadeIn key={item.id} delay={index * 0.1} y={30} className="w-full h-full">
              <div className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#D7E2EA/5] border border-[#D7E2EA/20]">
                <img 
                  src={item.imageUrl} 
                  alt={item.caption} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-[#0C0C0C]/40 to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 p-6">
                  <p className="text-white/60 text-sm font-semibold tracking-widest uppercase mb-1">
                    {item.category}
                  </p>
                  <p className="text-white text-lg md:text-xl font-medium">
                    {item.caption}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
