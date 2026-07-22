import { useEffect, useRef, useState } from "react"
import { motion, useTransform } from "framer-motion"
import { useMouse } from "../context/MouseContext"
import {
  hexToRgb,
  setThemeAccentOverride,
  updateSidebarSource,
  removeSidebarSource,
  SIDEBAR_PROXIMITY_RADIUS,
} from "../context/ThemeEngine"

// Ana kategori bulutundaki (CategoryItem.jsx) proximity desenini sidebar
// için "sakinleştirilmiş" biçimde tekrar eder: aynı useMouse() + rect
// ölçümü + useTransform zinciri, ama daha kısa yarıçap (SIDEBAR_PROXIMITY_
// RADIUS, ThemeEngine.jsx ile paylaşılan tek sabit) ve çok daha küçük
// görsel etki (kontrast + küçük nokta + azami 2px kayma — harf glow'u
// veya büyüme yok). Ayrıca kendi ekran konumunu ve rengini ThemeEngine'e
// kaydeder (updateSidebarSource) — bu, ana atmosferin (cursor glow,
// vignette, grid, snake/fiber) sidebar yakınlığına da hafifçe tepki
// vermesini sağlayan tek bağlantı noktası.
export default function SidebarLink({ item, active, onSelect }) {
  const btnRef = useRef(null)
  const [center, setCenter] = useState({ x: -1000, y: -1000 })
  const { mouseX, mouseY } = useMouse()

  useEffect(() => {
    const rgb = hexToRgb(item.accentColor)
    const measure = () => {
      const el = btnRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      setCenter({ x, y })
      updateSidebarSource(item.id, rgb, x, y)
    }
    measure()
    window.addEventListener("resize", measure)
    const id = setTimeout(measure, 400)
    return () => {
      window.removeEventListener("resize", measure)
      clearTimeout(id)
      removeSidebarSource(item.id)
    }
  }, [item.id, item.accentColor])

  const distance = useTransform([mouseX, mouseY], (latest) => {
    const [mx, my] = latest
    const dx = mx - center.x
    const dy = my - center.y
    return Math.sqrt(dx * dx + dy * dy)
  })

  const proximity = useTransform(distance, [0, SIDEBAR_PROXIMITY_RADIUS], [1, 0], {
    clamp: true,
  })
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const textOpacity = useTransform(proximity, [0, 1], [0.42, 0.85])
  // Reduced motion'da renk/kontrast tepkisi kalır, yalnızca dekoratif
  // 1-2px kayma kaldırılır.
  const shiftX = useTransform(proximity, [0, 1], reducedMotion ? [0, 0] : [0, 2])
  const dotOpacity = useTransform(proximity, (p) => Math.max(p * 0.9, active ? 0.55 : 0))
  const dotScale = useTransform(proximity, (p) => Math.max(p, active ? 0.75 : 0.4))

  const activate = () => setThemeAccentOverride(item.accentColor)
  const release = () => setThemeAccentOverride(null)

  // Bir <button>'a tıklamak tarayıcıda da native olarak focus verir —
  // onFocus'u koşulsuz activate() yapsaydık, tıklayıp paneli açtıktan
  // sonra buton hiç blur olmadığı (panel içine focus-trap yok) için bu
  // proje-yuvası kilidi süresiz asılı kalır ve panel kapanınca öncelik
  // sırası yanlışlıkla bu eski renkte takılı kalırdı. :focus-visible
  // kontrolü yalnızca gerçek klavye (Tab) odağında aktive eder — spec'in
  // "Keyboard focus durumunda" maddesiyle zaten örtüşüyor.
  const handleFocus = (e) => {
    if (e.target.matches(":focus-visible")) activate()
  }

  return (
    <div className="sidebar-item" style={{ "--sidebar-accent": item.accentColor }}>
      <motion.span
        className="sidebar-item__dot"
        aria-hidden="true"
        style={{ opacity: dotOpacity, scale: dotScale }}
      />
      <motion.button
        ref={btnRef}
        type="button"
        className={`sidebar-link ${active ? "sidebar-link--active" : ""}`}
        style={active ? undefined : { opacity: textOpacity, x: shiftX }}
        onClick={() => onSelect(item.id)}
        onFocus={handleFocus}
        onBlur={release}
        onTouchStart={activate}
        onTouchEnd={release}
        onTouchCancel={release}
      >
        {item.label}
      </motion.button>
    </div>
  )
}
