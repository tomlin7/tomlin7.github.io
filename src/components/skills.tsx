"use client"

import { motion } from "framer-motion"
import {
    SiJavascript, SiTypescript, SiReact, SiNextdotjs, SiTailwindcss, SiNodedotjs,
    SiPython, SiRust, SiCplusplus, SiGo, SiHtml5, SiCss3, SiKotlin, SiSwift,
    SiDocker, SiGit, SiGithub, SiLinux, SiKubernetes, SiNginx,
    SiPostgresql, SiMongodb, SiRedis, SiMysql, SiSqlite,
    SiOpenai, SiFigma, SiVercel, SiSupabase, SiPrisma, SiGraphql, SiWebrtc,
    SiDjango, SiFlask, SiFastapi, SiExpress, SiNestjs,
    SiAmazonaws, SiGooglecloud, SiFirebase, SiNetlify, SiHeroku,
    SiTensorflow, SiPytorch, SiPandas, SiNumpy, SiScikitlearn,
    SiUnity, SiGodot, SiUnrealengine,
    SiCypress, SiPlaywright, SiSelenium, SiVitest, SiJest,
    SiPostman, SiInsomnia, SiJira, SiTrello, SiConfluence,
    SiAdobephotoshop, SiAdobeaftereffects, SiCanva, SiGradle, SiBun, SiExpo, SiElectron, SiFlutter, SiRedux, SiSocketdotjs, SiThreejs, SiTauri, SiWebgl, SiGunicorn
} from "react-icons/si"
import { IconType } from "react-icons"

interface Skill {
    name: string
    icon: IconType
}

const skills: Skill[] = [
    // Languages
    { name: "Python", icon: SiPython },
    { name: "C++", icon: SiCplusplus },
    { name: "C", icon: SiCplusplus }, // Using C++ icon for C as SiC doesn't exist broadly or is same family
    { name: "Kotlin", icon: SiKotlin },
    { name: "Go", icon: SiGo },
    { name: "TypeScript", icon: SiTypescript },
    { name: "JavaScript", icon: SiJavascript },
    { name: "CSS3", icon: SiCss3 },
    { name: "Rust", icon: SiRust },

    // Cloud & Deployment
    { name: "Netlify", icon: SiNetlify },
    { name: "Heroku", icon: SiHeroku },
    { name: "Render", icon: SiVercel }, // Placeholder if SiRender not found, or use general cloud
    { name: "Vercel", icon: SiVercel },
    { name: "Google Cloud", icon: SiGooglecloud },
    { name: "Firebase", icon: SiFirebase },
    { name: "Bun", icon: SiBun },

    // Backend Frameworks
    { name: "Django", icon: SiDjango },
    { name: "Express", icon: SiExpress },
    { name: "FastAPI", icon: SiFastapi },
    { name: "Flask", icon: SiFlask },
    { name: "NestJS", icon: SiNestjs },
    { name: "Gunicorn", icon: SiGunicorn },
    { name: "Nginx", icon: SiNginx },

    // App Frameworks
    { name: "Electron", icon: SiElectron },
    { name: "Expo", icon: SiExpo },
    { name: "Flutter", icon: SiFlutter },
    { name: "Tauri", icon: SiTauri },

    // Frontend
    { name: "Next.js", icon: SiNextdotjs },
    { name: "Node.js", icon: SiNodedotjs },
    { name: "React", icon: SiReact },
    { name: "Redux", icon: SiRedux },
    { name: "Socket.io", icon: SiSocketdotjs },
    { name: "Three.js", icon: SiThreejs },
    { name: "Tailwind", icon: SiTailwindcss },
    { name: "Vite", icon: SiReact }, // SiVite? Checking
    { name: "WebGL", icon: SiWebgl },
    { name: "HTML5", icon: SiHtml5 },

    // Database
    { name: "MySQL", icon: SiMysql },
    { name: "PostgreSQL", icon: SiPostgresql },
    { name: "SQLite", icon: SiSqlite },
    { name: "Redis", icon: SiRedis },
    { name: "Supabase", icon: SiSupabase },
    { name: "Prisma", icon: SiPrisma },
    { name: "MongoDB", icon: SiMongodb },
    { name: "GraphQL", icon: SiGraphql },

    // AI/ML
    { name: "NumPy", icon: SiNumpy },
    { name: "Pandas", icon: SiPandas },
    { name: "Scikit-learn", icon: SiScikitlearn },
    { name: "TensorFlow", icon: SiTensorflow },
    { name: "Keras", icon: SiTensorflow }, // Keras usually paired with TF
    { name: "PyTorch", icon: SiPytorch },
    { name: "OpenAI", icon: SiOpenai },

    // Tools & DevOps
    { name: "Git", icon: SiGit },
    { name: "GitHub", icon: SiGithub },
    { name: "CircleCI", icon: SiGithub }, // Placeholder
    { name: "Playwright", icon: SiPlaywright },
    { name: "Selenium", icon: SiSelenium },
    { name: "Vitest", icon: SiVitest },
    { name: "Cypress", icon: SiCypress },
    { name: "Docker", icon: SiDocker },
    { name: "Kubernetes", icon: SiKubernetes },
    { name: "Postman", icon: SiPostman },
    { name: "Jira", icon: SiJira },
    { name: "Confluence", icon: SiConfluence },
    { name: "Trello", icon: SiTrello },
    { name: "Gradle", icon: SiGradle },
    { name: "Sentry", icon: SiReact }, // Placeholder or omit if not found

    // Design & Creative
    { name: "Figma", icon: SiFigma },
    { name: "Photoshop", icon: SiAdobephotoshop },
    { name: "After Effects", icon: SiAdobeaftereffects },
    { name: "Canva", icon: SiCanva },
    { name: "Unity", icon: SiUnity },
    { name: "Godot", icon: SiGodot },
    { name: "Itch.io", icon: SiUnity }, // Placeholder
]

export function Skills() {
    return (
        <section id="skills" className="container mx-auto py-24 px-4 bg-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="max-w-6xl mx-auto"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 font-mono gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-primary">&gt;</span>
                        <span>Home</span>
                        <span className="text-muted-foreground/50">/</span>
                        <span className="text-foreground">Skills</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-0 border-t border-l border-border/50">
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
