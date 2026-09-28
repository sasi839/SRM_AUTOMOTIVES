-- Seed data for SRM AUTOMOTIVES

-- 1. Insert Initial Site Content
INSERT INTO site_content (
    business_name,
    owner_name,
    primary_phone,
    secondary_phone,
    whatsapp_number,
    email,
    address,
    google_maps_url
) VALUES (
    'SRM AUTOMOTIVES',
    'Lokesh',
    '+91 8919594039',
    NULL,
    '918919594039',
    'Lokesh.lvrn@gimil.com',
    'SRM AUTOMOTIVES, #184, Renigunta Road, S.V. Autonagar, Tirupati, Andhra Pradesh',
    'https://maps.app.goo.gl/dnHpFsgdPKao7ALk7'
) ON CONFLICT DO NOTHING;

-- 2. Insert Initial Site Images

-- A. HERO SLIDES (section = 'hero')
INSERT INTO site_images (section, title, subtitle, image_url, display_order, is_active) VALUES
('hero', 'SRM AUTOMOTIVES', 'The premium destination for mechanical repairs, teflon coating, and luxury vehicle restoration in Tirupati.', 'https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=1920&q=80', 1, true),
('hero', 'EXPERT DETAILING', 'State-of-the-art facilities equipped to handle everything from routine maintenance to complex engine rebuilds.', 'https://images.unsplash.com/photo-1635425032549-065a3962b13c?auto=format&fit=crop&w=1920&q=80', 2, true),
('hero', 'PRECISION REPAIRS', 'Highly skilled, certified technicians handling every repair with precision and genuine spare parts.', 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=1920&q=80', 3, true);

-- B. SERVICE CARD IMAGES (section = 'service') - Each service has its own independent record
INSERT INTO site_images (section, title, subtitle, image_url, display_order, is_active) VALUES
('service', 'Mechanical Repairs', 'Complete engine diagnostics and expert mechanical fixes.', 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=800&q=80', 1, true),
('service', 'Tinkering', 'Precision dent removal and structural auto body repairs.', 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80', 2, true),
('service', 'Painting', 'Premium color matching and full-body spray painting.', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80', 3, true),
('service', 'Teflon Coating', 'Advanced surface protection for a long-lasting shine.', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80', 4, true),
('service', 'A/C Repairs', 'Complete air conditioning service and refrigerant recharge.', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80', 5, true),
('service', 'Insurance Claims', 'Hassle-free processing of accidental insurance claims.', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80', 6, true),
('service', 'Roadside Assistance', 'Emergency support when you are stranded on the road.', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80', 7, true),
('service', 'Breakdown Services', 'On-spot troubleshooting for unexpected vehicle breakdowns.', 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=800&q=80', 8, true),
('service', 'Roadside Towing', 'Safe and secure vehicle towing to our service center.', 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=800&q=80', 9, true),
('service', 'Spare Parts', '100% genuine OEM spare parts for all major brands.', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80', 10, true);

-- C. GALLERY / OUR WORKS IMAGES (section = 'gallery') - Each gallery item has its own independent record
INSERT INTO site_images (section, title, category, image_url, display_order, is_active) VALUES
('gallery', 'Engine Diagnostics & Repair', 'Mechanical Repairs', 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=800&q=80', 1, true),
('gallery', 'Brake & Suspension Overhaul', 'Mechanical Repairs', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80', 2, true),
('gallery', 'Precision Dent Removal', 'Tinkering', 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80', 3, true),
('gallery', 'Chassis Alignment', 'Tinkering', 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80', 4, true),
('gallery', 'Full Body Paint Restoration', 'Painting', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80', 5, true),
('gallery', 'Scratch & Blemish Repair', 'Painting', 'https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=800&q=80', 6, true),
('gallery', 'Premium Polish & Shine', 'Teflon Coating', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80', 7, true),
('gallery', 'Long-lasting Ceramic Protection', 'Teflon Coating', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80', 8, true),
('gallery', '24/7 Emergency Recovery', 'Roadside Towing', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80', 9, true),
('gallery', 'Safe Flatbed Transport', 'Roadside Towing', 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=800&q=80', 10, true),
('gallery', 'Genuine OEM Components', 'Spare Parts', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80', 11, true),
('gallery', 'Performance Upgrades', 'Spare Parts', 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=800&q=80', 12, true);
