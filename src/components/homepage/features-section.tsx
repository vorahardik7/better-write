'use client';

import { motion } from 'motion/react';
import { Wand2 } from 'lucide-react';

const features = [
  {
    title: "Smart Text Editing",
    description: "Select any text and tell AI what to do. Make it formal, summarize, or fix grammar.",
    bg: "bg-amber-100"
  },
  {
    title: "Document Chat",
    description: "Chat with your document in real time. Ask questions, get summaries, request changes.",
    bg: "bg-sky-100"
  },
  {
    title: "Instant Results",
    description: "No menus or learning curve. AI transforms your content instantly.",
    bg: "bg-lime-100"
  },
  {
    title: "Better Than Word",
    description: "Modern formatting plus AI superpowers to create professional docs faster.",
    bg: "bg-rose-100"
  },
  {
    title: "Code Snippets Too",
    description: "Generate examples and technical snippets inline without breaking your flow.",
    bg: "bg-violet-100"
  },
  {
    title: "Context-Aware AI",
    description: "Understands your entire document for suggestions that match tone and style.",
    bg: "bg-gray-100"
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-12 bg-pattern">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Document editing, 
            <span className="text-blue-600"> simplified</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you love about Word, enhanced with AI that actually helps you write better
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="group relative cursor-pointer"
           >
              <div className={`relative p-8 rounded-xl border-2 border-black shadow-[6px_6px_0_#000] ${feature.bg} h-[180px] flex flex-col justify-between`}>
                <h3 className="text-xl font-bold text-black mb-3">
                  {feature.title}
                </h3>
                <p className="text-black/80 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
} 