"use client"

import { useEffect, useRef } from "react"

export function PixelBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d", { alpha: true })
        if (!ctx) return

        let animationFrameId: number
        const squareSize = 25

        // Zoom configuration
        const targetX = -0.7436438870371587 // Seahorse Valley
        const targetY = 0.13182590420531197
        let zoom = 1.0
        // Extremely slow zoom for "infinite" feel
        const zoomSpeed = 1.001
        const maxZoom = 1000000

        const renderMandelbrot = () => {
            const isDark = document.documentElement.classList.contains("dark")

            const width = canvas.width
            const height = canvas.height
            const cols = Math.ceil(width / squareSize)
            const rows = Math.ceil(height / squareSize)

            // Clear
            ctx.clearRect(0, 0, width, height)

            const aspectRatio = width / height
            const scale = 3.0 / zoom

            for (let x = 0; x < cols; x++) {
                for (let y = 0; y < rows; y++) {
                    // Normalized coords
                    const nx = (x * squareSize - width / 2) / (Math.min(width, height) / 2)
                    const ny = (y * squareSize - height / 2) / (Math.min(width, height) / 2)

                    const cReal = targetX + nx / zoom
                    const cImag = targetY + ny / zoom

                    let zReal = 0
                    let zImag = 0
                    let iter = 0
                    const maxIter = 50 + Math.log(zoom) * 10

                    while (zReal * zReal + zImag * zImag < 4 && iter < maxIter) {
                        const tempReal = zReal * zReal - zImag * zImag + cReal
                        zImag = 2 * zReal * zImag + cImag
                        zReal = tempReal
                        iter++
                    }

                    if (iter < maxIter) {
                        // Calculate opacity based on iteration count
                        // Map iter to a small alpha range for "dim/subtle" look
                        const brightness = iter / maxIter
                        const minAlpha = 0.01
                        const maxAlpha = 0.10 // Adjusted slightly for visibility
                        const alpha = minAlpha + (brightness * (maxAlpha - minAlpha))

                        // Dynamic opacity, same base color
                        if (isDark) {
                            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
                        } else {
                            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`
                        }

                        // Draw full square (no grid gap)
                        ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize)
                    }
                }
            }

            zoom *= zoomSpeed
            if (zoom > maxZoom) {
                zoom = 1.0
            }

            animationFrameId = requestAnimationFrame(renderMandelbrot)
        }

        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        window.addEventListener("resize", resizeCanvas)
        resizeCanvas()
        renderMandelbrot()

        return () => {
            window.removeEventListener("resize", resizeCanvas)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full pointer-events-none"
            style={{ zIndex: 0 }}
        />
    )
}
