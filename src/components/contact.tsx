"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function Contact() {
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        // Verification only: log to console
        console.log("Form submitted")
        alert("Thanks for contacting me! This is a demo form.")
    }

    return (
        <section id="contact" className="container mx-auto py-12 md:py-24 lg:py-32 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="mx-auto max-w-[600px]"
            >
                <Card className="border-border/50 bg-background/60 backdrop-blur">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold">Get in Touch</CardTitle>
                        <CardDescription>
                            Have a project in mind or just want to say hi? I'd love to hear from you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <div className="grid gap-2">
                                <Input id="name" placeholder="Name" required />
                            </div>
                            <div className="grid gap-2">
                                <Input id="email" type="email" placeholder="Email" required />
                            </div>
                            <div className="grid gap-2">
                                <Input id="subject" placeholder="Subject" />
                            </div>
                            <div className="grid gap-2">
                                <Textarea id="message" placeholder="Message" className="min-h-[120px]" required />
                            </div>
                            <Button type="submit" className="w-full">
                                Send Message
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </section>
    )
}
