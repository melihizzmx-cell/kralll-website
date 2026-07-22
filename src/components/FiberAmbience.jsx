// "Living Fiber Ambience" — karanlığın içinde gerçekten dolaşan, tek
// parça bir neon yılan/fiber hattı. Önceki sürüm sabit SVG path'lerini
// birkaç piksel translate ediyordu; bu artık gerçek bir baş/gövde/kuyruk
// sistemi: başın kapalı bir Catmull-Rom rotası üzerinde zaman bazlı
// sabit hızla ilerlediği, son N konumunun (point history) kuyruk olarak
// biriktiği ve eski konumların listeden düştüğü bir canvas çizimi.
//
// Neden canvas: gövdenin şekli her karede gerçekten değişiyor (path
// morphing değil — konum geçmişinden yeniden inşa ediliyor), bunu ucuza
// yapmanın en pratik yolu tek bir full-screen <canvas> ve elle
// requestAnimationFrame döngüsü. React state her karede güncellenmiyor;
// tüm animasyon durumu bu effect'in kapsamındaki mutable değişkenlerde
// tutuluyor, React yalnızca <canvas> elemanını bir kez monte ediyor.
//
// Rota: WAYPOINTS kapalı bir döngü oluşturan kontrol noktaları (bazıları
// ekran dışında — böylece baş gerçekten viewport'a girip çıkıyor).
// Sabit hızlı ilerleme için mount'ta bir kümülatif uzunluk tablosu
// (buildLengthTable) çıkarılıyor; her kare bu tablo üzerinde ikili arama
// yapılıyor, path yeniden hesaplanmıyor. Rotaya, teğete dik yönde iki
// uyumsuz frekanslı sinüsten oluşan çok yavaş bir "wobble" ekleniyor —
// bu sayede döngü hiçbir zaman birebir kendini tekrar etmiyor ve döngü
// sarımında görünür bir sıçrama olmuyor (konum sampleAtDistance içinde
// modulo ile sürekli/kesintisiz — headDist hiç sıfırlanmıyor, sonsuz
// büyüyor, gerçek konuma çevrimi modulo yapıyor).
//
// Metinlerden kaçınma: rota tasarımı zaten kategori/sidebar/identity
// bölgelerinin dışından geçecek şekilde kalibre edildi (bkz. PROTECTED_
// BOXES). Buna ek olarak dampFactor() her çizilen noktada bu kutulara
// olan mesafeye göre opacity'yi yumuşakça kısan bir güvenlik ağı — rota
// hesaplaması kusursuz olmasa bile metinlerin üstü hiçbir zaman tam
// opaklıkla boyanmıyor.
//
// Renk: iki katmanlı sistem korunuyor. (1) Gövde boyunca sabit 4 renkli
// bir gradient (violet→mavi→cyan→magenta, BASE_STOPS). (2) Bu renk, canlı
// --accent-r/g/b (ThemeEngine) değeriyle %25 oranında karıştırılıyor —
// ikinci bir renk motoru değil, mevcut CSS değişkenlerinin düşük frekansta
// (320ms'de bir, per-frame DOM okuması değil) okunup JS'te lerp edilmesi.
//
// Performans sınırları: devicePixelRatio en fazla 1.5 (mobilde 1), point
// history sınırlı (34 masaüstü / 20 mobil), per-frame DOM ölçümü yok,
// canvas boyutu yalnızca resize'da (debounce'lı) güncelleniyor, sekme
// gizliyken veya panel/case study açıkken (paused prop) rAF döngüsü iş
// yapmadan bekliyor (elapsed saati de duruyor — geri dönüşte sıçrama
// olmuyor), unmount'ta temizleniyor. Mobilde ilk ~1.5sn'lik kare süresi
// ölçülüp sürekli düşükse (>%35 kare >40ms) animasyon tek bir statik
// kareye düşüyor.

import { useEffect, useRef } from "react"

const LOGICAL_W = 1440
const LOGICAL_H = 900

// Kapalı döngü kontrol noktaları — bazıları ekran dışında. Sidebar,
// kategori metinleri, üst HUD ve kimlik bloğundan geniş bir payla kaçınacak
// şekilde negatif alanlardan geçiyor.
// scratchpad/verify-snake-route.mjs ile örneklenip PROTECTED_BOXES'a göre
// ayarlandı: 24 farklı wobble-fazında ve rotanın tamamında yalnızca %4.9
// örnek damp bölgesine giriyor, %0.2'si kutunun tam içinde (bkz. commit
// mesajı) — yani opacity düşürme çoğunlukla devrede olmayan, nadir bir
// güvenlik ağı; rotanın büyük çoğunluğu gerçekten negatif alanlardan
// geçiyor.
const WAYPOINTS = [
  [-160, 620],
  [320, 620],
  [660, 610],
  [700, 480],
  [700, 360],
  [900, 190],
  [950, 45],
  [1140, 40],
  [1330, 250],
  [1330, 550],
  [1500, 700],
  [1500, 950],
  [550, 1020],
  [-200, 780],
]

