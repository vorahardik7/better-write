'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Command, Sparkles, Check, X, Pause, Play } from 'lucide-react';

const demoSteps = [
  {
    id: 1,
    action: "Start writing",
    originalText: "Our new product launch went well last month.",
    selectedText: "",
    prompt: "",
    suggestion: "",
    showPalette: false
  },
  {
    id: 2,
    action: "Select text",
    originalText: "Our new product launch went well last month.",
    selectedText: "Our new product launch went well last month.",
    prompt: "",
    suggestion: "",
    showPalette: false
  },
  {
    id: 3,
    action: "Press ⌘K for AI",
    originalText: "Our new product launch went well last month.",
    selectedText: "Our new product launch went well last month.",
    prompt: "",
    suggestion: "",
    showPalette: true
  },
  {
    id: 4,
    action: "Tell AI what you want",
    originalText: "Our new product launch went well last month.",
    selectedText: "Our new product launch went well last month.",
    prompt: "make this more professional with specific results",
    suggestion: "",
    showPalette: true
  },
  {
    id: 5,
    action: "AI suggests improvements",
    originalText: "Our new product launch went well last month.",
    selectedText: "Our new product launch went well last month.",
    prompt: "make this more professional with specific results",
    suggestion: "Our Q3 product launch exceeded expectations, achieving 150% of projected sales targets and securing 2,847 new customers in the first 30 days.",
    showPalette: true
  },
  {
    id: 6,
    action: "Accept and continue writing",
    originalText: "Our Q3 product launch exceeded expectations, achieving 150% of projected sales targets and securing 2,847 new customers in the first 30 days.",
    selectedText: "",
    prompt: "",
    suggestion: "",
    showPalette: false
  }
];

