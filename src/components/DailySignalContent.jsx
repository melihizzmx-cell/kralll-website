import { useEffect, useMemo, useState } from "react"
import { prefersReducedMotion } from "../lib/caseTransition"
import { generateDailySignal, getLocalDateKey, scheduleAtNextLocalMidnight } from "../lib/dailySignal"
import { dailySignalContent } from "../data/dailySignal"
import { hexToRgb } from "../context/ThemeEngine"

const MOTION_VARIANTS = new Set(["drift", "pulse", "static", "vertical", "wave"])

function formatDisplayDate(dateStr) {
  const [y, m, d] = dateStr.split("-")
  return `${d}.${m}.${y}`
}

// Not Defteri'nin özel içeriği — hakkimda/iletisim gibi generic body/list
// render'ını atlayıp kendi yerleşimini kullanır (bkz. SectionPanel.jsx).
// Backend/CMS yok: günün sinyali src/lib/dailySignal.js + src/data/
// dailySignal.js üzerinden, kullanıcının yerel takvim gününden deterministik
// olarak üretilir. Günlük renk yalnızca bu bileşenin kendi --daily-rgb
// değişkeni üzerinden birkaç ince yüzeye uygulanır (eyebrow, signal no,
// ayırıcı, kelime, küçük glow) — panelin geneli veya ThemeEngine'in global
// accent'i bundan etkilenmez.
export default function DailySignalContent() {
  const [dateKey, setDateKey] = useState(() => getLocalDateKey())
  const reduced = prefersReducedMotion()

  useEffect(() => {
    // Sürekli bir interval yerine bir sonraki yerel gece yarısına tek
    // seferlik bir zamanlayıcı kurulur; ateşlendiğinde dateKey güncellenir,
    // bu da bu effect'i yeniden çalıştırıp bir sonraki gece yarısı için
    // kendini otomatik olarak yeniden kurar.
    const cancel = scheduleAtNextLocalMidnight(() => setDateKey(getLocalDateKey()))
    return cancel
  }, [dateKey])

  const signal = useMemo(() => generateDailySignal(dateKey, dailySignalContent), [dateKey])

  const [dr, dg, db] = signal.color ? hexToRgb(signal.color) : []
  const daily = signal.color ? { "--daily-rgb": `${dr}, ${dg}, ${db}` } : {}

  const motionVariant = MOTION_VARIANTS.has(signal.motionVariant) ? signal.motionVariant : "static"
  const motionClass = reduced ? "" : `daily-signal--motion-${motionVariant}`

  const rare = signal.rareEvent
  const [rareMediaError, setRareMediaError] = useState(false)

  return (
    <div className={`daily-signal ${motionClass}`} style={daily}>
      <span className="modal-eyebrow daily-signal__date">{formatDisplayDate(signal.date)}</span>
      <span className="daily-signal__number">DAILY SIGNAL №{signal.signalNumber}</span>

      <div className="daily-signal__divider" aria-hidden="true" />

      {rare ? (
        <div className="daily-signal__rare">
          <h2 className="modal-title modal-title--sm daily-signal__word daily-signal__word--rare">
            {rare.label}
          </h2>
          {rare.media && !rareMediaError && (
            <div className="daily-signal__rare-media">
              <img
                src={rare.poster}
                alt=""
                aria-hidden="true"
                onError={() => setRareMediaError(true)}
              />
            </div>
          )}
        </div>
      ) : (
        <>
          {signal.word && (
            <h2 className="modal-title modal-title--sm daily-signal__word">{signal.word}</h2>
          )}

          {signal.shortLine && (
            <div className="daily-signal__frequency">
              <span className="daily-signal__frequency-label">Today's frequency:</span>
              <p className="daily-signal__line">{signal.shortLine}</p>
            </div>
          )}

          {signal.song && (
            <p className="daily-signal__song">
              <span className="daily-signal__song-title">{signal.song.title}</span>
              {signal.song.artist && <span className="daily-signal__song-artist"> — {signal.song.artist}</span>}
            </p>
          )}

          {signal.image && (
            <img className="daily-signal__image" src={signal.image} alt="" loading="lazy" />
          )}
        </>
      )}

      <p className="daily-signal__caption">Generated daily from Melih's personal archive.</p>
    </div>
  )
}
