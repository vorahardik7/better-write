'use client';

import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { MousePointer, Command, Brain, CheckCircle, Zap, Type, Edit3, Send } from 'lucide-react';
import { SectionHeader } from './section-header';

const demoSteps = [
  {
    step: 1,
    title: 'Drop your source',
    description: 'Paste research, meeting notes, or a rough draft into better-write.',
    originalText: 'Discovery sync raw notes • 40 min call • Key takeaways: pilot launch, ops blockers, success metrics tracking.',
  },
  {
    step: 2,
    title: 'Call the command palette',
    description: 'Highlight a section and press ⌘K. Ask for a rewrite, summary, or action plan.',
    prompt: 'Create a stakeholder-ready brief with goals, risks, timeline, and owner from these notes.',
  },
  {
    step: 3,
    title: 'Review the structured output',
    description: 'AI drafts the sections you need while keeping your source nearby.',
    suggestion:
      'Summary: Pilot with 25 customers in June. Goals: 92% onboarding completion by week 2. Risks: integration backlog, support bandwidth. Next steps: finalize ops checklist by May 18, confirm analytics triggers.',
  },
  {
    step: 4,
    title: 'Publish or export',
    description: 'Accept changes, share for review, or export to your existing workflow.',
    finalText:
      'Stakeholder brief drafted, reviewers tagged, and export queued to PDF + Notion. Tasks synced to roadmap workspace.',
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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ccd5ae]/60">
                <MousePointer className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Drop your source</h3>
                <p className="text-sm text-slate-600">Paste research notes or import an existing doc into better-write.</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-[#fefae0] rounded-2xl border border-[#e9edc9] p-6 shadow-sm">
                <div className="relative">
                  <p className="text-lg leading-relaxed text-slate-800">
                    Discovery sync • 40 min call • Key takeaways: pilot launch with 25 customers, onboarding blockers, analytics owners TBD.
                  </p>
                  <motion.div
                    className="absolute inset-0 bg-[#ccd5ae]/30 rounded"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
                  />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 bg-[rgba(212,163,115,0.9)] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                Captured
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <span>Next: Highlight the key section and press ⌘K.</span>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-8">
              <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ccd5ae]/60">
                <Command className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Call the command palette</h3>
                <p className="text-sm text-slate-600">Highlight what matters, press ⌘K, and ask for the rewrite or summary you need.</p>
              </div>
            </div>

            <div className="bg-[#fefae0] rounded-2xl border border-[#e9edc9] shadow-lg overflow-hidden">
              <div className="bg-[#e9edc9] border-b border-[#d4a373]/40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-xs font-medium text-slate-600 ml-2">AI Command Palette</span>
                </div>
              </div>

                <div className="p-6 space-y-4">
                  <div className="rounded-lg border border-[#d4a373]/30 bg-[#fbf1d6] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">Prompt</p>
                    <p className="text-sm text-slate-700">
                      {demoSteps[1].prompt}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#d4a373] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c18f62]">
                      <Send className="h-4 w-4" />
                      Generate
                    </button>
                    <button className="rounded-lg border border-[#d4a373]/40 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#fdf8eb]">
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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ccd5ae]/60">
                <Brain className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Review the structured output</h3>
                <p className="text-sm text-slate-600">Better-write lays the summary beside your source so you can tweak fast.</p>
              </div>
            </div>

            <div className="bg-[#fefae0] rounded-2xl border border-[#e9edc9] shadow-lg overflow-hidden">
              <div className="bg-[#e9edc9] border-b border-[#d4a373]/40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-900">Brief preview</span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-[#d4a373]/30 bg-[#fbf1d6] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">Original notes</p>
                    <p className="text-sm text-slate-600 line-through">
                      {demoSteps[0].originalText}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#e9edc9] bg-[#fefae0] p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">Structured brief</p>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {demoSteps[2].suggestion}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#d4a373] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c18f62]">
                    <CheckCircle className="h-4 w-4" />
                    Insert sections
                  </button>
                  <button className="rounded-lg border border-[#d4a373]/40 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#fdf8eb]">
                    Regenerate
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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ccd5ae]/60">
                <CheckCircle className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Publish or export</h3>
                <p className="text-sm text-slate-600">Accept edits, share, or push tasks into your roadmap tool.</p>
              </div>
            </div>

            <div className="bg-[#fefae0] rounded-2xl border border-[#e9edc9] shadow-lg overflow-hidden">
              <div className="bg-[#e9edc9] border-b border-[#d4a373]/40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#88994f]" />
                  <span className="text-sm font-semibold text-slate-900">Launch-ready</span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="rounded-lg border border-[#d4a373]/30 bg-[#fbf1d6] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">Final brief</p>
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">
                    {demoSteps[3].finalText}
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#ccd5ae]/60 px-3 py-1 text-xs font-semibold text-slate-700">
                    <Zap className="h-3 w-3" />
                    Tasks synced
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#ccd5ae]/60 px-3 py-1 text-xs font-semibold text-slate-700">
                    <Type className="h-3 w-3" />
                    Ready to share
                  </span>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#d4a373] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c18f62]">
                    <Edit3 className="h-4 w-4" />
                    Continue editing
                  </button>
                  <button className="rounded-lg border border-[#d4a373]/40 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#fdf8eb]">
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
    <section
      id="demo"
      // className="relative py-24 sm:py-28 bg-gradient-to-br from-[#fff0f6] via-[#fff7fb] to-white"
      className="relative py-24 sm:py-28"
    >
      <div className="pointer-events-none motion-smooth absolute inset-0" aria-hidden>
        <div className="absolute left-[18%] top-[6%] h-64 w-64 rounded-full bg-gradient-to-br from-[#ccd5ae] via-transparent to-transparent opacity-55 blur-3xl" />
        <div className="absolute -right-24 top-[28%] h-80 w-80 rounded-full bg-gradient-to-br from-[#faedcd] via-[#fefae0] to-transparent opacity-55 blur-3xl" />
        <div className="absolute bottom-[-18%] left-1/3 h-72 w-72 rounded-full bg-gradient-to-br from-[#d4a373] via-[#faedcd] to-transparent opacity-45 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <SectionHeader sectionId="demo" label="Demo" order={2}>
          Demo
        </SectionHeader>

        <div className="lg:hidden">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e9edc9]/60 bg-[#fefae0]/90 px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[rgb(136,153,79)]">
              How it works
            </span>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.08] text-slate-900">
              Watch the AI palette elevate your document in seconds
            </h2>
          </div>

          <div className="mt-8 space-y-6">
            {demoSteps.map((step) => (
              <div
                key={step.step}
                className="rounded-3xl border border-[#e9edc9]/60 bg-[#fefae0]/80 p-5 shadow-[0_16px_36px_rgba(212,163,115,0.12)] backdrop-blur"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d4a373] text-xs font-semibold text-white">
                    {step.step.toString().padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                  </div>
                </div>

                {step.originalText && (
                  <div className="mt-4 rounded-2xl border border-[#e9edc9] bg-[#fefae0] p-4 text-sm leading-relaxed text-slate-700">
                    {step.originalText}
                  </div>
                )}

                {step.prompt && (
                  <div className="mt-4 rounded-2xl border border-[#d4a373]/30 bg-[#fbf1d6] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Prompt</p>
                    <p className="mt-2 text-sm text-slate-700">{step.prompt}</p>
                  </div>
                )}

                {step.suggestion && (
                  <div className="mt-4 rounded-2xl border border-[#e9edc9] bg-[#fefae0] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">AI Suggestion</p>
                    <p className="mt-2 text-sm font-medium text-slate-800 leading-relaxed">{step.suggestion}</p>
                  </div>
                )}

                {step.finalText && (
                  <div className="mt-4 rounded-2xl border border-[#e9edc9] bg-[#fefae0] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Final Text</p>
                    <p className="mt-2 text-sm font-medium text-slate-800 leading-relaxed">{step.finalText}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:grid lg:grid-cols-[1.05fr_1.6fr] lg:gap-16">
          <div className="space-y-14 lg:sticky lg:top-24 lg:self-start lg:pt-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="max-w-xl"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e9edc9]/60 bg-[#fefae0]/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(136,153,79)]">
                How it works
              </span>
              <h2 className="mt-6 text-4xl font-semibold leading-[1.05] text-slate-900 sm:text-5xl">
                Watch the AI palette elevate your document in seconds
              </h2>
            </motion.div>

            <div className="flex flex-col gap-4">
              {demoSteps.map((step, index) => (
                <div
                  key={step.step}
                  className={`rounded-2xl border px-5 py-4 transition-all duration-300 ${
                    currentStep === index
                      ? 'border-[rgb(212,163,115)] bg-[#fefae0] shadow-xl'
                      : 'border-transparent bg-[#fefae0]/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                        currentStep === index
                          ? 'bg-[#d4a373] text-white'
                          : 'bg-[#e9edc9] text-slate-600'
                      }`}
                    >
                      {step.step.toString().padStart(2, '0')}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${currentStep === index ? 'text-slate-900' : 'text-slate-600'}`}>
                        {step.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 space-y-32">
            {demoSteps.map((step, index) => (
              <div
                key={step.step}
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                data-step-index={index}
                className="min-h-[70vh] scroll-mt-32 flex items-center"
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
                  className="w-full rounded-[30px] border bg-[#fefae0] px-8 py-10 shadow-xl"
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