export function DemoSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-play continuously with faster timing
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      if (currentStep < demoSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setCurrentStep(0);
      }
    }, currentStep === 4 ? 2500 : 1800); // Faster transitions

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying]);

  const step = demoSteps[currentStep];
  const textContentKey = step.selectedText ? `sel:${step.selectedText}` : `raw:${step.originalText}`;

  const isActionActive = (action: string, prompt: string) => {
    const actionKeywords: Record<string, string[]> = {
      'Make formal': ['formal', 'professional', 'business', 'polished'],
      'Fix grammar': ['grammar', 'typo', 'spelling', 'correct', 'punctuation'],
    };
    const normalized = (prompt || '').toLowerCase();
    return (actionKeywords[action] || []).some((k) => normalized.includes(k));
  };

  const handleAccept = () => {
    if (step.suggestion) {
      setIsPlaying(false);
      setCurrentStep(demoSteps.length - 1);
    }
  };

  const handleReject = () => {
    if (step.suggestion) {
      setIsPlaying(false);
      setCurrentStep(3); // Back to "Tell AI what you want"
    }
  };

  return (
    <section className="py-24 bg-pattern">
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
            className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-black text-black rounded-full text-sm font-semibold mb-4 cursor-pointer shadow-[3px_3px_0_#000]"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4" />
            See It In Action
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Watch the magic happen
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how VibeDoc transforms your writing with simple, natural instructions
          </p>
        </motion.div>

        {/* Demo Interface - Side by Side Layout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex gap-6 h-[500px]">
            {/* Editor Mock - Left Side */}
            <div className="flex-1 bg-white rounded-xl shadow-[6px_6px_0_#000] overflow-hidden border-2 border-black">
              {/* Editor Header */}
              <div className="flex items-center justify-between p-4 border-b-2 border-black bg-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full cursor-pointer"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full cursor-pointer"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full cursor-pointer"></div>
                  </div>
                  <span className="text-sm font-semibold text-black">VibeDoc Editor</span>
                </div>
                <div className="flex items-center gap-3 w-1/2">
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    Step {currentStep + 1} of {demoSteps.length}: {step.action}
                  </div>
                  <div className="flex-1 h-2 rounded-full border-2 border-black bg-white overflow-hidden">
                    <motion.div
                      className="h-full bg-black"
                      initial={false}
                      animate={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                      transition={{ duration: 0.25 }}
                    />
                  </div>
                  <button
                    className="inline-flex items-center justify-center w-7 h-7 border-2 border-black rounded-md bg-white shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] transition-all duration-150 cursor-pointer"
                    aria-label={isPlaying ? 'Pause demo autoplay' : 'Play demo autoplay'}
                    onClick={() => setIsPlaying((p) => !p)}
                  >
                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Editor Content */}
              <div className="p-8 h-[calc(100%-4rem)] flex flex-col">
                <div className="prose max-w-none flex-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={textContentKey}
                      className="text-lg leading-relaxed"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                    >
                      {step.selectedText ? (
                        <>
                          <motion.span 
                            className="bg-yellow-200 border-2 border-black rounded px-1 cursor-pointer"
                            initial={{ backgroundColor: "#fef3c7" }}
                            animate={{ backgroundColor: step.selectedText ? "#fde047" : "#fef3c7" }}
                            transition={{ duration: 0.3 }}
                          >
                            {step.selectedText}
                          </motion.span>
                          <span className="text-gray-700">
                            {step.originalText.slice(step.selectedText.length)}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-700">{step.originalText}</span>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Selection Indicator */}
                <div className="h-12 flex items-end">
                  <AnimatePresence>
                    {step.selectedText && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-block"
                      >
                        {step.selectedText.length} characters selected • Press ⌘K for AI
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Command Palette - Right Side */}
            <div className="w-96">
              <div className="h-full">
                <div className="bg-white rounded-xl shadow-[6px_6px_0_#000] border-2 border-black h-full overflow-hidden">
                  <div className="p-4 border-b-2 border-black">
                    <div className="flex items-center gap-2 text-sm font-semibold text-black">
                      <Command className="w-4 h-4" />
                      AI Assistant
                    </div>
                  </div>
                  
                  <div className="flex flex-col h-[calc(100%-4rem)]">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {step.showPalette ? (
                        <>
                          {/* Quick Actions */}
                          <div>
                            <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Quick Actions</div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                "Make formal",
                                "Fix grammar",
                              ].map((action) => {
                                const active = isActionActive(action, step.prompt || '');
                                return (
                                  <motion.button
                                    key={action}
                                    className={`text-xs p-2 rounded border-2 border-black transition-all duration-200 cursor-pointer ${
                                      active
                                        ? 'bg-blue-100 shadow-[2px_2px_0_#000]'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                    animate={{
                                      scale: active ? 1.02 : 1
                                    }}
                                  >
                                    {action}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Custom Input */}
                          <div>
                            <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Custom Instruction</div>
                            <motion.div 
                              className="bg-gray-50 border-2 border-black rounded-lg p-3 text-sm min-h-[60px] flex items-center"
                              animate={{
                                backgroundColor: step.prompt ? "#dbeafe" : "#f9fafb"
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              <motion.span
                                className="text-gray-700"
                                animate={{ opacity: step.prompt ? 1 : 0.5 }}
                              >
                                {step.prompt || "Describe what you want to do..."}
                              </motion.span>
                            </motion.div>
                          </div>

                          {/* AI Response */}
                          <AnimatePresence>
                            {step.suggestion && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.4 }}
                              >
                                <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">AI Enhancement</div>
                                <div className="bg-emerald-50 border-2 border-black p-3 rounded-lg">
                                  <div className="text-sm text-emerald-800 leading-relaxed">{step.suggestion}</div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-sm text-gray-500">
                            Select text and press <span className="font-semibold">⌘K</span> to open the AI Assistant
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Bar - always visible when suggestion exists */}
                    {step.suggestion && (
                      <div className="border-t-2 border-black p-3 bg-white shrink-0">
                        <div className="flex gap-2">
                          <motion.button 
                            className="bg-emerald-100 border-2 border-black rounded-lg shadow-[3px_3px_0_#000] px-6 py-3 font-bold text-black hover:shadow-[4px_4px_0_#000] transition-all duration-200 cursor-pointer w-1/2 text-sm min-w-[160px]"
                            whileHover={{ y: -1 }}
                            whileTap={{ y: 0 }}
                            onClick={handleAccept}
                          >
                            <div className="flex items-center gap-1 justify-center">
                              <Check className="w-3 h-3" />
                              Accept
                            </div>
                          </motion.button>
                          <motion.button 
                            className="bg-red-100 border-2 border-black rounded-lg shadow-[3px_3px_0_#000] px-6 py-3 font-bold text-black hover:shadow-[4px_4px_0_#000] transition-all duration-200 cursor-pointer w-1/2 text-sm min-w-[160px]"
                            whileHover={{ y: -1 }}
                            whileTap={{ y: 0 }}
                            onClick={handleReject}
                          >
                            <div className="flex items-center gap-1 justify-center">
                              <X className="w-3 h-3" />
                              Reject
                            </div>
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 