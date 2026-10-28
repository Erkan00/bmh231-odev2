// Global Durum Değişkenleri
let tumEtkinlikler = [];
let aktifTur = "tumu";
let aktifAramaMetni = "";

// DOM Elemanları
const kartlarGrid = document.getElementById("kartlar-grid");
const aramaGirdisi = document.getElementById("arama-girdisi");
const filtreButonlari = document.querySelectorAll(".filtre-butonu");
const etkinlikFormu = document.getElementById("etkinlik-formu");
const formBildirim = document.getElementById("form-bildirim");

// D2: API'den Veri Çekme Fonksiyonu (async/await, try/catch, response.ok)
async function etkinlikleriYukle() {
  kartlarGrid.innerHTML = "";
  const yukleniyorYazisi = document.createElement("p");
  yukleniyorYazisi.className = "durum-iletisi";
  yukleniyorYazisi.textContent = "Etkinlikler yükleniyor, lütfen bekleyiniz...";
  kartlarGrid.append(yukleniyorYazisi);

  try {
    const yanit = await fetch("/api/etkinlikler");

    if (!yanit.ok) {
      throw new Error(`Sunucu yanıt hatası: ${yanit.status}`);
    }

    tumEtkinlikler = await yanit.json();
    kartlariFiltreleVeCiz();
  } catch (hata) {
    kartlarGrid.innerHTML = "";
    const hataYazisi = document.createElement("p");
    hataYazisi.className = "durum-iletisi";
    hataYazisi.textContent = "Etkinlikler yüklenirken bir sorun oluştu. Lütfen sunucunun çalıştığından emin olunuz.";
    kartlarGrid.append(hataYazisi);
    console.error("Etkinlik yükleme hatası:", hata);
  }
}

// C1: Tek Bir Kart Öğesi Oluşturma (createElement, textContent, append)
function kartOlustur(etkinlik) {
  const kart = document.createElement("article");
  kart.className = "etkinlik-karti";

  // Başlık
  const baslik = document.createElement("h2");
  baslik.className = "kart-baslik";
  baslik.textContent = etkinlik.baslik;

  // Detaylar Konteynırı
  const detaylar = document.createElement("div");
  detaylar.className = "kart-detaylar";

  // Tarih (Türkçe Yerelleştirme)
  const tarihSatir = document.createElement("p");
  tarihSatir.className = "kart-detay-satir";
  const etkinlikTarihi = new Date(etkinlik.tarih);
  tarihSatir.textContent = `📅 Tarih: ${etkinlikTarihi.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })}`;

  // Yer
  const yerSatir = document.createElement("p");
  yerSatir.className = "kart-detay-satir";
  yerSatir.textContent = `📍 Yer: ${etkinlik.yer}`;

  // Kontenjan
  const kontenjanSatir = document.createElement("p");
  kontenjanSatir.className = "kart-detay-satir";
  kontenjanSatir.textContent = `👥 Kontenjan: ${etkinlik.kontenjan} kişi`;

  detaylar.append(tarihSatir, yerSatir, kontenjanSatir);

  // Kart Alt Kısmı (Tür Rozeti)
  const altKisim = document.createElement("div");
  altKisim.className = "kart-alt";

  const turRozeti = document.createElement("span");
  turRozeti.className = `tur-rozeti tur-${etkinlik.tur}`;
  turRozeti.textContent = etkinlik.tur.toUpperCase();

  altKisim.append(turRozeti);

  // Kartı Birleştirme
  kart.append(baslik, detaylar, altKisim);
  return kart;
}

// C2: Filtre ve Arama Mantığı
function kartlariFiltreleVeCiz() {
  kartlarGrid.innerHTML = "";

  const filtrelenmis = tumEtkinlikler.filter(etkinlik => {
    const turUyumu = (aktifTur === "tumu") || (etkinlik.tur.toLowerCase() === aktifTur.toLowerCase());
    const aramaUyumu = etkinlik.baslik.toLowerCase().includes(aktifAramaMetni.toLowerCase());
    return turUyumu && aramaUyumu;
  });

  if (filtrelenmis.length === 0) {
    const bosMesaj = document.createElement("p");
    bosMesaj.className = "durum-iletisi";
    bosMesaj.textContent = "Aramanıza uygun etkinlik bulunamadı.";
    kartlarGrid.append(bosMesaj);
    return;
  }

  filtrelenmis.forEach(etkinlik => {
    const kartDugumu = kartOlustur(etkinlik);
    kartlarGrid.append(kartDugumu);
  });
}

// C2: Arama Kutusu Dinleyicisi
aramaGirdisi.addEventListener("input", (e) => {
  aktifAramaMetni = e.target.value.trim();
  kartlariFiltreleVeCiz();
});

// C2: Tür Filtreleme Düğmeleri Dinleyicisi
filtreButonlari.forEach(buton => {
  buton.addEventListener("click", () => {
    filtreButonlari.forEach(b => b.classList.remove("secili"));
    buton.classList.add("secili");
    aktifTur = buton.getAttribute("data-tur");
    kartlariFiltreleVeCiz();
  });
});

// C3: Form Doğrulama (preventDefault, textContent, hata kontrolü)
etkinlikFormu.addEventListener("submit", (e) => {
  e.preventDefault();

  const ad = document.getElementById("etkinlik-adi").value.trim();
  const tarihDegeri = document.getElementById("etkinlik-tarih").value;
  const eposta = document.getElementById("kullanici-eposta").value.trim();

  formBildirim.className = "form-bildirim";
  formBildirim.textContent = "";

  // 1. Ad Denetimi: En az 5 karakter
  if (ad.length < 5) {
    formBildirim.textContent = "Etkinlik adı en az 5 karakter uzunluğunda olmalıdır.";
    formBildirim.classList.add("hata");
    return;
  }

  // 2. Tarih Denetimi: Boş olamaz ve geçmiş gün seçilemez
  if (!tarihDegeri) {
    formBildirim.textContent = "Lütfen bir etkinlik tarihi seçiniz.";
    formBildirim.classList.add("hata");
    return;
  }

  const secilenTarih = new Date(tarihDegeri);
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);

  if (secilenTarih < bugun) {
    formBildirim.textContent = "Etkinlik tarihi geçmiş bir gün olamaz.";
    formBildirim.classList.add("hata");
    return;
  }

  // 3. E-posta Denetimi: Geçerli e-posta deseni
  const epostaRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!epostaRegEx.test(eposta)) {
    formBildirim.textContent = "Lütfen geçerli bir e-posta adresi giriniz.";
    formBildirim.classList.add("hata");
    return;
  }

  // Başarılı Durum
  formBildirim.textContent = "Teşekkürler! Etkinlik öneriniz başarıyla kaydedildi.";
  formBildirim.classList.add("basari");
  etkinlikFormu.reset();
});

// Sayfa yüklendiğinde etkinlikleri getir
document.addEventListener("DOMContentLoaded", etkinlikleriYukle);