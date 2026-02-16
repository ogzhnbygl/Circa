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

**Collection**: `shifts` (MongoDB)

Veritabanı bağlantısı `MONGODB_URI` üzerinden sağlanır.

| Alan Adı | Tip | Açıklama |
| :--- | :--- | :--- |
| `_id` | ObjectId | Benzersiz kayıt ID'si |
| `userId` | String | Kaydı oluşturan kullanıcının ID'si (Auth'dan gelir) |
| `startDate` | Date | Mesai başlangıç zamanı (ISO 8601) |
| `endDate` | Date | Mesai bitiş zamanı (ISO 8601) |
| `description` | String | Açıklama notu (Opsiyonel) |
| `createdAt` | Date | Kayıt oluşturulma zamanı |

## 🔌 API Referansı

### Shifts API

**Dosya**: `/api/shifts.js`

#### 1. Mesaileri Listeleme
- **Endpoint**: `GET /api/shifts`
- **Açıklama**: Giriş yapmış kullanıcının tüm mesai kayıtlarını oluşturulma tarihine göre (yeniden eskiye) getirir.
- **Yanıt**:
  ```json
  [
    {
      "_id": "65b...",
      "userId": "user_id_123",
      "startDate": "2024-02-06T09:00:00.000Z",
      "endDate": "2024-02-06T18:00:00.000Z",
      "description": "Günlük mesai"
    }
  ]
  ```

#### 2. Yeni Mesai Ekleme
- **Endpoint**: `POST /api/shifts`
- **Body**:
  ```json
  {
    "startDate": "2024-02-06T09:00:00",
    "endDate": "2024-02-06T18:00:00",
    "description": "Proje A çalışması"
  }
  ```

## 🔐 Güvenlik

- **Auth Check:** Her API isteğinde `verifyUser` fonksiyonu ile Apex'ten gelen oturum çerezi doğrulanır.
- **Data Isolation:** Kullanıcılar sadece kendi (`userId` ile eşleşen) kayıtlarını görebilir.
