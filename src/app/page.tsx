import { HeroSection } from '@/components/homepage/hero-section';
import { FeaturesSection } from '@/components/homepage/features-section';
import { DemoSection } from '@/components/homepage/demo-section';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">Ready to transform your writing?</h3>
            <p className="text-gray-400">Join the future of document editing with VibeDoc</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
