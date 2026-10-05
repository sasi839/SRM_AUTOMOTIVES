import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { SiteContent, SiteImage } from '../lib/supabase';
import {
  replaceWebsiteImage,
  uploadWebsiteImage,
  deleteWebsiteImage,
  validateImageFile,
} from '../lib/storage';
import {
  LogOut,
  Building,
  Images,
  Wrench,
  Grid,
  Save,
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  Activity,
  Layers,
  FileCheck,
  X,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'business' | 'hero' | 'services' | 'gallery' | 'marquee' | 'about' | 'whyus'>('business');
  
  // Status messages
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const fetchLock = React.useRef(false);

  // Business Content State
  const [content, setContent] = useState<SiteContent>({
    id: '',
    business_name: 'SREE RAJA RAJESWARI MOTORS',
    owner_name: 'Lokesh',
    primary_phone: '+91 8919594039',
    secondary_phone: '',
    whatsapp_number: '918919594039',
    email: 'Lokesh.lvrn@gmail.com',
    address: 'SREE RAJA RAJESWARI MOTORS, #184, Renigunta Road, S.V. Autonagar, Tirupati, Andhra Pradesh',
    google_maps_url: 'https://maps.app.goo.gl/dnHpFsgdPKao7ALk7',
    created_at: '',
    updated_at: '',
  });

  // Images State
  const [heroSlides, setHeroSlides] = useState<SiteImage[]>([]);
  const [services, setServices] = useState<SiteImage[]>([]);
  const [galleryItems, setGalleryItems] = useState<SiteImage[]>([]);

  // New Hero Slide Form State
  const [newHeroTitle, setNewHeroTitle] = useState('');
  const [newHeroSubtitle, setNewHeroSubtitle] = useState('');
  const [newHeroFile, setNewHeroFile] = useState<File | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);

  // New Gallery Item Form State
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryCategory, setNewGalleryCategory] = useState('Mechanical Repairs');
  const [newGalleryFile, setNewGalleryFile] = useState<File | null>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // New Service Form State
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceSubtitle, setNewServiceSubtitle] = useState('');
  const [newServiceFile, setNewServiceFile] = useState<File | null>(null);
  const [uploadingService, setUploadingService] = useState(false);


  // Confirmation Modal State
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<SiteImage | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  const fetchSiteData = async () => {
    if (fetchLock.current) return;
    fetchLock.current = true;
    try {
      // Fetch Business Content
      const { data: contentData } = await supabase
        .from('site_content')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (contentData) {
        setContent(contentData);
      }

      // Fetch Site Images
      const { data: imagesData } = await supabase
        .from('site_images')
        .select('*')
        .order('display_order', { ascending: true });

      const items = (imagesData as SiteImage[]) || [];
      let heroes = items.filter((img) => img.section === 'hero');
      let servs = items.filter((img) => img.section === 'service');
      let gall = items.filter((img) => img.section === 'gallery');

      // Default Hero Slides
      const defaultSlides = [
        { section: 'hero', title: 'SREE RAJA RAJESWARI MOTORS', subtitle: 'The premium destination for mechanical repairs, teflon coating, and luxury vehicle restoration in Tirupati.', image_url: 'https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=1920&q=80', display_order: 0, is_active: true },
        { section: 'hero', title: 'EXPERT DETAILING', subtitle: 'State-of-the-art facilities equipped to handle everything from routine maintenance to complex engine rebuilds.', image_url: 'https://images.unsplash.com/photo-1635425032549-065a3962b13c?auto=format&fit=crop&w=1920&q=80', display_order: 1, is_active: true },
        { section: 'hero', title: 'PRECISION REPAIRS', subtitle: 'Highly skilled, certified technicians handling every repair with precision and genuine spare parts.', image_url: 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=1920&q=80', display_order: 2, is_active: true },
      ];

      // Default Services
      const defaultServices = [
        { section: 'service', title: 'Mechanical Repairs', subtitle: 'Complete engine diagnostics and expert mechanical fixes.', image_url: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=800&q=80', display_order: 1, is_active: true },
        { section: 'service', title: 'Tinkering', subtitle: 'Precision dent removal and structural auto body repairs.', image_url: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80', display_order: 2, is_active: true },
        { section: 'service', title: 'Painting', subtitle: 'Premium color matching and full-body spray painting.', image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80', display_order: 3, is_active: true },
        { section: 'service', title: 'Teflon Coating', subtitle: 'Advanced surface protection for a long-lasting shine.', image_url: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80', display_order: 4, is_active: true },
        { section: 'service', title: 'A/C Repairs', subtitle: 'Complete air conditioning service and refrigerant recharge.', image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80', display_order: 5, is_active: true },
        { section: 'service', title: 'Insurance Claims', subtitle: 'Hassle-free processing of accidental insurance claims.', image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80', display_order: 6, is_active: true },
        { section: 'service', title: 'Roadside Assistance', subtitle: 'Emergency support when you are stranded on the road.', image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80', display_order: 7, is_active: true },
        { section: 'service', title: 'Breakdown Services', subtitle: 'On-spot troubleshooting for unexpected vehicle breakdowns.', image_url: 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=800&q=80', display_order: 8, is_active: true },
        { section: 'service', title: 'Roadside Towing', subtitle: 'Safe and secure vehicle towing to our service center.', image_url: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=800&q=80', display_order: 9, is_active: true },
        { section: 'service', title: 'Spare Parts', subtitle: '100% genuine OEM spare parts for all major brands.', image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80', display_order: 10, is_active: true }
      ];

      // Default Gallery / Our Works
      const defaultGallery = [
        { section: 'gallery', title: 'Engine Diagnostics & Repair', category: 'Mechanical Repairs', image_url: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=800&q=80', display_order: 1, is_active: true },
        { section: 'gallery', title: 'Brake & Suspension Overhaul', category: 'Mechanical Repairs', image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80', display_order: 2, is_active: true },
        { section: 'gallery', title: 'Precision Dent Removal', category: 'Tinkering', image_url: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80', display_order: 3, is_active: true },
        { section: 'gallery', title: 'Chassis Alignment', category: 'Tinkering', image_url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80', display_order: 4, is_active: true },
        { section: 'gallery', title: 'Full Body Paint Restoration', category: 'Painting', image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80', display_order: 5, is_active: true },
        { section: 'gallery', title: 'Scratch & Blemish Repair', category: 'Painting', image_url: 'https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=800&q=80', display_order: 6, is_active: true },
        { section: 'gallery', title: 'Premium Polish & Shine', category: 'Teflon Coating', image_url: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80', display_order: 7, is_active: true },
        { section: 'gallery', title: 'Long-lasting Ceramic Protection', category: 'Teflon Coating', image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80', display_order: 8, is_active: true },
        { section: 'gallery', title: '24/7 Emergency Recovery', category: 'Roadside Towing', image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80', display_order: 9, is_active: true },
        { section: 'gallery', title: 'Safe Flatbed Transport', category: 'Roadside Towing', image_url: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=800&q=80', display_order: 10, is_active: true },
        { section: 'gallery', title: 'Genuine OEM Components', category: 'Spare Parts', image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80', display_order: 11, is_active: true },
        { section: 'gallery', title: 'Performance Upgrades', category: 'Spare Parts', image_url: 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=800&q=80', display_order: 12, is_active: true }
      ];

      // In-memory fallbacks if database table has 0 items (No automatic DB insertions!)
      if (heroes.length === 0) {
        heroes = defaultSlides.map((s, idx) => ({
          id: `default-hero-${idx}`,
          section: 'hero',
          title: s.title,
          subtitle: s.subtitle,
          category: null,
          image_url: s.image_url,
          display_order: s.display_order,
          is_active: s.is_active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
      }

      if (servs.length === 0) {
        servs = defaultServices.map((s, idx) => ({
          id: `default-service-${idx}`,
          section: 'service',
          title: s.title,
          subtitle: s.subtitle,
          category: null,
          image_url: s.image_url,
          display_order: s.display_order,
          is_active: s.is_active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
      }

      if (gall.length === 0) {
        gall = defaultGallery.map((g, idx) => ({
          id: `default-gallery-${idx}`,
          section: 'gallery',
          title: g.title,
          subtitle: null,
          category: g.category,
          image_url: g.image_url,
          display_order: g.display_order,
          is_active: g.is_active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
      }

      setHeroSlides(heroes);
      setServices(servs);
      setGalleryItems(gall);
    } catch (err: unknown) {
      console.error('Error fetching site data:', err);
    } finally {
      fetchLock.current = false;
    }
  };

  useEffect(() => {
    fetchSiteData();
  }, []);

  // 1. BUSINESS CONTENT UPDATE
  const handleSaveBusinessContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      if (content.id) {
        const { error } = await supabase
          .from('site_content')
          .update({
            business_name: content.business_name,
            owner_name: content.owner_name,
            primary_phone: content.primary_phone,
            secondary_phone: content.secondary_phone,
            whatsapp_number: content.whatsapp_number,
            email: content.email,
            address: content.address,
            google_maps_url: content.google_maps_url,
            updated_at: new Date().toISOString(),
          } as never)
          .eq('id', content.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('site_content')
          .insert({
            business_name: content.business_name,
            owner_name: content.owner_name,
            primary_phone: content.primary_phone,
            secondary_phone: content.secondary_phone,
            whatsapp_number: content.whatsapp_number,
            email: content.email,
            address: content.address,
            google_maps_url: content.google_maps_url,
          } as never)
          .select()
          .single();

        if (error) throw error;
        if (data) setContent(data as SiteContent);
      }

      showFeedback('success', 'Business information updated successfully in the online cloud database!');
    } catch (err: unknown) {
      showFeedback('error', (err as any).message || 'Failed to update business content.');
    } finally {
      setSaving(false);
    }
  };

  // 2. IMAGE REPLACEMENT HANDLER WITH VALIDATION & LOADING
  const handleImageReplace = async (
    item: SiteImage,
    folder: 'hero' | 'services' | 'gallery',
    file: File
  ) => {
    const val = validateImageFile(file);
    if (!val.valid) {
      showFeedback('error', val.error || 'Invalid image file.');
      return;
    }

    setSaving(true);
    showFeedback('success', `Uploading new image for "${item.title || item.section}"...`);

    try {
      const res = await replaceWebsiteImage(item.id, file, folder);
      if (res.error) throw res.error;

      showFeedback('success', 'Image replaced successfully in the online cloud database!');
      fetchSiteData();
    } catch (err: unknown) {
      showFeedback('error', (err as any).message || 'Failed to replace image.');
    } finally {
      setSaving(false);
    }
  };

  // 3. IMAGE RECORD UPDATE (Title, Subtitle, Active Toggle, Display Order)
  const handleSaveImageRecord = async (item: SiteImage) => {
    setSaving(true);
    try {
      if (item.id.startsWith('default-')) {
        const { error } = await supabase
          .from('site_images')
          .insert({
            section: item.section,
            title: item.title,
            subtitle: item.subtitle,
            category: item.category,
            image_url: item.image_url,
            display_order: item.display_order,
            is_active: item.is_active,
          } as never);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_images')
          .update({
            title: item.title,
            subtitle: item.subtitle,
            category: item.category,
            is_active: item.is_active,
            display_order: item.display_order,
            updated_at: new Date().toISOString(),
          } as never)
          .eq('id', item.id);

        if (error) throw error;
      }

      showFeedback('success', `Success! Changes for "${item.title || item.id}" have been updated in the online cloud database.`);
      fetchSiteData();
    } catch (err: unknown) {
      showFeedback('error', (err as any).message || 'Failed to update record.');
    } finally {
      setSaving(false);
    }
  };

  // 4. REORDER HANDLER (Move Up / Down)
  const handleMoveOrder = async (list: SiteImage[], index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const itemA = { ...list[index] };
    const itemB = { ...list[targetIndex] };

    // Swap display_order
    const tempOrder = itemA.display_order;
    itemA.display_order = itemB.display_order;
    itemB.display_order = tempOrder;

    setSaving(true);
    try {
      await Promise.all([
        supabase.from('site_images').update({ display_order: itemA.display_order } as never).eq('id', itemA.id),
        supabase.from('site_images').update({ display_order: itemB.display_order } as never).eq('id', itemB.id),
      ]);
      fetchSiteData();
      showFeedback('success', 'Display order updated in the online cloud database!');
    } catch (err: unknown) {
      showFeedback('error', (err as any).message || 'Failed to reorder items.');
    } finally {
      setSaving(false);
    }
  };

  // 5. ADD NEW HERO SLIDE
  const handleAddHeroSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeroFile) {
      showFeedback('error', 'Please select an image file for the new hero slide.');
      return;
    }

    const val = validateImageFile(newHeroFile);
    if (!val.valid) {
      showFeedback('error', val.error || 'Invalid image file.');
      return;
    }

    setUploadingHero(true);
    try {
      const uploadRes = await uploadWebsiteImage(newHeroFile, 'hero');
      if (uploadRes.error || !uploadRes.publicUrl) {
        throw uploadRes.error || new Error('Upload failed');
      }

      const nextOrder = heroSlides.length > 0
        ? Math.max(...heroSlides.map((h) => h.display_order)) + 1
        : 0;

      const { error: insertError } = await supabase.from('site_images').insert({
        section: 'hero',
        title: newHeroTitle || 'SREE RAJA RAJESWARI MOTORS',
        subtitle: newHeroSubtitle || '',
        image_url: uploadRes.publicUrl,
        display_order: nextOrder,
        is_active: true,
      } as never);

      if (insertError) throw insertError;

      showFeedback('success', 'New Hero slide added to the online cloud database!');
      setNewHeroTitle('');
      setNewHeroSubtitle('');
      setNewHeroFile(null);
      fetchSiteData();
    } catch (err: unknown) {
      showFeedback('error', (err as any).message || 'Failed to add hero slide.');
    } finally {
      setUploadingHero(false);
    }
  };

  // 6. ADD NEW GALLERY IMAGE
  const handleAddGalleryImage = async (e: React.FormEvent, overrideCategory?: string) => {
    e.preventDefault();
    if (!newGalleryFile) {
      showFeedback('error', 'Please select an image file to upload.');
      return;
    }

    const val = validateImageFile(newGalleryFile);
    if (!val.valid) {
      showFeedback('error', val.error || 'Invalid file.');
      return;
    }

    setUploadingGallery(true);
    try {
      const uploadRes = await uploadWebsiteImage(newGalleryFile, 'gallery');
      if (uploadRes.error || !uploadRes.publicUrl) {
        throw uploadRes.error || new Error('Upload failed');
      }

      const nextOrder = galleryItems.length > 0
        ? Math.max(...galleryItems.map((g) => g.display_order)) + 1
        : 1;

      const { error: insertError } = await supabase.from('site_images').insert({
        section: 'gallery',
        title: newGalleryTitle || 'Gallery Image',
        category: overrideCategory || newGalleryCategory,
        subtitle: overrideCategory === 'WhyUs' ? newHeroSubtitle : null,
        image_url: uploadRes.publicUrl,
        display_order: nextOrder,
        is_active: true,
      } as never);

      if (insertError) throw insertError;

      showFeedback('success', 'New item added successfully to the online cloud database!');
      setNewGalleryTitle('');
      setNewHeroSubtitle('');
      setNewGalleryFile(null);
      fetchSiteData();
    } catch (err: unknown) {
      showFeedback('error', (err as any).message || 'Failed to add gallery image.');
    } finally {
      setUploadingGallery(false);
    }
  };

  // 7.5 ADD NEW SERVICE
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceFile) {
      showFeedback('error', 'Please select an image file for the new service.');
      return;
    }

    const val = validateImageFile(newServiceFile);
    if (!val.valid) {
      showFeedback('error', val.error || 'Invalid image file.');
      return;
    }

    setUploadingService(true);
    try {
      const uploadRes = await uploadWebsiteImage(newServiceFile, 'services');
      if (uploadRes.error || !uploadRes.publicUrl) {
        throw uploadRes.error || new Error('Upload failed');
      }

      const nextOrder = services.length > 0
        ? Math.max(...services.map((s) => s.display_order)) + 1
        : 1;

      const { error: insertError } = await supabase.from('site_images').insert({
        section: 'service',
        title: newServiceTitle || 'New Service',
        subtitle: newServiceSubtitle || '',
        image_url: uploadRes.publicUrl,
        display_order: nextOrder,
        is_active: true,
      } as never);

      if (insertError) throw insertError;

      showFeedback('success', 'New service added to the online cloud database!');
      setNewServiceTitle('');
      setNewServiceSubtitle('');
      setNewServiceFile(null);
      fetchSiteData();
    } catch (err: unknown) {
      showFeedback('error', (err as any).message || 'Failed to add service.');
    } finally {
      setUploadingService(false);
    }
  };

  // 8. CONFIRMED DELETE ITEM (Hero, Service, or Gallery)
  const executeDeleteItem = async () => {
    if (!deleteConfirmItem) return;

    const item = deleteConfirmItem;
    setDeleteConfirmItem(null);
    setSaving(true);

    try {
      // Don't try to delete default in-memory items
      if (item.id.startsWith('default-')) {
        showFeedback('error', 'Cannot delete a default placeholder item. Add real items first, then remove defaults.');
        return;
      }

      const res = await deleteWebsiteImage(item.id);
      if (res.error) throw res.error;

      showFeedback('success', `Deleted "${item.title || 'item'}" from the online cloud database!`);
      fetchSiteData();
    } catch (err: unknown) {
      showFeedback('error', (err as any).message || 'Failed to delete item.');
    } finally {
      setSaving(false);
    }
  };

  // Metrics summary calculation
  const activeHeroCount = heroSlides.filter((h) => h.is_active).length;
  const activeGalleryCount = galleryItems.filter((g) => g.is_active).length;

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#D7E2EA] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#121212] via-[#141414] to-[#121212] border-b border-[#E5B549]/10 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <img src="/srm-logo.png" alt="SREE RAJA RAJESWARI MOTORS" className="h-9 sm:h-10 w-auto object-contain drop-shadow-md" />
          <div>
            <h1 className="text-lg font-black uppercase tracking-wider text-white">
              SREE RAJA RAJESWARI MOTORS
            </h1>
            <p className="text-xs text-[#E5B549] uppercase tracking-widest font-medium">
              Admin Content & Image Manager
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-xs text-[#D7E2EA]/60">
            Admin: <strong className="text-white">{user?.email}</strong>
          </span>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-6">
        {/* OVERVIEW METRICS CARDS (Requirement 1) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#121212] to-[#0f1a12] border border-emerald-500/15 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-[#D7E2EA]/60 uppercase tracking-wider">
              <span>System Status</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-bold text-white uppercase tracking-wide">Live & Connected</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#121212] to-[#181510] border border-[#E5B549]/15 rounded-2xl p-4 flex flex-col justify-between hover:border-[#E5B549]/30 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-[#D7E2EA]/60 uppercase tracking-wider">
              <span>Hero Slides</span>
              <Images className="w-4 h-4 text-[#E5B549]" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {activeHeroCount} <span className="text-xs font-normal text-[#D7E2EA]/60">/ {heroSlides.length} Active</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#121212] to-[#101318] border border-blue-400/15 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-400/30 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-[#D7E2EA]/60 uppercase tracking-wider">
              <span>Services</span>
              <Wrench className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {services.length} <span className="text-xs font-normal text-[#D7E2EA]/60">Services</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#121212] to-[#151018] border border-purple-400/15 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-400/30 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-[#D7E2EA]/60 uppercase tracking-wider">
              <span>Our Works</span>
              <Grid className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {activeGalleryCount} <span className="text-xs font-normal text-[#D7E2EA]/60">/ {galleryItems.length} Active</span>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-[#D7E2EA]/10 pb-4">
          <button
            onClick={() => setActiveTab('business')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'business'
                ? 'bg-[#E5B549] text-black shadow-lg shadow-[#E5B549]/20'
                : 'bg-[#1A1A1A] text-[#D7E2EA]/70 hover:text-white border border-[#D7E2EA]/10'
            }`}
          >
            <Building className="w-4 h-4" />
            Business Info
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'hero'
                ? 'bg-[#E5B549] text-black shadow-lg shadow-[#E5B549]/20'
                : 'bg-[#1A1A1A] text-[#D7E2EA]/70 hover:text-white border border-[#D7E2EA]/10'
            }`}
          >
            <Images className="w-4 h-4" />
            Hero Slides ({heroSlides.length})
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'services'
                ? 'bg-[#E5B549] text-black shadow-lg shadow-[#E5B549]/20'
                : 'bg-[#1A1A1A] text-[#D7E2EA]/70 hover:text-white border border-[#D7E2EA]/10'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Services ({services.length})
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'gallery'
                ? 'bg-[#E5B549] text-black shadow-lg shadow-[#E5B549]/20'
                : 'bg-[#1A1A1A] text-[#D7E2EA]/70 hover:text-white border border-[#D7E2EA]/10'
            }`}
          >
            <Grid className="w-4 h-4" />
            Our Works ({galleryItems.filter(g => g.category !== 'Marquee').length})
          </button>

          <button
            onClick={() => setActiveTab('marquee')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'marquee'
                ? 'bg-[#E5B549] text-black shadow-lg shadow-[#E5B549]/20'
                : 'bg-[#1A1A1A] text-[#D7E2EA]/70 hover:text-white border border-[#D7E2EA]/10'
            }`}
          >
            <Grid className="w-4 h-4" />
            Marquee Slider ({galleryItems.filter(g => g.category === 'Marquee').length})
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'about'
                ? 'bg-[#E5B549] text-black shadow-lg shadow-[#E5B549]/20'
                : 'bg-[#1A1A1A] text-[#D7E2EA]/70 hover:text-white border border-[#D7E2EA]/10'
            }`}
          >
            <Grid className="w-4 h-4" />
            About ({galleryItems.filter(g => g.category === 'About').length})
          </button>
          <button
            onClick={() => setActiveTab('whyus')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'whyus'
                ? 'bg-[#E5B549] text-black shadow-lg shadow-[#E5B549]/20'
                : 'bg-[#1A1A1A] text-[#D7E2EA]/70 hover:text-white border border-[#D7E2EA]/10'
            }`}
          >
            <Grid className="w-4 h-4" />
            Why Us ({galleryItems.filter(g => g.category === 'WhyUs').length})
          </button>
        </div>

        {/* TAB 1: BUSINESS INFO */}
        {activeTab === 'business' && (
          <div className="bg-[#121212] border border-[#D7E2EA]/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold uppercase text-white tracking-wide flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#E5B549]" />
                Business Information
              </h2>
              <p className="text-xs text-[#D7E2EA]/60 mt-1">
                Edit core contact details, owner name, address, and maps location link.
              </p>
            </div>

            <form onSubmit={handleSaveBusinessContent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                  Business Name
                </label>
                <input
                  type="text"
                  disabled={saving}
                  value={content.business_name || ''}
                  onChange={(e) => setContent({ ...content, business_name: e.target.value })}
                  className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                  Owner Name
                </label>
                <input
                  type="text"
                  disabled={saving}
                  value={content.owner_name || ''}
                  onChange={(e) => setContent({ ...content, owner_name: e.target.value })}
                  className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                  Primary Phone
                </label>
                <input
                  type="text"
                  disabled={saving}
                  value={content.primary_phone || ''}
                  onChange={(e) => setContent({ ...content, primary_phone: e.target.value })}
                  className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                  Secondary Phone (Optional)
                </label>
                <input
                  type="text"
                  disabled={saving}
                  value={content.secondary_phone || ''}
                  onChange={(e) => setContent({ ...content, secondary_phone: e.target.value })}
                  className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  disabled={saving}
                  value={content.whatsapp_number || ''}
                  onChange={(e) => setContent({ ...content, whatsapp_number: e.target.value })}
                  className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                  Email
                </label>
                <input
                  type="email"
                  disabled={saving}
                  value={content.email || ''}
                  onChange={(e) => setContent({ ...content, email: e.target.value })}
                  className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                  Address
                </label>
                <textarea
                  rows={3}
                  disabled={saving}
                  value={content.address || ''}
                  onChange={(e) => setContent({ ...content, address: e.target.value })}
                  className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                  Google Maps URL / Directions Link
                </label>
                <input
                  type="text"
                  disabled={saving}
                  value={content.google_maps_url || ''}
                  onChange={(e) => setContent({ ...content, google_maps_url: e.target.value })}
                  className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#E5B549] text-black font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl hover:bg-[#f0c25c] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Business Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: HERO SLIDES */}
        {activeTab === 'hero' && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#121212] border border-[#D7E2EA]/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold uppercase text-white tracking-wide flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#E5B549]" />
                Hero Slides Management
              </h2>
              <p className="text-xs text-[#D7E2EA]/60 mt-1">
                Reorder slides, replace images, edit headlines, and toggle slide visibility.
              </p>
            </div>

            {/* Add New Hero Slide Form */}
            <div className="bg-[#121212] border border-[#D7E2EA]/10 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-base font-bold uppercase text-white tracking-wide flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#E5B549]" />
                Add New Hero Slide
              </h3>

              <form onSubmit={handleAddHeroSlide} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                    Slide Headline / Title
                  </label>
                  <input
                    type="text"
                    disabled={uploadingHero}
                    value={newHeroTitle}
                    onChange={(e) => setNewHeroTitle(e.target.value)}
                    placeholder="e.g. SREE RAJA RAJESWARI MOTORS"
                    className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#E5B549]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                    Hero Slide Image File
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingHero}
                    onChange={(e) => setNewHeroFile(e.target.files?.[0] || null)}
                    className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-2 text-xs text-[#D7E2EA] file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#E5B549] file:text-black file:font-bold hover:file:bg-[#f0c25c]"
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                    Slide Description / Subtitle
                  </label>
                  <textarea
                    rows={2}
                    disabled={uploadingHero}
                    value={newHeroSubtitle}
                    onChange={(e) => setNewHeroSubtitle(e.target.value)}
                    placeholder="e.g. The premium destination for mechanical repairs..."
                    className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#E5B549]"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={uploadingHero || !newHeroFile}
                    className="bg-[#E5B549] text-black font-bold uppercase text-xs tracking-wider px-6 py-3 rounded-xl hover:bg-[#f0c25c] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {uploadingHero ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Upload & Add Hero Slide
                  </button>
                </div>
              </form>
            </div>

            <div className="flex flex-col gap-4">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="bg-[#121212] border border-[#D7E2EA]/10 rounded-2xl p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between"
                >
                  {/* Image Preview & Replacement */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">
                    <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden border border-[#D7E2EA]/20 bg-black shrink-0">
                      <img src={slide.image_url} alt={slide.title || 'Slide'} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-[#E5B549] uppercase">
                        Order #{slide.display_order}
                      </div>
                    </div>

                    <label className="cursor-pointer bg-[#1A1A1A] border border-[#D7E2EA]/20 hover:border-[#E5B549] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shrink-0">
                      <Upload className="w-4 h-4 text-[#E5B549]" />
                      Replace Image
                      <input
                        type="file"
                        accept="image/*"
                        disabled={saving}
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleImageReplace(slide, 'hero', e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Text Edit Inputs */}
                  <div className="flex-1 w-full flex flex-col gap-3">
                    <input
                      type="text"
                      disabled={saving}
                      value={slide.title || ''}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[index].title = e.target.value;
                        setHeroSlides(updated);
                      }}
                      placeholder="Slide Title"
                      className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                    />
                    <textarea
                      rows={2}
                      disabled={saving}
                      value={slide.subtitle || ''}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[index].subtitle = e.target.value;
                        setHeroSlides(updated);
                      }}
                      placeholder="Slide Subtitle"
                      className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-2.5 text-xs text-[#D7E2EA] focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                    />
                  </div>

                  {/* Actions (Reorder, Active Toggle, Save, Delete) */}
                  <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end border-t lg:border-t-0 border-[#D7E2EA]/10 pt-4 lg:pt-0">
                    <button
                      disabled={index === 0 || saving}
                      onClick={() => handleMoveOrder(heroSlides, index, 'up')}
                      className="p-2.5 rounded-xl bg-[#1A1A1A] border border-[#D7E2EA]/20 hover:text-[#E5B549] disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    <button
                      disabled={index === heroSlides.length - 1 || saving}
                      onClick={() => handleMoveOrder(heroSlides, index, 'down')}
                      className="p-2.5 rounded-xl bg-[#1A1A1A] border border-[#D7E2EA]/20 hover:text-[#E5B549] disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      disabled={saving}
                      onClick={() => {
                        const updated = [...heroSlides];
                        updated[index].is_active = !updated[index].is_active;
                        setHeroSlides(updated);
                        handleSaveImageRecord(updated[index]);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                        slide.is_active
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                      }`}
                      title="Toggle Active Status"
                    >
                      {slide.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <span>{slide.is_active ? 'Active' : 'Inactive'}</span>
                    </button>

                    <button
                      disabled={saving}
                      onClick={() => handleSaveImageRecord(slide)}
                      className="bg-[#E5B549] text-black font-bold uppercase text-xs px-4 py-2.5 rounded-xl hover:bg-[#f0c25c] flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>

                    <button
                      disabled={saving}
                      onClick={() => setDeleteConfirmItem(slide)}
                      className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SERVICES */}
        {activeTab === 'services' && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#121212] border border-[#D7E2EA]/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold uppercase text-white tracking-wide flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#E5B549]" />
                Services Manager
              </h2>
              <p className="text-xs text-[#D7E2EA]/60 mt-1">
                Add, edit, reorder, replace images, and manage all services.
              </p>
            </div>

            {/* Add New Service Form */}
            <div className="bg-[#161616] border border-[#E5B549]/30 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#E5B549] flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Service
              </h3>

              <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                    Service Title
                  </label>
                  <input
                    type="text"
                    disabled={uploadingService}
                    placeholder="e.g. Wheel Alignment"
                    value={newServiceTitle}
                    onChange={(e) => setNewServiceTitle(e.target.value)}
                    required
                    className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                    Description
                  </label>
                  <input
                    type="text"
                    disabled={uploadingService}
                    placeholder="e.g. Precision alignment for smooth driving"
                    value={newServiceSubtitle}
                    onChange={(e) => setNewServiceSubtitle(e.target.value)}
                    className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                    Service Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingService}
                    onChange={(e) => setNewServiceFile(e.target.files?.[0] || null)}
                    required
                    className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                  />
                </div>

                <div className="md:col-span-3 flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={uploadingService}
                    className="bg-[#E5B549] text-black font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-xl hover:bg-[#f0c25c] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {uploadingService ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding Service...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Service
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className="bg-[#121212] border border-[#D7E2EA]/10 rounded-2xl p-6 flex flex-col gap-4 hover:border-[#D7E2EA]/20 transition-colors"
                >
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#D7E2EA]/20 bg-black">
                    <img src={service.image_url} alt={service.title || 'Service'} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-[#E5B549] uppercase">
                      Order #{service.display_order}
                    </div>
                  </div>

                  {/* Editable Title */}
                  <input
                    type="text"
                    disabled={saving}
                    value={service.title || ''}
                    onChange={(e) => {
                      const updated = [...services];
                      updated[index].title = e.target.value;
                      setServices(updated);
                    }}
                    placeholder="Service Title"
                    className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                  />

                  {/* Editable Description */}
                  <textarea
                    rows={2}
                    disabled={saving}
                    value={service.subtitle || ''}
                    onChange={(e) => {
                      const updated = [...services];
                      updated[index].subtitle = e.target.value;
                      setServices(updated);
                    }}
                    placeholder="Service Description"
                    className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-2.5 text-xs text-[#D7E2EA] focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                  />

                  {/* Actions Row */}
                  <div className="flex items-center justify-between gap-2 border-t border-[#D7E2EA]/10 pt-4">
                    <div className="flex items-center gap-1">
                      <button
                        disabled={index === 0 || saving}
                        onClick={() => handleMoveOrder(services, index, 'up')}
                        className="p-2 rounded-lg bg-[#1A1A1A] border border-[#D7E2EA]/20 hover:text-[#E5B549] disabled:opacity-30 text-xs"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={index === services.length - 1 || saving}
                        onClick={() => handleMoveOrder(services, index, 'down')}
                        className="p-2 rounded-lg bg-[#1A1A1A] border border-[#D7E2EA]/20 hover:text-[#E5B549] disabled:opacity-30 text-xs"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      disabled={saving}
                      onClick={() => {
                        const updated = [...services];
                        updated[index].is_active = !updated[index].is_active;
                        setServices(updated);
                        handleSaveImageRecord(updated[index]);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                        service.is_active
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                      }`}
                    >
                      {service.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {service.is_active ? 'Active' : 'Inactive'}
                    </button>

                    <label className="cursor-pointer bg-[#1A1A1A] border border-[#D7E2EA]/20 hover:border-[#E5B549] text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5 text-[#E5B549]" />
                      Replace
                      <input
                        type="file"
                        accept="image/*"
                        disabled={saving}
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleImageReplace(service, 'services', e.target.files[0]);
                          }
                        }}
                      />
                    </label>

                    <button
                      disabled={saving}
                      onClick={() => handleSaveImageRecord(service)}
                      className="bg-[#E5B549] text-black font-bold uppercase text-xs p-2 rounded-lg hover:bg-[#f0c25c] disabled:opacity-50"
                      title="Save"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>

                    <button
                      disabled={saving}
                      onClick={() => setDeleteConfirmItem(service)}
                      className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white p-2 rounded-lg text-xs disabled:opacity-50"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: OUR WORKS / GALLERY */}
        {activeTab === 'gallery' && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#121212] border border-[#D7E2EA]/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold uppercase text-white tracking-wide flex items-center gap-2">
                  <Grid className="w-5 h-5 text-[#E5B549]" />
                  Our Works / Gallery Manager
                </h2>
                <p className="text-xs text-[#D7E2EA]/60 mt-1">
                  Add new gallery images, replace existing images, reorder items, or delete entries.
                </p>
              </div>
            </div>

            {/* Form to Add New Gallery Image */}
            <div className="bg-[#161616] border border-[#E5B549]/30 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#E5B549] flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Gallery Item
              </h3>

              <form onSubmit={handleAddGalleryImage} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                    Image Caption / Title
                  </label>
                  <input
                    type="text"
                    disabled={uploadingGallery}
                    placeholder="e.g. Engine Overhaul & Polish"
                    value={newGalleryTitle}
                    onChange={(e) => setNewGalleryTitle(e.target.value)}
                    required
                    className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                    Service Category
                  </label>
                  <select
                    disabled={uploadingGallery}
                    value={newGalleryCategory}
                    onChange={(e) => setNewGalleryCategory(e.target.value)}
                    className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                  >
                    <option value="Mechanical Repairs">Mechanical Repairs</option>
                    <option value="Tinkering">Tinkering</option>
                    <option value="Painting">Painting</option>
                    <option value="Teflon Coating">Teflon Coating</option>
                    <option value="Roadside Towing">Roadside Towing</option>
                    <option value="Spare Parts">Spare Parts</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                    Upload Image File
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingGallery}
                    onChange={(e) => setNewGalleryFile(e.target.files?.[0] || null)}
                    required
                    className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                  />
                </div>

                <div className="md:col-span-3 flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={uploadingGallery}
                    className="bg-[#E5B549] text-black font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-xl hover:bg-[#f0c25c] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {uploadingGallery ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading Image...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Gallery Image
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.filter(item => item.category !== 'Marquee').map((item, index) => (
                <div
                  key={item.id}
                  className="bg-[#121212] border border-[#D7E2EA]/10 rounded-2xl p-5 flex flex-col gap-4 justify-between"
                >
                  <div className="flex flex-col gap-3">
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#D7E2EA]/20 bg-black">
                      <img src={item.image_url} alt={item.title || 'Gallery'} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-[#E5B549] uppercase">
                        #{item.display_order} • {item.category || 'Work'}
                      </div>
                    </div>

                    <input
                      type="text"
                      disabled={saving}
                      value={item.title || ''}
                      onChange={(e) => {
                        const updated = [...galleryItems];
                        updated[index].title = e.target.value;
                        setGalleryItems(updated);
                      }}
                      className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-[#D7E2EA]/10 pt-4">
                    <div className="flex items-center gap-1">
                      <button
                        disabled={index === 0 || saving}
                        onClick={() => handleMoveOrder(galleryItems, index, 'up')}
                        className="p-2 rounded-lg bg-[#1A1A1A] border border-[#D7E2EA]/20 hover:text-[#E5B549] disabled:opacity-30 text-xs"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={index === galleryItems.length - 1 || saving}
                        onClick={() => handleMoveOrder(galleryItems, index, 'down')}
                        className="p-2 rounded-lg bg-[#1A1A1A] border border-[#D7E2EA]/20 hover:text-[#E5B549] disabled:opacity-30 text-xs"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <label className="cursor-pointer bg-[#1A1A1A] border border-[#D7E2EA]/20 hover:border-[#E5B549] text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5 text-[#E5B549]" />
                      Replace
                      <input
                        type="file"
                        accept="image/*"
                        disabled={saving}
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleImageReplace(item, 'gallery', e.target.files[0]);
                          }
                        }}
                      />
                    </label>

                    <button
                      disabled={saving}
                      onClick={() => handleSaveImageRecord(item)}
                      className="bg-[#E5B549] text-black font-bold uppercase text-xs p-2 rounded-lg hover:bg-[#f0c25c] disabled:opacity-50"
                      title="Save"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>

                    <button
                      disabled={saving}
                      onClick={() => setDeleteConfirmItem(item)}
                      className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white p-2 rounded-lg text-xs disabled:opacity-50"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MARQUEE SLIDER */}
        {activeTab === 'marquee' && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#121212] border border-[#D7E2EA]/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold uppercase text-white tracking-wide flex items-center gap-2">
                  <Grid className="w-5 h-5 text-[#E5B549]" />
                  Marquee Slider Manager
                </h2>
                <p className="text-xs text-[#D7E2EA]/60 mt-1">
                  Add new slider images, replace existing images, reorder items, or delete entries.
                </p>
              </div>
            </div>

            {/* Form to Add New Marquee Image */}
            <div className="bg-[#161616] border border-[#E5B549]/30 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#E5B549] flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Marquee Image
              </h3>

              <form 
                onSubmit={(e) => {
                  handleAddGalleryImage(e, 'Marquee');
                }} 
                className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                    Image Label / Title
                  </label>
                  <input
                    type="text"
                    disabled={uploadingGallery}
                    placeholder="e.g. Performance Tuning"
                    value={newGalleryTitle}
                    onChange={(e) => setNewGalleryTitle(e.target.value)}
                    required
                    className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                    Upload Image File
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingGallery}
                    onChange={(e) => setNewGalleryFile(e.target.files?.[0] || null)}
                    required
                    className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={uploadingGallery}
                    className="bg-[#E5B549] text-black font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-xl hover:bg-[#f0c25c] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {uploadingGallery ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading Image...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Marquee Image
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Marquee Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.filter(item => item.category === 'Marquee').map((item, index) => (
                <div
                  key={item.id}
                  className="bg-[#121212] border border-[#D7E2EA]/10 rounded-2xl p-5 flex flex-col gap-4 justify-between"
                >
                  <div className="flex flex-col gap-3">
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#D7E2EA]/20 bg-black">
                      <img src={item.image_url} alt={item.title || 'Marquee'} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-[#E5B549] uppercase">
                        #{item.display_order} • Slider
                      </div>
                    </div>

                    <input
                      type="text"
                      disabled={saving}
                      value={item.title || ''}
                      onChange={(e) => {
                        const globalIndex = galleryItems.findIndex(g => g.id === item.id);
                        if (globalIndex === -1) return;
                        const updated = [...galleryItems];
                        updated[globalIndex].title = e.target.value;
                        setGalleryItems(updated);
                      }}
                      className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-[#D7E2EA]/10 pt-4">
                    <div className="flex items-center gap-1">
                      <button
                        disabled={index === 0 || saving}
                        onClick={() => handleMoveOrder(galleryItems, galleryItems.findIndex(g => g.id === item.id), 'up')}
                        className="p-2 rounded-lg bg-[#1A1A1A] border border-[#D7E2EA]/20 hover:text-[#E5B549] disabled:opacity-30 text-xs"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={index === galleryItems.filter(g => g.category === 'Marquee').length - 1 || saving}
                        onClick={() => handleMoveOrder(galleryItems, galleryItems.findIndex(g => g.id === item.id), 'down')}
                        className="p-2 rounded-lg bg-[#1A1A1A] border border-[#D7E2EA]/20 hover:text-[#E5B549] disabled:opacity-30 text-xs"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <label className="cursor-pointer bg-[#1A1A1A] border border-[#D7E2EA]/20 hover:border-[#E5B549] text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5 text-[#E5B549]" />
                      Replace
                      <input
                        type="file"
                        accept="image/*"
                        disabled={saving}
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleImageReplace(item, 'gallery', e.target.files[0]);
                          }
                        }}
                      />
                    </label>

                    <button
                      disabled={saving}
                      onClick={() => handleSaveImageRecord(item)}
                      className="bg-[#E5B549] text-black font-bold uppercase text-xs p-2 rounded-lg hover:bg-[#f0c25c] disabled:opacity-50"
                      title="Save"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>

                    <button
                      disabled={saving}
                      onClick={() => setDeleteConfirmItem(item)}
                      className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white p-2 rounded-lg text-xs disabled:opacity-50"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: ABOUT US */}
        {activeTab === 'about' && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#121212] border border-[#D7E2EA]/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold uppercase text-white tracking-wide flex items-center gap-2">
                  <Grid className="w-5 h-5 text-[#E5B549]" />
                  About Us Images
                </h2>
                <p className="text-xs text-[#D7E2EA]/60 mt-1">
                  Manage the 4 decorative floating images in the About Us section.
                </p>
              </div>
            </div>

            {/* Form to Add New About Image */}
            <div className="bg-[#161616] border border-[#E5B549]/30 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#E5B549] flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New About Image
              </h3>

              <form 
                onSubmit={(e) => handleAddGalleryImage(e, 'About')} 
                className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                    Image Label (Internal)
                  </label>
                  <input
                    type="text"
                    disabled={uploadingGallery}
                    placeholder="e.g. Garage Exterior"
                    value={newGalleryTitle}
                    onChange={(e) => setNewGalleryTitle(e.target.value)}
                    required
                    className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                    Upload Image File
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingGallery}
                    onChange={(e) => setNewGalleryFile(e.target.files?.[0] || null)}
                    required
                    className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={uploadingGallery}
                    className="bg-[#E5B549] text-black font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-xl hover:bg-[#f0c25c] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {uploadingGallery ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add About Image
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* About Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {galleryItems.filter(item => item.category === 'About').map(item => (
                <div
                  key={item.id}
                  className="bg-[#121212] border border-[#D7E2EA]/10 rounded-2xl p-5 flex flex-col gap-4 justify-between"
                >
                  <div className="flex flex-col gap-3">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-[#D7E2EA]/20 bg-black">
                      <img src={item.image_url} alt={item.title || 'About'} className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                      <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-[#E5B549] uppercase">
                        #{item.display_order} • About
                      </div>
                    </div>

                    <input
                      type="text"
                      disabled={saving}
                      value={item.title || ''}
                      onChange={(e) => {
                        const globalIndex = galleryItems.findIndex(g => g.id === item.id);
                        if (globalIndex === -1) return;
                        const updated = [...galleryItems];
                        updated[globalIndex].title = e.target.value;
                        setGalleryItems(updated);
                      }}
                      className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-[#D7E2EA]/10 pt-4">
                    <label className="cursor-pointer bg-[#1A1A1A] border border-[#D7E2EA]/20 hover:border-[#E5B549] text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-full justify-center">
                      <Upload className="w-3.5 h-3.5 text-[#E5B549]" />
                      Replace
                      <input
                        type="file"
                        accept="image/*"
                        disabled={saving}
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleImageReplace(item, 'gallery', e.target.files[0]);
                          }
                        }}
                      />
                    </label>

                    <button
                      disabled={saving}
                      onClick={() => handleSaveImageRecord(item)}
                      className="bg-[#E5B549] text-black p-2 rounded-lg hover:bg-[#f0c25c] disabled:opacity-50"
                      title="Save"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>

                    <button
                      disabled={saving}
                      onClick={() => setDeleteConfirmItem(item)}
                      className="bg-red-500/10 border border-red-500/30 text-red-400 p-2 rounded-lg hover:bg-red-500 hover:text-white disabled:opacity-50"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: WHY US */}
        {activeTab === 'whyus' && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#121212] border border-[#D7E2EA]/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold uppercase text-white tracking-wide flex items-center gap-2">
                  <Grid className="w-5 h-5 text-[#E5B549]" />
                  Why Us Statistics
                </h2>
                <p className="text-xs text-[#D7E2EA]/60 mt-1">
                  Manage the statistic cards in the Why Us section (Image, Number, Label, Description).
                </p>
              </div>
            </div>

            {/* Form to Add New Why Us Stat */}
            <div className="bg-[#161616] border border-[#E5B549]/30 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#E5B549] flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Statistic Card
              </h3>

              <form 
                onSubmit={(e) => handleAddGalleryImage(e, 'WhyUs')} 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                    Big Number (Title)
                  </label>
                  <input
                    type="text"
                    disabled={uploadingGallery}
                    placeholder="e.g. 10+"
                    value={newGalleryTitle}
                    onChange={(e) => setNewGalleryTitle(e.target.value)}
                    required
                    className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                    Label (Subtitle)
                  </label>
                  <input
                    type="text"
                    disabled={uploadingGallery}
                    placeholder="e.g. Years of Experience"
                    value={newHeroSubtitle} // Reusing this generic state for the subtitle form field
                    onChange={(e) => setNewHeroSubtitle(e.target.value)}
                    className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
                    Upload Background
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingGallery}
                    onChange={(e) => setNewGalleryFile(e.target.files?.[0] || null)}
                    required
                    className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                  />
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={uploadingGallery}
                    className="bg-[#E5B549] w-full text-black font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-xl hover:bg-[#f0c25c] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploadingGallery ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Stat
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Why Us Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {galleryItems.filter(item => item.category === 'WhyUs').map(item => (
                <div
                  key={item.id}
                  className="bg-[#121212] border border-[#D7E2EA]/10 rounded-2xl p-5 flex flex-col gap-4 justify-between"
                >
                  <div className="flex flex-col gap-3">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-[#D7E2EA]/20 bg-black flex flex-col items-center justify-center">
                      <img src={item.image_url} alt={item.title || 'Stat'} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                      <div className="relative z-10 text-center">
                         <span className="font-black text-3xl text-white block">{item.title}</span>
                         <span className="text-xs font-bold uppercase text-[#E5B549]">{item.subtitle}</span>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-[#E5B549] uppercase z-20">
                        #{item.display_order} • Why Us
                      </div>
                    </div>

                    <input
                      type="text"
                      disabled={saving}
                      placeholder="Number (e.g. 10+)"
                      value={item.title || ''}
                      onChange={(e) => {
                        const globalIndex = galleryItems.findIndex(g => g.id === item.id);
                        if (globalIndex === -1) return;
                        const updated = [...galleryItems];
                        updated[globalIndex].title = e.target.value;
                        setGalleryItems(updated);
                      }}
                      className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                    />

                    <input
                      type="text"
                      disabled={saving}
                      placeholder="Label (e.g. Years of Experience)"
                      value={item.subtitle || ''}
                      onChange={(e) => {
                        const globalIndex = galleryItems.findIndex(g => g.id === item.id);
                        if (globalIndex === -1) return;
                        const updated = [...galleryItems];
                        updated[globalIndex].subtitle = e.target.value;
                        setGalleryItems(updated);
                      }}
                      className="bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl px-3 py-2 text-[#D7E2EA]/70 text-xs focus:outline-none focus:border-[#E5B549] disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-[#D7E2EA]/10 pt-4">
                    <label className="cursor-pointer bg-[#1A1A1A] border border-[#D7E2EA]/20 hover:border-[#E5B549] text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-full justify-center">
                      <Upload className="w-3.5 h-3.5 text-[#E5B549]" />
                      Replace
                      <input
                        type="file"
                        accept="image/*"
                        disabled={saving}
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleImageReplace(item, 'gallery', e.target.files[0]);
                          }
                        }}
                      />
                    </label>

                    <button
                      disabled={saving}
                      onClick={() => handleSaveImageRecord(item)}
                      className="bg-[#E5B549] text-black p-2 rounded-lg hover:bg-[#f0c25c] disabled:opacity-50"
                      title="Save"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>

                    <button
                      disabled={saving}
                      onClick={() => setDeleteConfirmItem(item)}
                      className="bg-red-500/10 border border-red-500/30 text-red-400 p-2 rounded-lg hover:bg-red-500 hover:text-white disabled:opacity-50"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* CONFIRMATION SAFETY MODAL (Requirement 2) */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-red-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#D7E2EA]/10 pb-4">
              <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-sm">
                <ShieldCheck className="w-5 h-5" />
                Confirm Deletion
              </div>
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="text-[#D7E2EA]/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm text-[#D7E2EA]">
                Are you sure you want to permanently delete this {deleteConfirmItem.section === 'hero' ? 'hero slide' : deleteConfirmItem.section === 'service' ? 'service' : 'item'}?
              </p>

              <div className="p-3 bg-[#1A1A1A] border border-[#D7E2EA]/10 rounded-xl flex items-center gap-3">
                <img
                  src={deleteConfirmItem.image_url}
                  alt={deleteConfirmItem.title || 'Preview'}
                  className="w-12 h-12 rounded-lg object-cover bg-black"
                />
                <div>
                  <div className="text-xs font-bold text-white uppercase">{deleteConfirmItem.title}</div>
                  <div className="text-[10px] text-[#E5B549] uppercase">{deleteConfirmItem.category}</div>
                </div>
              </div>

              <p className="text-xs text-red-400/80">
                This action will remove the record from the database and delete the image file.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="px-5 py-2.5 rounded-xl border border-[#D7E2EA]/20 text-xs font-bold uppercase tracking-wider text-[#D7E2EA] hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={executeDeleteItem}
                className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
