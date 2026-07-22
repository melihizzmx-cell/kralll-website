import { motion } from "framer-motion"

// Hakkımda paneli, diğer bölümlerin generic body/list/timeline render'ını
// paylaşmıyor — editoryal bir düzen istendiği için kendi bileşeninde
// yaşıyor (bkz. SectionPanel.jsx, yalnızca sectionId==="hakkimda" iken bu
// bileşene devrediyor). İçerik src/data/sections.js -> sections.hakkimda
// üzerinden yönetiliyor, burada hiçbir metin hardcode edilmiyor.
//
// Hareket: eyebrow/başlık satırları/biyografi açılışta çok hafif stagger
// ile geliyor (staggerContainer + fadeUpItem). Timeline/prensipler/
// currently/CTA ise scroll'da whileInView ile düşük mesafeli fade-up
// yapıyor — kaydırma paneli kendi overflow-y:auto konteyneri olduğu için
// IntersectionObserver kökü olarak scrollRootRef'e bağlanıyor (aksi halde
// tarayıcı viewport'una göre tetiklenip modal içinde hep "görünür"
// sayılabilirdi). Bu dosyanın dışındaki hiçbir yer prefers-reduced-motion'ı
// framer-motion'a otomatik geçirmiyor (MotionConfig yok, her bileşen kendi
// window.matchMedia() kontrolünü yapıyor — bkz. ThemeEngine/FiberAmbience/
// SidebarLink), o yüzden burada da aynı desen: reduced motion'da hidden===
// show yapılarak translate/opacity geçişi tamamen kaldırılıyor, içerik
// doğrudan son konumunda beliriyor.

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

const staggerContainer = prefersReducedMotion
  ? { hidden: {}, show: {} }
  : {
      hidden: {},
      show: {
        transition: { staggerChildren: 0.09, delayChildren: 0.1 },
      },
    }

const fadeUpItem = prefersReducedMotion
  ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
  : {
      hidden: { opacity: 0, y: 10 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
      },
    }

const scrollFadeUp = prefersReducedMotion
  ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
  : {
      hidden: { opacity: 0, y: 16 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
      },
    }

export default function AboutPanelContent({ data, onOpenContact, scrollRootRef }) {
  const viewport = { once: true, amount: 0.4, root: scrollRootRef }

  return (
    <div className="about-panel">
      <div className="about-panel__top">
        <motion.div
          className="about-panel__intro-text"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.span variants={fadeUpItem} className="modal-eyebrow">
            {data.eyebrow}
          </motion.span>

          <motion.h2 variants={fadeUpItem} className="about-panel__title">
            {data.titleLines.map((line, i) => (
              <span className="about-panel__title-line" key={i}>
                {line.split(data.titleAccentWord).map((part, j, arr) => (
                  <span key={j}>
                    {part}
                    {j < arr.length - 1 && (
                      <span className="about-panel__title-accent">{data.titleAccentWord}</span>
                    )}
                  </span>
                ))}
              </span>
            ))}
          </motion.h2>

          <motion.div variants={fadeUpItem} className="about-panel__bio">
            {data.biography.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="about-panel__timeline"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={scrollFadeUp}
        >
          {data.timeline.map((item, i) => (
            <div className="about-panel__timeline-row" key={i}>
              <span className="about-panel__timeline-year">{item.year}</span>
              <span className="about-panel__timeline-text">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="about-panel__principles"
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        variants={scrollFadeUp}
      >
        <span className="about-panel__section-label">{data.principlesTitle}</span>
        <div className="about-panel__principle-list">
          {data.principles.map((p) => (
            <div className="about-panel__principle" key={p.index}>
              <span className="about-panel__principle-index">{p.index}</span>
              <span className="about-panel__principle-text">{p.text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="about-panel__currently"
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        variants={scrollFadeUp}
      >
        <span className="about-panel__section-label">{data.currentlyTitle}</span>
        <ul className="about-panel__currently-list">
          {data.currentlyExploring.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {data.statusLine && <p className="about-panel__status">{data.statusLine}</p>}
      </motion.div>

      <motion.div
        className="about-panel__cta"
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        variants={scrollFadeUp}
      >
        <p className="about-panel__cta-line">{data.closingCta.line1}</p>
        <button
          type="button"
          className="about-panel__cta-trigger"
          onClick={() => onOpenContact(data.closingCta.targetSection)}
        >
          {data.closingCta.line2}
        </button>
      </motion.div>
    </div>
  )
}
