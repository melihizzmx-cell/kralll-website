import { useEffect, useRef } from "react"
import { initAmbientAudio } from "../lib/ambientAudio"

// App seviyesinde bir kez mount edilir (bkz. App.jsx) ve panel/proje
// açılıp kapanmasından etkilenmeden ömrü boyunca aynı <audio> elementini
// kullanır — kullanıcıya görünür bir kontrol veya buton yok, tüm
// koordinasyon src/lib/ambientAudio.js üzerinden yürür.
export default function AmbientAudio() {
  const audioRef = useRef(null)

  useEffect(() => {
    if (!audioRef.current) return
    return initAmbientAudio(audioRef.current)
  }, [])

  return (
    <audio
      ref={audioRef}
      src="/audio/portfolio-ambient-loop.mp3"
      loop
      preload="auto"
      aria-hidden="true"
    />
  )
}
