import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { sections } from "../data/sections"

export default function SectionPanel({ sectionId, onClose }) {
  const data = sectionId ? sections[sectionId] : null

  useEffect(() => {
    if (!data) return
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
  }, [data, onClose])

  return (
    <AnimatePresence>
      {data && (
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
            aria-label={data.title}
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

            <span className="modal-eyebrow">{data.eyebrow}</span>
            <h2 className="modal-title modal-title--sm">{data.title}</h2>

            {data.body?.map((paragraph, i) => (
              <p className="modal-body" key={i}>
                {paragraph}
              </p>
            ))}

            {data.list && (
              <ul className="modal-list">
                {data.list.map((item, i) => (
                  <li key={i} className="modal-list__item">
                    <span>{item.title}</span>
                    <span className="modal-list__meta">{item.meta}</span>
                  </li>
                ))}
              </ul>
            )}

            {data.quotes && (
              <div className="modal-quotes">
                {data.quotes.map((quote, i) => (
                  <blockquote key={i} className="modal-quote">
                    “{quote.text}”
                    <cite>{quote.meta}</cite>
                  </blockquote>
                ))}
              </div>
            )}

            {data.contact && (
              <div className="modal-contact">
                <a className="modal-contact__email" href={`mailto:${data.contact.email}`}>
                  {data.contact.email}
                </a>
                <div className="modal-contact__links">
                  {data.contact.links.map((link) => (
                    <a key={link.label} href={link.href}>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
