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
    title: 'Car Mechanical Repairs & Engine Diagnostics in Tirupati | SRM Motors',
    metaDescription: 'Looking for expert car mechanics in Tirupati? SRM Motors in S.V. Autonagar offers comprehensive engine diagnostics, suspension overhauls, and routine maintenance.',
    h1: 'Car Mechanical Repairs in Tirupati',
    tagline: 'Precision mechanical diagnostics and full-service engine care by certified experts.',
    description: [
      'At SREE RAJA RAJESWARI MOTORS (SRM Motors), we provide bumper-to-bumper mechanical repair services designed to keep your vehicle running at peak performance. Modern cars require sophisticated diagnostic tools and expert knowledge, which is exactly what our Tirupati workshop delivers.',
      'Common mechanical issues like engine stalling, poor fuel efficiency, squeaking brakes, or unusual suspension noises can lead to costly breakdowns if ignored. Our mechanics conduct thorough inspections to identify the root cause of these problems. Whether you need a simple brake pad replacement, a complex clutch overhaul, or a deep engine diagnostic scan, we handle it all with precision.',
      'We use exclusively genuine OEM spare parts and factory-recommended lubricants for every repair. Customers across Tirupati choose us because we prioritize transparent pricing, fast turnaround times, and long-lasting mechanical solutions rather than temporary fixes.'
    ],
    features: [
      'Advanced Computerized Engine Diagnostics',
      'Brake Pad Replacement & Disc Skimming',
      'Clutch Assembly & Transmission Repairs',
      'Suspension, Shocks & Steering Overhauls',
      'Radiator Flushing & Cooling System Fixes',
      'Routine Oil Changes & Filter Replacements'
    ],
    image: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=1200&q=80'
  },
  'tinkering': {
    slug: 'tinkering',
    name: 'Tinkering',
    title: 'Expert Car Tinkering & Dent Repair Services in Tirupati | SRM Motors',
    metaDescription: 'Restore your car\'s factory shape with professional auto body tinkering and dent removal in Tirupati at SRM Motors. Structural realignment and rust repair experts.',
    h1: 'Professional Car Tinkering & Dent Repair',
    tagline: 'Seamlessly restoring your car’s body panels and structural integrity.',
    description: [
      'Vehicle collisions, parking mishaps, and daily wear can leave your car with unsightly dents and structural damage. SRM Motors specializes in high-quality car tinkering and auto body restoration in Tirupati, bringing your vehicle back to its original factory condition.',
      'Our tinkering experts address a wide range of auto body needs, from pulling out minor door dings without damaging the surrounding area, to performing major chassis realignment after a severe collision. We cut out rust, weld new metal patches, and perfectly align fenders, bumpers, and doors so your vehicle is safe and aesthetically flawless.',
      'Choosing SRM Motors means trusting technicians who use advanced hydraulic pulling tools and precision welding equipment. We don\'t just hammer out dents; we meticulously restore the structural integrity of your car, preparing it perfectly for a flawless paint finish.'
    ],
    features: [
      'Precision Dent Extraction & Panel Beating',
      'Chassis Alignment & Structural Restoration',
      'Rust Removal & Metal Patch Welding',
      'Bumper & Plastic Component Repair',
      'Door, Hood & Trunk Realignment',
      'Accident Damage Assessment'
    ],
    image: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=1200&q=80'
  },
  'ac-repairs': {
    slug: 'ac-repairs',
    name: 'AC Repairs',
    title: 'Car AC Repair & Gas Refilling Service in Tirupati | SRM Motors',
    metaDescription: 'Is your car AC blowing warm air? SRM Motors in Tirupati offers complete car air conditioning repair, R134a/R1234yf gas refilling, and leak detection.',
    h1: 'Car AC Repair & Maintenance Services',
    tagline: 'Stay cool on every drive with our comprehensive car air conditioning services.',
    description: [
      'Driving in the intense heat requires a perfectly functioning car air conditioning system. At SRM Motors in Tirupati, we offer specialized Car AC repair services to ensure your cabin remains cool, comfortable, and properly ventilated year-round.',
      'Over time, car AC systems can suffer from refrigerant leaks, failing compressors, clogged cabin filters, or faulty blower motors. If your AC is taking too long to cool, blowing warm air, or emitting a foul odor, our technicians utilize specialized pressure-testing equipment to pinpoint the exact leak or mechanical failure. We perform thorough condenser cleaning, evaporator servicing, and precise refrigerant gas recharging.',
      'We are Tirupati’s trusted choice for AC repairs because we don’t just blindly refill gas; we find and fix the underlying leak. Our comprehensive AC servicing guarantees optimal cooling efficiency and a healthier breathing environment inside your car.'
    ],
    features: [
      'Refrigerant Gas Top-up & Complete Recharge',
      'AC Compressor & Condenser Replacement',
      'Coolant Leak Detection & Pressure Testing',
      'Evaporator Core Cleaning & Disinfection',
      'Cabin Air Filter Replacement',
      'Blower Motor & AC Electrical Troubleshooting'
    ],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80'
  },
  'insurance-claims': {
    slug: 'insurance-claims',
    name: 'Insurance Claims',
    title: 'Cashless Car Insurance Claims & Accidental Repair in Tirupati | SRM Motors',
    metaDescription: 'Simplify your car insurance claims with SRM Motors in Tirupati. We coordinate with surveyors for hassle-free accidental repair and cashless claim processing.',
    h1: 'Cashless Car Insurance Claim Processing',
    tagline: 'Stress-free coordination with insurance providers for accidental vehicle repairs.',
    description: [
      'Dealing with vehicle damage after an accident is stressful enough without having to navigate complicated insurance paperwork. SRM Motors provides a streamlined, hassle-free car insurance claim service in Tirupati to get your vehicle repaired and back on the road quickly.',
      'Customers often struggle with documenting the damage correctly, filing the claim, and waiting for surveyor approvals. Our dedicated insurance assistance desk takes over this entire burden. We help you file the initial claim, capture the necessary photographic evidence, and directly coordinate with the insurance surveyors to ensure all accidental damage is properly accounted for in the repair estimate.',
      'We have established strong relationships with major insurance providers, allowing us to offer seamless cashless repair facilities. You can rely on SRM Motors to restore your car to showroom condition while we handle the backend bureaucracy.'
    ],
    features: [
      'End-to-End Accidental Claim Documentation',
      'Direct Coordination with Insurance Surveyors',
      'Cashless Repair Facilities Available',
      'Accurate Damage Estimation & Reporting',
      'Full Body Restoration & Tinkering',
      'Transparent Status Updates'
    ],
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80'
  },
  'roadside-towing': {
    slug: 'roadside-towing',
    name: 'Roadside Towing',
    title: '24/7 Car Towing Service & Flatbed Recovery in Tirupati | SRM Motors',
    metaDescription: 'Stranded? SRM Motors offers fast, safe, and secure 24/7 flatbed car towing services in and around Tirupati. Call us for immediate vehicle recovery.',
    h1: '24/7 Car Towing & Vehicle Recovery',
    tagline: 'Safe, prompt, and secure flatbed towing to our service center when you need it most.',
    description: [
      'A sudden vehicle breakdown or unfortunate accident can leave you stranded and vulnerable on the road. SRM Motors operates a highly responsive, 24/7 car towing service in Tirupati, ensuring you and your vehicle are safely transported out of harm’s way.',
      'Whether you are dealing with a severe collision, a transmission failure, or a car that simply won’t start, attempting to drive or improperly tow the vehicle can cause massive secondary damage. Our modern flatbed tow trucks are designed to securely lift and transport vehicles of all sizes—from hatchbacks to heavy SUVs—without putting any strain on the drivetrain or suspension.',
      'We pride ourselves on our rapid dispatch times and professional handling. When you call SRM Motors for towing, you are guaranteed safe transit directly to our S.V. Autonagar workshop, where our mechanics will immediately begin diagnosing the issue.'
    ],
    features: [
      '24/7 Emergency Towing Dispatch',
      'Damage-Free Flatbed Tow Trucks',
      'Accident & Collision Recovery',
      'Safe Transport for Luxury & Automatic Cars',
      'Winch-Out Services for Stuck Vehicles',
      'Direct Drop-off at SRM Service Center'
    ],
    image: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=1200&q=80'
  },
  'teflon-coating': {
    slug: 'teflon-coating',
    name: 'Teflon Coating',
    title: 'Premium Car Teflon Coating & Paint Protection in Tirupati | SRM Motors',
    metaDescription: 'Protect your car\'s paint and maintain a glossy finish with premium Teflon coating services at SRM Motors in Tirupati. Anti-scratch and weather protection.',
    h1: 'Premium Car Teflon Coating Services',
    tagline: 'Enhance your car’s shine and protect its paint from scratches, dust, and weather.',
    description: [
      'The harsh sun, heavy rains, and dusty roads of Tirupati can quickly degrade your car’s exterior paint, leaving it looking dull and aged. SRM Motors offers premium Teflon coating services to lock in your car’s shine and provide a robust layer of protection against environmental damage.',
      'Car owners frequently complain about micro-scratches, swirl marks from washing, and paint fading. Our Teflon (PTFE) coating process begins with a meticulous exterior detailing and compounding stage to remove existing surface imperfections. We then apply the synthetic Teflon sealant, which bonds with the paint to create a slick, hydrophobic barrier.',
      'This non-stick layer makes it incredibly difficult for dust, bird droppings, and hard water stains to adhere to the car. Customers choose SRM Motors for detailing because our multi-step application process guarantees a deep, mirror-like gloss that lasts for months, keeping your vehicle looking brand new.'
    ],
    features: [
      'Multi-stage Exterior Compounding & Polishing',
      'Swirl Mark & Micro-scratch Removal',
      'High-Gloss PTFE (Teflon) Sealant Application',
      'Hydrophobic Water & Dust Resistance',
      'Protection against UV Rays & Paint Fading',
      'Long-lasting Showroom Finish'
    ],
    image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=1200&q=80'
  },
  'electrical-work': {
    slug: 'electrical-work',
    name: 'Electrical Work',
    title: 'Auto Electrical Repairs & Wiring Diagnostics in Tirupati | SRM Motors',
    metaDescription: 'Expert car electrical repairs in Tirupati. SRM Motors specializes in wiring diagnostics, battery issues, alternator repairs, and sensor replacements.',
    h1: 'Expert Auto Electrical Repairs & Diagnostics',
    tagline: 'Advanced troubleshooting for car wiring, batteries, alternators, and modern sensors.',
    description: [
      'Modern vehicles are highly dependent on complex electrical systems and computerized modules. When these systems fail, it takes specialized knowledge to fix them. SRM Motors provides expert auto electrical repairs and advanced wiring diagnostics in Tirupati.',
      'Electrical issues can manifest as a dead battery, dimming headlights, malfunctioning power windows, a blown fuse, or the dreaded Check Engine Light. Finding the source of an electrical short or a failing sensor requires sophisticated multimeters and OBD-II scanning tools. Our skilled auto electricians are trained to trace complex wiring diagrams and isolate faults in alternators, starter motors, and ECU modules.',
      'Instead of blindly replacing expensive electronic parts, we focus on accurate diagnostics to save you money. SRM Motors is the preferred destination in Tirupati for resolving stubborn electrical gremlins safely and permanently, ensuring your car’s electronics function flawlessly.'
    ],
    features: [
      'Computerized OBD-II Sensor Diagnostics',
      'Battery Testing & Replacement',
      'Alternator & Starter Motor Repair',
      'Wiring Harness Inspection & Short Circuit Fixes',
      'Headlight, Indicator & Cabin Lighting Repairs',
      'Power Window & Central Locking Troubleshooting'
    ],
    image: 'https://images.unsplash.com/photo-1563261683-9e4ba6f4526d?auto=format&fit=crop&w=1200&q=80'
  },
  'painting': {
    slug: 'painting',
    name: 'Painting',
    title: 'Car Painting & Scratch Removal in Tirupati | SRM Motors',
    metaDescription: 'Get factory-finish car painting and scratch removal in Tirupati at SRM Motors. We use premium automotive paints for perfect color matching and glossy finish.',
    h1: 'Premium Car Spray Painting',
    tagline: 'Flawless color matching and full-body spray painting for a showroom finish.',
    description: [
      'Restore the beauty of your vehicle with professional car painting services at SRM Motors in Tirupati. Whether you need to fix a single scratched bumper or want a complete full-body repaint, our advanced paint booth ensures a dust-free, factory-quality finish.',
      'We use premium automotive paints and computerized color-matching technology to ensure the new paint blends perfectly with your car’s existing color. Our multi-stage process involves sanding, primer application, base coat, and a durable clear coat for maximum gloss and protection.'
    ],
    features: [
      'Computerized Exact Color Matching',
      'Full Body & Panel-by-Panel Painting',
      'Deep Scratch & Scuff Removal',
      'Dust-Free Paint Booth Application',
      'Premium Clear Coat for UV Protection'
    ],
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80'
  },
  'roadside-assistance': {
    slug: 'roadside-assistance',
    name: 'Roadside Assistance',
    title: 'Car Roadside Assistance in Tirupati | SRM Motors',
    metaDescription: 'Emergency car roadside assistance in Tirupati. Flat tire assistance, battery jump-start, and breakdown support by SRM Motors on Renigunta Road.',
    h1: 'Emergency Car Roadside Assistance',
    tagline: 'Rapid emergency roadside support, battery jump-starts, and flat tire assistance.',
    description: [
      'Stranded on the road with a dead battery, flat tire, or sudden mechanical failure? SRM Motors provides prompt roadside assistance for car drivers in and around Tirupati.',
      'Our mobile support team reaches your location equipped to handle battery jump-starts, tire changes, fuel delivery, and minor emergency electrical troubleshooting to get you moving again.'
    ],
    features: [
      'Dead Battery Jump-start Service',
      'Flat Tire Replacement & Air Check',
      'Emergency Fuel Delivery',
      'On-the-spot Minor Mechanical Fixes'
    ],
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80'
  },
  'breakdown-services': {
    slug: 'breakdown-services',
    name: 'Breakdown Services',
    title: 'Car Breakdown Repair Services in Tirupati | SRM Motors',
    metaDescription: 'Stuck with a broken car? SRM Motors offers rapid car breakdown repair services in Tirupati to diagnose and fix unexpected mechanical failures.',
    h1: 'Car Breakdown Repair Services',
    tagline: 'On-spot troubleshooting for unexpected vehicle breakdowns.',
    description: [
      'When your car breaks down unexpectedly, you need a mechanic you can trust. SRM Motors offers specialized breakdown diagnostic services in Tirupati to quickly identify and resolve the issue.',
      'Our technicians act fast to inspect engine failures, overheating issues, or transmission locks. If the vehicle requires heavy machinery to fix, we coordinate immediate towing to our Autonagar facility.'
    ],
    features: [
      'Rapid Engine Failure Diagnostics',
      'Overheating & Coolant Leak Fixes',
      'Transmission & Clutch Troubleshooting',
      'Priority Workshop Repair Scheduling'
    ],
    image: 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=1200&q=80'
  },
  'spare-parts': {
    slug: 'spare-parts',
    name: 'Spare Parts',
    title: 'Genuine OEM Car Spare Parts in Tirupati | SRM Motors',
    metaDescription: 'Looking for genuine car spare parts in Tirupati? SRM Motors supplies and installs 100% authentic OEM components for all major car brands.',
    h1: 'Genuine OEM Car Spare Parts',
    tagline: '100% genuine OEM spare parts for guaranteed safety and performance.',
    description: [
      'Using counterfeit or low-quality spare parts can severely damage your vehicle. At SRM Motors in Tirupati, we exclusively use and supply 100% genuine OEM (Original Equipment Manufacturer) parts for all repairs and replacements.',
      'From brake pads and suspension mounts to engine components and electrical sensors, we source directly from authorized distributors. This guarantees that your vehicle retains its original performance, safety standards, and longevity.'
    ],
    features: [
      '100% Authentic OEM Replacements',
      'Sourced Directly from Authorized Dealers',
      'Parts Warranty as per Manufacturer',
      'Available for All Major Car Brands'
    ],
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80'
  }
};
