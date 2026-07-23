import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { chapterNavVariants, reducedChapterNavVariants } from "../lib/caseTransition"

// Mevcut bölüm isimleri korunuyor (bkz. görev metni) — sıra, kullanıcının
// verdiği örnek sırayla birebir aynı. Gerçek içerik akışı (Overview →
// Idea → Visual World → Activation → Film → Credits) buradan biraz farklı
// olsa da, içerik yapısını değiştirmemek için sayfadaki DOM sırası hiç
// dokunulmadı — nav yalnızca her bölümün id'sine referans veriyor.
const CHAPTERS = [
  { id: "overview", label: "Overview" },
  { id: "idea", label: "Idea" },
  { id: "film", label: "Film" },
  { id: "visual-world", label: "Visual World" },
  { id: "activation", label: "Activation" },
  { id: "credits", label: "Credits" },
]

// FullCaseStudy'nin üstünde sticky duran bölüm navigasyonu. Aktif bölüm
// ve "yapışma" (sticky-shadow) durumu, sayfanın kendi scroll konteynerini
// (.case-backdrop, ProjectModal'dan scrollRootRef ile geliyor) kök alan
// iki ayrı IntersectionObserver ile izleniyor — hiçbir scroll event'inde
// React state güncellenmiyor, yalnızca eşik geçildiğinde.
export default function CaseChapterNav({ scrollRootRef, reduced }) {
  const [active, setActive] = useState(CHAPTERS[0].id)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef(null)
  const sentinelRef = useRef(null)
  const itemRefs = useRef({})
  const underlineRef = useRef(null)
  // Sayfanın en altına ulaşılıp ulaşılmadığını iki bağımsız observer
  // arasında paylaşmak için — aşağıdaki ana içerik observer'ı, en alt
  // sentinel'i görünürken kendi kararını uygulamıyor (bkz. iki efekt
  // arasındaki yorum).
  const atBottomRef = useRef(false)
  // Bir sekmeye tıklandığında hedefe smooth scroll başlar; tıklanan sekme
  // hemen aktif gösterilir (optimistic update) ve kayma bitene kadar ana
  // gözlemci bunu ezmez — hedefin tam sınırında (ör. iki bölüm bitişikken)
  // gözlemcinin komşu bölümü aktif okuyabildiği kısa belirsizlik penceresini
  // kapatıyor. Süre dolunca normal scroll takibi kaldığı yerden devam eder.
  const clickOverrideRef = useRef(false)
  const clickTimeoutRef = useRef(null)

  // Aktif bölüm: nav'ın kendi yüksekliği kadar üstten kesen ve alttan
  // geniş bir pay bırakan rootMargin ile yalnızca "nav'ın hemen altındaki"
  // dar şerit aktif kabul ediliyor; o an içinde en üstteki bölüm kazanıyor.
  // Credits kısa ve sayfanın en altına yakın olduğu için bu dar şeride
  // hiç girmeden sayfanın sonuna ulaşılabiliyor — bu yüzden en alttaki
  // sentinel görünürken (atBottomRef.current) bu observer'ın kararı
  // görmezden geliniyor, alttaki ikinci observer son bölümü zorla aktif
  // işaretliyor. İki bağımsız IntersectionObserver'ın hangisinin son
  // ateşleneceği garanti olmadığından, öncelik burada açıkça kodlanmış.
  useEffect(() => {
    const root = scrollRootRef.current
    if (!root) return

    const navHeight = navRef.current?.offsetHeight ?? 56
    const targets = CHAPTERS.map((c) => document.getElementById(c.id)).filter(Boolean)
    if (!targets.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (atBottomRef.current || clickOverrideRef.current) return
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        const id = visible[0].target.id
        setActive((prev) => (prev === id ? prev : id))
      },
      { root, rootMargin: `-${navHeight + 4}px 0px -65% 0px`, threshold: 0 }
    )

    targets.forEach((t) => observer.observe(t))
    return () => observer.disconnect()
  }, [scrollRootRef])

  // Sayfanın en altındaki sentinel görünür olduğunda son bölümü (Credits)
  // zorla aktif işaretliyoruz; kullanıcı geri yukarı kayınca atBottomRef
  // false'a döner ve yukarıdaki ana observer tekrar söz sahibi olur.
  useEffect(() => {
    const root = scrollRootRef.current
    const endSentinel = document.getElementById("case-chapter-nav-end")
    if (!root || !endSentinel) return
    const lastId = CHAPTERS[CHAPTERS.length - 1].id
    const observer = new IntersectionObserver(
      ([entry]) => {
        atBottomRef.current = entry.isIntersecting
        if (entry.isIntersecting) setActive(lastId)
      },
      { root, threshold: 0 }
    )
    observer.observe(endSentinel)
    return () => observer.disconnect()
  }, [scrollRootRef])

  // Sticky-shadow: nav'ın hemen üstündeki 1px'lik sentinel görünümden
  // çıktığı an nav "yapışmış" (sticky top:0'a oturmuş) demektir. Sentinel
  // "görünmüyor" iki farklı sebepten olabilir: henüz o noktaya
  // ulaşılmadı (ilk yüklemede sentinel hâlâ viewport'un altında, hero
  // görseli yüzünden) ya da kullanıcı onu geçti (sentinel viewport'un
  // üstünden çıktı, nav sticky'e yapıştı). Yalnızca ikincisinde gölgeyi
  // göster — bottom kenarı kökün üst kenarının üzerine çıktıysa.
  useEffect(() => {
    const root = scrollRootRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setScrolled(false)
          return
        }
        const rootTop = entry.rootBounds ? entry.rootBounds.top : 0
        setScrolled(entry.boundingClientRect.bottom < rootTop)
      },
      { root, threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [scrollRootRef])

  // Aktif underline'ın bir sekmeden diğerine yumuşak kayması: framer-
  // motion'ın layoutId/FLIP mekanizması yerine kasıtlı olarak düz bir
  // CSS transition kullanılıyor. Hızlı art arda scroll sırasında (birden
  // fazla bölüm kısa sürede aktif olabiliyor) framer-motion'ın paylaşılan
  // layout animasyon kuyruğu tıkanıp panelin kendi AnimatePresence exit
  // animasyonuyla çakışabiliyordu (case study kapanışının donup kalması,
  // bkz. commit mesajı) — tek bir underline elemanının left/width'ini
  // doğrudan güncelleyip geçişi CSS'e bırakmak bunu tamamen ortadan
  // kaldırıyor, GPU-composited ve framer-motion'ın global animasyon
  // zamanlayıcısından bağımsız.
  useEffect(() => {
    const btn = itemRefs.current[active]
    const underline = underlineRef.current
    if (!btn || !underline) return
    underline.style.left = `${btn.offsetLeft}px`
    underline.style.width = `${btn.offsetWidth}px`
  }, [active])

  // Mobilde aktif sekme kendi yatay scroll konteynerinde görünür kalsın —
  // yalnızca nav'ın kendi scrollLeft'i değişiyor, sayfa scroll'u etkilenmez.
  useEffect(() => {
    const nav = navRef.current
    const btn = itemRefs.current[active]
    if (!nav || !btn) return
    const btnLeft = btn.offsetLeft
    const btnRight = btnLeft + btn.offsetWidth
    const viewLeft = nav.scrollLeft
    const viewRight = viewLeft + nav.clientWidth
    if (btnLeft < viewLeft) {
      nav.scrollTo({ left: Math.max(0, btnLeft - 24), behavior: reduced ? "auto" : "smooth" })
    } else if (btnRight > viewRight) {
      nav.scrollTo({ left: btnRight - nav.clientWidth + 24, behavior: reduced ? "auto" : "smooth" })
    }
  }, [active, reduced])

  useEffect(() => () => window.clearTimeout(clickTimeoutRef.current), [])

  const handleClick = (id) => {
    const root = scrollRootRef.current
    const target = document.getElementById(id)
    if (!root || !target) return

    setActive(id)
    clickOverrideRef.current = true
    window.clearTimeout(clickTimeoutRef.current)
    clickTimeoutRef.current = window.setTimeout(() => {
      clickOverrideRef.current = false
    }, 900)

    const navHeight = navRef.current?.offsetHeight ?? 0
    const rootRect = root.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const offset = targetRect.top - rootRect.top + root.scrollTop - navHeight - 16
    root.scrollTo({ top: Math.max(0, offset), behavior: reduced ? "auto" : "smooth" })
  }

  return (
    <>
      <div ref={sentinelRef} className="case-chapter-nav__sentinel" aria-hidden="true" />
      <motion.nav
        ref={navRef}
        className={`case-chapter-nav ${scrolled ? "case-chapter-nav--scrolled" : ""}`}
        aria-label="Bölümler"
        variants={reduced ? reducedChapterNavVariants : chapterNavVariants}
        initial="initial"
        animate="animate"
      >
        <span
          ref={underlineRef}
          aria-hidden="true"
          className={`case-chapter-nav__underline ${
            reduced ? "case-chapter-nav__underline--instant" : ""
          }`}
        />
        {CHAPTERS.map((c) => (
          <button
            key={c.id}
            ref={(el) => {
              itemRefs.current[c.id] = el
            }}
            type="button"
            className={`case-chapter-nav__item ${
              active === c.id ? "case-chapter-nav__item--active" : ""
            }`}
            onClick={() => handleClick(c.id)}
          >
            {c.label}
          </button>
        ))}
      </motion.nav>
    </>
  )
}
