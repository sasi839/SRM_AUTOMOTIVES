import { useState, useEffect } from 'react';
import HeroSection from './components/HeroSection';
import MarqueeSection from './components/MarqueeSection';
import AboutSection from './components/AboutSection';
import WhyUsSection from './components/WhyUsSection';
import ServicesSection from './components/ServicesSection';
import ProjectsSection from './components/ProjectsSection';
import FooterSection from './components/FooterSection';
import EmergencyBreakdownButton from './components/EmergencyBreakdownButton';
import AdminPage from './admin/AdminPage';
import { SiteDataProvider } from './context/SiteDataContext';

function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(
    window.location.pathname === '/admin' || window.location.hash === '#admin'
  );

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminRoute(
        window.location.pathname === '/admin' || window.location.hash === '#admin'
      );
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (isAdminRoute) {
    return <AdminPage />;
  }

  return (
    <SiteDataProvider>
      <div className="main-wrapper overflow-x-clip min-h-screen">
        <HeroSection />
        <ServicesSection />
        <ProjectsSection />
        <MarqueeSection />
        <WhyUsSection />
        <AboutSection />
        <FooterSection />
        <EmergencyBreakdownButton />
      </div>
    </SiteDataProvider>
  );
}

export default App;
