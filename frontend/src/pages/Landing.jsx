import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Journey from '../components/landing/Journey';
import Companies from '../components/landing/Companies';
import CTA from '../components/landing/CTA';
import ParticleBackground from '../components/ui/ParticleBackground';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col relative selection:bg-purple-500 selection:text-white">
      <ParticleBackground />
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <Journey />
        <Companies />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
