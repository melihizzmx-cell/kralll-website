import { useEffect, useRef, useState } from "react"

// İletişim paneli de (Hakkımda gibi) generic body/contact render'ı yerine
// kendi bileşeninde yaşıyor — gerçek e-posta/sosyal linkler ve "Copy
// email" etkileşimi burada. İçerik src/data/sections.js -> sections.
// iletisim üzerinden yönetiliyor, hiçbir adres/URL bu dosyada hardcode
// edilmiyor.
export default function ContactPanelContent({ data }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleCopy = async () => {
    try {
      if (!navigator.clipboard?.writeText) return
      await navigator.clipboard.writeText(data.email)
      setCopied(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard API kullanılamıyorsa (izin reddi, güvenli olmayan
      // bağlam vb.) sessizce hiçbir şey yapmıyoruz — mailto linki ayrı
      // bir eleman olduğu için bundan etkilenmiyor, konsola hata da
      // yazılmıyor.
    }
  }

  return (
    <div className="contact-panel">
      <span className="modal-eyebrow">{data.eyebrow}</span>
      <h2 className="modal-title modal-title--sm">{data.title}</h2>
      <p className="contact-panel__description">{data.description}</p>

      <div className="contact-panel__email-block">
        <a className="contact-panel__email" href={`mailto:${data.email}`}>
          {data.email}
        </a>
        <button
          type="button"
          className={`contact-panel__copy ${copied ? "contact-panel__copy--success" : ""}`}
          onClick={handleCopy}
        >
          {copied ? data.copyLabels.success : data.copyLabels.idle}
        </button>
      </div>

      <div className="contact-panel__socials">
        {data.socials.map((social) => (
          <a
            key={social.label}
            className="contact-panel__social"
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {social.label}
          </a>
        ))}
      </div>
    </div>
  )
}
