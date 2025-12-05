"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Github, Linkedin, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PixelBackground } from "@/components/pixel-background"

export function Hero() {
    return (
        <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden py-12 md:py-24 lg:py-32 bg-transparent">
            {/* Pixel Background */}
            <PixelBackground />
            <div className="absolute inset-0 bg-background/30 backdrop-blur-[1px] z-0 pointer-events-none" />

            <div className="container flex flex-col items-center px-4 text-center md:px-6 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Tomlin7
                        <br />
                        <span className="text-primary text-2xl sm:text-4xl font-mono mt-4 block">Software Engineer</span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-4 max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 font-mono"
                >
                    Computer Engineering Student & Digital Craftsman.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-8 flex gap-4"
                >
                    <Button asChild size="lg" className="rounded-none border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all">
                        <Link href="#projects">
                            View Work <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild className="rounded-none border-2 hover:bg-accent transition-all">
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
