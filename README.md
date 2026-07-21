# kralll — kişisel fikir evreni

Karanlık, minimal ve hafif cyberpunk hissiyatında bir kişisel portfolyo sitesi.
Ekranın ortasında, imlecin UV fener gibi aydınlattığı dağınık bir proje
evreni var. React + Vite + Framer Motion ile yazıldı.

## Kullanılan teknolojiler

- React 18
- Vite 5
- Framer Motion (animasyonlar)
- Lucide React (ikonlar)
- Düz CSS (Tailwind yok, `src/styles.css` içinde tek dosya)

## Proje yapısı

```
src/
  components/
    Sidebar.jsx        sol ince navigasyon
    CursorGlow.jsx      imleç etrafındaki mor ışık + özel cursor
    ProjectCloud.jsx    tüm projeleri ekrana yerleştiren katman
    ProjectItem.jsx     tek bir proje ismi + hover/proximity efektleri
    ProjectModal.jsx    projeye tıklanınca açılan detay paneli
    SectionPanel.jsx    Hakkımda / Not Defteri / AI Arşivi vb. paneller
  context/
    MouseContext.jsx    imleç konumunu tüm bileşenlere dağıtan context
  data/
    projects.js         proje listesi (yeni proje eklemek için burayı düzenle)
    sections.js         sol menüdeki diğer bölümlerin içerikleri
  App.jsx
  main.jsx
  styles.css
```

Yeni bir proje eklemek için `src/data/projects.js` dosyasına aşağıdaki gibi
bir obje eklemen yeterli:

```js
{
  id: "yeni-proje",
  title: "Yeni Proje",
  subtitle: "Kısa Açıklama",
  year: "2026",
  brand: "Marka",
  role: "Rol",
  x: 35,        // ekranın yüzde kaçında (yatay)
  y: 55,        // ekranın yüzde kaçında (dikey)
  rotation: -3, // hafif eğim (derece)
  size: "medium" // small | medium | large | xlarge
}
```

---

## Mac üzerinde çalıştırma (adım adım)

Bu rehber, terminal veya kod editörü kullanmaya yeni başlayan biri için
yazıldı.

### 1. Node.js kurulumu

Terminalde Node.js kurulu olup olmadığını kontrol et. **Terminal**
uygulamasını aç (Spotlight'ı `Cmd + Boşluk` ile açıp "Terminal" yazarak
bulabilirsin) ve şunu yaz:

```
node -v
```

Bir sürüm numarası görürsen (örn. `v20.11.0`) Node.js zaten kurulu demektir,
5. adıma geçebilirsin.

Eğer "command not found" gibi bir hata görürsen, Node.js kurulu değil demektir:

1. [https://nodejs.org](https://nodejs.org) adresine git
2. "LTS" yazan sürümü indir (Mac için `.pkg` dosyası)
3. İndirilen dosyayı çift tıklayıp kurulum adımlarını takip et
4. Kurulum bitince Terminal'i kapatıp tekrar aç, `node -v` komutunu tekrar dene

### 2. Projeyi Visual Studio Code ile açma

1. [https://code.visualstudio.com](https://code.visualstudio.com) adresinden
   Visual Studio Code'u indirip kur (zaten kuruluysa bu adımı atla)
2. VS Code'u aç
3. Üst menüden **File → Open Folder...** seçeneğine tıkla
4. Bu proje klasörünü (`kralll-website`) seç ve **Open** de

### 3. VS Code içinden terminal açma

VS Code içindeyken üst menüden **Terminal → New Terminal** seçeneğine
tıkla. Ekranın altında bir terminal paneli açılacak. Aşağıdaki tüm
komutları buraya yazabilirsin (ya da normal Mac Terminal uygulamasını da
kullanabilirsin, ikisi de aynı işi görür).

### 4. Proje klasörüne gitme (sadece normal Terminal kullanıyorsan)

VS Code'un içindeki terminal zaten proje klasöründe açılır, bu adımı
atlayabilirsin. Eğer Mac'in kendi Terminal uygulamasını kullanıyorsan,
proje klasörünü sürükleyip terminale bırakarak ya da şu şekilde klasöre
girebilirsin:

```
cd Downloads/kralll-website
```

(klasörü nereye koyduysan yolunu ona göre değiştir)

### 5. Bağımlılıkları kurma

Terminale şunu yaz ve Enter'a bas:

```
npm install
```

Bu komut, projenin ihtiyaç duyduğu paketleri (`node_modules` klasörü)
indirir. İlk seferde biraz sürebilir, sadece bir kere yapman yeterli
(paketleri değiştirmediğin sürece tekrar çalıştırmana gerek yok).

### 6. Siteyi çalıştırma

Kurulum bittikten sonra şunu yaz:

```
npm run dev
```

Terminalde şuna benzer bir çıktı göreceksin:

```
  VITE ready

  ➜  Local:   http://localhost:5173/
```

`http://localhost:5173/` adresini tarayıcında (Safari, Chrome vb.) açarak
siteyi görebilirsin. `Cmd` tuşuna basılı tutup linke tıklarsan da doğrudan
tarayıcıda açılır.

Siteyi kapatmak için terminalde `Control + C` tuşlarına bas.

### 7. Değişiklik yapınca ne olur?

`npm run dev` çalışırken yaptığın her dosya değişikliği tarayıcıda otomatik
olarak yansır, sayfayı elle yenilemene gerek yok.

### 8. Yayına almadan önce (opsiyonel)

Siteyi bir sunucuya yüklemeden önce üretim (production) sürümünü
oluşturmak istersen:

```
npm run build
```

Bu komut `dist` adında bir klasör oluşturur, o klasörün içeriği herhangi
bir statik hosting servisine (Vercel, Netlify, GitHub Pages vb.) yüklenebilir.

---

## Tasarım notları

- Renk paleti: `#030305` arka plan, `#9B4DFF` mor vurgu, `#C784FF` açık mor,
  `#EEE9F4` ana metin, `#3B3148` silik metin.
- Proje isimleri varsayılan olarak çok düşük opacity'de durur; imleç
  yaklaştıkça mor neon ile parlayıp büyür, alt çizgisi ve küçük oku belirir.
- İmlecin etrafındaki mor ışık, arka plandaki grid'i de o bölgede hafifçe
  ortaya çıkarır.
- Masaüstünde özel bir cursor (mor nokta + yumuşak glow) kullanılır; sistem
  cursor'ı gizlenir. Dokunmatik/mobil cihazlarda normal sistem cursor'ı
  kullanılır ve proje listesi dikey bir akışa döner.
