// Küçük, generic bir ambient-audio / sesli medya koordinasyonu. Site
// açıldığında tek bir <audio> ambient loop otomatik başlamayı dener; panel
// veya proje açılması bunu etkilemez. Yalnızca gerçekten sesli bir medya
// (ör. Little Melih videosu) çalmaya başladığında ambient duraklar, o medya
// durduğunda kaldığı yerden devam eder. Yeni bir sesli video eklenirse
// yalnızca notifyAudibleMediaStart/Stop çağırması yeterli — başka hiçbir
// yeri değiştirmek gerekmez.
const AMBIENT_VOLUME = 0.08
const FADE_MS = 200

let audioEl = null
let activeMediaCount = 0
let interactionListenersAttached = false
let fadeRafId = null

function cancelFade() {
  if (fadeRafId !== null) {
    cancelAnimationFrame(fadeRafId)
    fadeRafId = null
  }
}

function fadeVolume(el, from, to, duration, onDone) {
  cancelFade()
  el.volume = from
  const start = performance.now()
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration)
    el.volume = from + (to - from) * t
    if (t < 1) {
      fadeRafId = requestAnimationFrame(step)
    } else {
      fadeRafId = null
      onDone?.()
    }
  }
  fadeRafId = requestAnimationFrame(step)
}

function handleFirstInteraction() {
  playAmbient()
}

function attachInteractionListeners() {
  if (interactionListenersAttached) return
  interactionListenersAttached = true
  window.addEventListener("click", handleFirstInteraction)
  window.addEventListener("pointerdown", handleFirstInteraction)
  window.addEventListener("keydown", handleFirstInteraction)
}

function removeInteractionListeners() {
  if (!interactionListenersAttached) return
  interactionListenersAttached = false
  window.removeEventListener("click", handleFirstInteraction)
  window.removeEventListener("pointerdown", handleFirstInteraction)
  window.removeEventListener("keydown", handleFirstInteraction)
}

// Sekme gizliyken veya aktif sesli medya varken çağrılmaz; zaten çalıyorsa
// yalnızca volume'u garanti eder (fade'i yarıda kesmeden tekrar başlatmaz).
function playAmbient() {
  if (!audioEl || activeMediaCount > 0 || document.visibilityState === "hidden") return
  if (!audioEl.paused) return

  audioEl.volume = 0
  const playPromise = audioEl.play()
  const onSuccess = () => {
    fadeVolume(audioEl, 0, AMBIENT_VOLUME, FADE_MS)
    removeInteractionListeners()
  }
  if (playPromise?.then) {
    playPromise.then(onSuccess).catch(() => {
      // Otomatik oynatma engellendi (ya da eşzamanlı bir pause() tarafından
      // kesildi). activeMediaCount hâlâ 0 ise gerçek bir autoplay engeli
      // demektir — ilk kullanıcı etkileşiminde tekrar denenir.
      if (activeMediaCount === 0 && document.visibilityState !== "hidden") {
        attachInteractionListeners()
      }
    })
  } else {
    onSuccess()
  }
}

function pauseAmbientImmediate() {
  if (!audioEl) return
  cancelFade()
  audioEl.pause()
}

// <audio> elementini bir kez register eder (bkz. AmbientAudio.jsx), volume/
// loop'u ayarlar, ilk otomatik oynatmayı dener ve sekme görünürlüğünü
// izler. Döndürülen fonksiyon dinleyicileri temizler.
export function initAmbientAudio(el) {
  audioEl = el
  audioEl.loop = true
  audioEl.volume = AMBIENT_VOLUME

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      pauseAmbientImmediate()
    } else if (activeMediaCount === 0) {
      playAmbient()
    }
  }

  document.addEventListener("visibilitychange", handleVisibilityChange)
  playAmbient()

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange)
    removeInteractionListeners()
    cancelFade()
    audioEl = null
  }
}

// Sesli bir video/medya oynamaya başladığında çağrılır — ambient hemen
// (fade'siz) duraklar, sesler üst üste binmesin diye.
export function notifyAudibleMediaStart() {
  activeMediaCount += 1
  pauseAmbientImmediate()
}

// Aynı medya durduğunda/bittiğinde/kapandığında çağrılır — başka aktif
// sesli medya kalmadıysa ambient kaldığı yerden (başa sarmadan), yumuşak
// bir fade-in ile devam eder.
export function notifyAudibleMediaStop() {
  activeMediaCount = Math.max(0, activeMediaCount - 1)
  if (activeMediaCount === 0) {
    playAmbient()
  }
}
