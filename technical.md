# Circa - Teknik Dokümantasyon

Bu doküman, Circa modülünün teknik mimarisini, veritabanı yapısını ve API referanslarını detaylandırır.

## 🏗️ Mimari Genel Bakış

Circa, Apex ekosistemi içinde çalışan, ancak kendi veritabanı koleksiyonuna sahip bağımsız bir modüldür.

- **Frontend:** React SPA.
- **Backend:** Vercel Serverless Functions.
- **Auth:** Apex üzerinden sağlanan Paylaşılan Oturum (Shared Session).

## 📂 Dizin Yapısı

```
Circa/
├── api/                # Backend API (Vercel Serverless Functions)
│   ├── auth/           # Kimlik doğrulama yardımcıları
│   ├── lib/            # Ortak kütüphaneler (DB connection vb.)
│   └── shifts.js       # Mesai işlemleri API endpoint'i
├── src/                # Frontend Kaynak Dosyaları
│   ├── components/     # Yeniden kullanılabilir React bileşenleri
│   ├── context/        # React Context (AuthContext vb.)
│   ├── pages/          # Sayfa bileşenleri
│   ├── App.jsx         # Ana uygulama bileşeni
│   └── main.jsx        # Entry point
├── public/             # Statik dosyalar
└── package.json        # Proje bağımlılıkları ve scriptler
```

## 🗄️ Veritabanı Şeması

Veritabanı bağlantısı Apex ile ortak MongoDB kümesi üzerinden `Circa_db` veritabanına yapılır.

### 1. Koleksiyon: `shifts`
Kullanıcıların mesai ve vardiya kayıtlarını tutar.
| Alan Adı | Tip | Açıklama |
| :--- | :--- | :--- |
| `_id` | ObjectId | Benzersiz kayıt ID'si |
| `userId` | String | Kaydı oluşturan kullanıcının ID'si (Apex auth'tan gelir) |
| `startDate` | Date | Mesai başlangıç zamanı (UTC olarak saklanır) |
| `endDate` | Date | Mesai bitiş zamanı (UTC olarak saklanır) |
| `description` | String | İsteğe bağlı mesai açıklaması |
| `createdAt` | Date | Kayıt oluşturulma zamanı |

### 2. Koleksiyon: `leaves`
İzin dilekçeleri ve izin taleplerini tutar.
| Alan Adı | Tip | Açıklama |
| :--- | :--- | :--- |
| `_id` | ObjectId | Benzersiz kayıt ID'si |
| `userId` | String | İzni talep eden kullanıcının ID'si |
| `userName` | String | Talep eden kullanıcının Adı Soyadı (JWT'den alınır) |
| `startDate` | Date | İzin başlangıç tarihi |
| `endDate` | Date | İzin bitiş tarihi |
| `type` | String | İzin türü (`annual`, `sick`, `excused`) |
| `status` | String | Onay durumu (`pending`, `approved`, `rejected`) |
| `createdAt` | Date | Talep tarihi |

---

## 📅 Saat Dilimi (Timezone) Çözümleri
1.  **MultiSelectCalendar Tarih Seçimi:** Tarayıcıların yerel saat diliminden kaynaklanan gün kaymalarını önlemek amacıyla, takvim üzerinden seçilen tarihler yerel saat dilimine dönüştürülmeden doğrudan `YYYY-MM-DD` biçiminde string olarak işlenir ve sunucuya gönderilir.
2.  **UTC Katsayı Analizi (`process.js`):** Pazar günü mesailerine uygulanan fazla mesai çarpanının hesaplanmasında sunucunun bulunduğu timezone'dan bağımsız olarak UTC metotları (`Date.UTC` ve `getUTCDay()`) kullanılarak tarih parse edilir. Böylelikle pazar gününün cumartesiye veya pazartesiye kayması engellenmiştir.

---

## 🔌 API Referansı & Rotalar

### Ön Yüz Rotaları (`react-router-dom`)
- `/` - Dashboard & Mesai Takibi (Ana sayfa)
- `/leaves` - İzin Talepleri & İzin Dilekçesi Oluşturma
- `/reports` - Mesai ve İzin Raporları / Grafik Analizler

### Sunucu API Endpoint'leri (Zod Validasyonlu)

#### 1. Mesai API (`/api/shifts`)
- **GET `/api/shifts`**: Giriş yapmış kullanıcının kendi mesailerini listeler.
- **POST `/api/shifts`**: Yeni mesai ekler. Gönderilen gövde Zod şeması (`startDate`, `endDate`, `description`) ile doğrulanır. `startDate` < `endDate` kontrolü yapılır.
- **GET `/api/shifts/status`**: Kullanıcının aylık toplam mesai durumunu ve çalışma saatlerini katsayı hesaplamalarıyla getirir.

#### 2. İzin API (`/api/leaves`)
- **GET `/api/leaves`**: Kullanıcının izin taleplerini ve limitlerini listeler.
- **POST `/api/leaves`**: Yeni izin talebi oluşturur. Zod şeması ile `startDate`, `endDate`, `type` alanları doğrulanır. İzin başlangıç tarihinin bitiş tarihinden önce olması zorunludur.

---

## 🔐 Güvenlik

- **Token Doğrulama:** Tüm API istekleri Apex `verifyUser` ara katmanı ile koruma altındadır. `interapp_session` geçerli değilse `401 Unauthorized` döner.
- **İsim Yayılımı (JWT):** PDF oluşturma veya izin dilekçesi hazırlama adımlarında, kullanıcının Ad Soyad bilgisi JWT'deki `name` alanından çekilerek resmi belgelere doğru şekilde yansıtılır.
- **Veri İzolasyonu:** Kullanıcılar (admin rolünde olmayanlar) yalnızca kendi `userId` değerleriyle eşleşen mesai ve izin verilerine erişebilir.

