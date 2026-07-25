// Ana sayfanın en arka atmosfer katmanı — çok yavaş akan, kenarlarda
// yaşayan, merkezde sakinleşen ışık perdeleri ("energy field / wave
// curtain"). Tamamen saf CSS: hiçbir JS animasyon döngüsü, canvas veya
// per-frame ölçüm yok — hareket yalnızca compositor-only transform
// @keyframes ile sürüyor (bkz. styles.css .wave-field*), bu da onu
// FiberAmbience'ın canvas rAF döngüsünden bile daha ucuz kılıyor.
//
// Renk: yeni bir sistem değil — her bandın rengi CSS içinde doğrudan
// canlı --accent-r/g/b (ThemeEngine) değişkenini color-mix() ile sabit
// bir taban tonla karıştırıyor, JS hiç renk bilmiyor.
//
// Konum: App.jsx'te .bg-vignette'in ÜSTÜNE, FiberAmbience'ın ALTINA
// yerleştirilir — vignette'in kenarları karartmasının hemen üzerinde
// kendi ışığı "sızıyor" hissi verir, yılan/fiber hattı en öndeki hareket
// elemanı olarak kalır.
export default function WaveField() {
  return (
    <div className="wave-field" aria-hidden="true">
      <span className="wave-field__band wave-field__band--left-a" />
      <span className="wave-field__band wave-field__band--left-b" />
      <span className="wave-field__band wave-field__band--right-a" />
      <span className="wave-field__band wave-field__band--right-b" />
    </div>
  )
}
