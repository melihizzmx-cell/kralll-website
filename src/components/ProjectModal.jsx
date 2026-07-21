import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"

const titleFont = {
  serif: { fontFamily: "'Fraunces', serif", fontWeight: 500 },
  hand: { fontFamily: "'Caveat', cursive", fontWeight: 600 },
}

export default function ProjectModal({ project, onClose }) {
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

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="case-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            type="button"
            className="case-close"
            onClick={onClose}
            aria-label="Kapat"
          >
            <X size={18} strokeWidth={1.5} />
          </button>

          <motion.div
            className="case-panel"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="case-hero">
              <span className="case-hero__label">Görsel / Video Alanı</span>
              <h2
                className="case-hero__title"
                style={titleFont[project.style] ?? titleFont.hand}
              >
                {project.title}
              </h2>
            </div>

            <div className="case-content">
              <span className="case-eyebrow">{project.brand}</span>
              <p className="case-subtitle">{project.subtitle}</p>

              <div className="case-meta">
                <span>{project.year}</span>
                <span className="case-meta-dot">·</span>
                <span>{project.role}</span>
              </div>

              <div className="case-sections">
                <div className="case-section">
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
