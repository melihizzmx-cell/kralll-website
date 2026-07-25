// Not Defteri'nin "Daily Signal" içerik havuzları. Melih adına sahte
// düşünce/günlük üretilmez — burada yalnızca önceden tanımlanmış,
// küratöryel öğeler tutulur; src/lib/dailySignal.js bu havuzlardan
// tarih tabanlı deterministik bir seçim yapar (bkz. generateDailySignal).
//
// Yeni içerik eklemek: ilgili diziye yeni bir satır eklemek yeterli,
// başka hiçbir yeri değiştirmen gerekmez. Diziler boş bırakılırsa ilgili
// alan Not Defteri panelinde otomatik olarak gizlenir (hata vermez).
//
// Aşağıdaki birkaç giriş yalnızca sistemi göstermek için eklenmiş, açıkça
// PLACEHOLDER işaretli, nötr içeriklerdir — Melih'in gerçek düşünceleri
// veya kişisel günlüğü değildir.
export const dailySignalContent = {
  // Hex renkler. Kontrollü, düşük doygunluklu, karanlık palet ile uyumlu
  // tonlar tercih edilmeli (bkz. sidebarSections.js'teki accentColor'lar).
  colors: [
    "#C9973E", // placeholder — notlar bölümünün mevcut accent tonu
    "#9B4DFF", // placeholder
    "#55D7FF", // placeholder
    "#93A98A", // placeholder
    "#D9BFB0", // placeholder
  ],

  // Günün başlığı — kısa, iki kelimelik, atmosferik. Kişisel iddia
  // içermez, yalnızca bir "sinyal adı" hissi verir.
  words: [
    "VIOLET STATIC", // placeholder
    "QUIET FREQUENCY", // placeholder
    "SLOW APERTURE", // placeholder
    "PALE SIGNAL", // placeholder
    "SOFT DRIFT", // placeholder
  ],

  // Kısa satır — tek cümle, "today's frequency:" gibi bir çerçevenin
  // altına gelir. Nötr, stil betimleyici; günlük/itiraf değil.
  shortLines: [
    "slow, curious, unfinished.", // placeholder
    "quiet, patient, still forming.", // placeholder
    "steady signal, low noise.", // placeholder
  ],

  // Ruh hali etiketi — tek kelime.
  moods: [
    "curious", // placeholder
    "quiet", // placeholder
    "steady", // placeholder
    "unfinished", // placeholder
  ],

  // Opsiyonel: { title, artist } şeklinde şarkı referansları. Boş
  // bırakılabilir — bu alan panelde yalnızca dolu olduğunda görünür.
  songs: [],

  // Opsiyonel: /public altında gerçekten var olan görsellerin yolu.
  // Boş bırakılabilir — bu alan panelde yalnızca dolu olduğunda görünür.
  images: [],

  // İzin verilen 5 düşük yoğunluklu hareket varyasyonundan biri
  // (bkz. DailySignalContent.jsx / styles.css .daily-signal--motion-*).
  motionVariants: ["drift", "pulse", "static", "vertical", "wave"],

  // Nadir olaylar (~%3-5 ihtimalle seçilir). "media" alanı yalnızca
  // gerçekten var olan bir asset'e işaret ediyorsa kullanılır — asset
  // yoksa veya yüklenemezse component sessizce metne düşer.
  rareEvents: [
    { id: "no-signal", label: "NO SIGNAL TODAY" },
    { id: "little-melih", label: "LITTLE MELIH TRANSMISSION", media: "/media/surprise-me-baby-melih.mp4", poster: "/media/surprise-me-baby-melih-poster.webp" },
    { id: "archive-fragment", label: "ARCHIVE FRAGMENT" },
    { id: "night-mode", label: "NIGHT MODE" },
    { id: "found-footage", label: "FOUND FOOTAGE" },
  ],
}
