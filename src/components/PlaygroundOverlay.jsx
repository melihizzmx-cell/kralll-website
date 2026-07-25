import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Pause, Play, X } from "lucide-react"
import { prefersReducedMotion } from "../lib/caseTransition"
import { playgroundItems } from "../data/playground"

const EASE = [0.16, 1, 0.3, 1]

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.25, ease: EASE } },
}

const frameVariants = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE, delay: 0.05 } },
  exit: { opacity: 0, y: 10, scale: 0.985, transition: { duration: 0.25, ease: EASE } },
}

const reducedFrameVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

// Ana sayfadaki avatar butonuyla (bkz. SurpriseMe.jsx) açılan, küçük ve
// kişisel bir "easter egg" çerçevesi — mevcut ProjectModal/case study
// sistemini kullanmaz, ayrı ve hafif bir bileşen. Şimdilik yalnızca
// playgroundItems[0]'ı (sesli "Little Melih" videosu) gösteriyor; ileride
// mini-game/canvas deneyleri eklemek için data yapısı hazır (bkz.
// data/playground.js), ama bir galeri/seçim arayüzü henüz yok.
//
// SES: overlay açılışı avatar tıklamasından (gerçek bir user gesture)
// geldiği için ilk play() denemesi burada yapılır — ama asla zorlanmaz.
// Tarayıcı reddederse (autoplay kısıtı) sessizce poster + görünür bir Play
// düğmesine düşülür. Video bitince/overlay kapanınca sese devam ettirmez,
// loop yapmaz — currentTime sıfırlanıp ilk kare/poster'a döner.
export default function PlaygroundOverlay({ open, onClose }) {
  const item = playgroundItems[0]
  const videoRef = useRef(null)
  const closeBtnRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mediaError, setMediaError] = useState(false)
  const reduced = prefersReducedMotion()

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    document.body.classList.add("modal-open")
    closeBtnRef.current?.focus()
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
      document.body.classList.remove("modal-open")
    }
  }, [open, onClose])

  useEffect(() => {
    const video = videoRef.current
    if (!open) {
      setIsPlaying(false)
      if (video) {
        video.pause()
        video.currentTime = 0
      }
      return
    }
    if (!video || mediaError) return
    const attempt = video.play()
    if (attempt?.then) {
      attempt.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
    // Yalnızca overlay açılış anında bir kez denenir — mediaError/video
    // ref'i dependency'ye eklemek gereksiz yeniden denemelere yol açar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!item) return null

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused || video.ended) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    const video = videoRef.current
    if (video) video.currentTime = 0
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="playground-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          variants={backdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="playground-frame"
            variants={reduced ? reducedFrameVariants : frameVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeBtnRef}
              type="button"
              className="playground-close"
              onClick={onClose}
              aria-label="Kapat"
            >
              <X size={16} strokeWidth={1.5} />
            </button>

            {item.tag && <span className="playground-tag">{item.tag}</span>}

            {!mediaError ? (
              <div className="playground-media">
                <video
                  ref={videoRef}
                  className="playground-media__video"
                  src={item.media}
                  poster={item.poster}
                  playsInline
                  preload="metadata"
                  aria-describedby="playground-media-desc"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={handleEnded}
                  onError={() => setMediaError(true)}
                />
                <button
                  type="button"
                  className="playground-play"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Duraklat" : "Oynat"}
                >
                  {isPlaying ? <Pause size={18} strokeWidth={1.5} /> : <Play size={18} strokeWidth={1.5} />}
                </button>
              </div>
            ) : (
              <div className="playground-media playground-media--fallback" aria-hidden="true">
                <span>Surprise me</span>
              </div>
            )}

            <p id="playground-media-desc" className="sr-only">
              Kısa, sesli bir "Little Melih" videosu.
            </p>

            <div className="playground-caption">
              <span className="playground-title">{item.title}</span>
              {item.caption && <span className="playground-subtitle">{item.caption}</span>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
