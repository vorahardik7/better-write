import { HeroSection } from '@/components/homepage/hero-section';
import { FeaturesSection } from '@/components/homepage/features-section';
import { DemoSection } from '@/components/homepage/demo-section';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      
    </main>
  );
}
