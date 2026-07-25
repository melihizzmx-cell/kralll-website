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
