import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { SiteContent, SiteImage } from '../lib/supabase';
import { galleryData } from '../data/galleryData';
import { 
  Wrench, Hammer, PaintBucket, Sparkles, Truck, 
  Settings, Wind, LifeBuoy, Car, ShieldCheck 
} from 'lucide-react';

// Static Defaults
const DEFAULT_BUSINESS_CONTENT: SiteContent = {
  id: '',
  business_name: 'SREE RAJA RAJESWARI MOTORS',
  owner_name: 'Lokesh',
  primary_phone: '+91 8919594039',
  secondary_phone: null,
  whatsapp_number: '918919594039',
  email: 'Lokesh.lvrn@gmail.com',
  address: 'SREE RAJA RAJESWARI MOTORS\n#184, Renigunta Road\nS.V. Autonagar, Tirupati\nAndhra Pradesh',
  google_maps_url: 'https://maps.app.goo.gl/dnHpFsgdPKao7ALk7',
  created_at: '',
  updated_at: '',
};

const DEFAULT_SERVICES = [
  { name: 'Mechanical Repairs', icon: Wrench, desc: 'Complete engine diagnostics and expert mechanical fixes.', image: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tinkering', icon: Hammer, desc: 'Precision dent removal and structural auto body repairs.', image: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Painting', icon: PaintBucket, desc: 'Premium color matching and full-body spray painting.', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80' },
  { name: 'Teflon Coating', icon: Sparkles, desc: 'Advanced surface protection for a long-lasting shine.', image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80' },
  { name: 'A/C Repairs', icon: Wind, desc: 'Complete air conditioning service and refrigerant recharge.', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Insurance Claims', icon: ShieldCheck, desc: 'Hassle-free processing of accidental insurance claims.', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Roadside Assistance', icon: LifeBuoy, desc: 'Emergency support when you are stranded on the road.', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80' },
  { name: 'Breakdown Services', icon: Car, desc: 'On-spot troubleshooting for unexpected vehicle breakdowns.', image: 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Roadside Towing', icon: Truck, desc: 'Safe and secure vehicle towing to our service center.', image: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=800&q=80' },
  { name: 'Spare Parts', icon: Settings, desc: '100% genuine OEM spare parts for all major brands.', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80' }
];

export interface PublicHeroSlide {
  image: string;
  title: string;
  subtitle: string;
}

export interface PublicServiceItem {
  name: string;
  icon: typeof Wrench;
  desc: string;
  image: string;
}

export interface PublicGalleryItem {
  id: string;
  category: string;
  imageUrl: string;
  caption: string;
  subtitle?: string;
}

interface SiteDataContextType {
  businessContent: SiteContent;
  heroSlides: PublicHeroSlide[];
  services: PublicServiceItem[];
  galleryItems: PublicGalleryItem[];
  marqueeItems: PublicGalleryItem[];
  aboutItems: PublicGalleryItem[];
  whyUsItems: PublicGalleryItem[];
  loading: boolean;
}

const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined);

const getServiceIcon = (title: string) => {
  const normalizedTitle = title.toLowerCase().trim();
  switch (normalizedTitle) {
    case 'mechanical repairs': return Wrench;
    case 'tinkering': return Hammer;
    case 'painting': return PaintBucket;
    case 'teflon coating': return Sparkles;
    case 'a/c repairs': return Wind;
    case 'insurance claims': return ShieldCheck;
    case 'roadside assistance': return LifeBuoy;
    case 'breakdown services': return Car;
    case 'roadside towing': return Truck;
    case 'spare parts': return Settings;
    default: return Wrench;
  }
};

export const SiteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businessContent, setBusinessContent] = useState<SiteContent>(DEFAULT_BUSINESS_CONTENT);
  const [heroSlides, setHeroSlides] = useState<PublicHeroSlide[]>([]);
  const [services, setServices] = useState<PublicServiceItem[]>(DEFAULT_SERVICES);
  const [galleryItems, setGalleryItems] = useState<PublicGalleryItem[]>(
    galleryData.map(g => ({ id: g.id, category: g.category, imageUrl: g.imageUrl, caption: g.caption }))
  );
  const [marqueeItems, setMarqueeItems] = useState<PublicGalleryItem[]>([]);
  const [aboutItems, setAboutItems] = useState<PublicGalleryItem[]>([]);
  const [whyUsItems, setWhyUsItems] = useState<PublicGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPublicSiteData = async () => {
    try {
      // 1. Fetch Business Content
      const { data: contentData } = await supabase
        .from('site_content')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (contentData) {
        setBusinessContent({
          ...DEFAULT_BUSINESS_CONTENT,
          ...(contentData as Partial<SiteContent>),
        });
      }

      // 2. Fetch Active Site Images
      const { data: imagesData } = await supabase
        .from('site_images')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (imagesData && imagesData.length > 0) {
        const items = imagesData as SiteImage[];

        // Process Hero Slides
        const dbHeroSlides = items
          .filter((img) => img.section === 'hero')
          .map((img) => ({
            image: img.image_url,
            title: img.title || 'SREE RAJA RAJESWARI MOTORS',
            subtitle: img.subtitle || '',
          }));

        if (dbHeroSlides.length > 0) {
          setHeroSlides(dbHeroSlides);
        }

        // Process Services Images
        const dbServices = items.filter((img) => img.section === 'service');
        if (dbServices.length > 0) {
          const mappedServices = dbServices.map(img => ({
            name: img.title || 'Service',
            icon: getServiceIcon(img.title || ''),
            desc: img.subtitle || '',
            image: img.image_url,
          }));
          setServices(mappedServices);
        }

        // Process Gallery Items
        const dbGallery = items
          .filter((img) => img.section === 'gallery' && !['Marquee', 'About', 'WhyUs'].includes(img.category || ''))
          .map((img) => ({
            id: img.id,
            category: img.category || 'Work',
            imageUrl: img.image_url,
            caption: img.title || 'SREE RAJA RAJESWARI MOTORS',
          }));

        if (dbGallery.length > 0) {
          setGalleryItems(dbGallery);
        }

        // Process Marquee Items
        const dbMarquee = items
          .filter((img) => img.section === 'gallery' && img.category === 'Marquee')
          .map((img) => ({
            id: img.id,
            category: img.category || 'Marquee',
            imageUrl: img.image_url,
            caption: img.title || 'SREE RAJA RAJESWARI MOTORS',
          }));

        if (dbMarquee.length > 0) {
          setMarqueeItems(dbMarquee);
        }

        // Process About Items
        const dbAbout = items
          .filter((img) => img.section === 'gallery' && img.category === 'About')
          .map((img) => ({
            id: img.id,
            category: img.category || 'About',
            imageUrl: img.image_url,
            caption: img.title || 'About Image',
          }));

        if (dbAbout.length > 0) {
          setAboutItems(dbAbout);
        }

        // Process Why Us Items
        const dbWhyUs = items
          .filter((img) => img.section === 'gallery' && img.category === 'WhyUs')
          .map((img) => ({
            id: img.id,
            category: img.category || 'WhyUs',
            imageUrl: img.image_url,
            caption: img.title || 'Why Us Stat',
            subtitle: img.subtitle,
          }));

        if (dbWhyUs.length > 0) {
          setWhyUsItems(dbWhyUs as any); // subtitle isn't in PublicGalleryItem by default but we can pass it through since JS is dynamic, or we can add it. Let's just pass it.
        }
      }
    } catch (err: unknown) {
      console.error('Error fetching public site data from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicSiteData();
  }, []);

  return (
    <SiteDataContext.Provider
      value={{
        businessContent,
        heroSlides,
        services,
        galleryItems,
        marqueeItems,
        aboutItems,
        whyUsItems,
        loading,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  );
};

export const useSiteData = () => {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error('useSiteData must be used within a SiteDataProvider');
  }
  return context;
};
