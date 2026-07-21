import { useEffect, useRef, useState } from "react"
import { motion, useTransform } from "framer-motion"
import { useMouse } from "../context/MouseContext"
import { projectWrapperState, wrapperTransition } from "../lib/caseTransition"
import { setThemeAccentOverride } from "../context/ThemeEngine"

const PROXIMITY_RADIUS = 260
const META_FLIP_THRESHOLD = 64

const sizeFont = {
  small: "clamp(1.05rem, 1.9vw, 1.55rem)",
  medium: "clamp(1.5rem, 2.9vw, 2.3rem)",
  large: "clamp(2rem, 4vw, 3.2rem)",
  xlarge: "clamp(2.5rem, 5vw, 4rem)",
}

const handVariants = [
  { fontFamily: "'Caveat', cursive", fontWeight: 600, fontStyle: "normal" },
  { fontFamily: "'Caveat', cursive", fontWeight: 700, fontStyle: "normal" },
  { fontFamily: "'Caveat', cursive", fontWeight: 500, fontStyle: "normal" },
]

const serifVariants = [
  { fontFamily: "'Fraunces', serif", fontWeight: 500, fontStyle: "normal" },
  { fontFamily: "'Fraunces', serif", fontWeight: 400, fontStyle: "italic" },
  { fontFamily: "'Fraunces', serif", fontWeight: 600, fontStyle: "normal" },
]

export default function ProjectItem({
  project,
  index,
  onSelect,
  revealed,
  focused = false,
  receding = false,
}) {
  const btnRef = useRef(null)
  const [center, setCenter] = useState({ x: -1000, y: -1000 })
  const [hovered, setHovered] = useState(false)
  const { mouseX, mouseY } = useMouse()

  useEffect(() => {
    const measure = () => {
      const el = btnRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setCenter({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    }
    measure()
    window.addEventListener("resize", measure)
    const id = setTimeout(measure, 400)
    return () => {
      window.removeEventListener("resize", measure)
      clearTimeout(id)
    }
  }, [project.x, project.y])

  const distance = useTransform([mouseX, mouseY], (latest) => {
    const [mx, my] = latest
    const dx = mx - center.x
    const dy = my - center.y
    return Math.sqrt(dx * dx + dy * dy)
  })

  const proximity = useTransform(distance, [0, PROXIMITY_RADIUS], [1, 0], {
    clamp: true,
  })
  const opacity = useTransform(proximity, [0, 1], [0.09, 1])
  const scale = useTransform(proximity, [0, 1], [1, 1.08])
  // Glow'un bulanıklık/opaklığı burada proximity'den türetilir; rengi
  // (--accent-r/g/b) ise CSS composes eder (bkz. .project-item text-shadow) —
  // böylece JS hiç renk bilmeden ThemeEngine'in analog rengini takip eder.
  const glowBlur = useTransform(proximity, [0, 1], [0, 16])
  const glowOpacity = useTransform(proximity, [0, 1], [0, 0.75])

  const metaAbove = project.y >= META_FLIP_THRESHOLD
  const brandLine =
    project.brand && project.brand !== project.title
      ? `${project.brand} · ${project.year} · ${project.role}`
      : `${project.year} · ${project.role}`

  const variants = project.style === "serif" ? serifVariants : handVariants
  const variant = variants[index % variants.length]

  const activateAccent = () => {
    if (project.accentColor) setThemeAccentOverride(project.accentColor)
  }
  const releaseAccent = () => setThemeAccentOverride(null)

  return (
    <motion.div
      className={`project-wrapper project-wrapper--${project.size}`}
      style={{ left: `${project.x}%`, top: `${project.y}%` }}
      initial={{ opacity: 0, filter: "blur(10px)", y: 18, scale: 1 }}
      animate={projectWrapperState({ revealed, focused, receding })}
      transition={
        wrapperTransition({ focused, receding }) ?? {
          duration: 1.3,
          delay: revealed ? 0.3 + index * 0.09 : 0,
          ease: [0.16, 1, 0.3, 1],
        }
      }
    >
      <motion.button
        ref={btnRef}
        type="button"
        className="project-item"
        style={{
          opacity,
          scale,
          rotate: project.rotation,
          fontSize: sizeFont[project.size],
          fontFamily: variant.fontFamily,
          fontWeight: variant.fontWeight,
          fontStyle: variant.fontStyle,
          "--glow-blur": glowBlur,
          "--glow-opacity": glowOpacity,
        }}
        onClick={() => onSelect(project)}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onFocus={() => {
          setHovered(true)
          activateAccent()
        }}
        onBlur={() => {
          setHovered(false)
          releaseAccent()
        }}
        onTouchStart={activateAccent}
      >
        {project.title}
        <motion.span
          className="project-item__underline"
          style={{ scaleX: proximity }}
        />
      </motion.button>

      <motion.div
        className={`project-item__meta ${
          metaAbove ? "project-item__meta--above" : ""
        }`}
        initial={false}
        animate={{
          opacity: hovered ? 1 : 0,
          y: hovered ? 0 : metaAbove ? -6 : 6,
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ x: "-50%", rotate: project.rotation * 0.3 }}
      >
        <span className="project-item__meta-title">{project.subtitle}</span>
        <span className="project-item__meta-line">{brandLine}</span>
      </motion.div>
    </motion.div>
  )
}
