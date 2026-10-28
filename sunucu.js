const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const VERI_YOLU = path.join(__dirname, "etkinlikler.json");

// Dosya uzantılarına göre Content-Type eşleştirmesi
const MIME_TIPLERI = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon"
};

// Veriyi dosyadan senkron/güvenli okuma yardımcı fonksiyonu
function etkinlikleriOku() {
  const hamVeri = fs.readFileSync(VERI_YOLU, "utf-8");
  return JSON.parse(hamVeri);
}

const sunucu = http.createServer((req, res) => {
  // Gelen her isteği terminale yazdır (Ödev D1 kuralı)
  console.log(`[${new Date().toLocaleTimeString("tr-TR")}] ${req.method} ${req.url}`);

  // 1. Sadece GET metodunu kabul et; diğerlerine 405 dön
  if (req.method !== "GET") {
    res.writeHead(405, {
      "Content-Type": "text/plain; charset=utf-8",
      "Allow": "GET"
    });
    res.end("Yalnızca GET yöntemi desteklenmektedir.");
    return;
  }

  // URL çözümleme (sorgu parametreleri ve yol için)
  const ayrilmisUrl = new URL(req.url, `http://${req.headers.host}`);
  const yol = ayrilmisUrl.pathname;

  // 2. API Uç Noktaları
  if (yol.startsWith("/api/etkinlikler")) {
    const tumEtkinlikler = etkinlikleriOku();

    // Durum A: Tekil etkinlik getirme -> /api/etkinlikler/:id
    const idEslenmesi = yol.match(/^\/api\/etkinlikler\/(\d+)$/);
    if (idEslenmesi) {
      const id = parseInt(idEslenmesi[1], 10);
      const etkinlik = tumEtkinlikler.find(e => e.id === id);

      if (etkinlik) {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(etkinlik));
      } else {
        res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ hata: "Etkinlik bulunamadı" }));
      }
      return;
    }

    // Durum B: Liste veya türe göre süzme -> /api/etkinlikler veya /api/etkinlikler?tur=atolye
    if (yol === "/api/etkinlikler") {
      const turFiltresi = ayrilmisUrl.searchParams.get("tur");
      let sonuc = tumEtkinlikler;

      if (turFiltresi) {
        sonuc = tumEtkinlikler.filter(e => e.tur.toLowerCase() === turFiltresi.toLowerCase());
      }

      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(sonuc));
      return;
    }

    // Geçersiz API rotası
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Geçersiz API rotası.");
    return;
  }

  // 3. Statik Dosya Sunumu (public klasörü)
  let dosyaYolu;
  if (yol === "/" || yol === "/index.html") {
    dosyaYolu = path.join(PUBLIC_DIR, "index.html");
  } else {
    // Güvenlik denetimi: public dışına çıkılmasını engelle (Path Traversal önlemi)
    const normalizeYol = path.normalize(yol).replace(/^(\.\.[\/\\])+/, "");
    dosyaYolu = path.join(PUBLIC_DIR, normalizeYol);
  }

  // İstenen dosyanın gerçekten public klasörü altında olup olmadığını doğrula
  if (!dosyaYolu.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Erişim engellendi: Bu dizine erişim yetkiniz yok.");
    return;
  }

  // Dosyayı oku ve yanıtla
  fs.readFile(dosyaYolu, (hata, icerik) => {
    if (hata) {
      if (hata.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("404 Sayfa veya Dosya Bulunamadı.");
      } else {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("500 Sunucu Hatası.");
      }
      return;
    }

    const uzanti = path.extname(dosyaYolu).toLowerCase();
    const contentType = MIME_TIPLERI[uzanti] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(icerik);
  });
});

sunucu.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor...`);
});