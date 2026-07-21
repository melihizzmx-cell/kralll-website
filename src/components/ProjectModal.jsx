import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"

export default function ProjectModal({ project, onClose }) {
  useEffect(() => {
    if (!project) return
    const handleKey = (e) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [project, onClose])

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={onClose}
        >
          <motion.div
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Kapat"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            <span className="modal-eyebrow">{project.brand}</span>
            <h2 className="modal-title">{project.title}</h2>
            <p className="modal-subtitle">{project.subtitle}</p>

            <div className="modal-meta">
              <span>{project.year}</span>
              <span className="modal-meta-dot">·</span>
              <span>{project.role}</span>
            </div>

            <p className="modal-body">
              Bu bölüm, {project.title} projesine ait notlar, görseller ve
              sürecin özetini barındıracak şekilde büyütülebilir. Şimdilik
              fikrin çekirdeği burada duruyor — art direction kararları,
              referanslar ve üretim notları ileride bu panele eklenecek.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
