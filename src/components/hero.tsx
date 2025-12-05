"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Github, Linkedin, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
    return (
        <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden py-12 md:py-24 lg:py-32">
            {/* Background gradient/blob */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50 blur-3xl" />

            <div className="container flex flex-col items-center px-4 text-center md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Crafting Digital <br className="hidden sm:inline" />
                        <span className="text-primary">Experiences</span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-4 max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8"
                >
                    Hi, I'm a creative developer passionate about building accessible, pixel-perfect, and performant web experiences.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-8 flex gap-4"
                >
                    <Button asChild size="lg" className="rounded-full">
                        <Link href="#projects">
                            View Work <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild className="rounded-full">
                        <Link href="#contact">Contact Me</Link>
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-12 flex items-center gap-6 text-muted-foreground"
                >
                    <Link href="https://github.com" target="_blank" className="hover:text-primary transition-colors">
                        <Github className="h-6 w-6" />
                        <span className="sr-only">GitHub</span>
                    </Link>
                    <Link href="https://linkedin.com" target="_blank" className="hover:text-primary transition-colors">
                        <Linkedin className="h-6 w-6" />
                        <span className="sr-only">LinkedIn</span>
                    </Link>
                    <Link href="https://twitter.com" target="_blank" className="hover:text-primary transition-colors">
                        <Twitter className="h-6 w-6" />
                        <span className="sr-only">Twitter</span>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}
