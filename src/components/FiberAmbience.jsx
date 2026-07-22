// "Living Fiber Ambience" — karanlığın içinde dolaşan, uzun ve akışkan
// fiber-optik ışık hatları. Her hat tek bir uzun cubic-Bézier path;
// glow canlı CSS blur() ile değil, aynı path'in üç farklı stroke-width/
// opacity ile üst üste çizilmesiyle (outer/mid/core) elde ediliyor.
// Işığın hattın başında ve sonunda karanlığa karışması için her hat
// kendi linearGradient'ini kullanıyor.
//
// Renk: iki katmanlı sistem. (1) Her hattın kendi sabit baz tonu var
// (violet/mavi/cyan/pembe-violet — bkz. styles.css .fiber-stop--N).
// (2) Bu baz ton, CSS color-mix() ile mevcut --accent-r/g/b (Theme-
// Engine'in yazdığı canlı değer) ile hafifçe karıştırılıyor — ikinci
// bir renk motoru yok, salt CSS fonksiyonu.
//
// Hareket: yalnızca 3 hatta (id 1-3), yalnızca transform+opacity,
// tek paylaşılan @keyframes + CSS custom property ile farklı genlik/
// süre/gecikme. Hat 4 (en silik) tamamen statik. Koordinatlar,
// kategori metinlerinin ekran pozisyonlarına göre hesaplanıp bu
// bölgelerden (sürüklenme payı dahil) kaçınacak şekilde kalibre
// edildi — her hat 35-80vw uzunluğunda.
const LINES = [
  {
    id: "1",
    d: "M -60 30 C 180 130, 20 380, 240 520 C 340 590, 200 680, -40 900",
    roam: true,
  },
  {
    id: "2",
    d: "M 1510 70 C 1290 190, 1430 380, 1270 460 C 1140 530, 1300 640, 1190 780",
    roam: true,
  },
  {
    id: "3",
    d: "M 100 800 C 320 850, 550 790, 700 830 C 880 875, 1050 810, 1250 850",
    roam: true,
  },
  {
    id: "4",
    d: "M 1280 -60 C 1400 140, 1140 380, 1300 540 C 1400 650, 1300 800, 1420 900",
    faint: true,
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
              <stop
                offset="0%"
                className={`fiber-stop fiber-stop--${line.id}`}
                stopOpacity="0"
              />
              <stop
                offset="16%"
                className={`fiber-stop fiber-stop--${line.id}`}
                stopOpacity="1"
              />
              <stop
                offset="84%"
                className={`fiber-stop fiber-stop--${line.id}`}
                stopOpacity="1"
              />
              <stop
                offset="100%"
                className={`fiber-stop fiber-stop--${line.id}`}
                stopOpacity="0"
              />
            </linearGradient>
          ))}
        </defs>

        {LINES.map((line) => (
          <g
            key={line.id}
            className={[
              "fiber-line",
              `fiber-line--${line.id}`,
              line.roam && "fiber-line--roam",
              line.faint && "fiber-line--faint",
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
