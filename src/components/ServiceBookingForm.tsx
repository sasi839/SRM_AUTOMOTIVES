import React, { useState } from 'react';
import { Send, User, Phone, MapPin } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';

interface ServiceBookingFormProps {
  serviceName: string;
}

export const ServiceBookingForm: React.FC<ServiceBookingFormProps> = ({ serviceName }) => {
  const { businessContent } = useSiteData();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.phone.trim() || !formData.location.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    
    if (formData.phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }

    // Prepare WhatsApp Message
    const message = `*New Service Request*\n\n*Service:* ${serviceName}\n*Name:* ${formData.name}\n*Phone:* ${formData.phone}\n*Location:* ${formData.location}\n\nPlease let me know the next steps.`;
    const encodedMessage = encodeURIComponent(message);
    
    // Extract base WhatsApp number or use default
    const rawNumber = businessContent.whatsapp_number || '918919594039';
    // Clean number for URL
    const cleanNumber = rawNumber.replace(/\D/g, '');
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedMessage}`;
    
    // Redirect
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-surface border border-white/10 rounded-2xl p-6 sm:p-8" id="booking-form">
      <h3 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider mb-2">
        Request This Service
      </h3>
      <p className="text-sm text-white/70 mb-6">
        Fill out the details below and our team will get back to you immediately via WhatsApp.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Service Field (Locked) */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5 ml-1">
            Selected Service
          </label>
          <div className="w-full bg-white/5 border border-white/10 text-[#E5B549] text-sm font-semibold p-3 rounded-xl cursor-not-allowed">
            {serviceName}
          </div>
        </div>

        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5 ml-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="w-4 h-4 text-white/40" />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl pl-10 p-3 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5 ml-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="w-4 h-4 text-white/40" />
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl pl-10 p-3 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
              placeholder="e.g. +91 9876543210"
              required
            />
          </div>
        </div>

        {/* Location Field */}
        <div>
          <label htmlFor="location" className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5 ml-1">
            Your Location / Area <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="w-4 h-4 text-white/40" />
            </div>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl pl-10 p-3 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
              placeholder="e.g. S.V. Autonagar, Tirupati"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-2 w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold uppercase tracking-wider text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Request via WhatsApp
        </button>
      </form>
    </div>
  );
};
