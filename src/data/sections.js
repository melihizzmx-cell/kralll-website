// Sol menüdeki "İşlerim" dışındaki bölümlerin içerikleri.
// Yeni bir not, referans veya arşiv kaydı eklemek için ilgili
// listeye yeni bir satır eklemen yeterli.

// "hakkimda" diğer bölümlerden farklı, kendi editoryal düzenini kullanan
// yapılandırılmış bir obje (bkz. AboutPanelContent.jsx) — SectionPanel.jsx
// sectionId==="hakkimda" olduğunda bu şekli generic body/list/timeline/
// quotes/contact render'ı yerine özel bir bileşene devrediyor. Metni
// güncellemek için yalnızca bu objeyi değiştirmen yeterli.
export const sections = {
  hakkimda: {
    title: "Hakkımda",
    eyebrow: "About / Hakkımda",
    titleLines: [
      "I build visual worlds",
      "where ideas, art direction",
      "and technology meet.",
    ],
    titleAccentWord: "technology",
    biography: [
      "Melih Şentürk is an Art Director and AI Creative working across advertising, visual storytelling, image direction and motion.",
      "He started his advertising career while studying Public Relations and Advertising at Sakarya University. Today, he combines traditional art direction with AI-native production methods to turn ideas into distinctive visual worlds.",
    ],
    timeline: [
      { year: "2001", text: "Born in Trabzon." },
      { year: "2021", text: "Started working in advertising." },
      { year: "2024", text: "Expanded his practice into AI-driven image and motion production." },
      { year: "NOW", text: "Building ideas across art direction, AI and visual storytelling." },
    ],
    principlesTitle: "A few things I believe",
    principles: [
      { index: "01", text: "Ideas come before tools." },
      { index: "02", text: "Images need intention." },
      { index: "03", text: "Curiosity keeps the work moving." },
    ],
    currentlyTitle: "Currently exploring",
    currentlyExploring: [
      "AI-native creative processes",
      "Motion and moving image",
      "Visual systems",
      "Character-driven advertising",
    ],
    // Doğrulanabilir gerçek bir konum/müsaitlik bilgisi geldiğinde bu alanı
    // güncellemek yeterli; boş bırakılırsa satır hiç render edilmez.
    statusLine: "Based in Türkiye. Open to selected collaborations.",
    closingCta: {
      line1: "Have something interesting in mind?",
      line2: "Let's talk.",
      targetSection: "iletisim",
    },
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
