'use client';

import { motion } from 'motion/react';
import { 
  MessageSquare, 
  Zap, 
  Edit3, 
  FileText, 
  Code, 
  Bot,
  Wand2 
} from 'lucide-react';

const features = [
  {
    icon: Edit3,
    title: "Smart Text Editing",
    description: "Select any text and tell AI what to do. 'Make it formal', 'summarize this', or 'fix grammar' - AI understands your intent.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: MessageSquare,
    title: "Document Chat", 
    description: "Chat with your document in real-time. Ask questions, get summaries, or request specific changes - your AI writing partner.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "No complex menus or learning curve. AI transforms your content instantly with simple, natural instructions.",
    color: "from-amber-500 to-orange-500"
  },
  {
    icon: FileText,
    title: "Better Than Word",
    description: "All the formatting you need, plus AI superpowers. Create professional documents faster than ever before.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Code,
    title: "Code Snippets Too",
    description: "Need code examples or technical content? AI can generate and explain code snippets within your documents.",
    color: "from-indigo-500 to-blue-500"
  },
  {
    icon: Bot,
    title: "Context-Aware AI",
    description: "AI understands your entire document. Get suggestions that fit your content, tone, and writing style perfectly.",
    color: "from-slate-500 to-gray-500"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-4 cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            <Wand2 className="w-4 h-4" />
            Features
          </motion.div>
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
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative cursor-pointer"
            >
              <div className="relative p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Icon */}
                <motion.div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-6 cursor-pointer`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                  layoutId={`feature-bg-${index}`}
                />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
} 