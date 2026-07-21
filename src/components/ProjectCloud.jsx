import { useState } from "react"
import ProjectItem from "./ProjectItem"
import { projects } from "../data/projects"
import { FOCUS_HOLD_MS, prefersReducedMotion } from "../lib/caseTransition"

export default function ProjectCloud({ onSelectProject, revealed }) {
  const [focusedId, setFocusedId] = useState(null)

  const handleSelect = (project) => {
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
