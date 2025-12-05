"use client"

import { motion } from "framer-motion"

export function About() {
    return (
        <section id="about" className="container mx-auto py-12 md:py-24 lg:py-32 px-4">
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
                    <div className="space-y-4 text-muted-foreground text-lg">
                        <p>
                            I am a dedicated developer with a strong foundation in modern web technologies. My journey in coding began with a curiosity for how things work, and it has evolved into a career where I solve complex problems through clean and efficient code.
                        </p>
                        <p>
                            When I'm not coding, you can find me exploring new technologies, contributing to open source, or enjoying a good cup of coffee. I believe in continuous learning and always strive to stay ahead of the curve.
                        </p>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="relative aspect-square overflow-hidden rounded-xl bg-muted"
                >
                    {/* Placeholder for image */}
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        [Profile Image Placeholder]
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                </motion.div>
            </div>
        </section>
    )
}
