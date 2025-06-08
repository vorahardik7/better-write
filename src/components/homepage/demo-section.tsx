'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Command, Sparkles, Check, X } from 'lucide-react';

const demoSteps = [
  {
    id: 1,
    action: "Select text",
    originalText: "Hey there! This is some casual text that needs improvement.",
    selectedText: "Hey there! This is some casual text",
    prompt: "",
    suggestion: ""
  },
  {
    id: 2,
    action: "Press ⌘K",
    originalText: "Hey there! This is some casual text that needs improvement.",
    selectedText: "Hey there! This is some casual text",
    prompt: "",
    suggestion: ""
  },
  {
    id: 3,
    action: "Type instruction",
    originalText: "Hey there! This is some casual text that needs improvement.",
    selectedText: "Hey there! This is some casual text",
    prompt: "make this more formal and professional",
    suggestion: ""
  },
  {
    id: 4,
    action: "AI suggests",
    originalText: "Hey there! This is some casual text that needs improvement.",
    selectedText: "Hey there! This is some casual text",
    prompt: "make this more formal and professional",
    suggestion: "Good morning. This is professional content"
  },
  {
    id: 5,
    action: "Accept changes",
    originalText: "Good morning. This is professional content that needs improvement.",
    selectedText: "",
    prompt: "",
    suggestion: ""
  }
];

export function DemoSection() {
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-play continuously
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < demoSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setCurrentStep(0);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [currentStep]);

  const step = demoSteps[currentStep];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
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
            className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm font-medium mb-4 cursor-pointer"
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
            <div className="flex-1 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Editor Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full cursor-pointer"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full cursor-pointer"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full cursor-pointer"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">VibeDoc Editor</span>
                </div>
                <div className="text-xs text-gray-500">
                  Step {currentStep + 1} of {demoSteps.length}: {step.action}
                </div>
              </div>

              {/* Editor Content */}
              <div className="p-8 h-[calc(100%-4rem)] flex flex-col">
                <div className="prose max-w-none flex-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-lg leading-relaxed"
                    >
                      {step.selectedText ? (
                        <>
                          <span 
                            className="bg-blue-200 border-2 border-blue-400 rounded px-1 cursor-pointer"
                          >
                            {step.selectedText}
                          </span>
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
              <AnimatePresence mode="wait">
                {(step.prompt || step.suggestion) ? (
                  <motion.div
                    key="palette"
                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="h-full"
                  >
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 h-full overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Command className="w-4 h-4" />
                          AI Command Palette
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-6 h-[calc(100%-4rem)] overflow-y-auto">
                        {step.prompt && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm"
                          >
                            <div className="text-gray-500 mb-2">Your instruction:</div>
                            <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                              "{step.prompt}"
                            </div>
                          </motion.div>
                        )}
                        
                        {step.suggestion && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-sm"
                          >
                            <div className="text-gray-500 mb-2">AI Suggestion:</div>
                            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                              <div className="text-green-700">{step.suggestion}</div>
                            </div>
                            
                            <div className="flex gap-3 mt-4">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                                Accept
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                                Reject
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex items-center justify-center"
                  >
                    <div className="text-center text-gray-400">
                      <Command className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Select text and press ⌘K<br />to see AI in action</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 