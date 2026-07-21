import { useState } from "react"
import ProjectItem from "./ProjectItem"
import { projects } from "../data/projects"
import { FOCUS_HOLD_MS, prefersReducedMotion } from "../lib/caseTransition"
import { setThemeAccentOverride } from "../context/ThemeEngine"

export default function ProjectCloud({ onSelectProject, revealed }) {
  const [focusedId, setFocusedId] = useState(null)

  const handleSelect = (project) => {
    // Tıklanan projenin rengi, açılış koreografisiyle eşzamanlı olarak
    // hemen kilitlenir (bkz. ThemeEngine.setThemeAccentOverride) — case
    // study açıkken de ProjectModal aynı rengi korur.
    if (project.accentColor) setThemeAccentOverride(project.accentColor)

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
        />
      ))}
    </div>
  )
}
