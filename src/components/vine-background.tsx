"use client"

import { useEffect, useRef } from "react"

export function VineBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set dimensions
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const PIXEL_SIZE = 4
        const GRAVITY = 0.15
        const DAMPING = 0.99
        const SEGMENT_LENGTH = PIXEL_SIZE * 4

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
            isVertical: boolean
            isJointed: boolean
            color: string

            constructor(x: number, y: number, segments: number, isVertical = true, endX: number | null = null, endY: number | null = null) {
                this.points = []
                this.leaves = []
                this.isVertical = isVertical
                this.isJointed = endX !== null && endY !== null

                // Random green shade for this vine
                const greenShades = ['#2d5016', '#3a6b1e', '#4a8029', '#5c9633', '#6dad3d']
                this.color = greenShades[Math.floor(Math.random() * greenShades.length)]

                this.points.push(new Point(x, y, true))

                if (this.isJointed && endX !== null && endY !== null) {
                    // Create vine between two fixed points
                    for (let i = 1; i < segments - 1; i++) {
                        const t = i / (segments - 1)
                        const px = x + (endX - x) * t
                        const py = y + (endY - y) * t
                        this.points.push(new Point(px, py))
                    }
                    this.points.push(new Point(endX, endY, true))
                } else {
                    for (let i = 1; i < segments; i++) {
                        if (isVertical) {
                            this.points.push(new Point(x, y + i * SEGMENT_LENGTH))
                        } else {
                            this.points.push(new Point(x + i * SEGMENT_LENGTH, y))
                        }
                    }
                }

                // Add leaves randomly (sparse)
                const leafCount = Math.floor(segments / 4)
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

        const vines: Vine[] = []

        const initVines = () => {
            vines.length = 0 // Clear existing

            // Calculate segments based on height (approximate)
            const minSegments = Math.floor((canvas.height * 0.4) / SEGMENT_LENGTH)
            const maxSegmentsBonus = Math.floor((canvas.height * 0.2) / SEGMENT_LENGTH)

            // Top-left corner vines
            const topLeftCount = 5 + Math.floor(Math.random() * 3)
            for (let i = 0; i < topLeftCount; i++) {
                const rand = Math.random()
                if (rand > 0.85) {
                    // Vertical from top (Longer) with occasional vines closer to middle
                    const spread = Math.random() > 0.7 ? canvas.width * 0.4 : 200
                    const x = 20 + Math.random() * spread
                    const segments = minSegments + Math.floor(Math.random() * maxSegmentsBonus)
                    vines.push(new Vine(x, 0, segments, true))
                } else if (rand > 0.7) {
                    // Horizontal from side
                    const y = 20 + Math.random() * 100
                    const segments = 20 + Math.floor(Math.random() * 15)
                    vines.push(new Vine(0, y, segments, false))
                } else {
                    // Jointed between top and LEFT side ONLY
                    const spread = Math.random() > 0.7 ? canvas.width * 0.4 : 200
                    const topX = 30 + Math.random() * spread
                    const sideY = 50 + Math.random() * 200
                    const segments = minSegments + 10 + Math.floor(Math.random() * maxSegmentsBonus)
                    vines.push(new Vine(topX, 0, segments, false, 0, sideY))
                }
            }

            // Top-right corner vines
            const topRightCount = 5 + Math.floor(Math.random() * 3)
            for (let i = 0; i < topRightCount; i++) {
                const rand = Math.random()
                if (rand > 0.85) {
                    // Vertical from top (Longer) with occasional vines closer to middle
                    const spread = Math.random() > 0.7 ? canvas.width * 0.4 : 200
                    const x = canvas.width - (20 + Math.random() * spread)
                    const segments = minSegments + Math.floor(Math.random() * maxSegmentsBonus)
                    vines.push(new Vine(x, 0, segments, true))
                } else if (rand > 0.7) {
                    // Horizontal from side
                    const y = 20 + Math.random() * 100
                    const segments = 20 + Math.floor(Math.random() * 15)
                    vines.push(new Vine(canvas.width, y, segments, false))
                } else {
                    // Jointed between top and RIGHT side ONLY
                    const spread = Math.random() > 0.7 ? canvas.width * 0.4 : 200
                    const topX = canvas.width - (30 + Math.random() * spread)
                    const sideY = 50 + Math.random() * 200
                    const segments = minSegments + 10 + Math.floor(Math.random() * maxSegmentsBonus)
                    vines.push(new Vine(topX, 0, segments, false, canvas.width, sideY))
                }
            }
        }

        initVines()

        let time = 0
        let windStrength = 0
        let nextWindChange = 0
        let animationFrameId: number

        const render = () => {
            // Clear but keep transparency
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            time += 0.02

            // Intermittent breeze - more frequent and stronger
            if (time > nextWindChange) {
                if (Math.random() > 0.6) { // Increased chance of wind
                    windStrength = (Math.random() - 0.5) * 0.8 // Stronger wind (was 0.3)
                    nextWindChange = time + 2 + Math.random() * 4
                } else {
                    windStrength = 0
                    nextWindChange = time + 3 + Math.random() * 6
                }
            }

            // Gradually reduce wind
            windStrength *= 0.98 // Slower damping (was 0.95) for longer lasting wind
            // Add some complexity to the wind wave
            const wind = windStrength * (Math.sin(time * 2) + Math.sin(time * 5) * 0.5)

            vines.forEach(vine => {
                vine.update(wind)
                vine.draw(ctx)
            })

            animationFrameId = requestAnimationFrame(render)
        }

        render()

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            initVines() // Re-init on resize to fit corners
        }

        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full pointer-events-none z-[1]" // z-index set to be visible but not blocking
        />
    )
}
