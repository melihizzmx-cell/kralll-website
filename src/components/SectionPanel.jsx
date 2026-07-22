import { useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { sections } from "../data/sections"
import { sidebarSections } from "../data/sidebarSections"
import { hexToRgb, setPanelAccentOverride } from "../context/ThemeEngine"
import AboutPanelContent from "./AboutPanelContent"
import ContactPanelContent from "./ContactPanelContent"

export default function SectionPanel({ sectionId, onClose, onNavigate }) {
  const panelScrollRef = useRef(null)
  const data = sectionId ? sections[sectionId] : null
  const accentColor = sectionId
    ? sidebarSections.find((s) => s.id === sectionId)?.accentColor
    : null

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

  // Panel açıkken accent en yüksek öncelikli kaynak olarak kilitlenir
  // (bkz. ThemeEngine.jsx öncelik sırası); kapanınca 400-700ms içinde
  // sakin biçimde serbest bırakılır — imleç hâlâ bir kaynağa yakınsa
  // resolveAndApply() doğrudan oraya yönelir, önce nötr'e sıçramaz.
  useEffect(() => {
    setPanelAccentOverride(data ? accentColor : null)
    return () => setPanelAccentOverride(null)
  }, [data, accentColor])

  const [panelAccentR, panelAccentG, panelAccentB] = accentColor
    ? hexToRgb(accentColor)
    : []

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
            ref={panelScrollRef}
            className={`modal-panel ${sectionId === "hakkimda" ? "modal-panel--about" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={data.title}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              "--panel-accent": accentColor,
              "--panel-accent-rgb": `${panelAccentR}, ${panelAccentG}, ${panelAccentB}`,
            }}
          >
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Kapat"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            {sectionId === "hakkimda" ? (
              <AboutPanelContent data={data} onOpenContact={onNavigate} scrollRootRef={panelScrollRef} />
            ) : sectionId === "iletisim" ? (
              <ContactPanelContent data={data} />
            ) : (
              <>
                <span className="modal-eyebrow" lang={data.eyebrowLang}>
                  {data.eyebrow}
                </span>
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

                {data.timeline && (
                  <div className="modal-timeline">
                    {data.timeline.map((item, i) => (
                      <div className="modal-timeline__row" key={i}>
                        <span className="modal-timeline__year">{item.year}</span>
                        <span className="modal-timeline__text">{item.text}</span>
                      </div>
                    ))}
                  </div>
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
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
