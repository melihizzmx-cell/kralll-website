import { useEffect, useMemo, useRef, useState } from "react"
import ProjectItem from "./ProjectItem"
import ProjectHoverPeek from "./ProjectHoverPeek"
import { projects } from "../data/projects"
import { FOCUS_HOLD_MS, prefersReducedMotion } from "../lib/caseTransition"
import { pickPeekZone } from "../lib/discovery"
import { setThemeAccentOverride } from "../context/ThemeEngine"

// Hover/klavye odağı bir proje adına girdikten sonra Peek'in belirmesi
// için beklenen "niyet" süresi — kullanıcı projeden hızlıca geçerse hiç
// açılmaz (bkz. handlePeekStart/handlePeekEnd).
const PEEK_INTENT_MS = 400

function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches
}

export default function ProjectCloud({ onSelectProject, revealed }) {
  const [focusedId, setFocusedId] = useState(null)
  const [peekProject, setPeekProject] = useState(null)
  const peekTimerRef = useRef(null)
  const [isMobile, setIsMobile] = useState(isMobileViewport)

  useEffect(() => {
    const onResize = () => setIsMobile(isMobileViewport())
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => () => window.clearTimeout(peekTimerRef.current), [])

  const handleSelect = (project) => {
    // Tıklanan projenin rengi, açılış koreografisiyle eşzamanlı olarak
    // hemen kilitlenir (bkz. ThemeEngine.setThemeAccentOverride) — case
    // study açıkken de ProjectModal aynı rengi korur.
    if (project.accentColor) setThemeAccentOverride(project.accentColor)

    window.clearTimeout(peekTimerRef.current)
    setPeekProject(null)

    if (prefersReducedMotion()) {
      onSelectProject(project)
      return
    }
    setFocusedId(project.id)
    window.setTimeout(() => {
      onSelectProject(project)
      setFocusedId(null)
    }, FOCUS_HOLD_MS)
  }

  const handlePeekStart = (project) => {
    if (isMobileViewport()) return
    window.clearTimeout(peekTimerRef.current)
    peekTimerRef.current = window.setTimeout(() => setPeekProject(project), PEEK_INTENT_MS)
  }

  const handlePeekEnd = (project) => {
    window.clearTimeout(peekTimerRef.current)
    setPeekProject((current) => (current?.id === project.id ? null : current))
  }

  // Zone yalnızca aktif peek projesi değiştiğinde hesaplanır — hover
  // sırasında her kare değil.
  const peekZone = useMemo(() => (peekProject ? pickPeekZone(peekProject) : null), [peekProject])

  return (
    <div className="project-cloud" aria-label="Proje evreni">
      {projects.map((project, index) => (
        <ProjectItem
          key={project.id}
          project={project}
          index={index}
          onSelect={handleSelect}
          revealed={revealed}
          focused={project.id === focusedId}
          receding={focusedId !== null && focusedId !== project.id}
          onPeekStart={handlePeekStart}
          onPeekEnd={handlePeekEnd}
        />
      ))}

      {!isMobile && <ProjectHoverPeek project={peekProject} zone={peekZone} />}
    </div>
  )
}
