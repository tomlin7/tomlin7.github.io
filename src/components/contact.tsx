"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Bot, Mail, ArrowRight } from "lucide-react"

export function Contact() {
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitted(true)
        // Delay the mailto slightly to allow the UI to update first
        setTimeout(() => {
            window.location.href = `mailto:billydevbusiness@gmail.com?subject=Portfolio Inquiry&body=${encodeURIComponent(message)}%0D%0A%0D%0AFrom: ${email}`
        }, 500)
    }

    return (
        <section id="contact" className="container mx-auto py-24 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto"
            >
                {/* Header / Breadcrumbs */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 font-mono gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-primary">&gt;</span>
                        <span>Home</span>
                        <span className="text-muted-foreground/50">/</span>
                        <span className="text-foreground">Contact me</span>
                    </div>

                    <a
                        href="mailto:billydevbusiness@gmail.com"
                        className="flex items-center gap-2 px-4 py-2 border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors text-xs md:text-sm uppercase tracking-wider"
                    >
                        <Mail className="w-4 h-4" />
                        <span>billydevbusiness@gmail.com</span>
                    </a>
                </div>

                {/* Chat Interface */}
                <div className="relative border border-border/50 bg-card shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none" />

                    <div className="p-8 md:p-12 min-h-[400px] flex flex-col justify-center relative">
                        {isSubmitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center text-center space-y-6 py-12"
                            >
                                <div className="w-20 h-20 bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Bot className="w-10 h-10 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold font-mono">Message Received</h3>
                                    <p className="text-muted-foreground max-w-md mx-auto">
                                        Thanks for reaching out. I'll get back to you shortly.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setIsSubmitted(false)}
                                    variant="outline"
                                    className="rounded-none font-mono mt-4"
                                >
                                    Send another message
                                </Button>
                            </motion.div>
                        ) : (
                            <>
                                {/* Bot Message */}
                                <div className="flex gap-6 items-start max-w-2xl mb-12">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-lg border-2 border-primary" aria-hidden="true">
                                        <Bot className="w-6 h-6 md:w-8 md:h-8" />
                                    </div>

                                    <div className="space-y-2 w-full">
                                        <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground ml-1">
                                            Billy Bot
                                        </div>
                                        <div className="bg-muted text-foreground p-6 shadow-sm relative group border-l-2 border-primary w-full md:w-auto">
                                            <p className="text-lg md:text-xl font-medium leading-relaxed">
                                                Let's build cool stuff together.
                                                <br />
                                                Tell me about your project &darr;
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Input Area */}
                                <div className="md:ml-20">
                                    <form onSubmit={handleSubmit} className="relative max-w-xl space-y-4">
                                        <div className="grid gap-4">
                                            <Input
                                                type="email"
                                                placeholder="your@email.com"
                                                className="h-14 bg-background/50 border-2 border-border/50 text-lg font-mono focus-visible:ring-0 focus-visible:border-primary transition-all rounded-none"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                            <Textarea
                                                placeholder="How can I help you?"
                                                className="min-h-[120px] bg-background/50 border-2 border-border/50 text-lg font-mono focus-visible:ring-0 focus-visible:border-primary transition-all resize-none p-4 rounded-none"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="h-14 px-8 font-mono tracking-wide rounded-none group"
                                            >
                                                <span>Submit Request</span>
                                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </section>
    )
}
