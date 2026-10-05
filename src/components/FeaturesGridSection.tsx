import { FadeIn } from './Reusable';
import { Wrench, Hammer, Paintbrush, Truck, Shield, Cog } from 'lucide-react';

const FeaturesGridSection = () => {
  const features = [
    { 
      icon: <Wrench className="w-10 h-10 mb-4 text-[#D7E2EA]" />, 
      title: "Mechanical Repairs", 
      desc: "Comprehensive engine diagnostics and mechanical fixes." 
    },
    { 
      icon: <Hammer className="w-10 h-10 mb-4 text-[#D7E2EA]" />, 
      title: "Tinkering", 
      desc: "Precision dent removal and complete chassis alignment." 
    },
    { 
      icon: <Paintbrush className="w-10 h-10 mb-4 text-[#D7E2EA]" />, 
      title: "Painting", 
      desc: "Full body paint restoration and seamless scratch repair." 
    },
    { 
      icon: <Truck className="w-10 h-10 mb-4 text-[#D7E2EA]" />, 
      title: "Roadside Towing", 
      desc: "Emergency recovery and flatbed transport to our Tirupati workshop." 
    },
    { 
      icon: <Shield className="w-10 h-10 mb-4 text-[#D7E2EA]" />, 
      title: "Teflon Coating", 
      desc: "Long-lasting ceramic protection and premium polish." 
    },
    { 
      icon: <Cog className="w-10 h-10 mb-4 text-[#D7E2EA]" />, 
      title: "Genuine Spare Parts", 
      desc: "High-quality OEM components for all vehicle makes." 
    }
  ];

  return (
    <section className="bg-[#1c1c21] text-[#D7E2EA] px-5 sm:px-8 md:px-10 py-12 sm:py-20 md:py-32 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        <FadeIn delay={0} y={40} className="mb-16 md:mb-24 text-center w-full">
          <h2 className="hero-heading font-black uppercase text-[clamp(2rem,8vw,100px)] leading-none text-center">
            Our Services
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
          {features.map((feature, idx) => (
            <FadeIn 
              key={feature.title} 
              delay={0.1 + (idx * 0.1)} 
              y={30} 
              className="flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-[#D7E2EA]/5 border border-[#D7E2EA]/10 hover:bg-[#D7E2EA]/10 transition-colors duration-300"
            >
              {feature.icon}
              <h3 className="font-medium text-xl md:text-2xl uppercase tracking-wider mb-3 text-white">
                {feature.title}
              </h3>
              <p className="font-light text-sm md:text-base opacity-70">
                {feature.desc}
              </p>
            </FadeIn>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default FeaturesGridSection;
