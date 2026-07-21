import { useEffect, useRef, useState } from "react"
import { motion, useTransform } from "framer-motion"
import { useMouse } from "../context/MouseContext"

const PROXIMITY_RADIUS = 260

const sizeFont = {
  small: "clamp(1.1rem, 2vw, 1.6rem)",
  medium: "clamp(1.6rem, 3.1vw, 2.5rem)",
  large: "clamp(2.2rem, 4.3vw, 3.4rem)",
}

const weightVariants = [600, 700, 500]

export default function CategoryItem({ category, index, onSelect, revealed }) {
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
  }, [category.x, category.y])

  const distance = useTransform([mouseX, mouseY], (latest) => {
    const [mx, my] = latest
    const dx = mx - center.x
    const dy = my - center.y
    return Math.sqrt(dx * dx + dy * dy)
  })

  const proximity = useTransform(distance, [0, PROXIMITY_RADIUS], [1, 0], {
    clamp: true,
  })
  const opacity = useTransform(proximity, [0, 1], [0.1, 1])
  const scale = useTransform(proximity, [0, 1], [1, 1.08])
  const glowSize = useTransform(proximity, [0, 1], [0, 16])
  const textShadow = useTransform(glowSize, (v) =>
    v > 0 ? `0 0 ${v}px ${category.accentColor}b3` : "0 0 0px transparent"
  )

  return (
    <motion.div
      className="category-wrapper"
      style={{ left: `${category.x}%`, top: `${category.y}%` }}
      initial={{ opacity: 0, filter: "blur(10px)", y: 18 }}
      animate={
        revealed
          ? { opacity: 1, filter: "blur(0px)", y: 0 }
          : { opacity: 0, filter: "blur(10px)", y: 18 }
      }
      transition={{
        duration: 1.3,
        delay: revealed ? 0.3 + index * 0.09 : 0,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <motion.button
        ref={btnRef}
        type="button"
        className="category-item"
        style={{
          opacity,
          scale,
          rotate: category.rotation,
          fontSize: sizeFont[category.size],
          fontWeight: weightVariants[index % weightVariants.length],
          textShadow,
        }}
        onClick={() => onSelect(category)}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        {category.title}
        <motion.span
          className="category-item__underline"
          style={{ scaleX: proximity, background: category.accentColor }}
        />
      </motion.button>

      <motion.div
        className="category-item__meta"
        initial={false}
        animate={{
          opacity: hovered ? 1 : 0,
          y: hovered ? 0 : 4,
          filter: hovered ? "blur(0px)" : "blur(3px)",
        }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{ x: "-50%", rotate: category.rotation * 0.3 }}
      >
        <span
          className="category-item__meta-line"
          style={{ color: category.accentColor }}
        >
          {category.tagline}
        </span>
      </motion.div>
    </motion.div>
  )
}
