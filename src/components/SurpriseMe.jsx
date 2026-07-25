import { useState } from "react"

// Ana sayfanın alt-orta negatif alanında yaşayan küçük, kişisel bir
// easter egg — ARTIK rastgele proje AÇMIYOR (o davranış tamamen
// kaldırıldı, bkz. lib/discovery.js). Tıklanınca App.jsx'teki
// PlaygroundOverlay'i açan pixel-art bir avatar + kısa etiket. Gerçek bir
// <button>, klavye odağı görünür, "R" kısayolu App.jsx'te aynı onOpen
// callback'ini çağırır. buttonRef, overlay kapanınca odağın buraya geri
// dönmesi için App.jsx'e veriliyor.
//
// Avatar görseli henüz (public/media/ altında) mevcut değilse kırık
// görsel göstermek yerine sessizce küçük bir metinsel/işaretsel yer
// tutucuya düşer (bkz. avatarBroken).
export default function SurpriseMe({ onOpen, buttonRef }) {
  const [avatarBroken, setAvatarBroken] = useState(false)

  return (
    <button
      ref={buttonRef}
      type="button"
      className="surprise-me"
      onClick={onOpen}
      title="Playground'u aç (kısayol: R)"
      aria-label="Open Playground"
    >
      <span className="surprise-me__avatar" aria-hidden="true">
        {!avatarBroken ? (
          <img
            className="surprise-me__avatar-img"
            src="/media/surprise-me-baby-melih-poster.webp"
            alt=""
            loading="lazy"
            onError={() => setAvatarBroken(true)}
          />
        ) : (
          <span className="surprise-me__avatar-fallback">✦</span>
        )}
      </span>
      <span className="surprise-me__label">
        Surprise me <span className="surprise-me__arrow">↗</span>
      </span>
      <span className="surprise-me__meta">tiny Melih.exe</span>
    </button>
  )
}
