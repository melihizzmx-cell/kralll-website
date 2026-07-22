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
// hero başlık altı çizgisi, snake/fiber canvas) bu üç CSS değişkenini
// otomatik olarak okur — yeni bir kategori veya proje eklemek için başka
// hiçbir yeri değiştirmen gerekmez.
//
// Bu dosya, uygulamanın ömrü boyunca tek bir <ThemeEngine /> örneği
// varsayan bilinçli bir tekil (singleton) motordur: animasyon durumu
// (currentRgb / controls) modül kapsamında tutulur, böylece dışarıdaki
// bileşenler (proje tıklaması, dokunma, klavye odağı, sidebar) mousemove'
// dan bağımsız olarak setThemeAccentOverride() / setPanelAccentOverride()
// ile aynı rAF + CSS variable mekanizmasını doğrudan tetikleyebilir —
// ikinci bir renk sistemi değil, mevcut motorun tek giriş noktası
// genişletilmiş hâlidir.
//
// SIDEBAR: sidebar linkleri kendi accentColor'larını ve ekran konumlarını
// (mount/resize'da ölçülmüş, piksel cinsinden) updateSidebarSource() ile
// bu modüle kaydeder — kategori/proje kaynaklarıyla AYNI ağırlıklı
// ortalama havuzuna, ama SIDEBAR_INTENSITY çarpanıyla (~%55-60) daha
// zayıf katılır ve daha kısa bir yarıçapta (SIDEBAR_PROXIMITY_RADIUS)
// tepki verir — ana kategori etkisinin bir kopyası değil, onun sakin bir
// versiyonu.
//
// ÖNCELİK SIRASI (resolveAndApply / tick içinde uygulanır):
//   1. panelOverrideRgb  — açık SectionPanel'in kilitli rengi
//   2. projectOverrideRgb — aktif proje/case study rengi (veya sidebar
//      linkinin dokunma/klavye odağı ile geçici aktivasyonu — aynı genel
//      "doğrudan etkileşimle kilitlenen renk" yuvasını paylaşır)
//   3. imlece en yakın kategori/proje + sidebar öğelerinin ağırlıklı
//      ortalaması (analog proximity)
//   4. DEFAULT_RGB (nötr atmosfer)

const DEFAULT_RGB = [155, 77, 255] // sitenin klasik mor tonu, nötr varsayılan
const PROXIMITY_RADIUS = 320
// SidebarLink'in kendi yerel tepkisi (kontrast/nokta/1-2px kayma) için —
// spec'teki "180-260px'den itibaren hafif tepki" burada kullanılıyor.
export const SIDEBAR_PROXIMITY_RADIUS = 220
// Global atmosfer havuzundaki sidebar kaynakları İÇİN AYRI ve çok daha
// dar bir yarıçap: linkler yalnızca ~24px arayla dizili olduğundan,
// SIDEBAR_PROXIMITY_RADIUS'u burada da kullanmak komşu öğeleri neredeyse
// eşit ağırlıkla katıp "her bölüm farklı bir oda" hissini boğardı (24px
// mesafede weight ~0.89 — neredeyse hovered öğeyle aynı). Bu daha dar
// yarıçap yalnızca genel atmosferin (cursor glow/vignette/grid/snake)
// hangi bölüme yakın olduğunu ayırt etmesi için.
const SIDEBAR_AMBIENT_RADIUS = 60
const SIDEBAR_INTENSITY = 0.58
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

// Sidebar kaynakları kategori/proje gibi sabit yüzdelerle değil, gerçek
// ekran pikseliyle kayıtlı (sidebar sabit konumlu, bir "stage" içinde
// ölçeklenmiyor) — bkz. SidebarLink.jsx.
const sidebarSourceMap = new Map()

export function updateSidebarSource(id, rgb, x, y) {
  sidebarSourceMap.set(id, { rgb, x, y })
}

export function removeSidebarSource(id) {
  sidebarSourceMap.delete(id)
}

const currentRgb = [...DEFAULT_RGB]
const controls = [null, null, null]
let panelOverrideRgb = null
let projectOverrideRgb = null
let reducedMotion = false
let mouseXValue = null
let mouseYValue = null

