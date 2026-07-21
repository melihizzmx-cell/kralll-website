import { useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, X } from "lucide-react"
import { projects } from "../data/projects"

const titleFont = {
  serif: { fontFamily: "'Fraunces', serif", fontWeight: 500 },
  hand: { fontFamily: "'Caveat', cursive", fontWeight: 600 },
}

export default function ProjectModal({ project, onClose, onNavigate }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!project) return
    const handleKey = (e) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    document.body.classList.add("modal-open")
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
      document.body.classList.remove("modal-open")
    }
  }, [project, onClose])

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
  }, [project?.id])

  const currentIndex = project ? projects.findIndex((p) => p.id === project.id) : -1
  const nextProject = currentIndex === -1 ? null : projects[(currentIndex + 1) % projects.length]

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          ref={scrollRef}
          className="case-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          onClick={onClose}
        >
          <button type="button" className="case-close" onClick={onClose} aria-label="Kapat">
            <X size={18} strokeWidth={1.5} />
          </button>

          <motion.div
            key={project.id}
            className="case-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {project.caseStudy ? (
              <FullCaseStudy
                project={project}
                font={titleFont[project.style] ?? titleFont.hand}
                nextProject={nextProject}
                onNavigate={onNavigate}
              />
            ) : (
              <CompactCaseStudy
                project={project}
                font={titleFont[project.style] ?? titleFont.hand}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ContentNeeded({ label, aspect }) {
  return (
    <div className="study-empty" style={aspect ? { aspectRatio: aspect } : undefined}>
      {label && <span className="study-empty__label">{label}</span>}
      <span className="study-empty__flag">content needed</span>
    </div>
  )
}

function FullCaseStudy({ project, font, nextProject, onNavigate }) {
  return (
    <>
      <div className="study-hero">
        <ContentNeeded label="Hero Görsel / Video" />
      </div>

      <div className="study-header">
        <span className="case-eyebrow">{project.brand}</span>
        <h2 className="study-title" style={font}>
          {project.title}
        </h2>
        <p className="case-subtitle">{project.subtitle}</p>
        <div className="case-meta">
          <span>{project.year}</span>
          <span className="case-meta-dot">·</span>
          <span>{project.role}</span>
        </div>
      </div>

      <div className="study-body">
        <div className="case-section case-section--flush">
          <span className="case-section__label">Problem</span>
          <p className="case-section__text">{project.problem}</p>
        </div>

        <div className="case-section">
          <span className="case-section__label">Tüketici İçgörüsü</span>
          <p className="case-section__text">{project.insight}</p>
        </div>

        <div className="case-section">
          <span className="case-section__label">Ana Yaratıcı Fikir</span>
          <p className="case-section__text">{project.idea}</p>
        </div>
      </div>

      {project.outputs?.length > 0 && (
        <div className="study-outputs">
          <span className="study-outputs__label">Çıktılar</span>
          <div className="study-outputs__grid">
            {project.outputs.map((output) => (
              <div className="study-output" key={output.type}>
                <ContentNeeded label={output.type} aspect={output.aspect} />
                <p className="study-output__caption">{output.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="study-body">
        <div className="case-section">
          <span className="case-section__label">Rolüm</span>
          <p className="case-section__text">{project.roleDetail ?? project.role}</p>
        </div>
      </div>

      {nextProject && (
        <button type="button" className="study-next" onClick={() => onNavigate?.(nextProject)}>
          <span className="study-next__label">Sıradaki Proje</span>
          <span className="study-next__title">
            {nextProject.title}
            <ArrowRight size={20} strokeWidth={1.5} />
          </span>
        </button>
      )}
    </>
  )
}

function CompactCaseStudy({ project, font }) {
  return (
    <>
      <div className="study-hero">
        <ContentNeeded label="Görsel / Video Alanı" />
      </div>

      <div className="study-header">
        <span className="case-eyebrow">{project.brand}</span>
        <h2 className="study-title" style={font}>
          {project.title}
        </h2>
        <p className="case-subtitle">{project.subtitle}</p>
        <div className="case-meta">
          <span>{project.year}</span>
          <span className="case-meta-dot">·</span>
          <span>{project.role}</span>
        </div>
      </div>

      <div className="study-body">
        <div className="case-section case-section--flush">
          <span className="case-section__label">İçgörü</span>
          <p className="case-section__text">{project.insight}</p>
        </div>
        <div className="case-section">
          <span className="case-section__label">Fikir</span>
          <p className="case-section__text">{project.idea}</p>
        </div>
        <div className="case-section">
          <span className="case-section__label">Uygulama</span>
          <p className="case-section__text">{project.execution}</p>
        </div>
      </div>
    </>
  )
}
