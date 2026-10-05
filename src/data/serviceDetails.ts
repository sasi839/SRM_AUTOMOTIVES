export interface ServiceDetail {
  slug: string;
  name: string;
  title: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  description: string[];
  features: string[];
  image: string;
}

export const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  'mechanical-repairs': {
    slug: 'mechanical-repairs',
    name: 'Mechanical Repairs',
    title: 'Car Mechanical Repairs in Tirupati | SREE RAJA RAJESWARI MOTORS',
    metaDescription: 'Expert car mechanical repairs and engine diagnostics in Tirupati at SREE RAJA RAJESWARI MOTORS. S.V. Autonagar, Renigunta Road service center for all car models.',
    h1: 'Car Mechanical Repairs in Tirupati',
    tagline: 'Comprehensive engine diagnostics, routine maintenance, and precision mechanical troubleshooting in Autonagar, Tirupati.',
    description: [
      'At SREE RAJA RAJESWARI MOTORS in S.V. Autonagar, Tirupati, mechanical repairs form the core foundation of our workshop services. We handle everything from routine oil changes and filter replacements to complex engine diagnostics and mechanical overhauls.',
      'Our workshop on Renigunta Road is equipped with modern diagnostic tools to accurately identify mechanical issues across multi-brand vehicles. Whether your car requires brake pad replacements, clutch overhauls, suspension adjustments, or cooling system fixes, our team ensures every job is completed with precision.',
      'We use 100% genuine OEM spare parts for all replacements to ensure long-lasting vehicle safety, fuel efficiency, and optimal engine performance for your drives across Tirupati.'
    ],
    features: [
      'Engine Diagnostics & Tune-ups',
      'Brake System Maintenance & Pad Replacement',
      'Clutch & Transmission Repair',
      'Suspension & Shock Absorber Overhaul',
      'Engine Cooling & Radiator Servicing',
      '100% Genuine OEM Replacement Parts'
    ],
    image: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=1200&q=80'
  },
  'tinkering': {
    slug: 'tinkering',
    name: 'Tinkering',
    title: 'Car Body Tinkering & Dent Repair in Tirupati | SREE RAJA RAJESWARI MOTORS',
    metaDescription: 'Professional car tinkering and auto body dent repair in Tirupati at SREE RAJA RAJESWARI MOTORS. Precision dent removal and panel alignment on Renigunta Road.',
    h1: 'Car Body Tinkering & Dent Repair in Tirupati',
    tagline: 'Precision auto body tinkering, dent removal, and structural panel restoration at S.V. Autonagar, Tirupati.',
    description: [
      'Accidents, minor scratches, and road bumps can damage your car’s body panels. At SREE RAJA RAJESWARI MOTORS, our expert body tinkering team in Tirupati specializes in restoring damaged panels to their original factory shape.',
      'Located on Renigunta Road, our tinkering unit utilizes specialized body alignment tools to remove dents cleanly without damaging the vehicle’s structural integrity. From minor door dings to major fender and chassis realignments, we handle bodywork with meticulous care.',
      'Once tinkering is complete, our auto body panels are seamlessly prepared for spray painting and color matching to give your car a flawless finish.'
    ],
    features: [
      'Precision Car Dent Removal',
      'Fender & Bumper Alignment',
      'Door & Bonnet Panel Repair',
      'Chassis & Structural Realignment',
      'Accident Damage Restoration',
      'Pre-Paint Surface Preparation'
    ],
    image: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=1200&q=80'
  },
  'painting': {
    slug: 'painting',
    name: 'Painting',
    title: 'Car Spray Painting & Touch-up in Tirupati | SREE RAJA RAJESWARI MOTORS',
    metaDescription: 'High-quality car spray painting, custom color matching, and scratch repair in Tirupati. Full body paint restoration at SREE RAJA RAJESWARI MOTORS, S.V. Autonagar.',
    h1: 'Car Spray Painting & Body Restoration in Tirupati',
    tagline: 'Premium full-body spray painting, spot scratch repairs, and computer-matched color finishing in Tirupati.',
    description: [
      'Give your car a showroom shine with professional automotive spray painting at SREE RAJA RAJESWARI MOTORS in Tirupati. Our specialized paint facility in S.V. Autonagar ensures dust-free paint application and factory-matched color accuracy.',
      'We handle complete vehicle repaints, individual panel touch-ups, bumper scratch fixes, and clear coat restoration for cars of all makes and models. Our paint technicians use high-grade automotive finishes that withstand sun, heat, and weather conditions.',
      'Whether you are restoring faded paintwork or fixing accidental scratches on Renigunta Road, SREE RAJA RAJESWARI MOTORS delivers smooth, high-gloss paint perfection.'
    ],
    features: [
      'Full Body Car Spray Painting',
      'Panel Touch-ups & Scratch Repair',
      'Computerized Color Matching',
      'Bumper & Mirror Paint Restoration',
      'High-Gloss Clear Coat Protection',
      'Weather & UV Resistant Paint Finish'
    ],
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80'
  },
  'teflon-coating': {
    slug: 'teflon-coating',
    name: 'Teflon Coating',
    title: 'Car Teflon Coating & Paint Protection in Tirupati | SREE RAJA RAJESWARI MOTORS',
    metaDescription: 'Premium car Teflon coating and ceramic paint protection in Tirupati at SREE RAJA RAJESWARI MOTORS. Shield your car’s exterior paint with long-lasting gloss and shine.',
    h1: 'Car Teflon Coating & Paint Protection in Tirupati',
    tagline: 'Advanced exterior paint protection, high-gloss Teflon coating, and scratch shielding in Autonagar, Tirupati.',
    description: [
      'Protect your car’s paint investment with professional Teflon coating at SREE RAJA RAJESWARI MOTORS in Tirupati. Teflon coating adds a clear protective layer over your car’s paint, guarding against minor scratches, UV damage, road grime, and paint fading.',
      'Our detailers in S.V. Autonagar thoroughly wash, polish, and decontaminate the car exterior before applying premium Teflon sealant. The result is a smooth, hydrophobic finish that repels water and dirt while delivering a mirror-like shine.',
      'Keep your vehicle looking fresh and well-maintained on the roads of Tirupati with regular Teflon treatment at SREE RAJA RAJESWARI MOTORS.'
    ],
    features: [
      'Protective Teflon Paint Sealant',
      'Hydrophobic Surface Gloss & Polish',
      'Minor Scratch & Swirl Masking',
      'UV Protection Against Color Fading',
      'Dust & Dirt Repellent Finish',
      'Comprehensive Exterior Paint Conditioning'
    ],
    image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=1200&q=80'
  },
  'ac-repairs': {
    slug: 'ac-repairs',
    name: 'A/C Repairs',
    title: 'Car AC Repair & Gas Refill in Tirupati | SREE RAJA RAJESWARI MOTORS',
    metaDescription: 'Complete car AC repair, cooling service, compressor fix, and gas refilling in Tirupati at SREE RAJA RAJESWARI MOTORS, Renigunta Road.',
    h1: 'Car AC Repair & Servicing in Tirupati',
    tagline: 'Fast and reliable car air conditioning diagnostics, refrigerant gas charging, and cooling system repairs in Tirupati.',
    description: [
      'Beat the Tirupati heat with crisp, refreshing car air conditioning serviced by SREE RAJA RAJESWARI MOTORS. Our car AC repair specialists in S.V. Autonagar diagnose and fix all cooling issues to keep your cabin comfortable.',
      'We offer complete AC system inspections, refrigerant R134a/R1234yf gas refilling, leak detection, AC compressor repair, condenser cleaning, and cabin filter replacement. If your car AC is blowing warm air or emitting unpleasant odors, our team resolves it quickly.',
      'Visit our workshop on Renigunta Road for reliable car AC maintenance and enjoy cool, clean airflow on every drive.'
    ],
    features: [
      'Car AC Refrigerant Gas Top-up & Recharge',
      'AC Compressor Diagnosis & Repair',
      'Condenser & Evaporator Servicing',
      'Cooling Leak Detection & Pressure Test',
      'Cabin Air Filter Replacement & Disinfection',
      'Blower Motor & Electrical Repair'
    ],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80'
  },
  'insurance-claims': {
    slug: 'insurance-claims',
    name: 'Insurance Claims',
    title: 'Car Insurance Claim Assistance in Tirupati | SREE RAJA RAJESWARI MOTORS',
    metaDescription: 'Hassle-free accidental car insurance claim processing and cashless repair support in Tirupati at SREE RAJA RAJESWARI MOTORS, S.V. Autonagar.',
    h1: 'Car Insurance Claim Processing in Tirupati',
    tagline: 'Hassle-free insurance documentation, surveyor coordination, and accidental repair assistance in Tirupati.',
    description: [
      'Dealing with vehicle damage after an accident is stressful. At SREE RAJA RAJESWARI MOTORS in S.V. Autonagar, Tirupati, we simplify the insurance claim process for car owners.',
      'Our experienced team assists you with claim documentation, damage estimations, and surveyor inspections. We work closely with major insurance providers to facilitate smooth accidental repair workflows and minimize downtime.',
      'From body tinkering and spray painting to mechanical damage fixes, SREE RAJA RAJESWARI MOTORS restores your car back to roadworthy condition with complete transparency.'
    ],
    features: [
      'Accidental Insurance Claim Documentation',
      'Insurance Surveyor Coordination',
      'Accurate Body & Mechanical Repair Estimates',
      'Accident Damage Restoration',
      'Quality Genuine OEM Replacement Parts',
      'Transparent Claim Settlement Support'
    ],
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80'
  },
  'roadside-assistance': {
    slug: 'roadside-assistance',
    name: 'Roadside Assistance',
    title: 'Car Roadside Assistance in Tirupati | SREE RAJA RAJESWARI MOTORS',
    metaDescription: 'Emergency car roadside assistance in Tirupati. Flat tire assistance, battery jump-start, and breakdown support by SREE RAJA RAJESWARI MOTORS on Renigunta Road.',
    h1: 'Emergency Car Roadside Assistance in Tirupati',
    tagline: 'Rapid emergency roadside support, battery jump-starts, and flat tire assistance across Tirupati.',
    description: [
      'Stranded on the road with a dead battery, flat tire, or sudden mechanical failure? SREE RAJA RAJESWARI MOTORS provides prompt roadside assistance for car drivers in and around Tirupati.',
      'Our mobile support team reaches your location equipped to handle battery jump-starts, tire changes, fuel delivery, and minor emergency electrical troubleshooting.',
      'If your car cannot be fixed on-site, our towing service promptly transports your vehicle to our S.V. Autonagar service center on Renigunta Road for detailed repairs.'
    ],
    features: [
      'Dead Battery Jump-start Service',
      'Flat Tire Replacement & Air Check',
      'Emergency Fuel Top-up Assistance',
      'Minor Electrical & Mechanical On-spot Fixes',
      'Vehicle Towing Dispatch',
      'Quick Response in Tirupati'
    ],
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80'
  },
  'breakdown-services': {
    slug: 'breakdown-services',
    name: 'Breakdown Services',
    title: 'Car Breakdown Repair Service in Tirupati | SREE RAJA RAJESWARI MOTORS',
    metaDescription: 'Immediate car breakdown troubleshooting and roadside repair service in Tirupati by SREE RAJA RAJESWARI MOTORS. Rapid response team for vehicle emergencies.',
    h1: 'Car Breakdown Repair Services in Tirupati',
    tagline: 'On-spot breakdown troubleshooting, engine failure diagnostics, and roadside repair assistance in Tirupati.',
    description: [
      'Vehicle breakdowns can occur unexpectedly due to engine overheating, starter motor failure, belt snap, or electrical faults. SREE RAJA RAJESWARI MOTORS delivers reliable car breakdown services in Tirupati.',
      'Our skilled automotive mechanics reach your location with diagnostic equipment to identify the root cause of the breakdown and attempt immediate on-site repair whenever feasible.',
      'For severe mechanical or gearbox issues, we coordinate safe vehicle recovery to our workshop in S.V. Autonagar, Renigunta Road, ensuring your car gets expert care.'
    ],
    features: [
      'On-site Engine & Starter Diagnostics',
      'Overheating & Radiator Emergency Help',
      'Fan Belt & Hose Replacement',
      'Electrical Fuse & Alternator Troubleshooting',
      'Direct Towing Coordination',
      'Professional Mechanic Support'
    ],
    image: 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=1200&q=80'
  },
  'roadside-towing': {
    slug: 'roadside-towing',
    name: 'Roadside Towing',
    title: 'Car Towing Service in Tirupati | SREE RAJA RAJESWARI MOTORS',
    metaDescription: 'Safe and secure car towing service in Tirupati. Flatbed vehicle recovery to SREE RAJA RAJESWARI MOTORS service center at S.V. Autonagar, Renigunta Road.',
    h1: 'Car Towing & Recovery Service in Tirupati',
    tagline: 'Safe, damage-free flatbed towing and emergency vehicle recovery across Tirupati and Renigunta Road.',
    description: [
      'When your car is unable to drive due to a severe breakdown or accidental collision, SREE RAJA RAJESWARI MOTORS provides safe and secure roadside towing in Tirupati.',
      'We utilize flatbed vehicle transport to safely haul hatchback, sedan, SUV, and luxury cars without causing bumper or undercarriage strain.',
      'Our tow trucks transport your vehicle directly to our equipped service workshop in S.V. Autonagar on Renigunta Road, Tirupati, where our mechanics immediately begin diagnostic inspection.'
    ],
    features: [
      'Safe Flatbed Vehicle Towing',
      'Accident & Breakdown Recovery',
      'Underbody & Bumper Damage Prevention',
      'Hatchback, Sedan & SUV Transport',
      'Direct Haul to Autonagar Workshop',
      'Dependable Service in Tirupati'
    ],
    image: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=1200&q=80'
  },
  'spare-parts': {
    slug: 'spare-parts',
    name: 'Spare Parts',
    title: 'Genuine Car Spare Parts in Tirupati | SREE RAJA RAJESWARI MOTORS',
    metaDescription: '100% genuine OEM car spare parts in Tirupati at SREE RAJA RAJESWARI MOTORS. Engine parts, suspension kits, brakes, filters, and lubricants for all car brands.',
    h1: 'Genuine OEM Car Spare Parts in Tirupati',
    tagline: '100% authentic OEM replacement parts, engine components, and automotive consumables in S.V. Autonagar, Tirupati.',
    description: [
      'At SREE RAJA RAJESWARI MOTORS in Tirupati, we prioritize vehicle safety and performance by supplying 100% genuine OEM spare parts for multi-brand cars.',
      'Our inventory at S.V. Autonagar includes original engine components, brake pads, rotors, clutch assemblies, shock absorbers, air & oil filters, timing belts, and high-performance automotive lubricants.',
      'Using authentic spare parts ensures exact fitment, preserves vehicle manufacturer warranty standards, and keeps your car running reliably on the streets of Tirupati.'
    ],
    features: [
      '100% Genuine OEM Replacement Components',
      'Brake Pads, Discs & Fluid',
      'Engine Filters & Synthetic Lubricants',
      'Clutch Plates & Flywheels',
      'Suspension Arms, Bushings & Struts',
      'Compatible Parts for All Major Car Brands'
    ],
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80'
  }
};
