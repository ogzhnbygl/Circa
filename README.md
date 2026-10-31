# Circa - Personel Mesai & İzin Takip Sistemi

> **Apex Hub & Spoke** ekosistemine tam entegre; laboratuvar ve saha operasyonları için geliştirilmiş katsayılı mesai hesaplama motoru, timezone-safe takvim, izin bakiye yönetimi ve resmi PDF/CSV raporlama platformu.

---

## 📌 Proje Vizyonu ve Ekosistemdeki Rolü

**Circa**, Antigravity / WildType ekosisteminin çalışan zaman yönetimi, fazla mesai denklik hesaplaması ve izin süreçlerini dijitalleştiren çekirdek uydu (Spoke) uygulamasıdır. 

Özellikle laboratuvar operasyonları, hafta sonu vardiyaları ve resmi tatil nöbetlerinin yoğun olduğu çalışma ortamlarında (örneğin *İMU DEHAL - Deney Hayvanları Uygulama ve Araştırma Merkezi*) personelin hak edişlerinin şeffaf, adil ve hatasız bir şekilde kayıt altına alınmasını sağlar.

- **Merkezi Kimlik Doğrulama (Apex SSO):** Circa, bağımsız kullanıcı tablosu tutmaz; kimlik doğrulama ve yetkilendirmeyi Apex Hub üzerinden paylaşılan güvenli `interapp_session` (veya test ortamında `interapp_session_test`) JWT çerezi ile yürütür.
- **Kullanıcı Yetkilendirme (`apps: ['circa']`):** Kullanıcının sisteme erişebilmesi için Apex profilinde `circa` izninin bulunması veya `role: 'admin'` yetkisine sahip olması gerekir.
- **İki Yönlü Senkronizasyon:** Mesai kayıtları onaylanıp işlendiğinde katsayılı saatler izin bakiyesine otomatik dönüşür; çalışanlar bu bakiyeyi kullanarak sistem üzerinden tam gün veya saatlik izin talepleri oluşturabilir.

---

## 🚀 Temel Özellikler

### 1. Vardiya ve Mesai Yönetimi
- **Hızlı Veri Girişi:** Tarih, mesai türü (*Hafta İçi*, *Hafta Sonu*, *Resmi Tatil*), başlangıç-bitiş saatleri ve açıklama ile saniyeler içinde mesai kaydı.
- **Son Hareketler Paneli:** Kullanıcının geçmiş mesailerinin kronolojik kart listesi, anlık filtreleme ve silme desteği.
- **Dönem Kilitleme Güvenliği:** Bir aya ait mesailer bakiyelere işlendikten sonra çalışanlar geçmiş kayıtları silemez; veri bütünlüğü korunur.

### 2. Akıllı Katsayı ve Mesai Hesaplama Motoru
- **Çarpan Matrisi:**
  - **Hafta İçi ve Cumartesi:** `1.7x` katsayı
  - **Pazar Günü ve Resmi Tatiller:** `3.0x` katsayı
- **UTC Timezone-Safe Gün Tespiti:** İstemci veya sunucu saat dilimi farklarından kaynaklanan gün kaymalarını önlemek için `Date.UTC` ve `getUTCDay()` üzerinden Pazar günü tespiti.
- **Gece Vardiyası Desteği:** Gün dönümünü aşan vardiyalarda (örneğin 22:00 - 06:00) negatif süre oluşumunu engelleyen 24 saat tamamlama mantığı.

### 3. İzin Takip ve Bakiye Yönetimi (`time_offs` & `balances`)
- **Esnek İzin Seçenekleri:**
  - **Tam Gün İzin:** Çoklu gün seçimine izin veren `MultiSelectCalendar` bileşeni (gün başına net 8 saat).
  - **Saatlik İzin:** Gün içi başlangıç-bitiş saati belirterek dakika hassasiyetinde izin kullanımı.
- **Onay ve Bakiye Düşümü:** Yöneticiler bekleyen izinleri inceleyip tek tıkla onaylar; onaylanan izin süresi çalışanın hak ediş havuzundan negatif bakiye olarak düşülür.
- **İptal Mekanizması:** Onay bekleyen (`pending`) izin talepleri personel veya yönetici tarafından anında iptal edilebilir.

### 4. Kurumsal Raporlama ve Dışa Aktarım
- **Resmi PDF Dilekçe Üretimi (`jspdf` & `jspdf-autotable`):**
  - **Aylık Mesai İcmal Dilekçesi:** Kurum amirliğine sunulmak üzere ay içindeki tüm mesaileri, süreleri ve personel bazlı katsayılı toplam izin haklarını listeleyen resmi üst yazı.
  - **İzin Kullanım Dilekçesi:** Çalışanın mevcut bakiyesini ve talep ettiği izin aralığını içeren, ıslak imzaya hazır resmi personel izin talep formu.
  - **Gömülü Türkçe Font Desteği:** Türkçe karakter sorunlarını (ş, ğ, ı, İ, ö, ç) tamamen çözen dahili `Tinos` (Regular ve Bold) TTF font mimarisi.