// Kategori/sidebar/HUD/kimlik bölgelerinin yaklaşık kutuları (1440x900
// mantıksal uzayda — bkz. App.jsx .stage padding-left:150px ve
// src/data/categories.js x/y yüzdeleri). Sidebar kutusu sayfanın tamamı
// değil yalnızca mark+nav'ın kapladığı üst kısım (y0-220) — altı zaten
// boş, gereksiz yere geniş bir "yasak bölge" oluşturmasın diye.
const PROTECTED_BOXES = [
  { x0: 0, y0: 0, x1: 232, y1: 220 }, // sol sidebar (mark + nav)
  { x0: 1220, y0: 0, x1: LOGICAL_W, y1: 95 }, // üst sağ HUD (saat/tarih)
  { x0: 1030, y0: 770, x1: LOGICAL_W, y1: LOGICAL_H }, // alt sağ kimlik bloğu
  { x0: 410, y0: 145, x1: 770, y1: 270 }, // Selected Works
  { x0: 1070, y0: 105, x1: 1210, y1: 185 }, // AI Lab
  { x0: 910, y0: 360, x1: 1065, y1: 455 }, // Motion
  { x0: 245, y0: 445, x1: 570, y1: 550 }, // Image Direction
  { x0: 760, y0: 600, x1: 985, y1: 700 }, // Playground
  { x0: 260, y0: 695, x1: 405, y1: 785 }, // About
]

const DAMP_MARGIN = 45

const BASE_STOPS = [
  [155, 107, 255], // #9B6BFF violet
  [77, 140, 255], // #4D8CFF elektrik mavi
  [77, 217, 255], // #4DD9FF cyan
  [197, 107, 255], // #C56BFF pembe-violet/magenta
]

const DEFAULT_ACCENT = { r: 155, g: 77, b: 255 }
const ACCENT_MIX = 0.25

const LAYER_BASE = [
  { widthLo: 6, widthHi: 18, alphaLo: 0, alphaHi: 0.045 },
  { widthLo: 2.5, widthHi: 7, alphaLo: 0, alphaHi: 0.09 },
  { widthLo: 1, widthHi: 2.2, alphaLo: 0, alphaHi: 0.55 },
]

function scaleLayers(widthScale, alphaScale) {
  return LAYER_BASE.map((l) => ({
    widthLo: l.widthLo * widthScale,
    widthHi: l.widthHi * widthScale,
    alphaLo: l.alphaLo * alphaScale,
    alphaHi: l.alphaHi * alphaScale,
  }))
}

const DESKTOP_CFG = {
  maxDpr: 1.5,
  historyMax: 34,
  stepPx: 20,
  loopMs: 40000,
  wobbleAmp: 30,
  layers: scaleLayers(1, 1),
}

const MOBILE_CFG = {
  maxDpr: 1,
  historyMax: 20,
  stepPx: 16,
  loopMs: 52000,
  wobbleAmp: 18,
  layers: scaleLayers(0.6, 0.75),
}

const STATIC_LAYERS = scaleLayers(0.55, 0.4)
const SAMPLES_PER_SEGMENT = 40

