// Proje evreni burada yönetilir. Yeni bir fikir eklemek için
// aşağıdaki listeye yeni bir obje eklemen yeterli.
//
// x / y     : ekrana göre yüzde konumu (0-100)
// rotation  : derece cinsinden hafif eğim
// size      : "small" | "medium" | "large" | "xlarge"
// style     : "serif" (marka/müşteri işleri) | "hand" (kişisel/deneysel işler)
// insight / idea / execution : proje modalındaki kısa case-study notları
//
// caseStudy : true ise proje, ProjectModal içinde tam kapsamlı editoryal
// case study şablonuyla açılır (hero + problem + içgörü + fikir + çıktılar
// + rol + sonraki proje). Bu alan yoksa proje eski/kompakt modal ile açılır.
// Gerçek görsel/video materyali henüz yoksa `outputs` altındaki her
// bölüm otomatik olarak "content needed" etiketiyle boş gösterilir —
// buraya sahte/placeholder görsel eklenmemeli.
//
// accentColor : Selected Works içinde imleç/dokunma/klavye odağı bu projeye
// yaklaştığında ThemeEngine'in analog olarak geçtiği renk (bkz.
// src/context/ThemeEngine.jsx). Marka dünyasından ilham alan, karanlık
// sistemle uyumlu, kontrollü (neon olmayan) tonlar seçilmeli.

