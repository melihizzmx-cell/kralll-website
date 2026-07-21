import { useEffect, useRef } from "react"
import { animate } from "framer-motion"
import { useMouse } from "./MouseContext"
import { categories } from "../data/categories"
import { projects } from "../data/projects"

// Merkezi renk teması: hem ana sayfadaki kategoriler hem de Selected Works
// içindeki projeler kendi accentColor'ını tanımlar, bu motor imlecin (veya
// dokunma/klavye odağının) o öğelere olan yakınlığına göre --accent-r/g/b
// değişkenlerini analog ve yumuşak biçimde günceller. Tüketen tüm
// bileşenler (cursor-glow, ambient glow, nokta grid, proje underline'ı,
// hero başlık altı çizgisi) bu üç CSS değişkenini otomatik olarak okur —
// yeni bir kategori veya proje eklemek için başka hiçbir yeri değiştirmen
// gerekmez.
//
// Bu dosya, uygulamanın ömrü boyunca tek bir <ThemeEngine /> örneği
// varsayan bilinçli bir tekil (singleton) motordur: animasyon durumu
// (currentRgb / controls) modül kapsamında tutulur, böylece dışarıdaki
// bileşenler (proje tıklaması, dokunma, klavye odağı) mousemove'dan
// bağımsız olarak setThemeAccentOverride() ile aynı rAF + CSS variable
// mekanizmasını doğrudan tetikleyebilir — ikinci bir renk sistemi değil,
// mevcut motorun tek giriş noktası genişletilmiş hâlidir.

const DEFAULT_RGB = [155, 77, 255] // sitenin klasik mor tonu, nötr varsayılan
const PROXIMITY_RADIUS = 320
const EASE = [0.16, 1, 0.3, 1]

export function hexToRgb(hex) {
  const clean = hex.replace("#", "")
  const n = parseInt(clean, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const categorySources = categories.map((c) => ({
  x: c.x,
  y: c.y,
  rgb: hexToRgb(c.accentColor),
}))

const projectSources = projects
  .filter((p) => p.accentColor)
  .map((p) => ({ x: p.x, y: p.y, rgb: hexToRgb(p.accentColor) }))

const currentRgb = [...DEFAULT_RGB]
const controls = [null, null, null]
let overrideRgb = null
let reducedMotion = false

function applyTarget(target) {
  const root = document.documentElement
  const duration = reducedMotion ? 0 : 1
  ;["r", "g", "b"].forEach((ch, i) => {
    controls[i]?.stop()
    controls[i] = animate(currentRgb[i], target[i], {
      duration,
      ease: EASE,
      onUpdate: (v) => {
        currentRgb[i] = v
        root.style.setProperty(`--accent-${ch}`, v.toFixed(1))
      },
    })
  })
}

// Proje bileşenlerinin (tıklama, dokunma, klavye odağı) mousemove akışının
// dışından tema motoruna doğrudan hedef renk bildirmesi için tek giriş
// noktası. hex verildiğinde motor geometrik hesaplamayı devre dışı bırakıp
// o rengi kilitler; null verildiğinde imleç konumuna göre normal analog
// davranışa (veya hiçbir öğeye yakın değilse nötr tona) geri döner.
export function setThemeAccentOverride(hex) {
  overrideRgb = hex ? hexToRgb(hex) : null
  applyTarget(overrideRgb ?? DEFAULT_RGB)
}

export default function ThemeEngine() {
  const { mouseX, mouseY } = useMouse()
  const rafId = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    root.style.setProperty("--accent-r", DEFAULT_RGB[0])
    root.style.setProperty("--accent-g", DEFAULT_RGB[1])
    root.style.setProperty("--accent-b", DEFAULT_RGB[2])

    const tick = () => {
      if (overrideRgb) return

      const categoryStage = document.querySelector(".category-cloud")
      const projectStage = !categoryStage && document.querySelector(".project-cloud")
      const stage = categoryStage || projectStage
      if (!stage) return

      const sources = categoryStage ? categorySources : projectSources
      const rect = stage.getBoundingClientRect()
      const mx = mouseX.get()
      const my = mouseY.get()

      let totalWeight = 0
      let r = 0
      let g = 0
      let b = 0

      for (const s of sources) {
        const px = rect.left + (s.x / 100) * rect.width
        const py = rect.top + (s.y / 100) * rect.height
        const dist = Math.hypot(mx - px, my - py)
        const weight = Math.max(0, 1 - dist / PROXIMITY_RADIUS)
        if (weight <= 0) continue
        const w2 = weight * weight
        totalWeight += w2
        r += s.rgb[0] * w2
        g += s.rgb[1] * w2
        b += s.rgb[2] * w2
      }

      const target =
        totalWeight > 0.0001 ? [r / totalWeight, g / totalWeight, b / totalWeight] : DEFAULT_RGB

      applyTarget(target)
    }

    const scheduleTick = () => {
      if (rafId.current !== null) return
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null
        tick()
      })
    }

    const unsubX = mouseX.on("change", scheduleTick)
    const unsubY = mouseY.on("change", scheduleTick)

    return () => {
      unsubX()
      unsubY()
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
      controls.forEach((c) => c?.stop())
    }
  }, [mouseX, mouseY])

  return null
}
