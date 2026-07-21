// Ana sayfadaki yaratıcı giriş noktaları. Yeni bir kategori eklemek
// için yalnızca yeni bir obje eklemen yeterli — accentColor tanımlarsan
// cursor glow, ambient glow, grid ve hover renkleri otomatik olarak
// o rengi kullanır (bkz. src/context/ThemeEngine.jsx).
//
// x / y     : ekrana göre yüzde konumu (0-100)
// rotation  : derece cinsinden hafif eğim
// size      : "small" | "medium" | "large"
// tagline   : hover'da beliren tek satırlık açıklama

export const categories = [
  {
    id: "selected-works",
    title: "Selected Works",
    tagline: "Ideas made public.",
    accentColor: "#9B4DFF",
    x: 30,
    y: 22,
    rotation: -5,
    size: "large",
  },
  {
    id: "ai-lab",
    title: "AI Lab",
    tagline: "Experiments with machines.",
    accentColor: "#55D7FF",
    x: 75,
    y: 16,
    rotation: 4,
    size: "small",
  },
  {
    id: "motion",
    title: "Motion",
    tagline: "Thinking in time.",
    accentColor: "#5267FF",
    x: 64,
    y: 45,
    rotation: -6,
    size: "medium",
  },
  {
    id: "image-direction",
    title: "Image Direction",
    tagline: "Images with intent.",
    accentColor: "#F37121",
    x: 17,
    y: 55,
    rotation: 5,
    size: "medium",
  },
  {
    id: "playground",
    title: "Playground",
    tagline: "No brief. No rules.",
    accentColor: "#B7D65C",
    x: 55,
    y: 72,
    rotation: -4,
    size: "medium",
  },
  {
    id: "about",
    title: "About",
    tagline: "The story behind the work.",
    accentColor: "#E6E6E6",
    x: 13,
    y: 82,
    rotation: 6,
    size: "small",
  },
]
