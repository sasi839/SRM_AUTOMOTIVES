import { FadeIn } from './Reusable';

const WhyUsSection = () => {
  const stats = [
    { number: "10+", label: "Years of Experience", desc: "Delivering top-tier automotive care with a legacy of trust." },
    { number: "5000+", label: "Happy Customers", desc: "Consistently exceeding expectations for car owners across Tirupati." },
    { number: "20+", label: "Expert Mechanics", desc: "Highly skilled, certified technicians handling every repair with precision." },
    { number: "24/7", label: "Emergency Support", desc: "Round-the-clock towing and roadside assistance when you need it most." }
  ];

  return (
    <section id="why-us" className="bg-[#0C0C0C] text-[#D7E2EA] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        <FadeIn delay={0} y={40} className="mb-12 sm:mb-16 md:mb-20 text-center w-full">
          <h2 className="hero-heading section-accent section-accent-center font-black uppercase text-[clamp(3rem,10vw,140px)] leading-none text-center">
            Why Us
          </h2>
        </FadeIn>

        <FadeIn delay={0.1} y={30} className="mb-16 sm:mb-24 text-center max-w-4xl">
          <p className="text-[clamp(1rem,2vw,1.25rem)] font-light leading-relaxed opacity-80">
            At SRM Automotives, we don't just repair cars — we provide peace of mind. Our state-of-the-art facility is equipped to handle everything from routine maintenance to complex engine rebuilds. With a strict adherence to quality, we use only genuine spare parts and employ industry-leading techniques for tinkering, painting, and detailing.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 w-full">
          {stats.map((stat, idx) => (
            <FadeIn key={stat.label} delay={0.2 + (idx * 0.1)} y={30} className="flex flex-col items-center text-center p-6 rounded-3xl bg-surface border border-border hover:bg-surface-light hover:border-border-hover hover:-translate-y-1 gold-glow transition-all duration-300">
              <span className="font-black text-5xl md:text-6xl lg:text-7xl mb-4 bg-clip-text text-transparent bg-gradient-to-b from-brand-light to-brand">
                {stat.number}
              </span>
              <h3 className="font-medium text-xl md:text-2xl uppercase tracking-wider mb-3 text-white">
                {stat.label}
              </h3>
              <p className="font-light text-sm md:text-base opacity-70">
                {stat.desc}
              </p>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyUsSection;
