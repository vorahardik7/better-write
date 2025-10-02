"use client";
import { signIn } from "next-auth/react";

import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";


export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-[#f5f4f0] pb-24 pt-32">
            <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-12 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="w-full max-w-3xl"
                >
                    <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                        Precision writing workspace
                    </div>
                    <h1 className="mt-8 text-4xl font-semibold leading-[1.05] text-slate-900 sm:text-5xl md:text-6xl">
                        Compose professional documents with AI as your
                        co-author.
                    </h1>
                    <p className="mt-6 mx-auto max-w-2xl text-lg font-medium leading-relaxed text-slate-600">
                        BetterWrite streamlines outlining, revision, and
                        formatting so proposals, specs, and reports land
                        polished and publication-ready.
                    </p>

                    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                        <Link
                            href="/editor"
                            className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-8 py-4 text-sm font-semibold text-white transition hover:bg-black"
                        >
                            Launch the editor
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        <button
                            onClick={() =>
                                signIn("google", { redirectTo: "/dashboard" })
                            }
                            className="inline-flex cursor-pointer items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-8 py-4 text-sm font-semibold text-slate-900 transition hover:border-black/30"
                        >
                            <span className="flex h-6 w-6 items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    x="0px"
                                    y="0px"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 48 48"
                                >
                                    <path
                                        fill="#FFC107"
                                        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                                    ></path>
                                    <path
                                        fill="#FF3D00"
                                        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                                    ></path>
                                    <path
                                        fill="#4CAF50"
                                        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                                    ></path>
                                    <path
                                        fill="#1976D2"
                                        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                                    ></path>
                                </svg>
                            </span>
                            Continue with Google
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                        </button>
                    </div>

                    
                </motion.div>
            </div>
        </section>
    );
}
