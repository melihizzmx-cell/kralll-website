import { useEffect, useRef } from "react"

// Case study içindeki bir video, yalnızca görünür alana girdiğinde oynar,
// alandan çıktığında duraklar — "kontrollü autoplay". Video zaten muted +
// playsInline olduğu için tarayıcı autoplay politikalarıyla çakışmaz.
export function useCaseVideoAutoplay() {
  const videoRef = useRef(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {})
        } else {
          el.pause()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return videoRef
}
