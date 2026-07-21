import { useEffect, useState } from "react"
import { motion, useSpring } from "framer-motion"
import { useMouse } from "../context/MouseContext"

export default function CursorGlow() {
  const { mouseX, mouseY } = useMouse()
  const [pointerFine, setPointerFine] = useState(true)

  const glowX = useSpring(mouseX, { damping: 34, stiffness: 90, mass: 0.7 })
  const glowY = useSpring(mouseY, { damping: 34, stiffness: 90, mass: 0.7 })
  const dotX = useSpring(mouseX, { damping: 42, stiffness: 380, mass: 0.2 })
  const dotY = useSpring(mouseY, { damping: 42, stiffness: 380, mass: 0.2 })

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)")
    setPointerFine(mq.matches)
    const update = (e) => setPointerFine(e.matches)
    mq.addEventListener?.("change", update)
    return () => mq.removeEventListener?.("change", update)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const unsubX = mouseX.on("change", (v) => root.style.setProperty("--mx", `${v}px`))
    const unsubY = mouseY.on("change", (v) => root.style.setProperty("--my", `${v}px`))
    return () => {
      unsubX()
      unsubY()
    }
  }, [mouseX, mouseY])

  return (
    <>
      <motion.div
        className="cursor-glow"
        style={{ x: glowX, y: glowY }}
        aria-hidden="true"
      />
      {pointerFine && (
        <motion.div
          className="cursor-dot"
          style={{ x: dotX, y: dotY }}
          aria-hidden="true"
        />
      )}
    </>
  )
}
