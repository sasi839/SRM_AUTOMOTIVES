import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Loader2 } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';

const EmergencyBreakdownButton = () => {
  const { businessContent } = useSiteData();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const whatsappNumber = businessContent.whatsapp_number || '918919594039';

  const handleEmergencyClick = () => {
    if (isExpanded) {
      // Already expanded, trigger the location + WhatsApp flow
      sendEmergencyWhatsApp();
    } else {
      setIsExpanded(true);
      setError(null);
    }
  };

  const sendEmergencyWhatsApp = () => {
    setIsLocating(true);
    setError(null);

    if (!navigator.geolocation) {
      // Fallback: open WhatsApp without location
      const fallbackMsg = encodeURIComponent(
        `🚨 *EMERGENCY BREAKDOWN SERVICE* 🚨\n\nI need immediate roadside assistance!\n\n📍 Location: (Unable to detect - please share manually)\n\n🚗 SRM - Emergency Breakdown Service`
      );
      window.open(`https://wa.me/${whatsappNumber}?text=${fallbackMsg}`, '_blank');
      setIsLocating(false);
      setIsExpanded(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        
        const message = encodeURIComponent(
          `🚨 *EMERGENCY BREAKDOWN SERVICE* 🚨\n\nI need immediate roadside assistance!\n\n📍 *My Live Location:*\n${mapsLink}\n\n📌 Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n\n🚗 SRM - Emergency Breakdown Service`
        );

        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
        setIsLocating(false);
        setIsExpanded(false);
      },
      (geoError) => {
        // On error, still open WhatsApp but without exact location
        console.error('Geolocation error:', geoError);
        
        if (geoError.code === 1) {
          setError('Location access denied. Tap again to send without location.');
          // Still allow sending without location on next tap
          const fallbackMsg = encodeURIComponent(
            `🚨 *EMERGENCY BREAKDOWN SERVICE* 🚨\n\nI need immediate roadside assistance!\n\n📍 Location: (Permission denied - please share location manually in chat)\n\n🚗 SRM - Emergency Breakdown Service`
          );
          setTimeout(() => {
            window.open(`https://wa.me/${whatsappNumber}?text=${fallbackMsg}`, '_blank');
            setIsLocating(false);
            setIsExpanded(false);
            setError(null);
          }, 1500);
        } else {
          const fallbackMsg = encodeURIComponent(
            `🚨 *EMERGENCY BREAKDOWN SERVICE* 🚨\n\nI need immediate roadside assistance!\n\n📍 Location: (Could not detect - please share manually)\n\n🚗 SRM - Emergency Breakdown Service`
          );
          window.open(`https://wa.me/${whatsappNumber}?text=${fallbackMsg}`, '_blank');
          setIsLocating(false);
          setIsExpanded(false);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-3">
      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-red-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-red-500/10 w-[280px] sm:w-[320px] backdrop-blur-xl"
          >
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
                setError(null);
              }}
              className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center gap-3">
              {/* Badge */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-red-500/40 shadow-lg shadow-red-500/20">
                <img
                  src="/emergency-breakdown.png"
                  width="80"
                  height="80"
                  alt="Emergency Breakdown Service"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover scale-[1.3]"
                />
              </div>

              <div>
                <h3 className="text-white font-black text-sm sm:text-base uppercase tracking-wider">
                  Emergency Breakdown
                </h3>
                <p className="text-red-400 text-[10px] sm:text-xs uppercase tracking-widest font-semibold mt-0.5">
                  Roadside Car Assistance
                </p>
              </div>

              <p className="text-[#D7E2EA]/60 text-[11px] sm:text-xs leading-relaxed">
                Tap below to instantly share your <strong className="text-white">live location</strong> with our team via WhatsApp for immediate assistance.
              </p>

              {error && (
                <p className="text-amber-400 text-[10px] bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                  {error}
                </p>
              )}

              {/* CTA Button */}
              <button
                onClick={sendEmergencyWhatsApp}
                disabled={isLocating}
                className="w-full mt-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold uppercase tracking-wider text-xs sm:text-sm py-3 sm:py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 hover:shadow-red-500/40 disabled:opacity-60"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    Detecting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    Send Location & Get Help
                  </>
                )}
              </button>

              <p className="text-[#D7E2EA]/30 text-[9px] uppercase tracking-wider">
                Connects via WhatsApp instantly
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Badge Button */}
      <motion.button
        onClick={handleEmergencyClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative group"
        aria-label="Emergency Breakdown Service"
      >
        {/* Pulse ring animation */}
        <span className="absolute inset-0 rounded-full bg-red-500/30 animate-[emergency-ping_2s_ease-in-out_infinite]" />
        <span className="absolute inset-0 rounded-full bg-red-500/15 animate-[emergency-ping_2s_ease-in-out_infinite_0.5s]" />
        
        {/* Button */}
        <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden border-[3px] border-red-500/60 shadow-2xl shadow-red-500/30 group-hover:border-red-400 group-hover:shadow-red-400/40 transition-all duration-300 bg-[#1a1a1a]">
          <img
            src="/emergency-breakdown.png"
            width="72"
            height="72"
            alt="Emergency Breakdown Service"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover scale-[1.3]"
            draggable={false}
          />
        </div>

        {/* Label tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[#1a1a1a] border border-red-500/30 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl">
          <span className="text-red-400">SOS</span> Emergency Breakdown
          {/* Arrow */}
          <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-[#1a1a1a]" />
        </div>
      </motion.button>
    </div>
  );
};

export default EmergencyBreakdownButton;
