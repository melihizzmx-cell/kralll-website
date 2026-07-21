import { useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, X } from "lucide-react"
import { projects } from "../data/projects"
import {
  casePanelVariants,
  reducedCasePanelVariants,
  heroTitleVariants,
  reducedHeroTitleVariants,
  heroGlowVariants,
  prefersReducedMotion,
  ACCENT_RELEASE_DELAY_MS,
} from "../lib/caseTransition"
import { setThemeAccentOverride } from "../context/ThemeEngine"

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

  // Case study açıkken (veya "Sıradaki Proje" ile geçişte) o projenin
  // accentColor'ı ThemeEngine'de kilitli kalır. Kapandığında bağlamı kısa
  // süre korur, ardından imleç konumuna göre normal analog davranışa
  // (ProjectCloud üzerindeki proximity) geri bırakır.
  useEffect(() => {
    if (project?.accentColor) {
      setThemeAccentOverride(project.accentColor)
      return
    }
    const releaseTimer = window.setTimeout(() => {
      setThemeAccentOverride(null)
    }, ACCENT_RELEASE_DELAY_MS)
    return () => window.clearTimeout(releaseTimer)
  }, [project])

  const currentIndex = project ? projects.findIndex((p) => p.id === project.id) : -1
  const nextProject = currentIndex === -1 ? null : projects[(currentIndex + 1) % projects.length]
  const reduced = prefersReducedMotion()

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
            variants={reduced ? reducedCasePanelVariants : casePanelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {project.caseStudy ? (
              <FullCaseStudy
                project={project}
                font={titleFont[project.style] ?? titleFont.hand}
                nextProject={nextProject}
                onNavigate={onNavigate}
                reduced={reduced}
              />
            ) : (
              <CompactCaseStudy
                project={project}
                font={titleFont[project.style] ?? titleFont.hand}
                reduced={reduced}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Kategori bulutunda odaklanan proje adıyla hero başlığını görsel olarak
// bağlayan ortak bileşen. Tüm case study türleri aynısını kullanır.
function HeroTitle({ project, font, reduced }) {
  return (
    <motion.h2
      className="study-title"
      style={font}
      variants={reduced ? reducedHeroTitleVariants : heroTitleVariants}
      initial="initial"
      animate="animate"
    >
      {project.title}
      {!reduced && (
        <motion.span
          className="study-title__glow"
          aria-hidden="true"
          variants={heroGlowVariants}
          initial="initial"
          animate="animate"
        />
      )}
    </motion.h2>
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

function FullCaseStudy({ project, font, nextProject, onNavigate, reduced }) {
  return (
    <>
      <div className="study-hero">
        <ContentNeeded label="Hero Görsel / Video" />
      </div>

      <div className="study-header">
        <span className="case-eyebrow">{project.brand}</span>
        <HeroTitle project={project} font={font} reduced={reduced} />
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

function CompactCaseStudy({ project, font, reduced }) {
  return (
    <>
      <div className="study-hero">
        <ContentNeeded label="Görsel / Video Alanı" />
      </div>

      <div className="study-header">
        <span className="case-eyebrow">{project.brand}</span>
        <HeroTitle project={project} font={font} reduced={reduced} />
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
