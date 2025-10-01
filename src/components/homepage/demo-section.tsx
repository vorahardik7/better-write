'use client';

import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

const demoSteps = [
  {
    step: 1,
    title: 'Select text',
    description: 'Highlight the text you want to transform',
    originalText: 'Our Q3 product launch went well last month.',
    isSelected: false,
  },
  {
    step: 2,
    title: 'Press ⌘K',
    description: 'Open the AI palette and enter your prompt',
    prompt: 'Make this sound more professional and include specific outcomes',
    isSelected: false,
  },
  {
    step: 3,
    title: 'AI suggestion',
    description: 'Review the enhanced text suggestion',
    suggestion: 'Our Q3 launch exceeded targets, achieving 150% of projected revenue and onboarding 2,847 new customers within the first month.',
    isSelected: false,
  },
  {
    step: 4,
    title: 'Accept changes',
    description: 'Apply the transformation with one click',
    finalText: 'Our Q3 launch exceeded targets, achieving 150% of projected revenue and onboarding 2,847 new customers within the first month.',
    isSelected: false,
  },
];

export function DemoSection() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % demoSteps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="demo" className="bg-[#f5f4f0] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            How it works
          </span>
          <h2 className="mt-6 text-4xl font-semibold leading-[1.05] text-slate-900 sm:text-5xl">
            Watch the AI palette elevate your document in seconds
          </h2>
          <p className="mt-4 text-lg font-medium text-slate-600">
            See how BetterWrite transforms your writing with intelligent suggestions and seamless integration.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mx-auto mt-14 grid max-w-6xl gap-8 lg:grid-cols-2"
        >
          {/* Interactive Demo Card */}
          <div className="rounded-[28px] border border-black/5 bg-white p-8 shadow-[0_32px_80px_rgba(15,23,42,0.08)]">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Interactive Demo</h3>
              <p className="mt-2 text-sm text-slate-600">Watch the transformation in action</p>
            </div>
            
            <div className="rounded-2xl border border-black/10 bg-[#f8fafc] p-6">
              {/* Step indicator */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex gap-2">
                  {demoSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-8 rounded-full transition-all duration-300 ${
                        index <= currentStep ? 'bg-slate-900' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Step {currentStep + 1} of {demoSteps.length}
                </span>
              </div>

              {/* Demo content */}
              <div className="min-h-[300px] space-y-4">
                {currentStep === 0 && (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                      Original text
                    </div>
                    <div className="relative">
                      <p className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 text-sm font-medium text-slate-700">
                        {demoSteps[0].originalText}
                      </p>
                      <div className="absolute -top-2 -right-2 rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold text-white">
                        Selected
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                        <span>Press ⌘K to continue</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                      AI Palette
                    </div>
                    <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-4">
                      <div className="mb-2 text-xs font-semibold text-green-700">Your prompt:</div>
                      <p className="text-sm font-medium text-slate-700">
                        {demoSteps[1].prompt}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                        <span>Processing...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                      AI Suggestion
                    </div>
                    <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-medium leading-6 text-slate-700">
                        {demoSteps[2].suggestion}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 rounded-full border border-black/10 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
                        Accept
                      </button>
                      <button className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-black/20">
                        Ask again
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                      Final Result
                    </div>
                    <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-4">
                      <p className="text-sm font-medium leading-6 text-slate-700">
                        {demoSteps[3].finalText}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold text-green-700">
                        <span>✓ Transformation complete</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Features Card */}
          <div className="space-y-6">
            <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-slate-900">Key Features</h3>
              <div className="mt-6 space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-[#f5f4f0] text-sm font-semibold text-slate-900">
                    01
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Smart Selection</p>
                    <p className="mt-1 text-sm text-slate-600">Highlight any text to get contextual AI suggestions</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-[#f5f4f0] text-sm font-semibold text-slate-900">
                    02
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Instant Palette</p>
                    <p className="mt-1 text-sm text-slate-600">Press ⌘K to open the AI command palette instantly</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-[#f5f4f0] text-sm font-semibold text-slate-900">
                    03
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">One-Click Apply</p>
                    <p className="mt-1 text-sm text-slate-600">Accept or refine suggestions with a single click</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_26px_70px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-slate-900">Pro Tips</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="rounded-2xl border border-black/10 bg-[#f5f4f0] px-4 py-3">
                  Use specific prompts like &ldquo;make this more formal&rdquo; or &ldquo;add metrics&rdquo;
                </li>
                <li className="rounded-2xl border border-black/10 bg-[#f5f4f0] px-4 py-3">
                  Combine instructions: &ldquo;formal tone + highlight key points&rdquo;
                </li>
                <li className="rounded-2xl border border-black/10 bg-[#f5f4f0] px-4 py-3">
                  Preserves your formatting and style while enhancing content
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}