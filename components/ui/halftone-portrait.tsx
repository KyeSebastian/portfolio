"use client"

import { useCallback, useEffect, useRef } from "react"

interface HalftonePortraitProps {
  src: string
  alt: string
  className?: string
  background?: string
  cellSize?: number
  contrast?: number
  density?: number
  coverage?: number
  invert?: boolean
  animSpeed?: number
  animIntensity?: number
}

// 4x4 Bayer ordered-dither threshold matrix, normalized to 0..1.
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16))

function seededRandom(seed: number) {
  const s = Math.sin(seed) * 43758.5453
  return s - Math.floor(s)
}

function applyContrast(channel: number, contrast: number) {
  // contrast is a percentage where 100 = unity, matching the recipe's scale
  const factor = contrast / 100
  return Math.min(255, Math.max(0, (channel - 128) * factor + 128))
}

export default function HalftonePortrait({
  src,
  alt,
  className = "",
  background = "#000000",
  cellSize = 9,
  contrast = 158,
  density = 20,
  coverage = 100,
  invert = false,
  animSpeed = 100,
  animIntensity = 60,
}: HalftonePortraitProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const ditherRef = useRef<HTMLCanvasElement | null>(null)
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 })
  const rafRef = useRef<number | null>(null)

  // Builds the dithered composition once (on load / resize), not per frame.
  const sample = useCallback(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!container || !canvas || !img || !img.complete || !img.naturalWidth) return

    const width = container.clientWidth
    const height = container.clientHeight
    if (width === 0 || height === 0) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    sizeRef.current = { width, height, dpr }

    // cover-fit crop from the source image, same math as object-fit: cover
    const containerAspect = width / height
    const imgAspect = img.naturalWidth / img.naturalHeight
    let sx = 0
    let sy = 0
    let sw = img.naturalWidth
    let sh = img.naturalHeight
    if (imgAspect > containerAspect) {
      sw = img.naturalHeight * containerAspect
      sx = (img.naturalWidth - sw) / 2
    } else {
      sh = img.naturalWidth / containerAspect
      sy = (img.naturalHeight - sh) / 2
    }

    // full-res draw at device pixels so per-subpixel color sampling stays sharp
    const pxW = Math.round(width * dpr)
    const pxH = Math.round(height * dpr)
    const srcCanvas = document.createElement("canvas")
    srcCanvas.width = pxW
    srcCanvas.height = pxH
    const srcCtx = srcCanvas.getContext("2d")
    if (!srcCtx) return
    srcCtx.drawImage(img, sx, sy, sw, sh, 0, 0, pxW, pxH)
    const { data } = srcCtx.getImageData(0, 0, pxW, pxH)

    // density picks the sub-grid resolution inside each cell (2x2 .. 6x6)
    const subGrid = Math.min(6, Math.max(2, Math.round(density / 5)))
    const cellPx = cellSize * dpr
    const subPx = cellPx / subGrid

    const dither = document.createElement("canvas")
    dither.width = pxW
    dither.height = pxH
    const dctx = dither.getContext("2d")
    if (!dctx) return

    const cols = Math.ceil(pxW / cellPx)
    const rows = Math.ceil(pxH / cellPx)

    for (let cy = 0; cy < rows; cy++) {
      for (let cx = 0; cx < cols; cx++) {
        // coverage skips whole cells deterministically
        if (coverage < 100 && seededRandom(cx * 12.9898 + cy * 78.233) * 100 > coverage) continue

        for (let sy2 = 0; sy2 < subGrid; sy2++) {
          for (let sx2 = 0; sx2 < subGrid; sx2++) {
            const px = Math.min(pxW - 1, Math.floor(cx * cellPx + sx2 * subPx + subPx / 2))
            const py = Math.min(pxH - 1, Math.floor(cy * cellPx + sy2 * subPx + subPx / 2))
            const i = (py * pxW + px) * 4
            const r = applyContrast(data[i], contrast)
            const g = applyContrast(data[i + 1], contrast)
            const b = applyContrast(data[i + 2], contrast)
            let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255

            const threshold = BAYER_4X4[sy2 % 4][sx2 % 4]
            let on = lum > threshold
            if (invert) on = !on
            if (!on) continue

            dctx.fillStyle = `rgb(${r}, ${g}, ${b})`
            dctx.fillRect(
              Math.round(cx * cellPx + sx2 * subPx),
              Math.round(cy * cellPx + sy2 * subPx),
              Math.ceil(subPx),
              Math.ceil(subPx)
            )
          }
        }
      }
    }

    ditherRef.current = dither
  }, [cellSize, contrast, density, coverage, invert])

  // Per-frame: cheap draw of the precomputed dither bitmap, brightness
  // modulated by a single global "pulse" sine wave (animStyle: pulse).
  const render = useCallback(
    (time: number) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      const dither = ditherRef.current
      const { width, height, dpr } = sizeRef.current
      if (!ctx || !canvas || !dither || width === 0 || height === 0) return

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.fillStyle = background
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const speed = 0.3 + (animSpeed / 100) * 1.2
      const amplitude = (animIntensity / 100) * 0.5
      const pulse = 1 - amplitude / 2 + amplitude * 0.5 * Math.sin((time / 1000) * speed)

      ctx.globalAlpha = Math.min(1, Math.max(0, pulse))
      ctx.drawImage(dither, 0, 0)
      ctx.globalAlpha = 1

      void dpr
    },
    [background, animSpeed, animIntensity]
  )

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const loop = (time: number) => {
      render(time)
      rafRef.current = requestAnimationFrame(loop)
    }

    const start = () => {
      sample()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (reduceMotion) {
        render(0)
      } else {
        rafRef.current = requestAnimationFrame(loop)
      }
    }

    const img = new Image()
    imgRef.current = img
    img.src = src
    img.onload = start

    const container = containerRef.current
    let ro: ResizeObserver | null = null
    if (container) {
      ro = new ResizeObserver(() => {
        sample()
        if (reduceMotion) render(performance.now())
      })
      ro.observe(container)
    }

    const handleVisibility = () => {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      } else if (!reduceMotion && rafRef.current === null) {
        rafRef.current = requestAnimationFrame(loop)
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro?.disconnect()
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [src, sample, render])

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`} role="img" aria-label={alt}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  )
}
