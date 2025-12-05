"use client"

import { motion } from "framer-motion"
import { ExternalLink, Github } from "lucide-react"
import Link from "next/link"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Need to quickly create Card and Badge components or use inline styles.
// Since I want "premium", using components is better.
// I'll create `card.tsx` and `badge.tsx` in a separate step or just inline styles for now to save time if allowed.
// But "modern" requires good reuse. I will pause and create `card.tsx` and `badge.tsx` after this file if I reference them,
// OR likely I should create them first.
// I'll assume I have them or will create them immediately. I'll create them in the next tool calls.

const projects = [
    {
        title: "E-Commerce Dashboard",
        description:
            "A comprehensive dashboard for managing products, orders, and customers with real-time analytics.",
        tags: ["Next.js", "TypeScript", "Tailwind CSS", "Recharts"],
        links: {
            demo: "#",
            repo: "#",
        },
    },
    {
        title: "Social Media App",
        description:
            "A full-stack social platform with real-time messaging, file sharing, and user profiles.",
        tags: ["React", "Node.js", "Socket.io", "PostgreSQL"],
        links: {
            demo: "#",
            repo: "#",
        },
    },
    {
        title: "AI Content Generator",
        description:
            "An application that uses OpenAI API to generate marketing copy and blog posts.",
        tags: ["OpenAI API", "Next.js", "Vercel AI SDK"],
        links: {
            demo: "#",
            repo: "#",
        },
    },
]

export function Projects() {
    return (
        <section id="projects" className="container mx-auto py-12 md:py-24 lg:py-32 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col items-center gap-4 text-center mb-12"
            >
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Featured Projects
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                    Here are some of the projects I've worked on recently.
                </p>
            </motion.div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <Card className="h-full flex flex-col justify-between overflow-hidden border-border/50 bg-background/60 backdrop-blur transition-all hover:border-primary/50 hover:shadow-md">
                            <CardHeader>
                                <CardTitle>{project.title}</CardTitle>
                                <CardDescription>{project.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <Button variant="outline" size="sm" asChild className="w-full">
                                    <Link href={project.links.demo} target="_blank">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Demo
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild className="w-full">
                                    <Link href={project.links.repo} target="_blank">
                                        <Github className="mr-2 h-4 w-4" />
                                        Code
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
