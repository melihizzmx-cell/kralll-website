import ProjectItem from "./ProjectItem"
import { projects } from "../data/projects"

export default function ProjectCloud({ onSelectProject, revealed }) {
  return (
    <div className="project-cloud" aria-label="Proje evreni">
      {projects.map((project, index) => (
        <ProjectItem
          key={project.id}
          project={project}
          index={index}
          onSelect={onSelectProject}
          revealed={revealed}
        />
      ))}
    </div>
  )
}
