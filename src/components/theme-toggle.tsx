"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full p-2 bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors relative"
            aria-label="Toggle theme"
        >
            {theme === "light" ? (
                <Sun />
            ) : (
                <Moon />
            )}
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}
