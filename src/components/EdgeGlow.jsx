import { useEffect, useRef, useState } from "react"

// Bir frame (proje case study'si veya sidebar section paneli) açık olduğu
// sürece çevresinde sürekli, düşük tempoda saat yönünde akan tek bir ışık
// parçası. Frame'in TAMAMINI çevreleyen sabit/statik bir stroke YOK —
// yalnızca hareketli bir "head + tail" görünür, geçtiği yerde kenar tekrar
// tamamen karanlığa döner. Geometriyi ölçmek için kullanılan referans
// <rect> tamamen görünmez (stroke: transparent, opacity: 0) — yalnızca
// getTotalLength() için var, hiçbir görsel iz bırakmaz.
//
// Hareket, Web Animations API üzerinden element.animate() ile kuruluyor
// (React state hiçbir animasyon karesinde güncellenmiyor — yalnızca
// geometri/perimetre değiştiğinde bir kez yeniden kurulup tarayıcının
// compositor'ına bırakılıyor). Bilinçli olarak CSS @keyframes içinde
// `calc(-1 * var(--perimeter))` KULLANILMIYOR: kayıtsız (unregistered)
// bir custom property'ye bağlı calc() ifadesi, Chromium'da stroke-dashoffset
// için düzgün interpolasyon yerine %50 sınırında ayrık/sıçramalı bir
// davranışa düşüyor (daha önce empirik olarak doğrulandı). element.animate()
// literal sayısal keyframe değerleri kullandığı için bu sorunu tamamen
// atlıyor.
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
const TAIL_FRACTION = 0.18
const CORE_FRACTION = 0.06
// Pozitif bir WAAPI delay, o katmanı kalıcı olarak "delay/duration" oranı
// kadar geriden takip ettirir (infinite iterasyonda her turda sürekli).
// Core (parlak head) gecikmesiz önde akar; tail bu kadar geriden gelir.
// Core'un tail bandının ÖN (yeni/parlak) ucuna denk gelmesi için gecikme
// ≈ (tail uzunluğu - core uzunluğu) olmalı.
const TAIL_DELAY_FRACTION = TAIL_FRACTION - CORE_FRACTION - 0.02
const STROKE_INSET = 1
// reduced-motion'da tam çevre YOK — yalnızca sabit, kısa bir accent
// segmenti (frame'in başlangıç noktasında, hareketsiz).
const REDUCED_STATIC_FRACTION = 0.08

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
  const geometryRectRef = useRef(null)
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

  // --- Perimetre ölçümü (görünmez referans rect üzerinden) ---
  useEffect(() => {
    if (!rect || !geometryRectRef.current) return
    setPerimeter(geometryRectRef.current.getTotalLength())
  }, [rect, radius])

  // --- Sürekli akış animasyonu (WAAPI, literal sayısal keyframe'ler) ---
  useEffect(() => {
    runningAnimsRef.current.forEach((a) => a.cancel())
    runningAnimsRef.current = []

    if (reduced || !perimeter) return

    const targets = [
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
  const tailWidth = isMobile ? 4 : 5

  return (
    <div className="edge-glow" style={wrapperStyle} aria-hidden="true">
      <svg width={rect.width} height={rect.height} style={{ overflow: "visible" }}>
        {/* Yalnızca perimetre ölçümü için — hiçbir görsel iz bırakmaz. */}
        <rect
          ref={geometryRectRef}
          className="edge-glow__geometry"
          {...geometry}
          fill="none"
          stroke="transparent"
          style={{ opacity: 0 }}
        />

        {reduced && perimeter > 0 && (
          <rect
            className="edge-glow__reduced-static"
            {...geometry}
            fill="none"
            strokeDasharray={dashFor(REDUCED_STATIC_FRACTION)}
            style={{ stroke: accentColor }}
          />
        )}

        {!reduced && perimeter > 0 && (
          <g className="edge-glow__lap">
            <rect
              ref={tailRef}
              className="edge-glow__tail"
              {...geometry}
              fill="none"
              strokeWidth={tailWidth}
              strokeDasharray={dashFor(TAIL_FRACTION)}
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
