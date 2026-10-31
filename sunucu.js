
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_FILE = path.join(__dirname, 'data', 'etkinlikler.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

const sunucu = http.createServer((req, res) => {
  // Uçbirime istek yöntemi ve yolunu loglama
  console.log(`[${new Date().toLocaleTimeString('tr-TR')}] ${req.method} ${req.url}`);

  // GET dışındaki yöntemler için 405 Method Not Allowed
  if (req.method !== 'GET') {
    res.writeHead(405, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Allow': 'GET'
    });
    return res.end('405 Yönteme İzin Verilmedi (Method Not Allowed)');
  }

  // Güvenli URL ayrıştırma
  const host = req.headers.host || 'localhost:3000';
  const baseURL = `http://${host}`;
  const parsedUrl = new URL(req.url, baseURL);
  const pathname = parsedUrl.pathname;

  // 1. /api/etkinlikler (Filtreleme desteği ile)
  if (pathname === '/api/etkinlikler') {
    fs.readFile(DATA_FILE, 'utf8', (err, veri) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ hata: 'Veri dosyası okunamadı' }));
      }

      let etkinlikler = JSON.parse(veri);
      const turFiltresi = parsedUrl.searchParams.get('tur');

      if (turFiltresi) {
        etkinlikler = etkinlikler.filter(e => e.tur.toLowerCase() === turFiltresi.toLowerCase());
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(etkinlikler));
    });
    return;
  }

  // 2. /api/etkinlikler/:id
  if (pathname.startsWith('/api/etkinlikler/')) {
    const parcalar = pathname.split('/');
    const idStr = parcalar[3];
    const arananId = parseInt(idStr, 10);

    fs.readFile(DATA_FILE, 'utf8', (err, veri) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ hata: 'Veri dosyası okunamadı' }));
      }

      const etkinlikler = JSON.parse(veri);
      const bulunan = etkinlikler.find(e => e.id === arananId);

      if (bulunan) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(bulunan));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ hata: 'Etkinlik bulunamadı' }));
      }
    });
    return;
  }

  // 3. Statik Dosyalar (Yalnızca public/ altındakiler)
  let guvenliYol = pathname === '/' ? 'index.html' : pathname;
  const hedefDosya = path.normalize(path.join(PUBLIC_DIR, guvenliYol));

  // Path Traversal güvenlik kontrolü
  if (!hedefDosya.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Erişim Engellendi');
  }

  const uzanti = path.extname(hedefDosya).toLowerCase();
  const icerikTuru = MIME_TYPES[uzanti] || 'application/octet-stream';

  fs.readFile(hedefDosya, (err, icerik) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Bulunamadı');
    } else {
      res.writeHead(200, { 'Content-Type': icerikTuru });
      res.end(icerik);
    }
  });
});

sunucu.listen(PORT, '0.0.0.0', () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});