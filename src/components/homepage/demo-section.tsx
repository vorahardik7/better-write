'use client';

import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { MousePointer, Command, Brain, CheckCircle, Zap, Type, Edit3, Send } from 'lucide-react';
import { SectionHeader } from './section-header';

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
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          const index = Number(visibleEntry.target.getAttribute('data-step-index'));
          if (!Number.isNaN(index)) {
            setCurrentStep(index);
          }
        }
      },
      {
        threshold: 0.55,
      }
    );

    const currentRefs = stepRefs.current;
    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
      observer.disconnect();
    };
  }, []);

  const renderStepContent = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <MousePointer className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Select text</h3>
                <p className="text-sm text-slate-600">Highlight the text you want to transform</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="relative">
                  <p className="text-lg leading-relaxed text-slate-800">
                    Our Q3 product launch went well last month. We saw good engagement and positive feedback from users.
                  </p>
                  <motion.div
                    className="absolute inset-0 bg-slate-200/30 rounded"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
                  />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                Selected
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <span>Next: Press</span>
              <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-semibold">⌘K</kbd>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Command className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Press ⌘K</h3>
                <p className="text-sm text-slate-600">Open the AI command palette</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-xs font-medium text-slate-500 ml-2">AI Command Palette</span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Your prompt</p>
                  <p className="text-sm text-slate-700">
                    {demoSteps[1].prompt}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                  <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Brain className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">AI Suggestion</h3>
                <p className="text-sm text-slate-600">Review the enhanced text suggestion</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-900">AI Suggestion Ready</span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Original</p>
                    <p className="text-sm text-slate-600 line-through">
                      {demoSteps[0].originalText}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Suggested</p>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {demoSteps[2].suggestion}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                    <CheckCircle className="h-4 w-4" />
                    Accept suggestion
                  </button>
                  <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
      default:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <CheckCircle className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Complete</h3>
                <p className="text-sm text-slate-600">Your text has been enhanced with AI</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-slate-900">Transformation Complete</span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Enhanced Text</p>
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">
                    {demoSteps[3].finalText}
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    <Zap className="h-3 w-3" />
                    3x more professional
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    <Type className="h-3 w-3" />
                    Specific outcomes
                  </span>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                    <Edit3 className="h-4 w-4" />
                    Continue editing
                  </button>
                  <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <section id="demo" className="bg-[#f5f4f0] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader sectionId="demo" label="Demo" order={2}>
          Demo
        </SectionHeader>

        <div className="lg:grid lg:grid-cols-[1.05fr_1.6fr] lg:gap-16">
          <div className="space-y-10 lg:space-y-14 lg:sticky lg:top-24 lg:self-start lg:pt-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="max-w-xl"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                How it works
              </span>
              <h2 className="mt-6 text-4xl font-semibold leading-[1.05] text-slate-900 sm:text-5xl">
                Watch the AI palette elevate your document in seconds
              </h2>
            </motion.div>

            <div className="hidden lg:flex flex-col gap-4">
              {demoSteps.map((step, index) => (
                <div
                  key={step.step}
                  className={`rounded-2xl border px-5 py-4 transition-all duration-300 ${
                    currentStep === index
                      ? 'border-slate-900 bg-white shadow-xl'
                      : 'border-transparent bg-white/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                        currentStep === index
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {step.step.toString().padStart(2, '0')}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${currentStep === index ? 'text-slate-900' : 'text-slate-600'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 space-y-24 lg:mt-0 lg:space-y-32">
            {demoSteps.map((step, index) => (
              <div
                key={step.step}
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                data-step-index={index}
                className="min-h-[80vh] scroll-mt-32 flex items-center"
              >
                <motion.div
                  initial={{ opacity: 0, y: 48 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.45 }}
                  animate={{
                    scale: currentStep === index ? 1 : 0.97,
                    boxShadow:
                      currentStep === index
                        ? '0px 32px 96px rgba(15, 23, 42, 0.16)'
                        : '0px 16px 48px rgba(15, 23, 42, 0.08)',
                    borderColor: currentStep === index ? 'rgba(15, 23, 42, 0.2)' : 'rgba(148, 163, 184, 0.25)',
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="w-full rounded-[30px] border bg-white px-8 py-10 shadow-xl"
                >
                  {renderStepContent(index)}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}