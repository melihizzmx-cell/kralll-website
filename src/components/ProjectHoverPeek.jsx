import { AnimatePresence, motion } from "framer-motion"
import { prefersReducedMotion } from "../lib/caseTransition"
import { hexToRgb } from "../context/ThemeEngine"

const EASE = [0.16, 1, 0.3, 1]

const variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, y: 6, transition: { duration: 0.3, ease: EASE } },
}

const reducedVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
}

// Selected Works'te bir proje adına ~400ms niyet gecikmesiyle giren
// hover/klavye odağı bu küçük önizlemeyi tetikler (bkz. ProjectCloud).
// Sabit, bağlama göre seçilen bir "güvenli alan"da belirir (zone prop'u) —
// hover edilen öğenin kendi konumunu asla takip etmez, imlecin veya diğer
// arayüz elemanlarının üzerine binmez. pointer-events: none — hiçbir
// tıklamayı yakalamaz, altındaki gerçek proje linki her zaman tıklanabilir
// kalır. Yalnızca gerçek proje datasını gösterir; eksik alan (year/role/
// subtitle) varsa o satır hiç render edilmez.
export default function ProjectHoverPeek({ project, zone }) {
  const reduced = prefersReducedMotion()
  const activeVariants = reduced ? reducedVariants : variants

  const facts = project
    ? [project.subtitle, project.role, project.year].filter(Boolean)
    : []
  const [ar, ag, ab] = project?.accentColor ? hexToRgb(project.accentColor) : [155, 77, 255]

  return (
    <AnimatePresence mode="wait">
      {project && (
        <motion.div
          key={project.id}
          className={`project-peek project-peek--${zone}`}
          style={{ "--peek-accent-rgb": `${ar}, ${ag}, ${ab}` }}
          variants={activeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          aria-hidden="true"
        >
          {project.media?.heroDesktop && (
            <div className="project-peek__media">
              <img src={project.media.heroDesktop} alt="" loading="lazy" decoding="async" />
            </div>
          )}

          <div className="project-peek__meta">
            <span className="project-peek__title">{project.campaignTitle ?? project.title}</span>
            {facts.length > 0 && (
              <span className="project-peek__facts">{facts.join(" · ")}</span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