function catmullRomPoint(p0, p1, p2, p3, t) {
  const t2 = t * t
  const t3 = t2 * t
  const x =
    0.5 *
    (2 * p1[0] +
      (-p0[0] + p2[0]) * t +
      (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
      (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
  const y =
    0.5 *
    (2 * p1[1] +
      (-p0[1] + p2[1]) * t +
      (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
      (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
  return [x, y]
}

function pointOnLoop(waypoints, segIndex, t) {
  const n = waypoints.length
  const p0 = waypoints[(segIndex - 1 + n) % n]
  const p1 = waypoints[segIndex % n]
  const p2 = waypoints[(segIndex + 1) % n]
  const p3 = waypoints[(segIndex + 2) % n]
  return catmullRomPoint(p0, p1, p2, p3, t)
}

function buildLengthTable(waypoints) {
  const n = waypoints.length
  const samples = [{ dist: 0, seg: 0, t: 0 }]
  let cumulative = 0
  let prev = pointOnLoop(waypoints, 0, 0)
  for (let seg = 0; seg < n; seg++) {
    for (let i = 1; i <= SAMPLES_PER_SEGMENT; i++) {
      const t = i / SAMPLES_PER_SEGMENT
      const pt = pointOnLoop(waypoints, seg, t)
      cumulative += Math.hypot(pt[0] - prev[0], pt[1] - prev[1])
      samples.push({ dist: cumulative, seg, t })
      prev = pt
    }
  }
  return { samples, total: cumulative }
}

function sampleAtDistance(table, dist) {
  const { samples, total } = table
  const target = ((dist % total) + total) % total
  let lo = 0
  let hi = samples.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (samples[mid].dist < target) lo = mid + 1
    else hi = mid
  }
  const s = samples[lo]
  return { seg: s.seg, t: s.t }
}

function baseColorAt(t) {
  const segLen = 1 / (BASE_STOPS.length - 1)
  const idx = Math.min(BASE_STOPS.length - 2, Math.floor(t / segLen))
  const localT = (t - idx * segLen) / segLen
  const a = BASE_STOPS[idx]
  const b = BASE_STOPS[idx + 1]
  return [a[0] + (b[0] - a[0]) * localT, a[1] + (b[1] - a[1]) * localT, a[2] + (b[2] - a[2]) * localT]
}

function colorAt(t, accent) {
  const [br, bg, bb] = baseColorAt(t)
  return [
    br + (accent.r - br) * ACCENT_MIX,
    bg + (accent.g - bg) * ACCENT_MIX,
    bb + (accent.b - bb) * ACCENT_MIX,
  ]
}

function dampFactor(x, y) {
  let minDist = Infinity
  for (const box of PROTECTED_BOXES) {
    const dx = x < box.x0 ? box.x0 - x : x > box.x1 ? x - box.x1 : 0
    const dy = y < box.y0 ? box.y0 - y : y > box.y1 ? y - box.y1 : 0
    const dist = dx === 0 && dy === 0 ? 0 : Math.hypot(dx, dy)
    if (dist < minDist) minDist = dist
  }
  if (minDist >= DAMP_MARGIN) return 1
  return Math.max(0.12, minDist / DAMP_MARGIN)
}

export default function FiberAmbience({ paused = false }) {
  const canvasRef = useRef(null)
  const pausedRef = useRef(paused)

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const isMobile = window.matchMedia("(max-width: 900px)").matches
    const cfg = isMobile ? MOBILE_CFG : DESKTOP_CFG
    const lengthTable = buildLengthTable(WAYPOINTS)

    let dpr = 1
    let scale = 1
    let offsetX = 0
    let offsetY = 0

    function resize() {
      const w = window.innerWidth
      const h = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, cfg.maxDpr)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      scale = Math.max(w / LOGICAL_W, h / LOGICAL_H)
      offsetX = (w - LOGICAL_W * scale) / 2
      offsetY = (h - LOGICAL_H * scale) / 2
    }
    resize()

    const accent = { ...DEFAULT_ACCENT }
    function readAccent() {
      const style = getComputedStyle(document.documentElement)
      const r = parseFloat(style.getPropertyValue("--accent-r"))
      const g = parseFloat(style.getPropertyValue("--accent-g"))
      const b = parseFloat(style.getPropertyValue("--accent-b"))
      if (!Number.isNaN(r)) accent.r = r
      if (!Number.isNaN(g)) accent.g = g
      if (!Number.isNaN(b)) accent.b = b
    }
    readAccent()
    const accentTimer = setInterval(readAccent, 320)

    function clearCanvas() {
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.restore()
    }

    function applyLogicalTransform() {
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offsetX, dpr * offsetY)
    }

    function strokePolyline(points, layers, uniform) {
      const n = points.length
      ctx.lineCap = "round"
      for (let i = 1; i < n - 1; i++) {
        const p0 = points[i - 1]
        const p1 = points[i]
        const p2 = points[i + 1]
        const colorT = i / (n - 1)
        const tailFactor = uniform ? 1 : colorT
        const headBoost = !uniform && colorT > 0.85 ? 1.15 : 1
        const damp = dampFactor(p1.x, p1.y)
        const [r, g, b] = colorAt(colorT, accent)
        const mx1 = (p0.x + p1.x) / 2
        const my1 = (p0.y + p1.y) / 2
        const mx2 = (p1.x + p2.x) / 2
        const my2 = (p1.y + p2.y) / 2
        for (const layer of layers) {
          const alpha = (layer.alphaLo + (layer.alphaHi - layer.alphaLo) * tailFactor) * damp * headBoost
          if (alpha <= 0.002) continue
          const width = layer.widthLo + (layer.widthHi - layer.widthLo) * tailFactor
          ctx.strokeStyle = `rgba(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)}, ${alpha.toFixed(3)})`
          ctx.lineWidth = width
          ctx.beginPath()
          ctx.moveTo(mx1, my1)
          ctx.quadraticCurveTo(p1.x, p1.y, mx2, my2)
          ctx.stroke()
        }
      }
    }

    function drawStatic() {
      applyLogicalTransform()
      clearCanvas()
      const pts = []
      const SAMPLES = 100
      for (let i = 0; i <= SAMPLES; i++) {
        const dist = (i / SAMPLES) * lengthTable.total
        const { seg, t } = sampleAtDistance(lengthTable, dist)
        const [x, y] = pointOnLoop(WAYPOINTS, seg, t)
        pts.push({ x, y })
      }
      strokePolyline(pts, STATIC_LAYERS, true)
    }

    let resizeTimer = null

    if (reducedMotion) {
      drawStatic()
      const onResize = () => {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => {
          resize()
          drawStatic()
        }, 150)
      }
      window.addEventListener("resize", onResize)
      return () => {
        window.removeEventListener("resize", onResize)
        clearInterval(accentTimer)
        clearTimeout(resizeTimer)
      }
    }

    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, 150)
    }
    window.addEventListener("resize", onResize)

    // Kuyruk t=0'da boş başlamasın diye, mevcut hız/adımla geriye doğru
    // hesaplanmış geçmiş noktalarla önceden dolduruyoruz.
    const history = []
    for (let i = cfg.historyMax - 1; i >= 0; i--) {
      const dist = -(i * cfg.stepPx)
      const { seg, t } = sampleAtDistance(lengthTable, dist)
      const [x, y] = pointOnLoop(WAYPOINTS, seg, t)
      history.push({ x, y })
    }
    let lastPushDist = 0

    let rafId = null
    let startTime = null
    let idleAccum = 0
    let idleSince = null
    let lastFrameTime = null
    let frameCount = 0
    let slowFrames = 0
    let degraded = false

    function draw(now) {
      const isIdle = pausedRef.current || document.hidden
      if (isIdle) {
        if (idleSince === null) idleSince = now
        rafId = requestAnimationFrame(draw)
        return
      }
      if (idleSince !== null) {
        idleAccum += now - idleSince
        idleSince = null
        lastFrameTime = null
      }
      if (startTime === null) startTime = now

      if (isMobile && !degraded && lastFrameTime !== null) {
        const delta = now - lastFrameTime
        frameCount++
        if (delta > 40) slowFrames++
        if (frameCount === 90 && slowFrames / frameCount > 0.35) {
          degraded = true
          drawStatic()
          return
        }
      }
      lastFrameTime = now

      const elapsed = now - startTime - idleAccum
      const headDist = (elapsed / cfg.loopMs) * lengthTable.total

      let guard = 0
      while (headDist - lastPushDist >= cfg.stepPx && guard++ < 500) {
        lastPushDist += cfg.stepPx
        const { seg, t } = sampleAtDistance(lengthTable, lastPushDist)
        const [bx, by] = pointOnLoop(WAYPOINTS, seg, t)
        const ahead = sampleAtDistance(lengthTable, lastPushDist + 4)
        const [ax, ay] = pointOnLoop(WAYPOINTS, ahead.seg, ahead.t)
        const dx = ax - bx
        const dy = ay - by
        const len = Math.hypot(dx, dy) || 1
        const nx = -dy / len
        const ny = dx / len
        const wob =
          cfg.wobbleAmp *
          (0.6 * Math.sin(elapsed * 0.00048 + 1.7) + 0.4 * Math.sin(elapsed * 0.00029 + 4.1))
        history.push({ x: bx + nx * wob, y: by + ny * wob })
        if (history.length > cfg.historyMax) history.shift()
      }

      applyLogicalTransform()
      clearCanvas()
      if (history.length >= 3) strokePolyline(history, cfg.layers, false)

      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      window.removeEventListener("resize", onResize)
      clearInterval(accentTimer)
      clearTimeout(resizeTimer)
    }
  }, [])

  return (
    <div className="fiber-ambience" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
