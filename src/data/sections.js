// Sol menüdeki "İşlerim" dışındaki bölümlerin içerikleri.
// Yeni bir not, referans veya arşiv kaydı eklemek için ilgili
// listeye yeni bir satır eklemen yeterli.

export const sections = {
  hakkimda: {
    title: "Hakkımda",
    eyebrow: "Profil",
    body: [
      "Art direction ve dijital ürün tarafında çalışan, fikirlerini genelde karanlıkta biriktiren biriyim.",
      "Bu site, bitmiş bir portföyden çok üzerinde çalıştığım şeylerin dağınık bir haritası. Projeler, notlar ve denemeler zamanla burada birikiyor.",
    ],
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
