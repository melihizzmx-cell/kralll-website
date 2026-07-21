import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MouseProvider } from "./context/MouseContext"
import CursorGlow from "./components/CursorGlow"
import Sidebar from "./components/Sidebar"
import ProjectCloud from "./components/ProjectCloud"
import ProjectModal from "./components/ProjectModal"
import SectionPanel from "./components/SectionPanel"
import IntroOverlay from "./components/IntroOverlay"

function useClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  return now
}

function formatTime(date) {
  return date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function formatDate(date) {
  return date
    .toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replaceAll(".", "-")
}

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [activeSection, setActiveSection] = useState("isler")
  const [hasMoved, setHasMoved] = useState(false)
  const now = useClock()

  useEffect(() => {
    const reveal = () => setHasMoved(true)
    window.addEventListener("pointermove", reveal, { once: true })
    window.addEventListener("touchstart", reveal, { once: true })
    return () => {
      window.removeEventListener("pointermove", reveal)
      window.removeEventListener("touchstart", reveal)
    }
  }, [])

  const handleSelectSection = (id) => {
    setActiveSection(id)
  }

  return (
    <MouseProvider>
      <div className="app">
        <div className="bg-vignette" aria-hidden="true" />
        <div className="bg-grid" aria-hidden="true" />
        <div className="bg-noise" aria-hidden="true" />

        <CursorGlow />

        <Sidebar
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
          revealed={hasMoved}
        />

        <main className="stage">
          <h1 className="sr-only">kralll — kişisel fikir evreni</h1>
          <ProjectCloud onSelectProject={setSelectedProject} revealed={hasMoved} />
        </main>

        <motion.header
          className="hud hud--top"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: hasMoved ? 1 : 0 }}
          transition={{ duration: 1.2, delay: hasMoved ? 0.2 : 0, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="hud-time">{formatTime(now)}</span>
          <span className="hud-date">{formatDate(now)}</span>
        </motion.header>

        <motion.footer
          className="hud hud--bottom"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: hasMoved ? 1 : 0 }}
          transition={{ duration: 1.2, delay: hasMoved ? 0.2 : 0, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="hud-line">
            <span className="hud-dot" /> archive open
          </span>
        </motion.footer>

        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onNavigate={setSelectedProject}
        />
        <SectionPanel
          sectionId={activeSection === "isler" ? null : activeSection}
          onClose={() => setActiveSection("isler")}
        />

        <IntroOverlay visible={!hasMoved} />
      </div>
    </MouseProvider>
  )
}
