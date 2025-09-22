'use client';

import { motion } from 'motion/react';

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-pattern">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Simple pricing</h2>
          <p className="text-lg text-gray-600">Everything you need to write better, for one low price.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white border-2 border-black rounded-2xl shadow-[8px_8px_0_#000] p-8 max-w-md mx-auto"
        >
          <div className="mb-6">
            <div className="text-sm font-semibold text-gray-700 mb-1">BetterWrite</div>
            <div className="flex items-end gap-3">
              <div className="text-6xl font-extrabold text-gray-900">Free*</div>
              <div className="text-2xl text-gray-500 line-through mb-2">$15/mo</div>
            </div>
            <div className="text-gray-700 mt-1">Limited time launch access</div>
          </div>

          <ul className="text-gray-800 space-y-3 text-sm">
            <li>✔ Unlimited documents</li>
            <li>✔ AI editing and tone transforms</li>
            <li>✔ Document chat</li>
            <li>✔ Export (PDF/Markdown)</li>
            <li>✔ Sharing links</li>
            <li>✔ Priority improvements</li>
          </ul>

          <div className="mt-8">
            <a href="/editor" className="inline-block bg-white border-2 border-black rounded-xl shadow-[6px_6px_0_#000] px-8 py-4 font-bold text-black hover:shadow-[8px_8px_0_#000] cursor-pointer">
              Start free
            </a>
            <div className="text-xs text-gray-500 mt-2">* Original pricing $15/mo. Offer available for a limited time.</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


