document.addEventListener('DOMContentLoaded', () => {
  let tumEtkinlikler = [];
  let aktifTur = 'hepsi';

  const listeKapsayici = document.getElementById('etkinlik-listesi');
  const aramaInput = document.getElementById('arama-girdisi');
  const filtreButonlari = document.querySelectorAll('.filtre-btn');
  const form = document.getElementById('oneri-formu');
  const bildirimKutusu = document.getElementById('form-sonuc-mesaji');
  const yukleniyorKutusu = document.getElementById('yukleniyor-mesaji');

  async function verileriGetir() {
    if (yukleniyorKutusu) {
      yukleniyorKutusu.textContent = 'Etkinlikler yükleniyor, lütfen bekleyiniz...';
    }

    try {
      const yanit = await fetch('/api/etkinlikler');
      if (!yanit.ok) throw new Error('API Hatası');
      tumEtkinlikler = await yanit.json();
      if (yukleniyorKutusu) yukleniyorKutusu.textContent = '';
      kartlariYansit(tumEtkinlikler);
    } catch (hata) {
      if (yukleniyorKutusu) {
        yukleniyorKutusu.textContent = 'Etkinlikler yüklenirken bir sorun oluştu.';
      }
    }
  }

  function kartlariYansit(liste) {
    listeKapsayici.innerHTML = '';
    if (liste.length === 0) {
      listeKapsayici.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #5f6368; padding: 2rem;">Eşleşen etkinlik bulunamadı.</p>';
      return;
    }

    liste.forEach(item => {
      const kart = document.createElement('article');
      kart.className = 'etkinlik-karti';

      const baslik = document.createElement('h2');
      baslik.textContent = item.baslik;

      const detaylar = document.createElement('div');
      detaylar.className = 'kart-detaylar';

      const satirTarih = document.createElement('p');
      satirTarih.className = 'kart-satir';
      satirTarih.textContent = `📅 Tarih: ${item.tarih}`;

      const satirYer = document.createElement('p');
      satirYer.className = 'kart-satir';
      satirYer.textContent = `📍 Yer: ${item.yer}`;

      const satirKontenjan = document.createElement('p');
      satirKontenjan.className = 'kart-satir';
      satirKontenjan.textContent = `👥 Kontenjan: ${item.kontenjan} kişi`;

      detaylar.append(satirTarih, satirYer, satirKontenjan);

      const rozet = document.createElement('span');
      rozet.className = `rozet ${item.tur}`;
      rozet.textContent = item.tur.toUpperCase();

      kart.append(baslik, detaylar, rozet);
      listeKapsayici.appendChild(kart);
    });
  }

  function filtreUygula() {
    const metin = aramaInput.value.toLowerCase().trim();
    const filtrelenmis = tumEtkinlikler.filter(e => {
      const turEslesir = aktifTur === 'hepsi' || e.tur === aktifTur;
      const metinEslesir = e.baslik.toLowerCase().includes(metin) || e.yer.toLowerCase().includes(metin);
      return turEslesir && metinEslesir;
    });
    kartlariYansit(filtrelenmis);
  }

  aramaInput.addEventListener('input', filtreUygula);

  filtreButonlari.forEach(btn => {
    btn.addEventListener('click', () => {
      filtreButonlari.forEach(b => b.classList.remove('aktif'));
      btn.classList.add('aktif');
      aktifTur = btn.getAttribute('data-tur');
      filtreUygula();
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const baslik = document.getElementById('oneri-baslik').value.trim();
    const tur = document.getElementById('oneri-tur').value;
    const tarih = document.getElementById('oneri-tarih').value;
    const yer = document.getElementById('oneri-yer').value.trim();

    if (!baslik || !tur || !tarih || !yer) {
      bildirimKutusu.className = 'bildirim-alani hata';
      bildirimKutusu.textContent = 'Lütfen tüm zorunlu (*) alanları doldurunuz.';
      return;
    }

    bildirimKutusu.className = 'bildirim-alani basarili';
    bildirimKutusu.textContent = 'Öneriniz başarıyla kaydedildi!';
    form.reset();
  });

  verileriGetir();
});