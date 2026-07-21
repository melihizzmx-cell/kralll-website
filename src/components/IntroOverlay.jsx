import { useState } from "react"
import { motion } from "framer-motion"

export default function IntroOverlay({ visible }) {
  const [settled, setSettled] = useState(false)

  return (
    <motion.div
      className="intro-overlay"
      initial={{ opacity: 1 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
      aria-hidden="true"
    >
      <motion.span
        className="intro-overlay__text"
        initial={{ opacity: 0 }}
        animate={
          !visible
            ? { opacity: 0 }
            : settled
            ? { opacity: [1, 0.55, 1] }
            : { opacity: 1 }
        }
        transition={
          !visible
            ? { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
            : settled
            ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
            : { duration: 1.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }
        }
        onAnimationComplete={() => {
          if (visible && !settled) setSettled(true)
        }}
      >
        move your cursor
      </motion.span>
    </motion.div>
  )
}
