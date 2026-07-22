// "Living Fiber Ambience" — karanlığın içinde uzanan, uzun ve akışkan
// fiber-optik ışık hatları. Her hat tek bir uzun cubic-Bézier path;
// glow canlı CSS blur() ile değil, aynı path'in üç farklı stroke-width/
// opacity ile üst üste çizilmesiyle (outer/mid/core) elde ediliyor.
// Işığın hattın başında ve sonunda karanlığa karışması için her hat
// kendi linearGradient'ini kullanıyor. Renk mevcut --accent-r/g/b'yi
// doğrudan okur. Koordinatlar, kategori metinlerinin ekran
// pozisyonlarına göre hesaplanıp (bkz. commit notu) bu bölgelerden
// kaçınacak şekilde kalibre edildi — her hat 35-80vw uzunluğunda.
// Tamamen statik: performans karşılaştırması sonrası animasyon
// bilinçli olarak eklenmedi (bkz. styles.css yorum notu).
const LINES = [
  {
    id: "a",
    d: "M -60 30 C 180 130, 20 380, 240 520 C 340 590, 200 680, -40 900",
  },
  {
    id: "b",
    d: "M 1510 70 C 1290 190, 1430 380, 1270 460 C 1140 530, 1300 640, 1190 780",
  },
  {
    id: "c",
    d: "M 100 800 C 320 850, 550 790, 700 830 C 880 875, 1050 810, 1250 850",
  },
  {
    id: "d",
    d: "M 1280 -60 C 1400 140, 1140 380, 1300 540 C 1400 650, 1300 800, 1420 900",
    faint: true,
  },
  {
    id: "e",
    d: "M 1350 -60 C 1250 150, 1400 320, 1300 480 C 1220 600, 1380 750, 1300 900",
    wide: true,
  },
]

export default function FiberAmbience() {
  return (
    <div className="fiber-ambience" aria-hidden="true">
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <defs>
          {LINES.map((line) => (
            <linearGradient
              key={line.id}
              id={`fiberGrad-${line.id}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" className="fiber-stop" stopOpacity="0" />
              <stop offset="16%" className="fiber-stop" stopOpacity="1" />
              <stop offset="84%" className="fiber-stop" stopOpacity="1" />
              <stop offset="100%" className="fiber-stop" stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {LINES.map((line) => (
          <g
            key={line.id}
            className={[
              "fiber-line",
              `fiber-line--${line.id}`,
              line.faint && "fiber-line--faint",
              line.wide && "fiber-line--wide",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <path
              className="fiber-layer fiber-layer--outer"
              d={line.d}
              stroke={`url(#fiberGrad-${line.id})`}
            />
            <path
              className="fiber-layer fiber-layer--mid"
              d={line.d}
              stroke={`url(#fiberGrad-${line.id})`}
            />
            <path
              className="fiber-layer fiber-layer--core"
              d={line.d}
              stroke={`url(#fiberGrad-${line.id})`}
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
