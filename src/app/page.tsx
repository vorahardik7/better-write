import { HeroSection } from '@/components/homepage/hero-section';
import { FeaturesSection } from '@/components/homepage/features-section';
import { DemoSection } from '@/components/homepage/demo-section';
import { PricingSection } from '@/components/homepage/pricing-section';
import { Navbar } from '@/components/homepage/navbar';
import { ScrollSectionsProvider } from '@/components/homepage/scroll-sections-context';

export default function Home() {
  return (
    <main className="relative bg-[#fff5f9] text-slate-900">
      <ScrollSectionsProvider>
        <Navbar />
        <div className="relative isolate motion-smooth">
          <div className="pointer-events-none absolute inset-0 blur-3xl" aria-hidden>
            <div className="absolute -left-20 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-orange-200 via-rose-200 to-purple-200 opacity-70" />
            <div className="absolute right-0 top-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-blue-200 via-sky-100 to-white opacity-70" />
            <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-gradient-to-br from-amber-100 via-peachpuff to-pink-100 opacity-60" />
          </div>
          <HeroSection />
          <FeaturesSection />
        </div>

        <DemoSection />
        <PricingSection />
      </ScrollSectionsProvider>
    </main>
  );
}
