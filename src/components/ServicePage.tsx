import React from 'react';
import { 
  Wrench, Phone, MessageCircle, MapPin, ArrowLeft, CheckCircle2, ChevronRight, ArrowRight 
} from 'lucide-react';
import { SERVICE_DETAILS, type ServiceDetail } from '../data/serviceDetails';
import { useSiteData } from '../context/SiteDataContext';
import FooterSection from './FooterSection';
import EmergencyBreakdownButton from './EmergencyBreakdownButton';

interface ServicePageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const ServicePage: React.FC<ServicePageProps> = ({ slug, onNavigate }) => {
  const { businessContent } = useSiteData();
  const service: ServiceDetail | undefined = SERVICE_DETAILS[slug];

  if (!service) {
    return (
      <div className="min-h-screen bg-[#1c1c21] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Service Not Found</h1>
        <p className="text-white/60 mb-6">The requested service page does not exist.</p>
        <button 
          onClick={() => onNavigate('/')}
          className="bg-brand text-black px-6 py-2.5 rounded-full font-semibold uppercase tracking-wider text-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>
    );
  }

  const phoneHref = `tel:${businessContent.primary_phone || '+918919594039'}`;
  const whatsappHref = `https://api.whatsapp.com/send?phone=${businessContent.whatsapp_number || '918919594039'}`;
  const mapsUrl = businessContent.google_maps_url || 'https://maps.app.goo.gl/dnHpFsgdPKao7ALk7';

  // Get other services for internal linking
  const otherServices = Object.values(SERVICE_DETAILS).filter(s => s.slug !== slug);

  return (
    <div className="min-h-screen bg-[#1c1c21] text-[#D7E2EA] flex flex-col">
      {/* Header / Navbar */}
      <header className="w-full z-30 relative border-b border-white/10 backdrop-blur-sm bg-black/40 sticky top-0">
        <div className="flex justify-between items-center px-4 md:px-10 py-3.5 max-w-7xl mx-auto">
          <a 
            href="/" 
            onClick={(e) => { e.preventDefault(); onNavigate('/'); }}
            className="flex items-center gap-3 group"
            aria-label="SREE RAJA RAJESWARI MOTORS Homepage"
          >
            <img 
              src="/srm-logo.png" 
              width="180" 
              height="48" 
              alt="SREE RAJA RAJESWARI MOTORS Logo - Car Service Center in Tirupati" 
              className="h-9 sm:h-11 w-auto object-contain drop-shadow-xl" 
            />
            <span className="font-black text-lg sm:text-xl tracking-tighter text-white uppercase hidden sm:inline">
              SREE RAJA RAJESWARI MOTORS
            </span>
          </a>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/')}
              className="text-white/80 hover:text-brand text-xs sm:text-sm uppercase tracking-widest font-medium flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Home
            </button>
            <a 
              href={phoneHref}
              className="bg-brand text-black px-4 py-2 rounded-full font-bold uppercase text-xs tracking-wider hover:bg-brand-light transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> Call Now
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 py-8 md:py-16">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8 text-xs sm:text-sm text-white/50 flex items-center gap-2 flex-wrap">
          <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('/'); }} className="hover:text-brand transition-colors">Home</a>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          <a href="/#services" onClick={(e) => { e.preventDefault(); onNavigate('/#services'); }} className="hover:text-brand transition-colors">Services</a>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          <span className="text-brand font-medium">{service.name}</span>
        </nav>

        {/* Hero Banner Section */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-surface mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Column */}
            <div className="relative aspect-[16/9] lg:aspect-auto h-full min-h-[260px] sm:min-h-[340px]">
              <img 
                src={service.image} 
                alt={`${service.h1} at SREE RAJA RAJESWARI MOTORS`} 
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c21] via-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#1c1c21]/90" />
            </div>

            {/* Title & Tagline Column */}
            <div className="p-6 sm:p-10 md:p-12 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 text-brand text-xs uppercase tracking-widest font-semibold mb-3">
                <Wrench className="w-4 h-4" /> SRM • Tirupati
              </div>
              <h1 className="hero-heading font-black text-2xl sm:text-4xl md:text-5xl uppercase tracking-tight text-white leading-tight mb-4">
                {service.h1}
              </h1>
              <p className="text-white/80 font-light text-sm sm:text-base leading-relaxed mb-6">
                {service.tagline}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a 
                  href={phoneHref} 
                  className="bg-brand text-black font-semibold uppercase tracking-wider text-xs sm:text-sm px-6 py-3 rounded-full hover:bg-brand-light transition-all flex items-center gap-2 shadow-lg"
                >
                  <Phone className="w-4 h-4" /> Call Service Desk
                </a>
                <a 
                  href={whatsappHref} 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-[#25D366] text-white font-semibold uppercase tracking-wider text-xs sm:text-sm px-6 py-3 rounded-full hover:bg-[#20ba5a] transition-all flex items-center gap-2 shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Description Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-14 mb-16">
          
          {/* Main Service Copy */}
          <div className="lg:col-span-2 flex flex-col gap-6 text-[#D7E2EA]/90 font-light leading-relaxed text-sm sm:text-base">
            <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wide border-b border-white/10 pb-3">
              About {service.name} at SREE RAJA RAJESWARI MOTORS
            </h2>
            
            {service.description.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}

            <div className="mt-4 p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand" /> Workshop Location in Tirupati
              </h3>
              <p className="text-xs sm:text-sm text-white/70">
                <strong>SREE RAJA RAJESWARI MOTORS</strong> — #184, Renigunta Road, S.V. Autonagar, Tirupati, Andhra Pradesh.
              </p>
              <a 
                href={mapsUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-brand text-xs uppercase tracking-widest font-semibold hover:underline mt-1"
              >
                Get Directions on Google Maps <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Key Features & Service Checklist Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-6 pb-3 border-b border-white/10">
                Service Highlights
              </h3>
              <ul className="flex flex-col gap-4 text-xs sm:text-sm text-white/90">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Contact Box */}
            <div className="bg-brand/10 border border-brand/30 rounded-2xl p-6 text-center flex flex-col items-center">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">
                Need Immediate Assistance?
              </h3>
              <p className="text-xs text-white/70 mb-4">
                Call our team directly or share your location via WhatsApp.
              </p>
              <a 
                href={phoneHref} 
                className="w-full bg-brand text-black font-bold uppercase tracking-wider text-xs py-3 rounded-xl hover:bg-brand-light transition-colors mb-2 block"
              >
                {businessContent.primary_phone || '+91 8919594039'}
              </a>
            </div>
          </div>
        </div>

        {/* Related Services Navigation Section */}
        <section className="pt-10 border-t border-white/10">
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider mb-8">
            Other Automotive Services in Tirupati
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {otherServices.map((item) => (
              <a 
                key={item.slug}
                href={`/services/${item.slug}`}
                onClick={(e) => { e.preventDefault(); onNavigate(`/services/${item.slug}`); }}
                className="p-4 rounded-xl bg-surface border border-border hover:border-brand/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group"
              >
                <div className="flex flex-col">
                  <span className="text-white font-medium text-sm group-hover:text-brand transition-colors">
                    {item.name}
                  </span>
                  <span className="text-[#D7E2EA]/50 text-xs line-clamp-1">
                    Tirupati Car Service
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-brand opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </a>
            ))}
          </div>
        </section>

      </main>

      {/* Footer & Floating Emergency Badge */}
      <FooterSection />
      <EmergencyBreakdownButton />
    </div>
  );
};

export default ServicePage;
