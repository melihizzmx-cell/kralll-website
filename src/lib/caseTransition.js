// Kategori bulutundan case study'ye geçişte kullanılan ortak, tekrar
// kullanılabilir açılış sistemi. Tüm projeler aynı geçişi paylaşır —
// proje bazlı özel animasyon kodu yazılmaz.

const EASE = [0.16, 1, 0.3, 1]

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

// Tıklanan proje adının sahnede kısa süre odakta kalma süresi (ms).
// Bu sürenin sonunda case study açılır.
export const FOCUS_HOLD_MS = 200

// Proje bulutundaki bir öğenin dış wrapper'ının (proximity/hover
// sisteminden bağımsız) odak/geri çekilme durumuna göre animasyon hedefi.
export function projectWrapperState({ revealed, focused, receding }) {
  if (!revealed) return { opacity: 0, filter: "blur(10px)", y: 18, scale: 1 }
  if (focused) return { opacity: 1, filter: "blur(0px)", y: 0, scale: 1.05 }
  if (receding) return { opacity: 0.32, filter: "blur(4px)", y: 0, scale: 0.97 }
  return { opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }
}

// focused/receding durumundayken hızlı, aksi halde çağıranın kendi
// staggered reveal transition'ı kullanılır (null döner).
export function wrapperTransition({ focused, receding }) {
  if (focused || receding) {
    return { duration: 0.2, ease: EASE }
  }
  return null
}

// Case study panelinin ortak açılış/kapanış koreografisi.
export const casePanelVariants = {
  initial: { opacity: 0, scale: 0.985, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE },
  },
  exit: {
    opacity: 0,
    scale: 0.99,
    filter: "blur(4px)",
    transition: { duration: 0.35, ease: EASE },
  },
}

export const reducedCasePanelVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

// Hero başlığın paneli az bir gecikmeyle takip ederek "içinden açılma"
// hissi vermesi için kullanılan ortak varyantlar.
export const heroTitleVariants = {
  initial: { opacity: 0, y: 10, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: EASE, delay: 0.15 },
  },
}

export const reducedHeroTitleVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
}

// Tıklanan proje adının bulutta bıraktığı altı çizili "iz" ile hero
// başlığı görsel olarak bağlayan ince, destekleyici çizgi. Renk mevcut
// --accent-r/g/b değişkeninden okunur (bkz. ThemeEngine) — sistemin
// kendisine dokunulmaz, yalnızca mevcut değeri tüketir.
export const heroGlowVariants = {
  initial: { scaleX: 0, opacity: 0 },
  animate: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: EASE, delay: 0.18 },
  },
}
