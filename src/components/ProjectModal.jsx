import { useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useCaseVideoAutoplay } from "../lib/useCaseVideoAutoplay"
import { ArrowRight, X } from "lucide-react"
import { projects } from "../data/projects"
import EdgeGlow from "./EdgeGlow"
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
    <>
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

      <EdgeGlow
        fullscreen
        accentColor={project?.accentColor}
        radius={0}
        active={!!project}
        triggerKey={project?.id}
      />
    </>
  )
}

// Kategori bulutunda odaklanan proje adıyla hero başlığını görsel olarak
// bağlayan ortak bileşen. Tüm case study türleri aynısını kullanır.
// campaignTitle varsa (örn. gerçek bir kampanya adı) title yerine onu
// gösterir; yoksa mevcut davranış (project.title) hiç değişmez.
function HeroTitle({ project, font, reduced }) {
  return (
    <motion.h2
      className="study-title"
      style={font}
      variants={reduced ? reducedHeroTitleVariants : heroTitleVariants}
      initial="initial"
      animate="animate"
    >
      {project.campaignTitle ?? project.title}
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

// Full ve Compact case study'nin paylaştığı masthead — marka, başlık,
// alt satır ve meta. İkisi arasında birebir aynıydı, tekrarı kaldırmak
// için ortak bileşene taşındı.
function CaseHeader({ project, font, reduced }) {
  return (
    <div className="study-header">
      <span className="case-eyebrow">{project.brand}</span>
      <HeroTitle project={project} font={font} reduced={reduced} />
      {project.subtitle && <p className="case-subtitle">{project.subtitle}</p>}
      <div className="case-meta">
        <span>{project.year}</span>
        <span className="case-meta-dot">·</span>
        <span>{project.role}</span>
      </div>
    </div>
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

function CaseVideo({ src, poster }) {
  const videoRef = useCaseVideoAutoplay()
  return (
    <div className="study-video">
      <video
        ref={videoRef}
        className="study-video__el"
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        controls
        preload="none"
      />
    </div>
  )
}

function FullCaseStudy({ project, font, nextProject, onNavigate, reduced }) {
  const { media } = project

  return (
    <>
      <div className="study-hero study-hero--media">
        <picture>
          <source media="(max-width: 720px)" srcSet={media.heroMobile} />
          <img
            className="study-hero__image"
            src={media.heroDesktop}
            alt={`${project.campaignTitle ?? project.title} — kampanya anahtar görseli`}
            loading="eager"
          />
        </picture>
      </div>

      <CaseHeader project={project} font={font} reduced={reduced} />

      {/* 2. Campaign in One Sentence + My Role */}
      <div className="study-body">
        <div className="case-section case-section--flush">
          <span className="case-section__label" lang="en">
            The Campaign
          </span>
          <p className="case-section__text">{project.campaignSummary}</p>
        </div>

        <div className="case-section">
          <span className="case-section__label" lang="en">
            My Role
          </span>
          <p className="case-section__text">{project.myRole}</p>
        </div>

        {/* 3. Challenge & Insight */}
        <div className="case-section">
          <span className="case-section__label" lang="en">
            Challenge
          </span>
          <p className="case-section__text">{project.challenge}</p>
        </div>

        <div className="case-section">
          <span className="case-section__label" lang="en">
            Insight
          </span>
          <p className="case-section__text">{project.insight}</p>
        </div>
      </div>

      {/* 4. Big Idea */}
      <div className="study-body study-body--wide study-body--bigidea">
        <div className="case-section case-section--center case-section--flush">
          <span className="case-section__label" lang="en">
            Big Idea
          </span>
          <p className="case-statement">
            <span className="case-statement__line">{project.bigIdeaStatement}</span>
            <span className="case-statement__line case-statement__line--tagline">
              {project.bigIdeaTagline}
            </span>
          </p>
        </div>
      </div>

      {/* 5. Characters & Art Direction */}
      <div className="study-body">
        <div className="case-section case-section--flush">
          <span className="case-section__label" lang="en">
            Characters &amp; Art Direction
          </span>
          {project.charactersText.map((paragraph, i) => (
            <p className="case-section__text" key={i}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="study-outputs">
        <div className="study-outputs__grid">
          {media.art.map((src) => (
            <div className="study-output" key={src}>
              <img
                src={src}
                alt="TurkNet luchador karakter ve art direction detayı"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 6. Campaign Visuals & Messages */}
      <div className="study-outputs">
        <span className="study-outputs__label" lang="en">
          Campaign Visuals
        </span>
        <div className="study-outputs__grid">
          {media.campaignVisuals.map((src) => (
            <div className="study-output" key={src}>
              <img src={src} alt="TurkNet kampanya anahtar görseli" loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      <div className="study-body study-body--wide study-body--messages">
        <div className="case-section case-section--flush">
          <span className="case-section__label" lang="en">
            Messages
          </span>
          <ol className="case-messages">
            {project.campaignMessages.map((message, i) => (
              <li className="case-messages__item" key={message}>
                <span className="case-messages__index">0{i + 1}</span>
                {message}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* 7. Film / Motion */}
      <div className="study-outputs">
        <span className="study-outputs__label" lang="en">
          Film / Motion
        </span>
        <CaseVideo src={media.film} poster={media.filmPoster} />
      </div>

      {/* 8. Extensions + Process */}
      <div className="study-body study-body--wide">
        <div className="case-section case-section--flush study-copy">
          <span className="case-section__label" lang="en">
            AI in the Process
          </span>
          <p className="case-section__text">{project.aiProcess}</p>
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

      <CaseHeader project={project} font={font} reduced={reduced} />

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
