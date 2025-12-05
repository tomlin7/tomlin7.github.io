"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"

export function Footer() {
    const textCanvasRef = useRef<HTMLCanvasElement>(null)
    const vineCanvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const textCanvas = textCanvasRef.current
        const vineCanvas = vineCanvasRef.current
        const container = containerRef.current

        if (!textCanvas || !vineCanvas || !container) return

        const textCtx = textCanvas.getContext("2d", { willReadFrequently: true })
        const vineCtx = vineCanvas.getContext("2d")

        if (!textCtx || !vineCtx) return

        let animationFrameId: number

        const setCanvasSize = () => {
            // Use container dimensions, but ensure at least some height
            const width = window.innerWidth
            const height = Math.max(400, window.innerHeight * 0.5) // At least 400px or half screen

            textCanvas.width = width
            textCanvas.height = height
            vineCanvas.width = width
            vineCanvas.height = height
            // Update style height of container if needed, though usually controlled by CSS
        }

        const PIXEL_SIZE = 4
        const GRAVITY = 0.15
        const DAMPING = 0.99
        const SEGMENT_LENGTH = PIXEL_SIZE * 4

        let textPoints: { x: number, y: number }[] = []

        class Point {
            x: number
            y: number
            oldX: number
            oldY: number
            fixed: boolean

            constructor(x: number, y: number, fixed = false) {
                this.x = x
                this.y = y
                this.oldX = x
                this.oldY = y
                this.fixed = fixed
            }

            update(wind: number) {
                if (this.fixed) return

                const vx = (this.x - this.oldX) * DAMPING
                const vy = (this.y - this.oldY) * DAMPING

                this.oldX = this.x
                this.oldY = this.y

                this.x += vx + wind
                this.y += vy + GRAVITY
            }
        }

        interface Leaf {
            segmentIdx: number
            side: number
        }

        class Vine {
            points: Point[]
            leaves: Leaf[]
            isJointed: boolean
            color: string

            constructor(x: number, y: number, segments: number, targetX: number | null = null, targetY: number | null = null) {
                this.points = []
                this.leaves = []
                this.isJointed = targetX !== null && targetY !== null

                // Random green shade for this vine
                const greenShades = ['#2d5016', '#3a6b1e', '#4a8029', '#5c9633', '#6dad3d']
                this.color = greenShades[Math.floor(Math.random() * greenShades.length)]

                this.points.push(new Point(x, y, true))

                if (this.isJointed && targetX !== null && targetY !== null) {
                    // Create vine between two fixed points
                    for (let i = 1; i < segments - 1; i++) {
                        const t = i / (segments - 1)
                        const px = x + (targetX - x) * t
                        const py = y + (targetY - y) * t
                        this.points.push(new Point(px, py))
                    }
                    this.points.push(new Point(targetX, targetY, true))
                } else {
                    // Create vine with one fixed point
                    const angle = Math.random() * Math.PI * 2
                    for (let i = 1; i < segments; i++) {
                        const distance = i * SEGMENT_LENGTH
                        const px = x + Math.cos(angle) * distance
                        const py = y + Math.sin(angle) * distance
                        this.points.push(new Point(px, py))
                    }
                }

                // Add leaves randomly (fewer leaves)
                const leafCount = Math.floor(segments / 6)
                for (let i = 0; i < leafCount; i++) {
                    const segmentIdx = Math.floor(Math.random() * (segments - 2)) + 2
                    const side = Math.random() > 0.5 ? 1 : -1
                    this.leaves.push({ segmentIdx, side })
                }
            }

            update(wind: number) {
                this.points.forEach(p => p.update(wind))

                for (let i = 0; i < 3; i++) {
                    this.constrainPoints()
                }
            }

            constrainPoints() {
                for (let i = 0; i < this.points.length - 1; i++) {
                    const p1 = this.points[i]
                    const p2 = this.points[i + 1]

                    const dx = p2.x - p1.x
                    const dy = p2.y - p1.y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    const diff = (SEGMENT_LENGTH - dist) / dist

                    const offsetX = dx * diff * 0.5
                    const offsetY = dy * diff * 0.5

                    if (!p1.fixed) {
                        p1.x -= offsetX
                        p1.y -= offsetY
                    }
                    if (!p2.fixed) {
                        p2.x += offsetX
                        p2.y += offsetY
                    }
                }
            }

            draw(ctx: CanvasRenderingContext2D) {
                ctx.fillStyle = this.color

                for (let i = 0; i < this.points.length - 1; i++) {
                    const p1 = this.points[i]
                    const p2 = this.points[i + 1]

                    const x1 = Math.floor(p1.x / PIXEL_SIZE) * PIXEL_SIZE
                    const y1 = Math.floor(p1.y / PIXEL_SIZE) * PIXEL_SIZE
                    const x2 = Math.floor(p2.x / PIXEL_SIZE) * PIXEL_SIZE
                    const y2 = Math.floor(p2.y / PIXEL_SIZE) * PIXEL_SIZE

                    this.drawPixelLine(ctx, x1, y1, x2, y2)
                }

                // Draw leaves
                this.leaves.forEach(leaf => {
                    const p = this.points[leaf.segmentIdx]
                    const x = Math.floor(p.x / PIXEL_SIZE) * PIXEL_SIZE
                    const y = Math.floor(p.y / PIXEL_SIZE) * PIXEL_SIZE

                    // Simple pixelated leaf (3 pixels in L shape)
                    const offsetX = leaf.side * PIXEL_SIZE * 2
                    ctx.fillRect(x + offsetX, y, PIXEL_SIZE, PIXEL_SIZE)
                    ctx.fillRect(x + offsetX, y + PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
                    ctx.fillRect(x + offsetX + (leaf.side * PIXEL_SIZE), y + PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
                })
            }

            drawPixelLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
                const dx = Math.abs(x2 - x1)
                const dy = Math.abs(y2 - y1)
                const sx = x1 < x2 ? PIXEL_SIZE : -PIXEL_SIZE
                const sy = y1 < y2 ? PIXEL_SIZE : -PIXEL_SIZE
                let err = dx - dy

                let currentX = x1
                let currentY = y1

                while (true) {
                    ctx.fillRect(currentX, currentY, PIXEL_SIZE, PIXEL_SIZE)

                    if (currentX === x2 && currentY === y2) break

                    const e2 = 2 * err
                    if (e2 > -dy) {
                        err -= dy
                        currentX += sx
                    }
                    if (e2 < dx) {
                        err += dx
                        currentY += sy
                    }
                }
            }
        }

        let vines: Vine[] = []

        const drawText = () => {
            if (!textCtx) return
            const width = textCanvas.width
            const height = textCanvas.height

            textCtx.clearRect(0, 0, width, height)

            const fontSize = Math.min(width / 5, height / 2)

            // Check for dark mode via document class or similar, but for now specific color
            const isDark = document.documentElement.classList.contains("dark")
            textCtx.fillStyle = isDark ? '#fff' : '#000' // Adaptive color
            textCtx.font = `bold ${fontSize}px monospace`
            textCtx.textAlign = 'center'
            textCtx.textBaseline = 'middle'

            textCtx.fillText("Tomlin7", width / 2, height / 2)

            // Sample edges
            const imageData = textCtx.getImageData(0, 0, width, height)
            const data = imageData.data
            const sampleStep = 16

            textPoints = []

            for (let y = 0; y < height; y += sampleStep) {
                for (let x = 0; x < width; x += sampleStep) {
                    const index = (y * width + x) * 4
                    if (data[index + 3] > 0) { // Check alpha
                        // Check neighbors
                        let isEdge = false
                        for (let ny = -sampleStep; ny <= sampleStep; ny += sampleStep) {
                            for (let nx = -sampleStep; nx <= sampleStep; nx += sampleStep) {
                                if (nx === 0 && ny === 0) continue

                                const neighborX = x + nx
                                const neighborY = y + ny

                                if (neighborX >= 0 && neighborX < width && neighborY >= 0 && neighborY < height) {
                                    const neighborIndex = (neighborY * width + neighborX) * 4
                                    if (data[neighborIndex + 3] === 0) {
                                        isEdge = true
                                        break
                                    }
                                }
                            }
                            if (isEdge) break
                        }

                        if (isEdge) {
                            textPoints.push({ x, y })
                        }
                    }
                }
            }
        }

        const initVines = () => {
            vines = []

            if (textPoints.length > 0) {
                const edgeCount = Math.min(12, textPoints.length / 8)
                const selectedTextPoints: { x: number, y: number }[] = []
                const textPointStep = Math.max(1, Math.floor(textPoints.length / edgeCount))

                for (let i = 0; i < textPoints.length; i += textPointStep) {
                    selectedTextPoints.push(textPoints[i])
                    if (selectedTextPoints.length >= edgeCount) break
                }

                for (let i = 0; i < selectedTextPoints.length; i++) {
                    const textPoint = selectedTextPoints[i]
                    let edgeX = 0, edgeY = 0
                    const edge = i % 4

                    switch (edge) {
                        case 0: edgeX = textCanvas.width * (i / selectedTextPoints.length); edgeY = 0; break;
                        case 1: edgeX = textCanvas.width; edgeY = textCanvas.height * (i / selectedTextPoints.length); break;
                        case 2: edgeX = textCanvas.width * (1 - i / selectedTextPoints.length); edgeY = textCanvas.height; break;
                        case 3: edgeX = 0; edgeY = textCanvas.height * (1 - i / selectedTextPoints.length); break;
                    }

                    const distance = Math.sqrt(Math.pow(textPoint.x - edgeX, 2) + Math.pow(textPoint.y - edgeY, 2))
                    const segments = Math.max(10, Math.floor(distance / SEGMENT_LENGTH))

                    vines.push(new Vine(edgeX, edgeY, segments, textPoint.x, textPoint.y))
                }

                const outwardCount = Math.min(8, textPoints.length / 12)
                for (let i = 0; i < outwardCount; i++) {
                    const index = Math.floor(i * (textPoints.length / outwardCount))
                    const textPoint = textPoints[index]
                    const segments = 6 + Math.floor(Math.random() * 6)
                    vines.push(new Vine(textPoint.x, textPoint.y, segments))
                }
            }
        }

        let time = 0
        let windStrength = 0
        let nextWindChange = 0

        const animate = () => {
            vineCtx.clearRect(0, 0, vineCanvas.width, vineCanvas.height)
            time += 0.02

            if (time > nextWindChange) {
                if (Math.random() > 0.7) {
                    windStrength = (Math.random() - 0.5) * 0.3
                    nextWindChange = time + 2 + Math.random() * 4
                } else {
                    windStrength = 0
                    nextWindChange = time + 3 + Math.random() * 6
                }
            }

            windStrength *= 0.95
            const wind = windStrength * Math.sin(time * 3)

            vines.forEach(vine => {
                vine.update(wind)
                vine.draw(vineCtx)
            })

            animationFrameId = requestAnimationFrame(animate)
        }

        const handleResize = () => {
            setCanvasSize()
            drawText()
            initVines()
        }

        window.addEventListener("resize", handleResize)

        // Initial setup
        setCanvasSize()
        // Small delay to ensure fonts loaded/layout ready
        setTimeout(() => {
            drawText()
            initVines()
            animate()
        }, 100)

        return () => {
            window.removeEventListener("resize", handleResize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <footer ref={containerRef} className="relative border-t bg-background/50 min-h-[400px] overflow-hidden">
            <canvas ref={textCanvasRef} className="absolute inset-0 z-0 opacity-30" />
            <canvas ref={vineCanvasRef} className="absolute inset-0 z-10 pointer-events-none" />
            {/* 
            <div className="absolute bottom-0 w-full z-20 bg-background/80 backdrop-blur-sm border-t border-border/10">
                <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-6 md:flex-row px-4">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        © {new Date().getFullYear()} Tomlin7. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Link href="#" className="underline hover:text-primary transition-colors">
                            Terms
                        </Link>
                        <Link href="#" className="underline hover:text-primary transition-colors">
                            Privacy
                        </Link>
                    </div>
                </div>
            </div> */}
        </footer>
    )
}
