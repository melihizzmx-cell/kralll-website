import { createContext, useContext, useEffect, useRef } from "react"
import { useMotionValue } from "framer-motion"

const MouseContext = createContext(null)

export function MouseProvider({ children }) {
  const mouseX = useMotionValue(-1000)
  const mouseY = useMotionValue(-1000)
  const isFine = useRef(true)

  useEffect(() => {
    isFine.current = window.matchMedia("(pointer: fine)").matches

    const handleMove = (event) => {
      mouseX.set(event.clientX)
      mouseY.set(event.clientY)
    }

    const handleUp = (event) => {
      if (event.pointerType === "touch") {
        setTimeout(() => {
          mouseX.set(-1000)
          mouseY.set(-1000)
        }, 500)
      }
    }

    const handleLeaveWindow = () => {
      if (isFine.current) {
        mouseX.set(-1000)
        mouseY.set(-1000)
      }
    }

    window.addEventListener("pointermove", handleMove, { passive: true })
    window.addEventListener("pointerup", handleUp, { passive: true })
    window.addEventListener("pointercancel", handleUp, { passive: true })
    document.addEventListener("mouseleave", handleLeaveWindow)

    return () => {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
      window.removeEventListener("pointercancel", handleUp)
      document.removeEventListener("mouseleave", handleLeaveWindow)
    }
  }, [mouseX, mouseY])

  return (
    <MouseContext.Provider value={{ mouseX, mouseY }}>
      {children}
    </MouseContext.Provider>
  )
}

export function useMouse() {
  const ctx = useContext(MouseContext)
  if (!ctx) {
    throw new Error("useMouse, MouseProvider icinde kullanilmalidir")
  }
  return ctx
}
