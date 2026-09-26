import { FadeIn } from './Reusable';
import { MapPin, Phone, MessageCircle, Mail } from 'lucide-react';

const FooterSection = () => {
  return (
    <footer id="contact" className="bg-[#0C0C0C] text-[#D7E2EA] px-5 sm:px-8 md:px-10 py-16 sm:py-24 border-t border-[#D7E2EA]/10 relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 md:gap-20">
        
        {/* Contact Info */}
        <div className="flex-1 flex flex-col gap-8">
          <FadeIn delay={0} y={30}>
            <h2 className="font-black uppercase text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none text-white mb-6">
              Contact Us
            </h2>
          </FadeIn>
          
          <FadeIn delay={0.1} y={30} className="flex items-start gap-4">
            <MapPin className="w-6 h-6 shrink-0 mt-1" />
            <div className="flex flex-col">
              <span className="font-medium uppercase tracking-widest text-sm text-[#D7E2EA]/60 mb-1">Address</span>
              <p className="font-light text-lg sm:text-xl">
                SRM Motors<br />
                #184, Renigunta Road<br />
                S.V. Autonagar, Tirupati<br />
                Andhra Pradesh
              </p>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.2} y={30} className="flex items-start gap-4">
            <Phone className="w-6 h-6 shrink-0 mt-1" />
            <div className="flex flex-col">
              <span className="font-medium uppercase tracking-widest text-sm text-[#D7E2EA]/60 mb-1">Phone / 24/7 Towing</span>
              <a href="tel:+918919594039" className="font-light text-lg sm:text-xl hover:text-white transition-colors">+91 8919594039</a>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.25} y={30} className="flex items-start gap-4">
            <Mail className="w-6 h-6 shrink-0 mt-1" />
            <div className="flex flex-col">
              <span className="font-medium uppercase tracking-widest text-sm text-[#D7E2EA]/60 mb-1">Email</span>
              <a href="mailto:Lokesh.lvrn@gimil.com" className="font-light text-lg sm:text-xl hover:text-white transition-colors break-all">Lokesh.lvrn@gimil.com</a>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.3} y={30} className="mt-4">
            <a 
              href="https://wa.me/918919594039" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest px-8 py-3.5 hover:bg-[#D7E2EA]/10 transition-colors duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Us
            </a>
          </FadeIn>
        </div>
        
        {/* Google Maps Embed */}
        <FadeIn delay={0.4} y={30} className="flex-1 w-full h-[350px] sm:h-[450px] rounded-3xl overflow-hidden border-2 border-[#D7E2EA]/20 relative">
          <iframe 
            src="https://www.google.com/maps?q=184,+Renigunta+Road,+S.V.+Autonagar,+Tirupati&output=embed" 
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: 'grayscale(100%) invert(90%) contrast(1.2)' }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0"
          ></iframe>
          
          {/* Get Directions Button Overlaid on Map */}
          <a 
            href="https://maps.app.goo.gl/dnHpFsgdPKao7ALk7" 
            target="_blank" 
            rel="noreferrer"
            className="absolute bottom-6 right-6 inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA] bg-[#0C0C0C]/80 backdrop-blur-md text-[#D7E2EA] font-medium uppercase tracking-widest px-6 py-2.5 hover:bg-[#D7E2EA] hover:text-[#0C0C0C] transition-colors duration-300 text-sm z-10 shadow-xl"
          >
            <MapPin className="w-4 h-4" />
            Directions
          </a>
        </FadeIn>

      </div>
    </footer>
  );
};

export default FooterSection;