function applyTarget(target, duration) {
  const root = document.documentElement
  const d = reducedMotion ? 0 : duration
  ;["r", "g", "b"].forEach((ch, i) => {
    controls[i]?.stop()
    controls[i] = animate(currentRgb[i], target[i], {
      duration: d,
      ease: EASE,
      onUpdate: (v) => {
        currentRgb[i] = v
        root.style.setProperty(`--accent-${ch}`, v.toFixed(1))
      },
    })
  })
}

function computeProximityTarget() {
  if (!mouseXValue || !mouseYValue) return DEFAULT_RGB
  const mx = mouseXValue.get()
  const my = mouseYValue.get()

  const pool = []

  const categoryStage = document.querySelector(".category-cloud")
  const projectStage = !categoryStage && document.querySelector(".project-cloud")
  const stage = categoryStage || projectStage
  if (stage) {
    const sources = categoryStage ? categorySources : projectSources
    const rect = stage.getBoundingClientRect()
    for (const s of sources) {
      pool.push({
        x: rect.left + (s.x / 100) * rect.width,
        y: rect.top + (s.y / 100) * rect.height,
        rgb: s.rgb,
        radius: PROXIMITY_RADIUS,
        intensity: 1,
      })
    }
  }

  for (const s of sidebarSourceMap.values()) {
    pool.push({
      x: s.x,
      y: s.y,
      rgb: s.rgb,
      radius: SIDEBAR_AMBIENT_RADIUS,
      intensity: SIDEBAR_INTENSITY,
    })
  }

  let totalWeight = 0
  let r = 0
  let g = 0
  let b = 0

  for (const s of pool) {
    const dist = Math.hypot(mx - s.x, my - s.y)
    const weight = Math.max(0, 1 - dist / s.radius)
    if (weight <= 0) continue
    const w2 = weight * weight * s.intensity
    totalWeight += w2
    r += s.rgb[0] * w2
    g += s.rgb[1] * w2
    b += s.rgb[2] * w2
  }

  return totalWeight > 0.0001 ? [r / totalWeight, g / totalWeight, b / totalWeight] : DEFAULT_RGB
}

function resolveAndApply(duration) {
  if (panelOverrideRgb) {
    applyTarget(panelOverrideRgb, duration)
    return
  }
  if (projectOverrideRgb) {
    applyTarget(projectOverrideRgb, duration)
    return
  }
  applyTarget(computeProximityTarget(), duration)
}

// Proje bileşenlerinin (tıklama, dokunma, klavye odağı) ve sidebar
// linklerinin dokunma/klavye odağının mousemove akışının dışından tema
// motoruna doğrudan hedef renk bildirmesi için giriş noktası. hex
// verildiğinde bu öncelik-2 yuvayı kilitler; null verildiğinde serbest
// bırakır. Açık bir panel (öncelik-1) varsa görsel olarak hiçbir şey
// değişmez — yalnızca panel kapandığında hangi renge dönüleceği güncellenir.
export function setThemeAccentOverride(hex) {
  projectOverrideRgb = hex ? hexToRgb(hex) : null
  if (!panelOverrideRgb) resolveAndApply(reducedMotion ? 0 : 1)
}

// SectionPanel açıldığında/kapandığında çağrılır — öncelik sırasının en
// tepesindeki yuva. Kilitlenirken hızlıca (0.4s), serbest bırakılırken
// 400-700ms aralığında (0.55s) sakin biçimde geçiş yapar; serbest
// bırakıldığında imleç hâlâ bir kaynağa yakınsa resolveAndApply()
// doğrudan o hedefe yönelir (önce nötr'e sıçramaz).
export function setPanelAccentOverride(hex) {
  panelOverrideRgb = hex ? hexToRgb(hex) : null
  resolveAndApply(reducedMotion ? 0 : panelOverrideRgb ? 0.4 : 0.55)
}

export default function ThemeEngine() {
  const { mouseX, mouseY } = useMouse()
  const rafId = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    mouseXValue = mouseX
    mouseYValue = mouseY

    root.style.setProperty("--accent-r", DEFAULT_RGB[0])
    root.style.setProperty("--accent-g", DEFAULT_RGB[1])
    root.style.setProperty("--accent-b", DEFAULT_RGB[2])

    const tick = () => {
      if (panelOverrideRgb || projectOverrideRgb) return
      applyTarget(computeProximityTarget(), reducedMotion ? 0 : 1)
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
