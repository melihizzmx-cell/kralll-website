import { useEffect, useRef, useState } from "react"

// Bir frame (proje case study'si veya sidebar section paneli) açık olduğu
// sürece çevresinde sürekli, düşük tempoda saat yönünde akan fiber-optik
// benzeri bir ışık çizgisi. Klasik box-shadow/neon border değil: her zaman
// görünen çok ince bir temel stroke + üzerinde frame'in tüm çevresini
// (dört kenar + köşeler) kesintisiz dolaşan, önü parlak/kuyruğu sönen bir
// akış bandı.
//
// Hareket, Web Animations API üzerinden element.animate() ile kuruluyor
// (React state hiçbir animasyon karesinde güncellenmiyor — yalnızca
// geometri/perimetre değiştiğinde bir kez yeniden kurulup tarayıcının
// compositor'ına bırakılıyor). Bilinçli olarak CSS @keyframes içinde
// `calc(-1 * var(--perimeter))` KULLANILMIYOR: kayıtsız (unregistered)
// bir custom property'ye bağlı calc() ifadesi, Chromium'da stroke-dashoffset
// için düzgün interpolasyon yerine %50 sınırında ayrık/sıçramalı bir
// davranışa düşüyor (empirik olarak doğrulandı — ışık yalnızca üst kenarda
// görünüp görünmez biçimde "sıçrıyordu", tam da bu yüzden). element.animate()
// literal sayısal keyframe değerleri kullandığı için bu sorunu tamamen
// atlıyor ve WAAPI'nin garantili düzgün interpolasyonundan yararlanıyor.
//
// Konumlandırma iki modda çalışır:
//   fullscreen — ProjectModal (.case-backdrop) her zaman viewport'u birebir
//                kaplar, ölçüm gerekmez, sadece window boyutu izlenir.
//   panel modu — SectionPanel (.modal-panel), backdropRef'e göre absolute
//                konumlanır; panel boyutu/konumu ResizeObserver + birkaç
//                settle-ölçümüyle takip edilir (framer-motion'ın giriş
//                animasyonu ilk ~500ms'de rect'i hafifçe kaydırabildiği
//                için mount sonrası birkaç kez yeniden ölçülür).
//
// Proje/sekme değiştiğinde bileşen yeniden mount edilmez — yalnızca
// accentColor ve geometri prop'ları güncellenir, akış animasyonu kesintisiz
// sürer (CSS transition ile renk ~400ms'de yumuşak geçer), perimetre aynı
// kaldığı sürece WAAPI animasyonları da yeniden kurulmaz.
const LAP_DURATION_MS = 6500
const LAP_DURATION_MOBILE_MS = 8500
const HIGHLIGHT_FRACTION = 0.24
const CORE_FRACTION = 0.09
// Pozitif bir WAAPI delay, o katmanı kalıcı olarak "delay/duration" oranı
// kadar geriden takip ettirir (infinite iterasyonda her turda sürekli).
// Core (parlak çekirdek) gecikmesiz önde akar; tail/glow-wide/kontur bu
// kadar geriden gelir. Core'un tail bandının ÖN (yeni/parlak) ucuna denk
// gelmesi için gecikme ≈ (tail uzunluğu - core uzunluğu) olmalı.
const TAIL_DELAY_FRACTION = HIGHLIGHT_FRACTION - CORE_FRACTION - 0.03
const STROKE_INSET = 1

