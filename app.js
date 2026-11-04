/* Meryem'in Kitabı — okuyucu. Veri: veri.js (window.KITAP), araclar/site_kur.py üretir. */
(() => {
const K = window.KITAP;
const $ = (s, e = document) => e.querySelector(s);
const HAREKE = /[ً-ْٰ]/g;
const HARF = ["أ", "ب", "ج", "د"];
const SINIF_AD = { yeni: "Yeni kelime", bicim: "Bilinen kelimenin yeni biçimi", bilinen: "Bilinen kelime", ad: "Kişi adı" };
const TUR_AD = { fiil: "fiil", isim: "isim", edat: "edat", zamir: "zamir", ifade: "kalıp ifade", ad: "kişi adı" };

/* ---------- durum ---------- */
const ANAHTAR = "meryem-kitap-v1";
const durum = (() => {
  let d = {};
  try { d = JSON.parse(localStorage.getItem(ANAHTAR) || "{}"); } catch (e) { d = {}; }
  d.ayar = Object.assign({ hareke: true, turkce: true, renk: true, olcek: 1 }, d.ayar || {});
  d.kelimeler = d.kelimeler || [];
  d.ilerleme = d.ilerleme || {};
  d.yazi = d.yazi || {};
  return d;
})();
function kaydet() { try { localStorage.setItem(ANAHTAR, JSON.stringify(durum)); } catch (e) {} }
const yaz = s => durum.ayar.hareke ? s : s.replace(HAREKE, "");
function ayarUygula() {
  document.documentElement.style.setProperty("--olcek", durum.ayar.olcek);
  document.body.classList.toggle("renksiz", !durum.ayar.renk);
}

/* ---------- yardımcılar ---------- */
const kacis = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function tohum(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }
function karistir(arr, anahtar) { const r = tohum(anahtar); const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const IKON = {
  geri: '<svg class="simge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  ileri: '<svg class="simge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
  ev: '<svg class="simge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  ayar: '<svg class="simge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
  yildiz: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>',
  kelime: '<svg class="simge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  resim: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 9"/></svg>',
  dokun: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5a2 2 0 1 1 4 0v5"/><path d="M13 10a2 2 0 1 1 4 0v1a2 2 0 1 1 4 0v4a6 6 0 0 1-6 6h-1a7 7 0 0 1-6-3l-3-5a2 2 0 0 1 3-2l1 1"/></svg>',
  kok: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v8M12 11l-6 5M12 11l6 5M12 11v10"/><circle cx="6" cy="17" r="2"/><circle cx="18" cy="17" r="2"/></svg>',
  oyun: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="12" rx="4"/><path d="M8 11v4M6 13h4"/><circle cx="16" cy="12" r="1"/><circle cx="18" cy="14" r="1"/></svg>',
  hilal: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>'
};
const yildizHtml = (n, top = 3) => `<span class="yildizlar">${Array.from({ length: top }, (_, i) => `<span class="${i < n ? "dolu" : ""}">${IKON.yildiz}</span>`).join("")}</span>`;
const resimYolu = ad => ad ? `img/${ad}.jpg` : null;

/* kelime zinciri: metni noktalamasıyla koruyarak sar */
function kelimeHtml(metin, toks) {
  let kalan = metin, out = "";
  for (const t of toks) {
    const i = kalan.indexOf(t.t);
    if (i > 0) out += kacis(yaz(kalan.slice(0, i)));
    out += `<span class="k ${t.c || ""}" tabindex="0" role="button" data-g="${kacis(t.g)}" data-on="${kacis(t.on || "")}" data-t="${kacis(t.t)}" data-c="${t.c || "bilinen"}">${kacis(yaz(t.t))}</span>`;
    kalan = kalan.slice(i + t.t.length);
  }
  return out + kacis(yaz(kalan));
}
const satirHtml = s => `<div class="satir">${s.konusan ? `<span class="konusan">${kacis(yaz(s.konusan))}:</span>` : ""}${kelimeHtml(s.metin, s.toks)}</div>`;
const metinHtml = o => o.toks ? kelimeHtml(o.metin, o.toks) : kacis(yaz(o.metin));

/* ---------- üst çubuk ---------- */
function ustCubuk(alt) {
  return `<div class="cini"></div><header class="ust"><div class="ic">
    <a class="marka" href="#/"><svg class="rozet-yildiz" viewBox="0 0 40 40"><path fill="var(--turkuaz)" d="M20 2l5.3 7.2 8.8-1.5-1.5 8.8L40 20l-7.4 3.5 1.5 8.8-8.8-1.5L20 38l-5.3-7.2-8.8 1.5 1.5-8.8L0 20l7.4-3.5-1.5-8.8 8.8 1.5z"/><path fill="var(--altin)" d="M20 9l3 4 5-.8-.8 5L31 20l-3.8 2.8.8 5-5-.8-3 4-3-4-5 .8.8-5L9 20l3.8-2.8-.8-5 5 .8z"/></svg><span class="ar">كِتاب مَرْيَم</span><small>${kacis(alt || "Meryem'in Kitabı · Arapça A1")}</small></a>
    <span class="bosluk"></span>
    <a class="dugme kucuk" href="#/kelimelerim" title="Kelimelerim">${IKON.kelime}<span class="sayac">${durum.kelimeler.length}</span></a>
    <button class="dugme yuvarlak" id="ayar-ac" aria-label="Ayarlar" aria-expanded="false">${IKON.ayar}</button>
  </div></header>`;
}
function ayarPanel() {
  const a = durum.ayar;
  const anah = (k, ad) => `<div class="ayar"><span>${ad}</span><button class="anahtar" role="switch" aria-checked="${a[k]}" data-ayar="${k}" aria-label="${ad}"></button></div>`;
  return `<div class="ayar-panel" id="ayar-panel" role="dialog" aria-label="Ayarlar">
    ${anah("hareke", "Harekeler")}${anah("turkce", "Türkçe anlam")}${anah("renk", "Yeni kelimeleri renklendir")}
    <div class="ayar"><span>Yazı boyutu</span><span class="boyut">${[0.85, 1, 1.2].map((o, i) => `<button class="dugme kucuk" data-olcek="${o}" aria-pressed="${a.olcek == o}">${["A−", "A", "A+"][i]}</button>`).join("")}</span></div>
  </div>`;
}

/* ---------- sayfalar ---------- */
const kok = () => $("#uygulama");
function goster(html) { kok().innerHTML = html; window.scrollTo(0, 0); }

function anaSayfa() {
  const H = K.hikayeler;
  const devam = (() => { for (const h of H) { const p = durum.ilerleme[h.no]; if (!p || !p.bitti) return h.no; } return 1; })();
  goster(`${ustCubuk()}
  <section class="kahraman"><img src="${resimYolu(K.kapak)}" alt="Meryem kitabına sarılıyor, arkasında kardeşi Yusuf">
    <div class="ortu"></div>
    <div class="yazi"><div class="ic">
      <span class="seviye">A1 · ÜÇ HİKÂYE · ARAPÇA</span>
      <h1>كِتاب مَرْيَم</h1><p>Meryem'in Kitabı</p>
      <p class="alt">Meryem'in kitabı kayboldu. Sabah evde, okulda ve akşam yine evde onu arıyoruz. Resimlere ve kelimelere dokun, Arapçayı hikâyenin içinden öğren.</p>
      <div class="dugmeler"><a class="dugme altin" href="#/h/${devam}">${durum.ilerleme[1] ? "Okumaya devam et" : "Okumaya başla"} ${IKON.ileri}</a><a class="dugme" href="#/kadro">Kadroyla tanış</a><a class="dugme" href="#/sozluk">Resimli sözlük</a></div>
    </div></div>
  </section>
  <main class="ic">
    <section class="bolum"><h2>Üç hikâye, bir kayıp kitap</h2><p class="aciklama">Her hikâye bir öncekinin kelimeleriyle yazıldı. Yeni kelime çok az ve hep resimle geliyor.</p>
      <div class="hikaye-kartlar">${H.map(h => {
        const p = durum.ilerleme[h.no] || {};
        return `<button class="hk" data-git="#/h/${h.no}"><div class="gorsel"><img src="${resimYolu(h.sayfalar[0].resim)}" alt="" loading="lazy"><span class="no">HİKÂYE ${h.no} · ${h.vakit_tr}</span></div>
        <div class="govde"><div class="baslik">${kacis(yaz(h.baslik))}</div><div class="baslik-tr">${kacis(h.baslik_tr)}</div>
        <div class="alt-satir">${yildizHtml(p.yildiz || 0)}<span class="dugme kucuk">${p.bitti ? "Yeniden oku" : "Oku"} ${IKON.ileri}</span></div></div></button>`;
      }).join("")}</div>
    </section>
    <section class="bolum"><h2>Kadro</h2><p class="aciklama">Meryem, ailesi ve okul arkadaşları. Karta dokun, Arapça adını oku.</p>
      <div class="kadro-serit">${K.kadro.map(k => `<button class="kisi" data-git="#/kadro"><img src="${resimYolu(k.resim)}" alt="" loading="lazy"><div class="ar">${kacis(yaz(k.ad))}</div></button>`).join("")}</div>
    </section>
    <section class="bolum"><h2>Her sayfada</h2>
      <div class="ozellikler">
        <div class="oz"><div class="ikon">${IKON.resim}</div><h3>Resimli sayfalar</h3><p>Her sayfa bir sahne. Resimdeki noktalara dokun, nesnenin Arapçasını gör.</p></div>
        <div class="oz"><div class="ikon">${IKON.dokun}</div><h3>Dokun, anla</h3><p>Her kelimenin resmi, anlamı ve kitaptaki yeri bir dokunuşta.</p></div>
        <div class="oz"><div class="ikon">${IKON.kok}</div><h3>Kök ailesi</h3><p>مَدْرَسَة ile دَرْس aynı kökten. Kelimeler ailesiyle birlikte öğrenilir.</p></div>
        <div class="oz"><div class="ikon">${IKON.oyun}</div><h3>Hikâyeden sonra</h3><p>Sorular, resim–cümle eşleştirme, resmi bul ve cümle kur.</p></div>
      </div>
    </section>
  </main>
  ${altBilgi()}`);
}
const altBilgi = () => `<footer class="alt-bilgi">كِتاب مَرْيَم · Meryem'in Kitabı · deneme sürümü, ${K.tarih}<br>Arapça metin taslaktır, redaktör okumasından geçmedi. Resimler yapay zekâ ile üretilmiştir.</footer>`;

function kadroSayfa() {
  goster(`${ustCubuk("Kadro")}<main class="ic"><section class="bolum"><h2>Kadro</h2><p class="aciklama">Meryem bizi ailesiyle ve arkadaşlarıyla tanıştırıyor. Kelimelere dokun.</p>
    <div class="hikaye-kartlar">${K.kadro.map(k => `<div class="hk" style="cursor:default"><div class="gorsel" style="aspect-ratio:300/340;background:#F4EEE3"><img src="${resimYolu(k.resim)}" alt="" style="object-fit:contain"></div>
      <div class="govde"><div class="satir" style="border:0">${metinHtml(k.cumle)}</div><div class="baslik-tr">${kacis(k.tr)}</div></div></div>`).join("")}</div>
    <p style="margin-top:28px"><a class="dugme ana" href="#/h/1">Birinci hikâyeye başla ${IKON.ileri}</a></p></section></main>${altBilgi()}`);
}

function tahminSayfa(n) {
  const h = K.hikayeler[n - 1], t = h.tahmin;
  const secili = (durum.ilerleme[n] || {}).tahmin;
  goster(`${ustCubuk(h.baslik_tr)}<main class="ic"><div class="tahmin">
    <span class="etiket">HİKÂYE ${n} · OKUMADAN ÖNCE TAHMİN ET</span>
    <h2>${metinHtml(t.soru)}</h2><p>Doğru ya da yanlış yok. Tahminini seç, cevabı hikâyede bul.</p>
    <div class="secim-izgara">${t.secenekler.map((s, i) => `<button class="secim ${secili === i ? "secildi" : ""}" data-tahmin="${i}">${s.resim ? `<img src="${resimYolu(s.resim)}" alt="">` : ""}<span class="ar">${kacis(yaz(s.metin.metin))}</span></button>`).join("")}</div>
    <p style="margin-top:24px"><a class="dugme ana" href="#/h/${n}/s/1">Hikâyeyi aç ${IKON.ileri}</a></p>
  </div></main>`);
}

function okuyucuSayfa(n, si) {
  const h = K.hikayeler[n - 1], S = h.sayfalar, s = S[si - 1];
  if (!s) { location.hash = `#/h/${n}/etkinlik/1`; return; }
  const p = durum.ilerleme[n] = durum.ilerleme[n] || {};
  p.sayfa = Math.max(p.sayfa || 0, si); kaydet();
  goster(`${ustCubuk(`Hikâye ${n} · ${h.baslik_tr}`)}
  <main class="ic okuyucu">
    <div class="serit"><span class="ar">${kacis(yaz(h.baslik))}</span><div class="noktalar-ilerleme" aria-label="Sayfa ${si} / ${S.length}">${S.map((_, i) => `<span class="${i + 1 < si ? "gecti" : i + 1 === si ? "simdi" : ""}"></span>`).join("")}</div></div>
    <div class="sayfa">
      <div class="sahne"><img src="${resimYolu(s.resim)}" alt="${kacis(s.alt || "")}">
        ${s.noktalar.map(nk => `<button class="nokta" style="left:${nk.x}%;top:${nk.y}%" data-nokta="${kacis(nk.b)}" aria-label="Resimdeki nesne"></button>`).join("")}
        ${s.noktalar.length ? `<span class="nokta-ipucu">Noktalara dokun</span>` : ""}
      </div>
      <div class="metin-kart">${s.satirlar.map(satirHtml).join("")}</div>
    </div>
  </main>
  <nav class="sayfa-gezgin"><div class="ic">
    <a class="dugme" href="${si > 1 ? `#/h/${n}/s/${si - 1}` : `#/h/${n}`}">${IKON.geri} Önceki</a>
    <span class="orta">Sayfa ${si} / ${S.length}</span>
    <a class="dugme ana" href="${si < S.length ? `#/h/${n}/s/${si + 1}` : `#/h/${n}/etkinlik/1`}">${si < S.length ? "Sonraki" : "Etkinliklere geç"} ${IKON.ileri}</a>
  </div></nav>`);
}

/* ---------- etkinlikler ---------- */
const ADIMLAR = ["sorular", "eslestir", "kelime", "insa", "yaz"];
const ADIM_AD = { sorular: "Anlama", eslestir: "Resim ve cümle", kelime: "Resmi bul", insa: "Cümle kur", yaz: "Sıra sende" };
let etk = null; // geçici durum

function etkinlikSayfa(n, ai) {
  const h = K.hikayeler[n - 1], E = h.etkinlik, adim = ADIMLAR[ai - 1];
  if (!adim) { sonucSayfa(n); return; }
  if (!etk || etk.n !== n || etk.ai !== ai) etk = { n, ai, tur: 0, ilk: true, puan: 0, toplam: 0 };
  const p = durum.ilerleme[n] = durum.ilerleme[n] || {};
  p.puan = p.puan || {};
  const ust = `<div class="etk-ust"><a class="dugme kucuk" href="#/h/${n}/s/${h.sayfalar.length}">${IKON.geri} Hikâye</a><span class="adim">${ai} / ${ADIMLAR.length} · ${ADIM_AD[adim]}</span><div class="cubuk"><i style="width:${(ai - 1) / ADIMLAR.length * 100}%"></i></div></div>`;
  let govde = "";
  if (adim === "sorular") {
    const q = h.sorular[etk.tur];
    govde = `<div class="yonerge"><span class="no">١</span>${metinHtml(K.yonerge.oku_sec)}</div><p class="yardim">Oku ve doğru cevabı seç. (Soru ${etk.tur + 1} / ${h.sorular.length})</p>
      <div class="soru-ar">${metinHtml(q.soru)}</div>
      <div class="secenekler">${q.secenekler.map((o, i) => `<button class="secenek" data-cevap="${i}"><span class="h">${HARF[i]}</span><span>${metinHtml(o)}</span></button>`).join("")}</div>`;
  } else if (adim === "eslestir") {
    const e = E.eslestir[etk.tur];
    const sec = karistir([e.dogru, ...e.celdirici], n + "-" + etk.tur);
    govde = `<div class="yonerge"><span class="no">٢</span>${metinHtml(K.yonerge.oku_sec)}</div><p class="yardim">Resme uyan cümleyi seç. (${etk.tur + 1} / ${E.eslestir.length})</p>
      <div class="esles-resim"><img src="${resimYolu(e.resim)}" alt=""></div>
      <div class="secenekler">${sec.map((o, i) => `<button class="secenek" data-cevap="${o === e.dogru ? "d" : "y"}"><span class="h">${HARF[i]}</span><span>${metinHtml(o)}</span></button>`).join("")}</div>`;
  } else if (adim === "kelime") {
    const liste = E.kelime, m = liste[etk.tur];
    const diger = karistir(liste.filter(x => x.m !== m.m), "k" + n + etk.tur).slice(0, 3);
    const sec = karistir([m, ...diger], "s" + n + etk.tur);
    govde = `<div class="yonerge"><span class="no">٣</span>${metinHtml(K.yonerge.oku_sec)}</div><p class="yardim">Kelimeyi oku, resmini bul. (${etk.tur + 1} / ${liste.length})</p>
      <div class="kelime-sor">${kacis(yaz(m.m))}</div>
      <div class="resim-secenek">${sec.map(o => `<button data-cevap="${o.m === m.m ? "d" : "y"}" aria-label="resim"><img src="${resimYolu(o.resim)}" alt=""></button>`).join("")}</div>`;
  } else if (adim === "insa") {
    const c = E.insa[etk.tur];
    etk.secilen = etk.secilen || [];
    const kalan = karistir(c.parcalar.map((x, i) => ({ x, i })), "i" + n + etk.tur).filter(o => !etk.secilen.includes(o.i));
    govde = `<div class="yonerge"><span class="no">٤</span>${metinHtml(K.yonerge.kur)}</div><p class="yardim">Kartlara sırayla dokun, hikâyedeki cümleyi kur. Yanlış kartı geri almak için üstteki karta dokun. (${etk.tur + 1} / ${E.insa.length})</p>
      <div class="insa-hedef" id="insa-hedef">${etk.secilen.map(i => `<button class="kartcik" data-geri="${i}">${kacis(yaz(c.parcalar[i]))}</button>`).join("")}</div>
      <div class="insa-kartlar">${kalan.map(o => `<button class="kartcik" data-kart="${o.i}">${kacis(yaz(o.x))}</button>`).join("")}</div>`;
  } else if (adim === "yaz") {
    const ss = h.sira_sende;
    govde = `<div class="yonerge"><span class="no">٥</span>${metinHtml(ss.yonerge)}</div><p class="yardim">${kacis(ss.tr_not)}</p>
      <div class="kalip">${kacis(yaz(ss.kalip))}</div>
      <textarea class="yaz" id="yazi" dir="rtl" lang="ar" placeholder="…">${kacis(durum.yazi[n] || "")}</textarea>
      <p class="yardim">Yazdığın yalnız bu cihazda saklanır. Öğretmenine göstermek için ekranı açık tut.</p>`;
  }
  const altDugme = adim === "yaz" ? `<button class="dugme ana" id="bitir">Bitir ${IKON.ileri}</button>` : (adim === "insa" ? `<button class="dugme" id="insa-sil">Baştan</button><button class="dugme ana" id="insa-kontrol">Kontrol et</button>` : "");
  goster(`${ustCubuk(`Hikâye ${n} · ${h.baslik_tr}`)}<main class="ic"><div class="etk">${ust}${govde}<div class="geri-bildirim" id="gb" aria-live="polite"></div><div class="etk-alt">${altDugme}</div></div></main>`);
}
function turBitti(dogruMu) {
  const n = etk.n, ai = etk.ai, h = K.hikayeler[n - 1], adim = ADIMLAR[ai - 1];
  const sayi = { sorular: h.sorular.length, eslestir: h.etkinlik.eslestir.length, kelime: h.etkinlik.kelime.length, insa: h.etkinlik.insa.length }[adim];
  if (etk.ilk) { etk.toplam++; if (dogruMu) etk.puan++; }
  if (!dogruMu) { etk.ilk = false; return; }
  const gb = $("#gb"); gb.className = "geri-bildirim iyi"; gb.textContent = ["Aferin!", "Çok güzel!", "Doğru!", "Harika!"][etk.tur % 4];
  setTimeout(() => {
    const p = durum.ilerleme[n];
    if (etk.tur + 1 < sayi) { etk.tur++; etk.ilk = true; etk.secilen = []; etkinlikSayfa(n, ai); }
    else { p.puan[adim] = [etk.puan, etk.toplam]; kaydet(); const nx = ai + 1; etk = null; location.hash = `#/h/${n}/etkinlik/${nx}`; }
  }, 750);
}

function sonucSayfa(n) {
  const h = K.hikayeler[n - 1], p = durum.ilerleme[n] = durum.ilerleme[n] || {};
  let d = 0, t = 0; Object.values(p.puan || {}).forEach(([a, b]) => { d += a; t += b; });
  const oran = t ? d / t : 1, yildiz = oran >= .9 ? 3 : oran >= .7 ? 2 : 1;
  p.bitti = true; p.yildiz = Math.max(p.yildiz || 0, yildiz); kaydet();
  const yeni = h.yeni_maddeler;
  const tahminNot = K.hikayeler.filter(x => x.tahmin.cevap_hikaye === n && (durum.ilerleme[x.no] || {}).tahmin != null).map(x => {
    const secim = durum.ilerleme[x.no].tahmin, dogru = x.tahmin.dogru;
    const on = x.no === n ? "Okumadan önceki tahminin" : `${x.no}. hikâyedeki tahminin`;
    return secim === dogru ? `${on} doğru çıktı!` : `${on} tutmadı: doğru cevap «${yaz(x.tahmin.secenekler[dogru].metin.metin)}».`;
  }).join(" ");
  goster(`${ustCubuk(`Hikâye ${n} · ${h.baslik_tr}`)}<main class="ic"><div class="sonuc">
    <div class="buyuk-yildiz">${Array.from({ length: 3 }, (_, i) => `<span class="${i < yildiz ? "dolu" : ""}">${IKON.yildiz}</span>`).join("")}</div>
    <h2>${yildiz === 3 ? "Mükemmel!" : yildiz === 2 ? "Çok iyi!" : "Bitirdin!"}</h2>
    <p class="aciklama" style="margin:0 auto 6px">İlk denemede ${d} / ${t} doğru. ${tahminNot}</p>
    ${yeni.length ? `<h3 style="margin:26px 0 10px">Bu hikâyenin yeni kelimeleri</h3><div class="kelime-izgara">${yeni.map(kelimeKutu).join("")}</div>
    <p style="margin-top:14px"><button class="dugme" id="hepsini-ekle">${IKON.kelime} Hepsini kelimelerime ekle</button></p>` : ""}
    <p style="margin-top:28px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">${n < K.hikayeler.length ? `<a class="dugme ana" href="#/h/${n + 1}">Sonraki hikâye ${IKON.ileri}</a>` : `<a class="dugme ana" href="#/kelimelerim">Kelimelerime bak</a>`}<a class="dugme" href="#/">${IKON.ev} Kitabın başı</a></p>
  </div></main>`);
  if (yildiz === 3) konfeti();
}
function konfeti() {
  const k = document.createElement("div"); k.className = "konfeti";
  const renk = ["#12858A", "#C8962E", "#C2533F", "#5B5F97", "#2E8B57"];
  for (let i = 0; i < 60; i++) { const e = document.createElement("i"); e.style.left = (i * 37 % 100) + "%"; e.style.background = renk[i % 5]; e.style.animationDelay = (i % 12) * 0.07 + "s"; k.appendChild(e); }
  document.body.appendChild(k); setTimeout(() => k.remove(), 2600);
}

/* ---------- kelimeler ---------- */
function kelimeKutu(m) {
  const md = K.maddeler[m], r = K.resim[m], yeni = md.sinif === "yeni";
  return `<button class="ks" data-madde="${kacis(m)}">${yeni ? `<span class="yeni-etiket">yeni</span>` : ""}${r ? `<img src="${resimYolu(r.ad)}" alt="" loading="lazy">` : `<div class="yok">${kacis(yaz(m)).slice(0, 2)}</div>`}<div class="ar">${kacis(yaz(m))}</div>${durum.ayar.turkce ? `<div class="tr">${kacis(md.tr)}</div>` : ""}</button>`;
}
function kelimelerimSayfa() {
  const L = durum.kelimeler.filter(m => K.maddeler[m]);
  goster(`${ustCubuk("Kelimelerim")}<main class="ic"><section class="bolum"><h2>Kelimelerim</h2>
    <p class="aciklama">Kelime kartındaki yıldıza dokunduğun kelimeler burada birikir. Bu cihazda saklanır.</p>
    ${L.length ? `<div class="kelime-izgara">${L.map(kelimeKutu).join("")}</div>` : `<p>Henüz kelime eklemedin. Hikâyede bir kelimeye dokun, kartta <b>Kelimelerime ekle</b> düğmesine bas.</p>`}
    <p style="margin-top:24px"><a class="dugme" href="#/sozluk">Resimli sözlüğün tamamı</a></p></section></main>${altBilgi()}`);
}
let sozlukFiltre = "hepsi";
function sozlukSayfa() {
  const tum = Object.keys(K.maddeler).filter(m => K.maddeler[m].sinif !== "ad" && !K.maddeler[m].eslik);
  const f = { hepsi: () => true, resimli: m => K.resim[m], yeni: m => K.maddeler[m].sinif === "yeni", fiil: m => K.maddeler[m].tur === "fiil", isim: m => K.maddeler[m].tur === "isim" };
  const L = tum.filter(f[sozlukFiltre]);
  const fd = (k, ad) => `<button class="dugme kucuk" data-filtre="${k}" aria-pressed="${sozlukFiltre === k}">${ad}</button>`;
  goster(`${ustCubuk("Resimli sözlük")}<main class="ic"><section class="bolum"><h2>Resimli sözlük</h2>
    <p class="aciklama">Kitaptaki bütün kelimeler. Karta dokun: anlamı, kökü ve aynı kökten kelimeler açılır.</p>
    <div class="filtre">${fd("hepsi", "Hepsi")}${fd("resimli", "Resimli")}${fd("yeni", "Yeni kelimeler")}${fd("isim", "İsimler")}${fd("fiil", "Fiiller")}</div>
    <div class="kelime-izgara">${L.map(kelimeKutu).join("")}</div></section></main>${altBilgi()}`);
}

/* ---------- kelime kartı ---------- */
let kartEl, perdeEl, seciliK = null, sonKart = null;
function kartAc(arg) {
  sonKart = arg;
  const { g, on, t, c, madde } = arg;
  const b = g ? K.bicimler[g] : null, m = madde || b.l, md = K.maddeler[m];
  const r = K.resim[m];
  const anlam = (b && b.tr) || md.tr;
  const aile = md.kok ? Object.entries(K.maddeler).filter(([x, v]) => v.kok === md.kok && x !== m && !v.eslik) : [];
  const ekli = durum.kelimeler.includes(m);
  const sinif = c || (md.sinif === "yeni" ? "yeni" : md.sinif === "ad" ? "ad" : "bilinen");
  kartEl.innerHTML = `${r ? `<div class="kk-resim ${r.sahne ? "sahne-resmi" : ""}"><img src="${resimYolu(r.ad)}" alt="">${r.sahne ? `<span class="kaynak">hikâyeden</span>` : ""}</div>` : ""}
    <div class="kk-govde"><div class="kk-ust"><div style="flex:1"><div class="kk-soz">${kacis(yaz(t || m))}</div>
      ${durum.ayar.turkce ? `<div class="kk-anlam">${on ? kacis(K.onek[on]) + " + " : ""}${kacis(anlam)}</div>` : `<div class="kk-bilgi">Türkçe anlam ayarlardan kapalı.</div>`}
      <span class="etiket ${sinif}">${SINIF_AD[sinif]}</span></div>
      <button class="dugme yuvarlak" id="kart-kapat" aria-label="Kapat">✕</button></div>
    ${t && yaz(t) !== yaz(m) ? `<div class="kk-bilgi">Sözlükte: <b class="ar" style="font-size:22px">${kacis(yaz(m))}</b>${durum.ayar.turkce ? ` · ${kacis(md.tr)}` : ""}</div>` : ""}
    <div class="kk-bilgi">${TUR_AD[md.tur] || md.tur}${md.kok ? ` · kök <b class="ar" style="font-size:21px">${kacis(md.kok.split("").join(" "))}</b>` : ""} · ${kacis(K.kaynak[m])}</div>
    ${aile.length ? `<div class="kk-bilgi">Aynı kökten:</div><div class="kk-aile">${aile.map(([x, v]) => `<button data-madde="${kacis(x)}">${kacis(yaz(x))}${durum.ayar.turkce ? `<small>${kacis(v.tr)}</small>` : ""}</button>`).join("")}</div>` : ""}
    <div class="kk-dugmeler"><button class="dugme ${ekli ? "" : "ana"}" id="kelime-ekle" data-madde="${kacis(m)}">${IKON.kelime} ${ekli ? "Kelimelerimde" : "Kelimelerime ekle"}</button></div></div>`;
  kartEl.classList.add("acik"); perdeEl.classList.add("acik");
}
function kartKapat() { kartEl.classList.remove("acik"); perdeEl.classList.remove("acik"); if (seciliK) seciliK.classList.remove("secili"); seciliK = null; }

/* ---------- olaylar ---------- */
document.addEventListener("click", e => {
  const T = e.target;
  const git = T.closest("[data-git]"); if (git) { location.hash = git.dataset.git; return; }
  const k = T.closest(".k[data-g]");
  if (k) { if (seciliK) seciliK.classList.remove("secili"); seciliK = k; k.classList.add("secili"); kartAc(k.dataset); return; }
  const nk = T.closest("[data-nokta]");
  if (nk) { const g = nk.dataset.nokta; kartAc({ g, t: g }); return; }
  const md = T.closest("[data-madde]");
  if (md && md.id !== "kelime-ekle") { kartAc({ madde: md.dataset.madde }); return; }
  if (T.closest("#kelime-ekle")) {
    const m = T.closest("#kelime-ekle").dataset.madde, i = durum.kelimeler.indexOf(m);
    if (i < 0) durum.kelimeler.push(m); else durum.kelimeler.splice(i, 1);
    kaydet(); kartAc(sonKart || { madde: m });
    document.querySelectorAll(".sayac").forEach(s => s.textContent = durum.kelimeler.length); return;
  }
  if (T.closest("#kart-kapat") || T === perdeEl) { kartKapat(); return; }
  if (T.closest("#ayar-ac")) { const p = $("#ayar-panel"); if (p) p.remove(); else { $(".ust .ic").insertAdjacentHTML("beforeend", ayarPanel()); $("#ayar-ac").setAttribute("aria-expanded", "true"); } return; }
  const an = T.closest("[data-ayar]");
  if (an) { const a = an.dataset.ayar; durum.ayar[a] = !durum.ayar[a]; kaydet(); ayarUygula(); yonlendir(true); return; }
  const ol = T.closest("[data-olcek]");
  if (ol) { durum.ayar.olcek = +ol.dataset.olcek; kaydet(); ayarUygula(); yonlendir(true); return; }
  if (!T.closest("#ayar-panel") && $("#ayar-panel")) $("#ayar-panel").remove();
  const th = T.closest("[data-tahmin]");
  if (th) { const n = +location.hash.split("/")[2]; const p = durum.ilerleme[n] = durum.ilerleme[n] || {}; p.tahmin = +th.dataset.tahmin; kaydet(); document.querySelectorAll(".secim").forEach(s => s.classList.toggle("secildi", s === th)); return; }
  const cv = T.closest("[data-cevap]");
  if (cv && etk) {
    if (cv.classList.contains("dogru") || cv.disabled) return;
    const adim = ADIMLAR[etk.ai - 1], h = K.hikayeler[etk.n - 1];
    const dogru = adim === "sorular" ? +cv.dataset.cevap === h.sorular[etk.tur].dogru : cv.dataset.cevap === "d";
    cv.classList.add(dogru ? "dogru" : "yanlis");
    if (!dogru) { cv.disabled = true; const gb = $("#gb"); gb.className = "geri-bildirim kotu"; gb.textContent = "Bir daha dene."; }
    else document.querySelectorAll("[data-cevap]").forEach(b => b.disabled = true);
    turBitti(dogru); return;
  }
  const kart = T.closest("[data-kart]");
  if (kart && etk) { etk.secilen = etk.secilen || []; etk.secilen.push(+kart.dataset.kart); etkinlikSayfa(etk.n, etk.ai); return; }
  const gr = T.closest("[data-geri]");
  if (gr && etk) { etk.secilen = etk.secilen.filter(i => i !== +gr.dataset.geri); etkinlikSayfa(etk.n, etk.ai); return; }
  if (T.closest("#insa-sil") && etk) { etk.secilen = []; etkinlikSayfa(etk.n, etk.ai); return; }
  if (T.closest("#insa-kontrol") && etk) {
    const c = K.hikayeler[etk.n - 1].etkinlik.insa[etk.tur];
    const tamam = etk.secilen.length === c.parcalar.length && etk.secilen.every((v, i) => c.parcalar[v] === c.parcalar[i]);
    const hd = $("#insa-hedef");
    if (tamam) { hd.classList.add("dogru"); turBitti(true); }
    else { hd.classList.remove("yanlis"); void hd.offsetWidth; hd.classList.add("yanlis"); const gb = $("#gb"); gb.className = "geri-bildirim kotu"; gb.textContent = etk.secilen.length < c.parcalar.length ? "Bütün kartları kullan." : "Sıra yanlış, bir daha dene."; turBitti(false); }
    return;
  }
  if (T.closest("#bitir")) { const n = etk ? etk.n : +location.hash.split("/")[2]; const ta = $("#yazi"); if (ta) { durum.yazi[n] = ta.value; kaydet(); } etk = null; location.hash = `#/h/${n}/sonuc`; return; }
  if (T.closest("#hepsini-ekle")) { const n = +location.hash.split("/")[2]; K.hikayeler[n - 1].yeni_maddeler.forEach(m => { if (!durum.kelimeler.includes(m)) durum.kelimeler.push(m); }); kaydet(); document.querySelectorAll(".sayac").forEach(s => s.textContent = durum.kelimeler.length); T.closest("#hepsini-ekle").textContent = "Eklendi ✓"; return; }
  const fl = T.closest("[data-filtre]");
  if (fl) { sozlukFiltre = fl.dataset.filtre; sozlukSayfa(); return; }
});
document.addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.matches(".k[data-g]")) { e.preventDefault(); e.target.click(); }
  if (e.key === "Escape") { kartKapat(); const p = $("#ayar-panel"); if (p) p.remove(); }
  const m = location.hash.match(/^#\/h\/(\d)\/s\/(\d+)/);
  if (m && !e.target.matches("textarea,input")) {
    const n = +m[1], s = +m[2], son = K.hikayeler[n - 1].sayfalar.length;
    if (e.key === "ArrowRight") location.hash = s < son ? `#/h/${n}/s/${s + 1}` : `#/h/${n}/etkinlik/1`;
    if (e.key === "ArrowLeft" && s > 1) location.hash = `#/h/${n}/s/${s - 1}`;
  }
});
document.addEventListener("input", e => { if (e.target.id === "yazi") { const n = +location.hash.split("/")[2]; durum.yazi[n] = e.target.value; kaydet(); } });

