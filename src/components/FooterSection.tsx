import { FadeIn } from './Reusable';
import { MapPin, Phone, MessageCircle, Mail } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';

const FooterSection = () => {
  const { businessContent } = useSiteData();

  const phoneHref = `tel:${businessContent.primary_phone || '+918919594039'}`;
  const mailHref = `mailto:${businessContent.email || 'Lokesh.lvrn@gmail.com'}`;
  const whatsappHref = `https://api.whatsapp.com/send?phone=${businessContent.whatsapp_number || '918919594039'}`;
  const directionsUrl = businessContent.google_maps_url || 'https://maps.app.goo.gl/dnHpFsgdPKao7ALk7';

  // Format address text for display
  const addressLines = (businessContent.address || 'SREE RAJA RAJESWARI MOTORS\n#184, Renigunta Road\nS.V. Autonagar, Tirupati\nAndhra Pradesh')
    .split('\n');

  return (
    <footer id="contact" className="bg-[#1c1c21] text-[#D7E2EA] px-4 sm:px-8 md:px-10 py-12 sm:py-24 border-t border-[#D7E2EA]/10 relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 md:gap-20">
        
        {/* Contact Info */}
        <div className="flex-1 flex flex-col gap-8">
          <FadeIn delay={0} y={30} className="flex items-center gap-3 sm:gap-4 mb-6">
            <img src="/srm-logo.png" alt="SREE RAJA RAJESWARI MOTORS Logo - Autonagar Tirupati" className="h-12 sm:h-14 md:h-16 w-auto object-contain drop-shadow-xl" />
            <h2 className="font-black uppercase text-3xl sm:text-4xl md:text-5xl tracking-tight leading-none text-white">
              Contact Us
            </h2>
          </FadeIn>
          
          <FadeIn delay={0.1} y={30} className="flex items-start gap-4">
            <MapPin className="w-6 h-6 shrink-0 mt-1 text-brand" />
            <div className="flex flex-col">
              <span className="font-medium uppercase tracking-widest text-sm text-[#D7E2EA]/60 mb-1">Address</span>
              <address className="not-italic font-light text-lg sm:text-xl">
                {addressLines.map((line, idx) => (
                  <span key={idx}>
                    {line}
                    {idx < addressLines.length - 1 && <br />}
                  </span>
                ))}
              </address>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.2} y={30} className="flex items-start gap-4">
            <Phone className="w-6 h-6 shrink-0 mt-1 text-brand" />
            <div className="flex flex-col">
              <span className="font-medium uppercase tracking-widest text-sm text-[#D7E2EA]/60 mb-1">Phone / Breakdown Towing</span>
              <a href={phoneHref} aria-label="Call SREE RAJA RAJESWARI MOTORS phone number" className="font-light text-lg sm:text-xl hover:text-brand transition-colors duration-300">
                {businessContent.primary_phone || '+91 8919594039'}
              </a>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.25} y={30} className="flex items-start gap-4">
            <Mail className="w-6 h-6 shrink-0 mt-1 text-brand" />
            <div className="flex flex-col">
              <span className="font-medium uppercase tracking-widest text-sm text-[#D7E2EA]/60 mb-1">Email</span>
              <a href={mailHref} aria-label="Send email to SREE RAJA RAJESWARI MOTORS" className="font-light text-lg sm:text-xl hover:text-brand transition-colors duration-300 break-all">
                {businessContent.email || 'Lokesh.lvrn@gmail.com'}
              </a>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.3} y={30} className="mt-4">
            <a 
              href={whatsappHref} 
              target="_blank" 
              rel="noreferrer"
              aria-label="Chat with SREE RAJA RAJESWARI MOTORS on WhatsApp"
              className="inline-flex items-center gap-3 rounded-full border-2 border-brand text-brand font-medium uppercase tracking-widest px-8 py-3.5 hover:bg-brand/10 transition-colors duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Us
            </a>
          </FadeIn>
        </div>
        
        {/* Google Maps Embed */}
        <div className="flex-1 w-full min-h-[300px] h-[300px] sm:min-h-[450px] sm:h-[450px] rounded-3xl overflow-hidden border-2 border-[#D7E2EA]/20 relative shrink-0">
          <iframe 
            src="https://www.google.com/maps?q=184,+Renigunta+Road,+S.V.+Autonagar,+Tirupati&output=embed" 
            title="SREE RAJA RAJESWARI MOTORS Location Map in Tirupati"
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0"
          ></iframe>
          
          {/* Get Directions Button Overlaid on Map */}
          <a 
            href={directionsUrl} 
            target="_blank" 
            rel="noreferrer"
            aria-label="Get directions to SREE RAJA RAJESWARI MOTORS on Google Maps"
            className="absolute bottom-6 right-6 inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA] bg-[#1c1c21]/90 backdrop-blur-md text-[#D7E2EA] font-medium uppercase tracking-widest px-6 py-3 hover:bg-brand hover:text-black hover:border-brand transition-colors duration-300 text-sm z-10 shadow-xl"
          >
            <MapPin className="w-4 h-4" />
            Directions
          </a>
        </div>

      </div>
      
      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-12 md:mt-20 pt-6 border-t border-[#D7E2EA]/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-light text-[#D7E2EA]/40">
        <p>&copy; {new Date().getFullYear()} SREE RAJA RAJESWARI MOTORS. All rights reserved.</p>
        <a 
          href="/admin" 
          className="bg-brand/10 text-brand hover:bg-brand hover:text-black border border-brand/20 transition-colors duration-300 flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-widest uppercase"
        >
          Admin Login
        </a>
      </div>
    </footer>
  );
};

export default FooterSection;
