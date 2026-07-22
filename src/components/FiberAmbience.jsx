// "Living Fiber Ambience" — ana sayfanın karanlığında çok yavaş akan,
// düşük opaklıklı ışık damarları. Tamamen statik SVG path'ler + CSS
// animasyonlarıyla çalışır (stroke-dashoffset akışı + opacity
// belirip-kaybolma); JS per-frame mantığı, mouse takibi veya canvas
// yok. Renk, mevcut ThemeEngine'in yazdığı --accent-r/g/b değişkenini
// doğrudan okur — ikinci bir renk motoru değil, mevcut sistemin sessiz
// bir tüketicisi.
export default function FiberAmbience() {
  return (
    <div className="fiber-ambience" aria-hidden="true">
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <path
          className="fiber-strand fiber-strand--a"
          d="M -60 120 C 220 40, 60 420, 260 520 C 420 600, 180 760, 320 900"
        />
        <path
          className="fiber-strand fiber-strand--b fiber-strand--fade"
          d="M 1500 60 C 1230 220, 1420 440, 1220 560 C 1080 640, 1300 780, 1180 940"
        />
        <path
          className="fiber-strand fiber-strand--c"
          d="M 180 -60 C 520 140, 780 20, 1020 160 C 1220 270, 1380 120, 1500 220"
        />
        <path
          className="fiber-strand fiber-strand--d fiber-strand--fade"
          d="M -60 780 C 340 900, 760 720, 1040 840 C 1260 930, 1420 820, 1500 880"
        />
        <path
          className="fiber-strand fiber-strand--e"
          d="M 1120 -60 C 1000 260, 1180 460, 1000 620 C 880 730, 1020 840, 940 940"
        />
      </svg>
    </div>
  )
}