/* ---------- yönlendirme ---------- */
function yonlendir(yerinde) {
  const y = window.scrollY;
  kartKapat();
  const h = location.hash.replace(/^#/, "") || "/";
  let m;
  if (h === "/" || h === "") anaSayfa();
  else if (h === "/kadro") kadroSayfa();
  else if (h === "/kelimelerim") kelimelerimSayfa();
  else if (h === "/sozluk") sozlukSayfa();
  else if ((m = h.match(/^\/h\/(\d)$/))) tahminSayfa(+m[1]);
  else if ((m = h.match(/^\/h\/(\d)\/s\/(\d+)$/))) okuyucuSayfa(+m[1], +m[2]);
  else if ((m = h.match(/^\/h\/(\d)\/etkinlik\/(\d+)$/))) etkinlikSayfa(+m[1], +m[2]);
  else if ((m = h.match(/^\/h\/(\d)\/sonuc$/))) sonucSayfa(+m[1]);
  else anaSayfa();
  if (yerinde) window.scrollTo(0, y);
}
document.addEventListener("DOMContentLoaded", () => {
  kartEl = document.createElement("div"); kartEl.className = "kelime-kart"; kartEl.setAttribute("role", "dialog"); kartEl.setAttribute("aria-label", "Kelime kartı");
  perdeEl = document.createElement("div"); perdeEl.className = "perde";
  document.body.append(perdeEl, kartEl);
  ayarUygula(); yonlendir();
});
window.addEventListener("hashchange", () => { if (!/etkinlik/.test(location.hash)) etk = null; yonlendir(); });
})();