- **Güvenli CSV/Excel Dışa Aktarımı:** Formül enjeksiyonu (`CSV Injection`) açıklarını önleyen tırnaklama ve hücre kaçış sanitizasyonu ile tek tıkla Excel uyumlu CSV raporu.

---

## 🛠️ Teknoloji Yığını

### Frontend
| Teknoloji | Sürüm | Kullanım Amacı |
| :--- | :--- | :--- |
| **React** | `^18.2.0` | Bileşen tabanlı modern SPA mimarisi |
| **React Router DOM** | `^7.16.0` | URL tabanlı istemci yönlendirmesi (`/`, `/permissions`, `/reports`) |
| **Vite** | `^5.0.8` | Ultra hızlı derleme aracı ve yerel serverless emülasyonu |
| **Tailwind CSS** | `^3.4.0` | Responsive, temiz ve kurumsal arayüz tasarımı |
| **Lucide React** | `^0.563.0` | Modern SVG ikon kütüphanesi |
| **jsPDF** | `^4.1.0` | İstemci tarafında kurumsal PDF belgeleri oluşturma motoru |
| **jspdf-autotable** | `^5.0.7` | PDF içinde dinamik sayfalanabilen ızgara ve tablolar |

### Backend & Altyapı
| Teknoloji | Sürüm | Kullanım Amacı |
| :--- | :--- | :--- |
| **Vercel Serverless Functions** | Node.js | Sunucusuz API endpoint'leri (`/api/...`) |
| **MongoDB Driver** | `^6.3.0` | MongoDB veritabanı bağlantısı ve aggregation pipeline'ları |
| **Zod** | `^4.4.3` | Giriş verilerinin katı tip ve format doğrulaması |
| **crypto (Node.js)** | Dahili | HS256 JWT imza doğrulaması ve `timingSafeEqual` kontrolü |
| **dotenv** | `^17.2.3` | Ortam değişkenleri yapılandırması |

---

## 📦 Kurulum ve Çalıştırma Rehberi

### Gereksinimler
- **Node.js:** v18.0.0 veya üzeri
- **npm:** v9.0.0 veya üzeri
- **MongoDB:** MongoDB Atlas veya yerel MongoDB kümesi (Apex ile aynı küme)

### Adım 1: Repoyu Klonlayın
```bash
git clone https://github.com/oguzhancart/Circa.git
cd Circa
```

### Adım 2: Bağımlılıkları Yükleyin
```bash
npm install
```

### Adım 3: Ortam Değişkenlerini Tanımlayın
Kök dizinde `.env` dosyasını oluşturun ve aşağıdaki anahtarları girin:

```env
# MongoDB Bağlantı URI'si (Apex veritabanı kümesi ile aynı)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority

# Apex SSO tarafından kullanılan paylaşılan JWT anahtarı (Zorunlu)
JWT_SECRET=your_super_secret_jwt_key_here

# Ortam Türü (development | production)
NODE_ENV=development

# (İsteğe Bağlı) Yerel ortamda doğrudan prod veritabanına bağlanmak için:
# FORCE_PROD_DB=true
```

> [!NOTE]
> `Circa`, `NODE_ENV=development` veya Vercel önizleme dağıtımlarında veritabanı adının sonuna otomatik olarak `_test_db` eki ekler (`Circa_test_db` ve `Apex_test_db`). Çerez ismi de `interapp_session_test` olarak izole edilir.

### Adım 4: Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Uygulama `http://localhost:5173` adresinde çalışacaktır.

> [!TIP]
> `vite.config.js` içerisine entegre edilen özel `vercelServerless` eklentisi sayesinde `/api/*` istekleri yerel ortamda Vite middleware katmanı üzerinden doğrudan Node.js fonksiyonu olarak yürütülür. Harici bir backend sunucusu çalıştırmanıza gerek yoktur. Ayrıca yerel geliştirme modunda otomatik olarak mock yönetici oturumu devreye girer.

### Adım 5: Derleme ve Üretim Önizlemesi
```bash
# Üretim çıktısı oluşturma
npm run build

# Üretim paketini yerelde test etme
npm run preview

# Linter kontrolü
npm run lint
```

---

## 📂 Proje Dizin Yapısı

