import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { MouseProvider } from "./context/MouseContext"
import ThemeEngine from "./context/ThemeEngine"
import CursorGlow from "./components/CursorGlow"
import FiberAmbience from "./components/FiberAmbience"
import Sidebar from "./components/Sidebar"
import CategoryCloud from "./components/CategoryCloud"
import ProjectCloud from "./components/ProjectCloud"
import ProjectModal from "./components/ProjectModal"
import SectionPanel from "./components/SectionPanel"
import IntroOverlay from "./components/IntroOverlay"
import SurpriseMe from "./components/SurpriseMe"
import { projects } from "./data/projects"
import { pickRandomProject } from "./lib/discovery"

const HINT_STORAGE_KEY = "kralll:hint-seen"
const HINT_DELAY_MS = 10000
const HINT_HOLD_MS = 3850

// "R — surprise me" ipucu, yalnızca yukarıdaki fısıltı tamamen kaybolduktan
// sonra ve oturum başına yalnızca bir kez belirir (bkz. SURPRISE_HINT_KEY,
// sessionStorage — mevcut HINT_STORAGE_KEY'in localStorage/kalıcı
// davranışından bilinçli olarak farklı). Sabit gecikme, iki mesajın asla
// aynı anda görünmemesini garanti eder: HINT_DELAY_MS + HINT_HOLD_MS
// (13850ms) her koşulda geçmiş oluyor.
const SURPRISE_HINT_STORAGE_KEY = "kralll:surprise-hint-seen"
const SURPRISE_HINT_DELAY_MS = 15200
const SURPRISE_HINT_HOLD_MS = 3200

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

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
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
  const [homeView, setHomeView] = useState("categories") // "categories" | "works"
  const [hasMoved, setHasMoved] = useState(false)
  const [hintVisible, setHintVisible] = useState(false)
  const [surpriseHintVisible, setSurpriseHintVisible] = useState(false)
  const hintTimers = useRef([])
  const surpriseHintTimers = useRef([])
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

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.localStorage.getItem(HINT_STORAGE_KEY)) return

    const showTimer = setTimeout(() => {
      setHintVisible(true)
      window.localStorage.setItem(HINT_STORAGE_KEY, "1")
      const hideTimer = setTimeout(() => setHintVisible(false), HINT_HOLD_MS)
      hintTimers.current.push(hideTimer)
    }, HINT_DELAY_MS)
    hintTimers.current.push(showTimer)

    return () => {
      hintTimers.current.forEach(clearTimeout)
      hintTimers.current = []
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.sessionStorage.getItem(SURPRISE_HINT_STORAGE_KEY)) return

    const showTimer = setTimeout(() => {
      setSurpriseHintVisible(true)
      window.sessionStorage.setItem(SURPRISE_HINT_STORAGE_KEY, "1")
      const hideTimer = setTimeout(() => setSurpriseHintVisible(false), SURPRISE_HINT_HOLD_MS)
      surpriseHintTimers.current.push(hideTimer)
    }, SURPRISE_HINT_DELAY_MS)
    surpriseHintTimers.current.push(showTimer)

    return () => {
      surpriseHintTimers.current.forEach(clearTimeout)
      surpriseHintTimers.current = []
    }
  }, [])

  const handleSurprise = () => {
    // ProjectModal veya SectionPanel açıkken (klavye kısayolu için asıl
    // koruma; buton zaten bunlar açıkken backdrop'un altında kalıp
    // tıklanamaz hâle geliyor) sessizce yok say.
    if (selectedProject || activeSection !== "isler") return
    const project = pickRandomProject(projects)
    if (project) setSelectedProject(project)
  }

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key.toLowerCase() !== "r") return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target
      const tag = target?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return
      if (selectedProject || activeSection !== "isler") return
      e.preventDefault()
      handleSurprise()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [selectedProject, activeSection])

  const handleSelectSection = (id) => {
    setActiveSection(id)
    if (id === "isler") setHomeView("categories")
  }

  const handleSelectCategory = (category) => {
    if (category.id === "selected-works") {
      setHomeView("works")
    } else if (category.id === "about") {
      setActiveSection("hakkimda")
    } else if (category.id === "ai-lab") {
      setActiveSection("ai-arsiv")
    } else {
      // Motion / Image Direction / Playground: henüz gerçek içerikleri
      // yok, mevcut SectionPanel üzerinden "Still taking shape." durumu
      // gösteriliyor (bkz. src/data/sections.js).
      setActiveSection(category.id)
    }
  }

  return (
    <MouseProvider>
      <ThemeEngine />
      <div className="app">
        <div className="bg-vignette" aria-hidden="true" />
        <FiberAmbience paused={!!selectedProject || activeSection !== "isler"} />
        <div className="bg-grid" aria-hidden="true" />
        <div className="bg-noise" aria-hidden="true" />

        <CursorGlow />

        <Sidebar
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
          revealed={hasMoved}
        />

        <main className="stage">
          <h1 className="sr-only">
            Melih Şentürk — Art Director & AI Creative, kişisel fikir evreni
          </h1>

          {homeView === "works" && (
            <button
              type="button"
              className="home-back"
              onClick={() => setHomeView("categories")}
            >
              ← Kategoriler
            </button>
          )}

          {homeView === "categories" ? (
            <CategoryCloud onSelectCategory={handleSelectCategory} revealed={hasMoved} />
          ) : (
            <ProjectCloud onSelectProject={setSelectedProject} revealed={hasMoved} />
          )}
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
          <span className="identity">
            <span className="identity-name">Melih Şentürk</span>
            <span className="identity-role">Art Director &amp; AI Creative</span>
          </span>
          <span className="hud-line">
            <span className="hud-dot" /> archive open
          </span>
        </motion.footer>

        <motion.p
          className="editorial-hint"
          aria-hidden="true"
          initial={false}
          animate={{ opacity: hintVisible ? 1 : 0 }}
          transition={{
            duration: prefersReducedMotion() ? 0 : hintVisible ? 0.85 : 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          Good work takes curiosity.
        </motion.p>

        <motion.p
          className="discovery-hint"
          aria-hidden="true"
          initial={false}
          animate={{ opacity: surpriseHintVisible ? 1 : 0 }}
          transition={{
            duration: prefersReducedMotion() ? 0 : surpriseHintVisible ? 0.85 : 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          R — surprise me
        </motion.p>

        <motion.div
          className="discovery-layer"
          initial={{ opacity: 0 }}
          animate={{ opacity: hasMoved ? 1 : 0 }}
          transition={{ duration: 1.2, delay: hasMoved ? 0.2 : 0, ease: [0.16, 1, 0.3, 1] }}
        >
          <SurpriseMe onSurprise={handleSurprise} />
        </motion.div>

        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onNavigate={setSelectedProject}
        />
        <SectionPanel
          sectionId={activeSection === "isler" ? null : activeSection}
          onClose={() => setActiveSection("isler")}
          onNavigate={setActiveSection}
        />

        <IntroOverlay visible={!hasMoved} />
      </div>
    </MouseProvider>
  )
}
