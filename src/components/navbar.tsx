"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
                <div className="flex gap-6 md:gap-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-bold inline-block font-mono text-xl">Tomlin7</span>
                    </Link>
                    <div className="hidden md:flex gap-6">
                        <Link
                            href="#about"
                            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            About
                        </Link>
                        <Link
                            href="#projects"
                            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            Projects
                        </Link>
                        <Link
                            href="#contact"
                            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            Contact
                        </Link>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <div className="md:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </div>
                </div>
            </div>
            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-b border-border/40 bg-background">
                    <div className="container py-4 flex flex-col gap-4 px-4">
                        <Link
                            href="#about"
                            className="text-sm font-medium hover:text-primary"
                            onClick={() => setIsOpen(false)}
                        >
                            About
                        </Link>
                        <Link
                            href="#projects"
                            className="text-sm font-medium hover:text-primary"
                            onClick={() => setIsOpen(false)}
                        >
                            Projects
                        </Link>
                        <Link
                            href="#contact"
                            className="text-sm font-medium hover:text-primary"
                            onClick={() => setIsOpen(false)}
                        >
                            Contact
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}
