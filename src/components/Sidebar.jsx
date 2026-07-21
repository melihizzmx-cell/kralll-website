import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"

const MOBILE_QUERY = "(max-width: 900px)"

const NAV_ITEMS = [
  { id: "isler", label: "İşlerim" },
  { id: "hakkimda", label: "Hakkımda" },
  { id: "notlar", label: "Not Defteri" },
  { id: "ai-arsiv", label: "AI Arşivi" },
  { id: "referanslar", label: "Referanslar" },
  { id: "iletisim", label: "İletişim" },
]

export default function Sidebar({ activeSection, onSelectSection, revealed }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches
  )

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    const update = (e) => setIsMobile(e.matches)
    mq.addEventListener?.("change", update)
    return () => mq.removeEventListener?.("change", update)
  }, [])

  const handleSelect = (id) => {
    onSelectSection(id)
    setMobileOpen(false)
  }

  return (
    <>
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? (
          <X size={18} strokeWidth={1.5} />
        ) : (
          <Menu size={18} strokeWidth={1.5} />
        )}
      </button>

      <motion.aside
        className="sidebar"
        initial={{ opacity: 0 }}
        animate={{
          opacity: revealed ? (hovered || isMobile ? 0.95 : 0.5) : 0,
          x: isMobile ? (mobileOpen ? 0 : -300) : 0,
        }}
        transition={{
          opacity: {
            duration: revealed ? 0.6 : 1.2,
            delay: revealed ? 0.2 : 0,
            ease: [0.16, 1, 0.3, 1],
          },
          x: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
      >
        <div className="sidebar-mark">kralll</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link ${
                activeSection === item.id && item.id !== "isler"
                  ? "sidebar-link--active"
                  : ""
              }`}
              onClick={() => handleSelect(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </motion.aside>
    </>
  )
}
