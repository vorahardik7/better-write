import { HeroSection } from '@/components/homepage/hero-section';
import { FeaturesSection } from '@/components/homepage/features-section';
import { DemoSection } from '@/components/homepage/demo-section';
import { PricingSection } from '@/components/homepage/pricing-section';
import { Navbar } from '@/components/homepage/navbar';

export default function Home() {
  return (
    <main className="bg-white text-slate-900">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <PricingSection />
    </main>
  );
}
