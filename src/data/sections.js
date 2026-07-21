// Sol menüdeki "İşlerim" dışındaki bölümlerin içerikleri.
// Yeni bir not, referans veya arşiv kaydı eklemek için ilgili
// listeye yeni bir satır eklemen yeterli.

export const sections = {
  hakkimda: {
    title: "Hakkımda",
    eyebrow: "Profil",
    timeline: [
      { year: "2001", text: "Born in Trabzon." },
      { year: "2021", text: "Started working in advertising." },
      { year: "2024", text: "Focused on Art Direction." },
      { year: "2025", text: "AI became part of the creative process." },
      { year: "Today", text: "Building visual systems and creative experiences." },
    ],
  },
  motion: {
    title: "Still taking shape.",
    eyebrow: "Motion",
    eyebrowLang: "en",
    body: ["New work will appear here."],
  },
  "image-direction": {
    title: "Still taking shape.",
    eyebrow: "Image Direction",
    eyebrowLang: "en",
    body: ["New work will appear here."],
  },
  playground: {
    title: "Still taking shape.",
    eyebrow: "Playground",
    eyebrowLang: "en",
    body: ["New work will appear here."],
  },
  notlar: {
    title: "Not Defteri",
    eyebrow: "Notlar",
    list: [
      { title: "Karanlık arayüzlerde okunabilirlik", meta: "2026" },
      { title: "El yazısı tipografi denemeleri", meta: "2025" },
      { title: "Minimal navigasyon üzerine", meta: "2025" },
      { title: "Işık, gölge ve odak hissi", meta: "2024" },
    ],
  },
  "ai-arsiv": {
    title: "AI Arşivi",
    eyebrow: "Arşiv",
    list: [
      { title: "Üretken görsel stil testleri", meta: "2026" },
      { title: "Prompt tabanlı marka kimliği denemeleri", meta: "2025" },
      { title: "AI destekli moodboard süreçleri", meta: "2025" },
    ],
  },
  referanslar: {
    title: "Referanslar",
    eyebrow: "Referanslar",
    quotes: [
      { text: "Fikirleri sadece görsel değil, sistem olarak kuruyor.", meta: "Ekip Arkadaşı" },
      { text: "Detaylara karanlıkta bile dikkat eden biri.", meta: "Proje Ortağı" },
    ],
  },
  iletisim: {
    title: "İletişim",
    eyebrow: "İletişim",
    body: [
      "Yeni bir proje, iş birliği ya da sadece merhaba demek için:",
    ],
    contact: {
      email: "hello@kralll.dev",
      links: [
        { label: "Instagram", href: "#" },
        { label: "LinkedIn", href: "#" },
        { label: "Behance", href: "#" },
      ],
    },
  },
}
