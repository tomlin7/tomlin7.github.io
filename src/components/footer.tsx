export function Footer() {
    return (
        <footer className="border-t py-6 md:py-0">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    © {new Date().getFullYear()} Portfolio. Built with Next.js, Tailwind CSS, and Framer Motion.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <a href="#" className="underline hover:text-primary">
                        Terms
                    </a>
                    <a href="#" className="underline hover:text-primary">
                        Privacy
                    </a>
                </div>
            </div>
        </footer>
    )
}
