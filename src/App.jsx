import { useEffect, useState } from "react"
import { MouseProvider } from "./context/MouseContext"
import CursorGlow from "./components/CursorGlow"
import Sidebar from "./components/Sidebar"
import ProjectCloud from "./components/ProjectCloud"
import ProjectModal from "./components/ProjectModal"
import SectionPanel from "./components/SectionPanel"

function useClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return now
}

function formatTime(date) {
  return date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
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
  const now = useClock()

  const handleSelectSection = (id) => {
    setActiveSection(id)
  }

  return (
    <MouseProvider>
      <div className="app">
        <div className="bg-vignette" aria-hidden="true" />
        <div className="bg-grid" aria-hidden="true" />
        <div className="bg-grid bg-grid--focus" aria-hidden="true" />
        <div className="bg-noise" aria-hidden="true" />
        <div className="bg-scanline" aria-hidden="true" />

        <CursorGlow />

        <Sidebar activeSection={activeSection} onSelectSection={handleSelectSection} />

        <main className="stage">
          <ProjectCloud onSelectProject={setSelectedProject} />
        </main>

        <header className="hud hud--top" aria-hidden="true">
          <span className="hud-time">{formatTime(now)}</span>
          <span className="hud-date">{formatDate(now)}</span>
        </header>

        <footer className="hud hud--bottom" aria-hidden="true">
          <span className="hud-line">
            <span className="hud-dot" /> system online
          </span>
          <span className="hud-line hud-line--dim">focus mode active</span>
        </footer>

        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        <SectionPanel
          sectionId={activeSection === "isler" ? null : activeSection}
          onClose={() => setActiveSection("isler")}
        />
      </div>
    </MouseProvider>
  )
}
