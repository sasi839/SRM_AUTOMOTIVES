import HeroSection from './components/HeroSection';
import MarqueeSection from './components/MarqueeSection';
import AboutSection from './components/AboutSection';
import WhyUsSection from './components/WhyUsSection';
import ServicesSection from './components/ServicesSection';
import ProjectsSection from './components/ProjectsSection';

import FooterSection from './components/FooterSection';

function App() {
  return (
    <div className="main-wrapper overflow-x-clip min-h-screen">
      <HeroSection />
      <ServicesSection />
      <ProjectsSection />
      <MarqueeSection />
      <WhyUsSection />
      <AboutSection />
      <FooterSection />
    </div>
  );
}

export default App;
