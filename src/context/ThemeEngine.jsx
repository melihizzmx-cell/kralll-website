import { useEffect, useRef } from "react"
import { animate } from "framer-motion"
import { useMouse } from "./MouseContext"
import { categories } from "../data/categories"

// Merkezi renk teması: her kategori kendi accentColor'ını tanımlar,
// bu motor imlecin kategorilere olan mesafesine göre --accent-r/g/b
// değişkenlerini analog ve yumuşak biçimde günceller. Tüketen tüm
// bileşenler (cursor-glow, ambient glow, nokta grid) bu üç CSS
// değişkenini otomatik olarak okur — yeni bir kategori eklemek için
// başka hiçbir yeri değiştirmen gerekmez.

const DEFAULT_RGB = [155, 77, 255] // sitenin klasik mor tonu, nötr varsayılan
const PROXIMITY_RADIUS = 320
const EASE = [0.16, 1, 0.3, 1]

function hexToRgb(hex) {
  const clean = hex.replace("#", "")
  const n = parseInt(clean, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const categoryColors = categories.map((c) => ({
  x: c.x,
  y: c.y,
  rgb: hexToRgb(c.accentColor),
}))

export default function ThemeEngine() {
  const { mouseX, mouseY } = useMouse()
  const currentRgb = useRef([...DEFAULT_RGB])
  const controlsRef = useRef([null, null, null])
  const rafId = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const duration = prefersReduced ? 0 : 1

    root.style.setProperty("--accent-r", DEFAULT_RGB[0])
    root.style.setProperty("--accent-g", DEFAULT_RGB[1])
    root.style.setProperty("--accent-b", DEFAULT_RGB[2])

    const applyTarget = (target) => {
      const channels = ["r", "g", "b"]
      channels.forEach((ch, i) => {
        controlsRef.current[i]?.stop()
        controlsRef.current[i] = animate(currentRgb.current[i], target[i], {
          duration,
          ease: EASE,
          onUpdate: (v) => {
            currentRgb.current[i] = v
            root.style.setProperty(`--accent-${ch}`, v.toFixed(1))
          },
        })
      })
    }

    const tick = () => {
      rafId.current = null
      const stage = document.querySelector(".category-cloud")
      if (!stage) return

      const rect = stage.getBoundingClientRect()
      const mx = mouseX.get()
      const my = mouseY.get()

      let totalWeight = 0
      let r = 0
      let g = 0
      let b = 0

      for (const c of categoryColors) {
        const px = rect.left + (c.x / 100) * rect.width
        const py = rect.top + (c.y / 100) * rect.height
        const dist = Math.hypot(mx - px, my - py)
        const weight = Math.max(0, 1 - dist / PROXIMITY_RADIUS)
        if (weight <= 0) continue
        const w2 = weight * weight
        totalWeight += w2
        r += c.rgb[0] * w2
        g += c.rgb[1] * w2
        b += c.rgb[2] * w2
      }

      const target =
        totalWeight > 0.0001
          ? [r / totalWeight, g / totalWeight, b / totalWeight]
          : DEFAULT_RGB

      applyTarget(target)
    }

    const scheduleTick = () => {
      if (rafId.current !== null) return
      rafId.current = requestAnimationFrame(tick)
    }

    const unsubX = mouseX.on("change", scheduleTick)
    const unsubY = mouseY.on("change", scheduleTick)

    return () => {
      unsubX()
      unsubY()
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
      controlsRef.current.forEach((c) => c?.stop())
    }
  }, [mouseX, mouseY])

  return null
}
