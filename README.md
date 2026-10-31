# Kampüs Etkinlik Panosu

Bu proje, **BMH231 Web Programlama** dersi 2. ödevi kapsamında geliştirilmiş tek sayfalık dinamik bir web uygulaması ve yerel HTTP/JSON API sunucusudur. Üniversite kampüsündeki atölye, söyleşi ve topluluk etkinliklerinin listelenmesini, filtrelenmesini ve yeni etkinlik önerisi toplanmasını sağlar.

---

## 🚀 Özellikler

* **Dinamik Kart Çizimi (DOM Manipulation):** Etkinlik verileri arayüze `document.createElement`, `append` ve modern DOM API'leri ile güvenli biçimde işlenir (XSS koruması).
* **Anlık Arama ve Filtreleme:** Arama kutusu (`input` olayı) ve kategori butonları ile hem metne hem de etkinlik türüne göre dinamik filtreleme yapılır.
* **İstemci Taraflı Form Doğrulama:** Öneri formu boş bırakılan zorunlu alanlara karşı denetlenir, kullanıcıya dinamik başarı/hata geri bildirimi verilir.
* **Harici Bağımlılıksız HTTP Sunucusu:** Node.js'in yerleşik `http`, `fs` ve `path` modülleri kullanılarak oluşturulan yerel web sunucusu.
* **REST/JSON API:** `/api/etkinlikler` uç noktası üzerinden filtreleme (`?tur=...`), tekil sorgulama (`/id`) ve hata durumları (404, 405) yönetilir.
* **Asenkron Veri İletişimi:** `fetch` ve `async/await` mimarisiyle sunucudan veri çekilir, yüklenme ve hata durumları arayüzde görsel olarak bildirilir.

---

## 📁 Proje Dizin Yapısı

```text
bmh231-odev2/
├── public/
│   ├── index.html       # Semantik HTML5 iskeleti
│   ├── stil.css         # Responsive Grid ve Flexbox stilleri
│   └── betik.js         # DOM manipülasyonu, filtreleme ve fetch mimarisi
├── veri/
│   └── etkinlikler.json # Etkinlik veri seti (JSON formatında)
├── sunucu.js            # Node.js yerel HTTP ve JSON API sunucusu
├── .gitignore           # Git tarafından izlenmeyecek dosyalar
├── README.md            # Proje tanıtım ve çalıştırma belgesi
└── bmh231-odev2-rapor.docx # Ödev teslim ve analiz raporu