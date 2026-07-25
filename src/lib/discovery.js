// Project Hover Peek'in belirdiği üç sabit "güvenli alan" — imlecin veya
// hover edilen öğenin konumunu asla takip etmez. Hangi bölgenin
// kullanılacağı, hover edilen projenin data'daki x/y yüzdesine (bkz.
// projects.js) göre EN UZAK olan bölge seçilerek belirlenir — böylece peek
// hiçbir zaman kendi tetikleyicisi olan proje adının üstüne binmez. Yalnızca
// aktif proje değiştiğinde hesaplanır (bkz. ProjectCloud) — per-frame ölçüm
// yok.
const PEEK_ZONES = [
  { id: "top-right", ax: 92, ay: 8 },
  { id: "mid-right", ax: 92, ay: 50 },
  { id: "bottom-left", ax: 10, ay: 92 },
]

export function pickPeekZone(project) {
  let best = PEEK_ZONES[0]
  let bestDist = -1
  for (const zone of PEEK_ZONES) {
    const dist = Math.hypot(project.x - zone.ax, project.y - zone.ay)
    if (dist > bestDist) {
      bestDist = dist
      best = zone
    }
  }
  return best.id
}

// "Surprise Me" için paylaşılan rastgele proje seçim mantığı — hem
// klavye kısayolu (App.jsx, "R") hem de SurpriseMe butonu aynı fonksiyonu
// kullanır. Son gösterilen proje id'si sessionStorage'da tutulur, böylece
// aynı proje art arda iki kez seçilmez (sekme kapanıp yeniden açıldığında
// sıfırlanır — kalıcı bir tercih değil, yalnızca "bir öncekini tekrar
// gösterme" hafızası).

const LAST_SURPRISE_KEY = "kralll:last-surprise"

function getLastSurpriseId() {
  if (typeof window === "undefined") return null
  try {
    return window.sessionStorage.getItem(LAST_SURPRISE_KEY)
  } catch {
    return null
  }
}

function setLastSurpriseId(id) {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(LAST_SURPRISE_KEY, id)
  } catch {
    // sessionStorage kullanılamıyorsa (gizli sekme vb.) sessizce yok say —
    // tekrar-önleme devre dışı kalır ama özellik çalışmaya devam eder.
  }
}

// disabled/draft gibi bir bayrak taşıyan projeler (şu an data'da yok,
// ileride eklenirse) rastgele havuza hiç girmez.
export function pickRandomProject(projects) {
  const eligible = projects.filter((p) => !p.disabled && !p.draft)
  if (eligible.length === 0) return null
  if (eligible.length === 1) return eligible[0]

  const lastId = getLastSurpriseId()
  const pool = eligible.filter((p) => p.id !== lastId)
  const candidates = pool.length > 0 ? pool : eligible

  const chosen = candidates[Math.floor(Math.random() * candidates.length)]
  setLastSurpriseId(chosen.id)
  return chosen
}
