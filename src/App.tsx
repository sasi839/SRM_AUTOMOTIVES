import { useState, useEffect } from 'react';
import HeroSection from './components/HeroSection';
import MarqueeSection from './components/MarqueeSection';
import AboutSection from './components/AboutSection';
import WhyUsSection from './components/WhyUsSection';
import ServicesSection from './components/ServicesSection';
import ProjectsSection from './components/ProjectsSection';
import FooterSection from './components/FooterSection';
import EmergencyBreakdownButton from './components/EmergencyBreakdownButton';
import ServicePage from './components/ServicePage';
import AdminPage from './admin/AdminPage';
import { SiteDataProvider } from './context/SiteDataContext';
import { SERVICE_DETAILS } from './data/serviceDetails';

function App() {
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname + window.location.hash
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.hash);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (path: string) => {
    if (path.includes('#')) {
      const targetHash = path.substring(path.indexOf('#'));
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/' + targetHash);
        setCurrentPath('/' + targetHash);
      } else {
        window.history.pushState({}, '', targetHash);
        setCurrentPath('/' + targetHash);
      }
      if (targetHash) {
        setTimeout(() => {
          const el = document.querySelector(targetHash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
      return;
    }

    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pathname = window.location.pathname;
  const hash = window.location.hash;

  const isAdminRoute = pathname === '/admin' || hash === '#admin' || pathname === '/billing' || hash === '#billing';
  const isServiceRoute = pathname.startsWith('/services/');
  const serviceSlug = isServiceRoute ? pathname.replace('/services/', '').replace(/\/$/, '') : '';
  const currentService = SERVICE_DETAILS[serviceSlug];

  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]');
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    let ogTitleMeta = document.querySelector('meta[property="og:title"]');
    let ogDescMeta = document.querySelector('meta[property="og:description"]');
    let ogUrlMeta = document.querySelector('meta[property="og:url"]');
    let twitterTitleMeta = document.querySelector('meta[name="twitter:title"]');
    let twitterDescMeta = document.querySelector('meta[name="twitter:description"]');
    let metaDesc = document.querySelector('meta[name="description"]');
    let jsonLdScript = document.getElementById('srm-jsonld');

    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }

    if (isAdminRoute) {
      // Admin route: noindex, nofollow, remove JSON-LD
      robotsMeta.setAttribute('content', 'noindex, nofollow');
      document.title = 'Admin Login | SREE RAJA RAJESWARI MOTORS';
      if (jsonLdScript) jsonLdScript.remove();
    } else if (isServiceRoute && currentService) {
      // Service Detail route: index, follow, service metadata & JSON-LD
      robotsMeta.setAttribute('content', 'index, follow');
      document.title = currentService.title;
      
      const prodUrl = `https://sreerajarajeswarimotors.com/services/${currentService.slug}`;
      canonicalLink.setAttribute('href', prodUrl);
      
      if (metaDesc) metaDesc.setAttribute('content', currentService.metaDescription);
      if (ogTitleMeta) ogTitleMeta.setAttribute('content', currentService.title);
      if (ogDescMeta) ogDescMeta.setAttribute('content', currentService.metaDescription);
      if (ogUrlMeta) ogUrlMeta.setAttribute('content', prodUrl);
      if (twitterTitleMeta) twitterTitleMeta.setAttribute('content', currentService.title);
      if (twitterDescMeta) twitterDescMeta.setAttribute('content', currentService.metaDescription);

      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.id = 'srm-jsonld';
        jsonLdScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(jsonLdScript);
      }
      jsonLdScript.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": currentService.name,
        "serviceType": currentService.h1,
        "provider": {
          "@type": "AutoRepair",
          "name": "Sree Raja Rajeswari Motors",
          "alternateName": "SRM Motors",
          "url": "https://sreerajarajeswarimotors.com/",
          "logo": "https://sreerajarajeswarimotors.com/srm-logo.png",
          "image": "https://sreerajarajeswarimotors.com/srm-logo.png",
          "telephone": "+91 8919594039",
          "email": "Lokesh.lvrn@gmail.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "#184, Renigunta Road, S.V. Autonagar",
            "addressLocality": "Tirupati",
            "addressRegion": "Andhra Pradesh",
            "addressCountry": "IN"
          }
        },
        "areaServed": {
          "@type": "City",
          "name": "Tirupati"
        },
        "description": currentService.metaDescription
      });

    } else {
      // Homepage: index, follow, WebSite & AutoRepair JSON-LD
      robotsMeta.setAttribute('content', 'index, follow');
      document.title = 'SREE RAJA RAJESWARI MOTORS | Car Service, Repairs & Teflon Coating in Tirupati';
      
      const prodUrl = 'https://sreerajarajeswarimotors.com/';
      canonicalLink.setAttribute('href', prodUrl);

      const homeDesc = "SREE RAJA RAJESWARI MOTORS in Tirupati offers expert car mechanical repairs, tinkering, spray painting, teflon coating, A/C service, and emergency breakdown towing.";
      if (metaDesc) metaDesc.setAttribute('content', homeDesc);
      if (ogTitleMeta) ogTitleMeta.setAttribute('content', 'SREE RAJA RAJESWARI MOTORS | Car Service, Repairs & Teflon Coating in Tirupati');
      if (ogDescMeta) ogDescMeta.setAttribute('content', homeDesc);
      if (ogUrlMeta) ogUrlMeta.setAttribute('content', prodUrl);
      if (twitterTitleMeta) twitterTitleMeta.setAttribute('content', 'SREE RAJA RAJESWARI MOTORS | Car Service, Repairs & Teflon Coating in Tirupati');
      if (twitterDescMeta) twitterDescMeta.setAttribute('content', homeDesc);

      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.id = 'srm-jsonld';
        jsonLdScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(jsonLdScript);
      }
      jsonLdScript.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": "https://sreerajarajeswarimotors.com/#website",
            "url": "https://sreerajarajeswarimotors.com/",
            "name": "Sree Raja Rajeswari Motors",
            "alternateName": ["SRM Motors", "Sree Raja Rajeswari Motors Tirupati"],
            "publisher": {
              "@id": "https://sreerajarajeswarimotors.com/#organization"
            }
          },
          {
            "@type": "AutoRepair",
            "@id": "https://sreerajarajeswarimotors.com/#organization",
            "name": "Sree Raja Rajeswari Motors",
            "alternateName": "SRM Motors",
            "url": "https://sreerajarajeswarimotors.com/",
            "logo": "https://sreerajarajeswarimotors.com/srm-logo.png",
            "image": "https://sreerajarajeswarimotors.com/srm-logo.png",
            "telephone": "+91 8919594039",
            "email": "Lokesh.lvrn@gmail.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "#184, Renigunta Road, S.V. Autonagar",
              "addressLocality": "Tirupati",
              "addressRegion": "Andhra Pradesh",
              "postalCode": "517506",
              "addressCountry": "IN"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Automotive Services",
              "itemListElement": Object.values(SERVICE_DETAILS).map(s => ({
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": s.name,
                  "description": s.metaDescription
                }
              }))
            }
          }
        ]
      });
    }
  }, [currentPath, isAdminRoute, isServiceRoute, currentService]);

  if (isAdminRoute) {
    return <AdminPage />;
  }

  if (isServiceRoute && serviceSlug) {
    return (
      <SiteDataProvider>
        <ServicePage slug={serviceSlug} onNavigate={handleNavigate} />
      </SiteDataProvider>
    );
  }

  return (
    <SiteDataProvider>
      <main className="main-wrapper overflow-x-clip min-h-screen">
        <HeroSection />
        <ServicesSection onNavigate={handleNavigate} />
        <ProjectsSection />
        <MarqueeSection />
        <WhyUsSection />
        <AboutSection />
        <FooterSection />
        <EmergencyBreakdownButton />
      </main>
    </SiteDataProvider>
  );
}

export default App;