export const projects = [
  {
    id: "turknet",
    title: "TurkNet",
    campaignTitle: "TurkNet'le Şov Başlasın",
    subtitle: "Kampanya Dünyası",
    year: "2026",
    brand: "TurkNet",
    role: "Creative Direction",
    x: 34,
    y: 19,
    rotation: -6,
    size: "large",
    style: "serif",
    accentColor: "#7C4DBF",
    caseStudy: true,

    campaignSummary:
      "TurkNet'in internet faydalarını teknik anlatımın dışına çıkarıp, üç luchador karakteri üzerinden eğlenceli ve güçlü bir kampanya dünyasına dönüştürdük. Türk evinin tanıdık atmosferi, beklenmedik bir şov sahnesine dönüştü.",
    myRole:
      "Creative concept development, art direction, character and visual world development, AI-assisted image production, key visual development and motion exploration.",

    challenge:
      "İnternet kategorisinde hız, taahhütsüzlük ve simetrik bağlantı gibi güçlü faydalar çoğunlukla benzer ve teknik bir iletişim diliyle anlatılıyor. TurkNet'in ürün mesajlarını daha görünür, hatırlanabilir ve eğlenceli bir dünyaya taşımamız gerekiyordu.",
    insight:
      "Teknik faydalar tek başına dikkat çekmeyebilir; ancak insanların günlük hayatına beklenmedik ve eğlenceli bir biçimde girdiğinde güçlü bir iletişim anına dönüşebilir.",
    bigIdea:
      "TurkNet'in güçlü internet faydalarını, evin içine giren üç luchadorun başlattığı büyük bir şova dönüştürmek: TurkNet'le Şov Başlasın.",

    charactersText: [
      "Üç luchador, TurkNet'in güçlü, özgür ve enerjik tavrını temsil eden kampanya karakterleri olarak tasarlandı. Meksikalı güreşçilerin gösterişli dünyasını tanıdık bir Türk evinin içine yerleştirmek, kampanyanın absürt mizahını ve görsel karşıtlığını oluşturdu.",
      "TurkNet moru ana renk olarak korunurken kostümler, kemerler, ev objeleri ve geleneksel detaylar aynı görsel dünyanın parçaları hâline getirildi.",
    ],

    campaignMessages: [
      "Taahhüt Yok",
      "Cayma Bedeli Bizden",
      "1.000 Mbps'ye Varan Hız",
      "İndirme = Yükleme",
    ],

    aiProcess:
      "AI; karakter, kostüm, poz, mekân ve kompozisyon alternatiflerini hızlı biçimde araştırmak için yaratıcı sürecin farklı aşamalarında kullanıldı. Seçilen yönler art direction sürecinde rafine edilerek KV, film ve hareketli içerik denemelerine dönüştürüldü.",

    media: {
      heroDesktop: "/case-studies/turknet/hero-desktop-web.webp",
      heroMobile: "/case-studies/turknet/hero-mobile-web.webp",
      art: ["/case-studies/turknet/art-01-web.webp"],
      campaignVisuals: [
        "/case-studies/turknet/kv-02-web.webp",
        "/case-studies/turknet/kv-03-web.webp",
      ],
      film: "/case-studies/turknet/film-web.mp4",
      filmPoster: "/case-studies/turknet/film-poster-web.webp",
    },
  },
  {
    id: "ultrand",
    title: "Ultrand",
    subtitle: "Marka Kimliği Sistemi",
    year: "2025",
    brand: "Ultrand",
    role: "Brand & Motion",
    x: 54,
    y: 12,
    rotation: 4,
    size: "small",
    style: "serif",
    accentColor: "#B5581F",
    insight: "Marka büyüdükçe kimliği farklı ellerde farklı şekillere giriyordu.",
    idea: "Esnek ama kendi kendini koruyan, hareket hâlinde de tutarlı kalan bir sistem tasarlamak.",
    execution:
      "Logotip, renk ve hareket kuralları tek bir motion-first sistemde birleştirildi.",
  },
  {
    id: "pidem",
    title: "Pidem",
    subtitle: "Dijital Ürün Deneyimi",
    year: "2025",
    brand: "Pidem",
    role: "UI Direction",
    x: 17,
    y: 35,
    rotation: 6,
    size: "xlarge",
    style: "serif",
    accentColor: "#D98B4A",
    insight:
      "Ürün güçlüydü ama arayüz bunu hissettirmiyordu; her ekran birbirinden kopuk duruyordu.",
    idea: "Ürünün kendi mantığını arayüze de taşıyan, sakin ve kendinden emin bir sistem kurmak.",
    execution:
      "Bileşen kütüphanesi ve etkileşim dili baştan kuruldu, ekranlar arası ritim yeniden yazıldı.",
  },
  {
    id: "ai-denemeleri",
    title: "AI Denemeleri",
    subtitle: "Üretken Görsel Testleri",
    year: "2026",
    brand: "Kişisel",
    role: "Araştırma",
    x: 70,
    y: 31,
    rotation: -5,
    size: "medium",
    style: "hand",
    accentColor: "#3E7CA6",
    insight: "Üretken araçlar hızlı sonuç veriyordu ama kendi sesimi kaybetme riski hep vardı.",
    idea: "AI'ı bir sonuç makinesi değil, taslak/sketch ortağı gibi kullanmak.",
    execution: "Prompt, seçim ve düzeltme döngüsü küçük, tekrar eden denemelerle test ediliyor.",
  },
  {
    id: "kisisel-isler",
    title: "Kişisel İşler",
    subtitle: "Sahiplenilen Küçük Fikirler",
    year: "2024–2026",
    brand: "Kişisel",
    role: "Yön & Uygulama",
    x: 27,
    y: 56,
    rotation: -4,
    size: "large",
    style: "hand",
    accentColor: "#B36B82",
    insight: "Müşteri işleri arasında kendi fikirlerimi biriktirecek bir yer yoktu.",
    idea: "Küçük, bitmemiş olsa bile sahiplenilen işler için kalıcı bir alan açmak.",
    execution: "Her biri farklı ölçekte, farklı zamanda; ortak paydası sadece dürüstlük.",
  },
  {
    id: "cekim-referanslari",
    title: "Çekim Referansları",
    subtitle: "Görsel Dil Arşivi",
    year: "2025",
    brand: "Arşiv",
    role: "Kürasyon",
    x: 11,
    y: 67,
    rotation: 7,
    size: "small",
    style: "hand",
    accentColor: "#5E7A94",
    insight: "Referans aramak, her seferinde sıfırdan başlayan dağınık bir süreçti.",
    idea: "Tekrar dönülebilecek, zamanla büyüyen kişisel bir görsel dil arşivi kurmak.",
    execution: "Kadraj, ışık ve renk üzerinden düzenli olarak güncellenen bir koleksiyon.",
  },
  {
    id: "kampanya-fikirleri",
    title: "Kampanya Fikirleri",
    subtitle: "Konsept Havuzu",
    year: "2025–2026",
    brand: "Arşiv",
    role: "Konsept Geliştirme",
    x: 60,
    y: 52,
    rotation: -8,
    size: "medium",
    style: "hand",
    accentColor: "#B8923A",
    insight: "En iyi fikirler genelde brief'ten önce, rastgele anlarda geliyordu.",
    idea: "Bu anları kaybetmeden, ham hâlleriyle bir havuzda tutmak.",
    execution: "Her biri tek cümlelik bir tohum; bir kısmı büyüyor, çoğu burada bekliyor.",
  },
  {
    id: "sosyal-medya-fikirleri",
    title: "Sosyal Medya Fikirleri",
    subtitle: "İçerik Konsept Notları",
    year: "2026",
    brand: "Arşiv",
    role: "İçerik Yönü",
    x: 76,
    y: 68,
    rotation: 4,
    size: "small",
    style: "hand",
    accentColor: "#6E9C7C",
    insight: "Format hızlı tüketiliyor ama fikir çoğu zaman hızla eskiyordu.",
    idea: "Formattan bağımsız, zamana dayanıklı küçük içerik fikirleri biriktirmek.",
    execution: "Notlar; başlık, ton ve görsel yön olarak üçe ayrılıyor.",
  },
]