export default function EdgeGlow({
  containerRef,
  backdropRef,
  fullscreen = false,
  accentColor,
  radius = 0,
  active,
}) {
  const [rect, setRect] = useState(null)
  const [perimeter, setPerimeter] = useState(0)
  const baseRectRef = useRef(null)
  const lapContourRef = useRef(null)
  const glowWideRef = useRef(null)
  const tailRef = useRef(null)
  const coreRef = useRef(null)
  const runningAnimsRef = useRef([])

  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches
  const durationMs = isMobile ? LAP_DURATION_MOBILE_MS : LAP_DURATION_MS
  const tailDelayMs = durationMs * TAIL_DELAY_FRACTION

  // --- Boyut / konum ölçümü ---
  useEffect(() => {
    if (!active) return

    if (fullscreen) {
      const measure = () => setRect({ width: window.innerWidth, height: window.innerHeight, left: 0, top: 0 })
      measure()
      window.addEventListener("resize", measure)
      return () => window.removeEventListener("resize", measure)
    }

    const container = containerRef?.current
    const backdrop = backdropRef?.current
    if (!container || !backdrop) return

    const measure = () => {
      const c = container.getBoundingClientRect()
      const b = backdrop.getBoundingClientRect()
      setRect({ width: c.width, height: c.height, left: c.left - b.left, top: c.top - b.top })
    }

    measure()
    const settleTimers = [50, 150, 300, 550].map((ms) => window.setTimeout(measure, ms))

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(container)
    window.addEventListener("resize", measure)

    return () => {
      settleTimers.forEach((id) => window.clearTimeout(id))
      resizeObserver.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [active, fullscreen, containerRef, backdropRef])

  // --- Perimetre ölçümü (rect radius'u yansıtan gerçek çevre uzunluğu) ---
  useEffect(() => {
    if (!rect || !baseRectRef.current) return
    setPerimeter(baseRectRef.current.getTotalLength())
  }, [rect, radius])

  // --- Sürekli akış animasyonu (WAAPI, literal sayısal keyframe'ler) ---
  useEffect(() => {
    runningAnimsRef.current.forEach((a) => a.cancel())
    runningAnimsRef.current = []

    if (reduced || !perimeter) return

    const targets = [
      { el: lapContourRef.current, delay: tailDelayMs },
      { el: glowWideRef.current, delay: tailDelayMs },
      { el: tailRef.current, delay: tailDelayMs },
      { el: coreRef.current, delay: 0 },
    ]

    targets.forEach(({ el, delay }) => {
      if (!el) return
      const anim = el.animate(
        [{ strokeDashoffset: "0px" }, { strokeDashoffset: `${-perimeter}px` }],
        { duration: durationMs, delay, iterations: Infinity, easing: "linear" }
      )
      runningAnimsRef.current.push(anim)
    })

    return () => {
      runningAnimsRef.current.forEach((a) => a.cancel())
      runningAnimsRef.current = []
    }
  }, [perimeter, durationMs, tailDelayMs, reduced])

  if (!active || !rect) return null

  const w = Math.max(0, rect.width - STROKE_INSET * 2)
  const h = Math.max(0, rect.height - STROKE_INSET * 2)
  const cornerRadius = Math.max(0, Math.min(radius, w / 2, h / 2))

  const geometry = { x: STROKE_INSET, y: STROKE_INSET, width: w, height: h, rx: cornerRadius, ry: cornerRadius }

  const wrapperStyle = fullscreen
    ? { position: "fixed", inset: 0, width: rect.width, height: rect.height }
    : { position: "absolute", left: rect.left, top: rect.top, width: rect.width, height: rect.height }

  const dashFor = (fraction) => (perimeter ? `${perimeter * fraction} ${perimeter}` : undefined)
  const glowWideWidth = isMobile ? 8 : 12

  return (
    <div className="edge-glow" style={wrapperStyle} aria-hidden="true">
      <svg width={rect.width} height={rect.height} style={{ overflow: "visible" }}>
        {/* Fotoğraf ağırlıklı hero gibi parlak/canlı zeminlerde ince stroke'un
            okunurluğunu garanti eden, neredeyse siyah ince kontur — büyük/bulanık
            bir gölge değil, rengin altını çizen tek pikselik bir çerçeve. */}
        <rect className="edge-glow__contour" {...geometry} fill="none" />
        <rect
          ref={baseRectRef}
          className="edge-glow__base"
          {...geometry}
          fill="none"
          style={{ stroke: accentColor }}
        />

        {!reduced && perimeter > 0 && (
          <g className="edge-glow__lap">
            <rect
              ref={lapContourRef}
              className="edge-glow__lap-contour"
              {...geometry}
              fill="none"
              strokeDasharray={dashFor(HIGHLIGHT_FRACTION)}
            />
            <rect
              ref={glowWideRef}
              className="edge-glow__glow-wide"
              {...geometry}
              fill="none"
              strokeWidth={glowWideWidth}
              strokeDasharray={dashFor(HIGHLIGHT_FRACTION + 0.03)}
              style={{ stroke: accentColor }}
            />
            <rect
              ref={tailRef}
              className="edge-glow__tail"
              {...geometry}
              fill="none"
              strokeDasharray={dashFor(HIGHLIGHT_FRACTION)}
              style={{ stroke: accentColor }}
            />
            <rect
              ref={coreRef}
              className="edge-glow__core"
              {...geometry}
              fill="none"
              strokeDasharray={dashFor(CORE_FRACTION)}
              style={{ stroke: `color-mix(in srgb, white 45%, ${accentColor})` }}
            />
          </g>
        )}
      </svg>
    </div>
  )
}
