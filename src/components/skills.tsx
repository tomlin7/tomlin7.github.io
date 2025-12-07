"use client"

import { motion } from "framer-motion"
import {
    SiJavascript, SiTypescript, SiReact, SiNextdotjs, SiNodedotjs,
    SiPython, SiGo, SiKotlin,
    SiDocker, SiGit, SiGithub, SiKubernetes,
    SiPostgresql, SiRedis, SiSqlite,
    SiOpenai, SiFigma, SiVercel, SiSupabase, SiPrisma, SiGraphql,
    SiDjango, SiFastapi, SiExpress, SiNestjs,
    SiGooglecloud, SiFirebase,
    SiTensorflow, SiPandas, SiNumpy,
    SiUnity,
    SiCypress, SiSelenium,
    SiPostman, SiJira, SiTrello, SiConfluence,
    SiAdobephotoshop, SiAdobeaftereffects, SiCanva, SiBun, SiExpo, SiElectron, SiFlutter, SiRedux, SiThreedotjs, SiTauri,
    SiCircleci,
    SiAnthropic,
    SiGooglegemini
} from "react-icons/si"
import { IconType } from "react-icons"
import { VenetianMask } from "lucide-react"

interface Skill {
    name: string
    icon: IconType
}

const skills: Skill[] = [

    // Frontend
    { name: "Next.js", icon: SiNextdotjs },
    { name: "React", icon: SiReact },
    { name: "Node.js", icon: SiNodedotjs },
    { name: "Three.js", icon: SiThreedotjs },
    { name: "Redux", icon: SiRedux },

    // Backend Frameworks
    { name: "Django", icon: SiDjango },
    { name: "Express", icon: SiExpress },
    { name: "FastAPI", icon: SiFastapi },
    { name: "NestJS", icon: SiNestjs },

    // Languages
    { name: "Python", icon: SiPython },
    { name: "TypeScript", icon: SiTypescript },
    { name: "JavaScript", icon: SiJavascript },
    { name: "Kotlin", icon: SiKotlin },
    { name: "Go", icon: SiGo },

    // App Frameworks
    { name: "Electron", icon: SiElectron },
    { name: "Expo", icon: SiExpo },
    { name: "Tauri", icon: SiTauri },
    { name: "Flutter", icon: SiFlutter },

    // Cloud & Deployment
    { name: "Vercel", icon: SiVercel },
    { name: "Bun", icon: SiBun },
    { name: "Google Cloud", icon: SiGooglecloud },
    { name: "Firebase", icon: SiFirebase },

    // Database
    { name: "Supabase", icon: SiSupabase },
    { name: "PostgreSQL", icon: SiPostgresql },
    { name: "SQLite", icon: SiSqlite },
    { name: "Redis", icon: SiRedis },
    { name: "Prisma", icon: SiPrisma },
    { name: "GraphQL", icon: SiGraphql },

    // AI/ML
    { name: "OpenAI API", icon: SiOpenai },
    { name: "Anthropic API", icon: SiAnthropic },
    { name: "Gemini API", icon: SiGooglegemini },

    // Tools & DevOps
    { name: "Docker", icon: SiDocker },
    { name: "Kubernetes", icon: SiKubernetes },
    { name: "Git", icon: SiGit },
    { name: "GitHub", icon: SiGithub },
    { name: "CircleCI", icon: SiCircleci },
    { name: "Cypress", icon: SiCypress },
    { name: "Playwright", icon: VenetianMask },
    { name: "Selenium", icon: SiSelenium },
    { name: "Postman", icon: SiPostman },
    { name: "Jira", icon: SiJira },
    { name: "Confluence", icon: SiConfluence },
    { name: "Trello", icon: SiTrello },


    { name: "TensorFlow", icon: SiTensorflow },
    { name: "NumPy", icon: SiNumpy },
    { name: "Pandas", icon: SiPandas },

    // Design & Creative
    { name: "Figma", icon: SiFigma },
    { name: "Photoshop", icon: SiAdobephotoshop },
    { name: "After Effects", icon: SiAdobeaftereffects },
    { name: "Canva", icon: SiCanva },
    { name: "Unity", icon: SiUnity },
]

export function Skills() {
    return (
        <section id="skills" className="container mx-auto py-24 px-4 bg-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="max-w-10xl mx-auto"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 font-mono gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-primary">&gt;</span>
                        <span>Home</span>
                        <span className="text-muted-foreground/50">/</span>
                        <span className="text-foreground">Skills</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-0 border-t border-l border-border/50">
                    {skills.map((skill, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.2, delay: index * 0.02 }} // Faster stagger
                            viewport={{ once: true }}
                            className="group relative aspect-square border-r border-b border-border/50 bg-card hover:bg-muted/50 transition-colors flex flex-col items-center justify-center p-4"
                        >
                            <skill.icon className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground/70 group-hover:text-foreground transition-colors" />

                            <div className="absolute bottom-1 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-mono text-muted-foreground truncate px-1">
                                    {skill.name}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    )
}