```
Circa/
├── api/                             # Vercel Serverless API Fonksiyonları
│   ├── auth/
│   │   └── session.js               # GET (oturum sorgulama), DELETE (çıkış)
│   ├── leaves/
│   │   ├── index.js                 # GET (izin listesi), POST (izin talebi), DELETE (iptal)
│   │   ├── approve.js               # POST (admin izin onayı ve bakiye düşümü)
│   │   └── balance.js               # GET (çalışan izin bakiyesi aggregation sorgusu)
│   ├── lib/
│   │   └── auth.js                  # verifyUser sarmalayıcısı ve veritabanı çözümleme
│   └── shifts/
│       ├── index.js                 # GET (mesailer), POST (yeni mesai), DELETE (mesai silme)
│       ├── process.js               # POST (admin aylık mesai katsayı motoru & bakiye aktarımı)
│       └── status.js                # GET (ayın işlenme durumu kontrolü)
├── lib/                             # Backend Paylaşılan Modülleri
│   ├── auth.js                      # JWT doğrulama, crypto timingSafeEqual, role/apps kontrolü
│   └── mongodb.js                   # MongoDB Singleton istemcisi ve DB/Cookie isim çözücü
├── public/                          # Statik Varlıklar
│   ├── Tinos-Bold.ttf               # jsPDF Türkçe destekli kalın font
│   └── Tinos-Regular.ttf            # jsPDF Türkçe destekli normal font
├── src/                             # React Frontend Kaynak Kodları
│   ├── components/
│   │   ├── AddShiftForm.jsx         # Mesai kayıt formu (tarih, tip, saat aralığı, açıklama)
│   │   ├── LeaveForm.jsx            # İzin talep formu (tam gün / saatlik mod geçişi)
│   │   ├── MultiSelectCalendar.jsx  # Timezone-safe çoklu gün seçim takvimi
│   │   ├── RecentLeaves.jsx         # İzin hareketleri listesi, onay/iptal butonları, dilekçe indirme
│   │   └── RecentShifts.jsx         # Mesai geçmiş kartları ve silme yönetimi
│   ├── context/
│   │   └── AuthContext.jsx          # Apex SSO oturum yönetimi, preview algılama ve logout
│   ├── pages/
│   │   ├── LeaveTracking.jsx        # İzin Takip sayfası (`/permissions`)
│   │   └── Reports.jsx              # Aylık Raporlar, CSV/PDF dışa aktarım & Mesai İşleme (`/reports`)
│   ├── utils/
│   │   └── pdf/
│   │       ├── generateLeavePetition.js # İzin kullanım dilekçesi PDF oluşturucu
│   │       └── generateShiftPetition.js # Aylık mesai icmal dilekçesi PDF oluşturucu
│   ├── App.jsx                      # Ana uygulama, navigasyon ve yönlendirme
│   ├── index.css                    # Tailwind CSS ve global stiller
│   └── main.jsx                     # React DOM giriş noktası
├── package.json                     # Bağımlılıklar ve npm scriptleri
├── tailwind.config.js               # Tailwind konfigürasyonu
├── vercel.json                      # Vercel SPA yeniden yazma (rewrites) kuralları
└── vite.config.js                   # Vite yapılandırması ve yerel Serverless middleware
```

---

## 🔐 Güvenlik ve Yetkilendirme Modeli

1. **HttpOnly & Secure JWT Oturumu:** Kullanıcı kimliği tarayıcı JavaScript kodunun erişemediği `interapp_session` (üretim) veya `interapp_session_test` (test) çerezi ile taşınır.
2. **Sabit Zamanlı İmza Doğrulaması:** `crypto.timingSafeEqual` kullanılarak olası zamanlama saldırılarına (timing attacks) karşı tam koruma sağlanır.
3. **Uygulama İzolasyonu:** Yalnızca Apex üzerinde `apps: ['circa']` yetkisi verilmiş olan kullanıcılar veya `role: 'admin'` olan yöneticiler API'leri çağırabilir. Yetkisiz istekler `403 Forbidden` ile reddedilir.
4. **Veri İzolasyonu:** Sıradan kullanıcılar yalnızca kendi e-postalarına ait mesai ve izin kayıtlarını görebilir ve yönetebilir. Yönetici (`admin`), tüm personelin hareketlerini inceleme, onaylama ve ay işleme yetkisine sahiptir.
5. **Giriş Doğrulaması:** Tüm mutation endpoint'leri (POST/DELETE) **Zod v4** şemalarıyla regex, enum ve tip kontrollerine tabi tutulur; geçersiz payload'lar anında `400 Bad Request` ile engellenir.

---

## 📖 İlgili Dokümanlar

- [TECHNICAL.md](./TECHNICAL.md): Sistem mimarisi, veritabanı koleksiyonları, API şemaları ve teknik ayrıntılar.
- [BLUEPRINT.md](./BLUEPRINT.md): Ürün vizyonu, tasarım felsefesi, iş kuralları ve faz yol haritası.

---

## 📜 Lisans

Bu proje **WildType / Antigravity** ekosistemine ait özel mülkiyettir. İzinsiz kopyalanması, çoğaltılması ve dağıtılması yasaktır.
