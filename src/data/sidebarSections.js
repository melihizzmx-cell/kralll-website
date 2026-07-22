// Sol menüdeki bölümlerin kimliği: id, etiket ve o bölümün "oda"sını
// tanımlayan tek bir accentColor. Sidebar.jsx (nav linkleri + proximity
// renk sistemi) ve SectionPanel.jsx (açılan panelin eyebrow/ayırıcı/vurgu
// renkleri) bu tek listeyi okur — yeni bir bölüm eklemek için yalnızca
// buraya id/label/accentColor eklemek yeterli, başka hiçbir yeri
// değiştirmen gerekmez (bkz. src/context/ThemeEngine.jsx'teki kategori/
// proje accentColor deseniyle aynı mantık).
//
// Renkler kontrollü, düşük doygunluklu, karanlık premium palet içinde
// kalibre edildi — bağıran marka renkleri değil, her bölümün sessizce
// hissettirdiği bir atmosfer tonu. "İşlerim" ve "AI Arşivi" kasıtlı
// olarak kategori bulutundaki "Selected Works" (#9B4DFF) ve "AI Lab"
// (#55D7FF) ile aynı tonu paylaşıyor — aynı bölüme farklı giriş
// noktalarından (sidebar / kategori bulutu) ulaşıldığında atmosfer
// tutarlı kalsın diye.
export const sidebarSections = [
  { id: "isler", label: "İşlerim", accentColor: "#9B4DFF" },
  { id: "hakkimda", label: "Hakkımda", accentColor: "#D9BFB0" },
  { id: "notlar", label: "Not Defteri", accentColor: "#C9973E" },
  { id: "ai-arsiv", label: "AI Arşivi", accentColor: "#55D7FF" },
  { id: "referanslar", label: "Referanslar", accentColor: "#5B5FC7" },
  { id: "iletisim", label: "İletişim", accentColor: "#93A98A" },
]
