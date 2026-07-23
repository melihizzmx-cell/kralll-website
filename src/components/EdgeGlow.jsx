import { useEffect, useRef, useState } from "react"

// Bir frame (proje case study'si veya sidebar section paneli) açıldığında
// çevresinde saat yönünde bir tur atan, fiber-optik benzeri ince bir ışık
// çizgisi. Klasik box-shadow/neon border değil: sakin 1px temel stroke +
// üzerinde kısa, parlak başlı/sönen kuyruklu tek bir "comet" katmanı.
//
// Konumlandırma iki modda çalışır:
//   fullscreen — ProjectModal (.case-backdrop) her zaman viewport'u birebir
//                kaplar, ölçüm gerekmez, sadece window boyutu izlenir.
//   panel modu — SectionPanel (.modal-panel), backdropRef'e göre absolute
//                konumlanır; panel boyutu/konumu ResizeObserver + birkaç
//                settle-ölçümüyle takip edilir (framer-motion'ın giriş
//                animasyonu ilk ~500ms'de rect'i hafifçe kaydırabildiği
//                için mount sonrası birkaç kez yeniden ölçülür).
const OPEN_LAP_MS = 2200
const OPEN_LAP_MS_MOBILE = 1900
const IDLE_GAP_MS = 7000
const PULSE_LAP_MS = 3600
const STROKE_INSET = 1

export default function EdgeGlow({
  containerRef,
  backdropRef,
  fullscreen = false,
  accentColor,
  radius = 0,
  active,
  triggerKey,
}) {
  const [rect, setRect] = useState(null)
  const [perimeter, setPerimeter] = useState(0)
  const [lap, setLap] = useState(null)
  const baseRectRef = useRef(null)
  const generationRef = useRef(0)

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

  // --- Açılış turu → sessizlik → yavaş nabız döngüsü ---
  useEffect(() => {
    if (!active || !rect) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      setLap(null)
      return
    }

    const isMobile = window.matchMedia("(max-width: 900px)").matches
    generationRef.current += 1
    const myGeneration = generationRef.current
    const timers = []

    const schedule = (fn, delay) => {
      const id = window.setTimeout(() => {
        if (generationRef.current !== myGeneration) return
        fn()
      }, delay)
      timers.push(id)
    }

    const runLap = (durationMs, intensity, onDone) => {
      setLap({ id: `${myGeneration}-${Date.now()}`, durationMs, intensity })
      schedule(() => {
        setLap(null)
        onDone?.()
      }, durationMs)
    }

    const pulseLoop = () => {
      if (isMobile) return
      schedule(() => runLap(PULSE_LAP_MS, 0.5, pulseLoop), IDLE_GAP_MS)
    }

    runLap(isMobile ? OPEN_LAP_MS_MOBILE : OPEN_LAP_MS, 1, pulseLoop)

    return () => {
      generationRef.current += 1
      timers.forEach((id) => window.clearTimeout(id))
      setLap(null)
    }
    // triggerKey değiştiğinde (yeni proje/sekme) tüm döngü sıfırdan başlar
  }, [active, triggerKey, rect !== null])

  if (!active || !rect) return null

  const w = Math.max(0, rect.width - STROKE_INSET * 2)
  const h = Math.max(0, rect.height - STROKE_INSET * 2)
  const cornerRadius = Math.max(0, Math.min(radius, w / 2, h / 2))
  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches

  const geometry = { x: STROKE_INSET, y: STROKE_INSET, width: w, height: h, rx: cornerRadius, ry: cornerRadius }

  const wrapperStyle = fullscreen
    ? { position: "fixed", inset: 0, width: rect.width, height: rect.height }
    : { position: "absolute", left: rect.left, top: rect.top, width: rect.width, height: rect.height }

  const dashFor = (fraction) => (perimeter ? `${perimeter * fraction} ${perimeter}` : undefined)
  const glowWideWidth = isMobile ? 8 : 14

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
          stroke={accentColor}
        />

        {!reduced && lap && perimeter > 0 && (
          <g
            key={lap.id}
            className="edge-glow__lap"
            style={{
              "--edge-glow-perimeter": perimeter,
              opacity: lap.intensity,
            }}
          >
            <rect
              className="edge-glow__lap-contour"
              {...geometry}
              fill="none"
              strokeDasharray={dashFor(0.16)}
              style={{ animationDuration: `${lap.durationMs}ms`, animationDelay: `${lap.durationMs * 0.07}ms` }}
            />
            <rect
              className="edge-glow__glow-wide"
              {...geometry}
              fill="none"
              stroke={accentColor}
              strokeWidth={glowWideWidth}
              strokeDasharray={dashFor(0.2)}
              style={{ animationDuration: `${lap.durationMs}ms` }}
            />
            <rect
              className="edge-glow__tail"
              {...geometry}
              fill="none"
              stroke={accentColor}
              strokeDasharray={dashFor(0.16)}
              style={{ animationDuration: `${lap.durationMs}ms`, animationDelay: `${lap.durationMs * 0.07}ms` }}
            />
            <rect
              className="edge-glow__head"
              {...geometry}
              fill="none"
              stroke={`color-mix(in srgb, white 48%, ${accentColor})`}
              strokeDasharray={dashFor(0.045)}
              style={{ animationDuration: `${lap.durationMs}ms` }}
            />
          </g>
        )}
      </svg>
    </div>
  )
}
