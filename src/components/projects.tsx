"use client"

import { motion } from "framer-motion"
import { Github, Star, GitFork } from "lucide-react"
import Link from "next/link"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

const projects = [
    {
        title: "biscuit",
        description: "Native IDE with Agents and Extensions <20 MB in Size",
        language: "Python",
        languageColor: "#3572A5",
        stars: 239,
        forks: 31,
        link: "https://github.com/tomlin7/biscuit",
    },
    {
        title: "cupcake",
        description:
            "Embeddable feature-rich code editor widget for tkinter, with syntax highlighting, completions, minimap and more",
        language: "Python",
        languageColor: "#3572A5",
        stars: 37,
        forks: 2,
        link: "https://github.com/tomlin7/cupcake",
    },
    {
        title: "ecommerce-chatbot",
        description:
            "E-commerce platform powered by agents with vector search, recommendations, order/cart management capabilities.",
        language: "TypeScript",
        languageColor: "#3178c6",
        stars: 13,
        forks: 4,
        link: "https://github.com/tomlin7/ecommerce-chatbot",
    },
    {
        title: "lemon",
        description: "The Lemon Programming Language. Minimalist, dynamic.",
        language: "Go",
        languageColor: "#00ADD8",
        stars: 7,
        forks: 0,
        link: "https://github.com/tomlin7/lemon",
    },
    {
        title: "BunchHQ/Bunch",
        description: "An upcoming cross-platform real-time group chat platform",
        language: "Python",
        languageColor: "#3572A5",
        stars: 4,
        forks: 0,
        link: "https://github.com/BunchHQ/Bunch",
    },
    {
        title: "Ember",
        description: "Game Engine written in C++",
        language: "C++",
        languageColor: "#f34b7d",
        stars: 17,
        forks: 2,
        link: "https://github.com/tomlin7/Ember",
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
                className="flex flex-col items-center gap-4 text-center mb-16"
            >
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Featured Projects
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                    Check out some of my open source contributions and personal projects.
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
                        <Link href={project.link} target="_blank" className="block h-full group">
                            <Card className="h-full flex flex-col justify-between overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1">
                                <CardHeader className="space-y-2">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                                            {project.title}
                                        </CardTitle>
                                        <Github className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    </div>
                                    <CardDescription className="line-clamp-3">
                                        {project.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="mt-auto pt-4">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: project.languageColor }}
                                            />
                                            <span>{project.language}</span>
                                        </div>
                                        <div className="flex items-center gap-1 hover:text-foreground transition-colors">
                                            <Star className="h-4 w-4" />
                                            <span>{project.stars}</span>
                                        </div>
                                        {project.forks > 0 && (
                                            <div className="flex items-center gap-1 hover:text-foreground transition-colors">
                                                <GitFork className="h-4 w-4" />
                                                <span>{project.forks}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
