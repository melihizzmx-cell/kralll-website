// Ana sayfanın alt-orta negatif alanında yaşayan küçük bir keşif
// etkileşimi — ana kahraman değil, sakin bir davet. Gerçek bir <button>:
// klavye odağı görünür, "R" kısayolu App.jsx'te aynı onSurprise callback'i
// çağırır (bkz. handleSurprise + title/aria-label burada tek elden).
export default function SurpriseMe({ onSurprise }) {
  return (
    <button
      type="button"
      className="surprise-me"
      onClick={onSurprise}
      title="Rastgele bir proje aç (kısayol: R)"
      aria-label="Rastgele bir proje aç"
    >
      Surprise me <span className="surprise-me__arrow" aria-hidden="true">↗</span>
    </button>
  )
}
