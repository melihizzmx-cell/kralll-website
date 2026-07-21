import { useEffect, useRef, useState } from "react"
import { motion, useTransform } from "framer-motion"
import { useMouse } from "../context/MouseContext"

const PROXIMITY_RADIUS = 230

const sizeFont = {
  small: "clamp(1.05rem, 1.9vw, 1.55rem)",
  medium: "clamp(1.5rem, 2.9vw, 2.3rem)",
  large: "clamp(2rem, 4vw, 3.2rem)",
  xlarge: "clamp(2.5rem, 5vw, 4rem)",
}

const handFonts = ["'Caveat', cursive", "'Nanum Pen Script', cursive"]

export default function ProjectItem({ project, index, onSelect, revealed }) {
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
  const opacity = useTransform(proximity, [0, 1], [0.035, 1])
  const scale = useTransform(proximity, [0, 1], [1, 1.08])
  const glowSize = useTransform(proximity, [0, 1], [0, 16])
  const textShadow = useTransform(
    glowSize,
    (v) => `0 0 ${v}px rgba(199, 132, 255, ${v > 0 ? 0.7 : 0})`
  )

  return (
    <motion.div
      className={`project-wrapper project-wrapper--${project.size}`}
      style={{ left: `${project.x}%`, top: `${project.y}%` }}
      initial={{ opacity: 0, filter: "blur(10px)", y: 18 }}
      animate={
        revealed
          ? { opacity: 1, filter: "blur(0px)", y: 0 }
          : { opacity: 0, filter: "blur(10px)", y: 18 }
      }
      transition={{
        duration: 1.8,
        delay: revealed ? 0.45 + index * 0.16 : 0,
        ease: [0.16, 1, 0.3, 1],
      }}
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
          fontFamily: handFonts[index % handFonts.length],
          textShadow,
        }}
        onClick={() => onSelect(project)}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        {project.title}
        <motion.span
          className="project-item__underline"
          style={{ scaleX: proximity }}
        />
        <motion.span
          className="project-item__arrow"
          style={{ opacity: proximity }}
        >
          ↗
        </motion.span>
      </motion.button>

      <motion.div
        className="project-item__meta"
        initial={false}
        animate={{
          opacity: hovered ? 1 : 0,
          y: hovered ? 0 : 6,
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ rotate: project.rotation * 0.3 }}
      >
        <span className="project-item__meta-title">{project.subtitle}</span>
        <span className="project-item__meta-line">
          {project.year} · {project.role}
        </span>
      </motion.div>
    </motion.div>
  )
}
