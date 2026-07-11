import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Demo from '../components/Demo';
import TrustSection from '../components/TrustSection';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="page-enter">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Demo />
      <TrustSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
