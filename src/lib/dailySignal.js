// Not Defteri'nin "Daily Signal" motoru. Backend, CMS veya günlük manuel
// commit gerektirmez: kullanıcının yerel takvim gününden (YYYY-MM-DD)
// deterministik bir sayısal seed türetilir, bu seed sabit bir sıradaki
// içerik havuzu seçimlerini besler. Aynı gün + aynı havuzlar → her zaman
// aynı sonuç (bkz. generateDailySignal). Math.random() hiçbir yerde
// kullanılmaz.

// DJB2 tabanlı basit string hash — tarih string'ini 32-bit işaretsiz bir
// tam sayı seed'e çevirir.
function hashStringToSeed(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return hash >>> 0
}

// mulberry32: küçük, bağımlılıksız, deterministik seeded PRNG. Aynı seed
// her zaman aynı çağrı sırasını üretir; bu yüzden alanlar (color, word,
// shortLine, ...) sabit bir sırada art arda çekilerek birbirleriyle
// çakışmadan (aynı indekse düşmeden) bağımsız sonuçlar üretir.
function mulberry32(seed) {
  let a = seed
  return function rng() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickFrom(rng, list) {
  if (!Array.isArray(list) || list.length === 0) return undefined
  const index = Math.min(Math.floor(rng() * list.length), list.length - 1)
  return list[index]
}

// Signal № — bir referans tarihten bu yana geçen gün sayısına dayanır,
// böylece zaman içinde artan, tekrarlanmayan ama tamamen deterministik
// bir sayaç hissi verir (rastgele değil).
const SIGNAL_EPOCH = "2024-01-01"

function parseDateKey(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number)
  return { y, m, d }
}

function computeSignalNumber(dateStr) {
  const epoch = parseDateKey(SIGNAL_EPOCH)
  const target = parseDateKey(dateStr)
  const epochUtc = Date.UTC(epoch.y, epoch.m - 1, epoch.d)
  const targetUtc = Date.UTC(target.y, target.m - 1, target.d)
  return Math.round((targetUtc - epochUtc) / 86400000) + 1
}

export const RARE_EVENT_PROBABILITY = 0.04

// Saf ve test edilebilir: aynı (dateStr, contentPools) girdisi için her
// zaman aynı çıktıyı döner. dateStr, kullanıcının YEREL takvim günüdür
// (YYYY-MM-DD) — UTC değil. Boş havuzlar hataya değil, ilgili alanda
// undefined'a yol açar; DailySignalContent bu alanları render etmez.
export function generateDailySignal(dateStr, contentPools) {
  const seed = hashStringToSeed(dateStr)
  const rng = mulberry32(seed)

  const color = pickFrom(rng, contentPools.colors)
  const word = pickFrom(rng, contentPools.words)
  const shortLine = pickFrom(rng, contentPools.shortLines)
  const mood = pickFrom(rng, contentPools.moods)
  const song = pickFrom(rng, contentPools.songs)
  const image = pickFrom(rng, contentPools.images)
  const motionVariant = pickFrom(rng, contentPools.motionVariants) ?? "static"

  const rareRoll = rng()
  const rareEvent = rareRoll < RARE_EVENT_PROBABILITY ? pickFrom(rng, contentPools.rareEvents) ?? null : null

  return {
    date: dateStr,
    signalNumber: computeSignalNumber(dateStr),
    color,
    word,
    shortLine,
    mood,
    song,
    image,
    motionVariant,
    rareEvent,
  }
}

// Kullanıcının kendi saat diliminde "bugün" — Date#toISOString() UTC'ye
// kaydığı için kullanılmaz, yerel getFullYear/getMonth/getDate ile üretilir.
export function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

// Sürekli bir interval yerine, bir sonraki yerel gece yarısına tek seferlik
// bir setTimeout kurar ve iptal fonksiyonu döner. Çağıran (DailySignalContent)
// zamanlayıcı ateşlendiğinde tarih anahtarını yeniden okuyup state'i günceller;
// bu da bileşeni yeniden render eder ve efekt yeni bir sonraki gece yarısı
// için kendini otomatik olarak yeniden kurar.
export function scheduleAtNextLocalMidnight(callback) {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5)
  const delay = next.getTime() - now.getTime()
  const timeoutId = setTimeout(callback, delay)
  return () => clearTimeout(timeoutId)
}
