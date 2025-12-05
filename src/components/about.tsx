"use client"

import { motion } from "framer-motion"
import { PixelBackground } from "@/components/pixel-background"
import Image from "next/image"

export function About() {
    return (
        <section id="about" className="relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0 opacity-50">
                <PixelBackground />
            </div>

            <div className="container relative z-10 mx-auto py-12 md:py-24 lg:py-32 px-4">
                <div className="grid gap-12 lg:grid-cols-2 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
                            About Me
                        </h2>
                        <div className="space-y-4 text-muted-foreground text-lg font-mono">
                            <p>
                                I am a Computer Engineering student and Software Engineer with a passion for building robust and minimalist systems. My work focuses on the intersection of hardware and software, creating efficient solutions that stand the test of time.
                            </p>
                            <p>
                                Currently studying Computer Engineering, I am always diving deep into low-level logic while maintaining high-level design aesthetics. I value simplicity, performance, and precision in every line of code I write.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="relative aspect-square overflow-hidden rounded-xl bg-muted/20 backdrop-blur-sm border border-border/50"
                    >
                        {/* Placeholder for image */}
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            <Image src="/me.png" alt="Profile" width={500} height={500} className="flex-1" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
