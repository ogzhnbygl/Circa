# Teknik Dokümantasyon

## Proje Yapısı

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

## API Referansı

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
      "description": "Günlük mesai",
      "createdAt": "2024-02-06T08:55:00.000Z"
    }
  ]
  ```

#### 2. Yeni Mesai Ekleme
- **Endpoint**: `POST /api/shifts`
- **Açıklama**: Yeni bir mesai kaydı oluşturur.
- **Body**:
  ```json
  {
    "startDate": "2024-02-06T09:00:00",
    "endDate": "2024-02-06T18:00:00",
    "description": "Proje A çalışması"
  }
  ```
- **Yanıt**:
  - `201 Created`: Kayıt başarılı.
  - `400 Bad Request`: Eksik veya hatalı veri.
  - `401 Unauthorized`: Oturum açılmamış.

## Veritabanı Şeması (Tahmini)

**Collection**: `shifts`

| Alan Adı | Tip | Açıklama |
|---|---|---|
| `_id` | ObjectId | Benzersiz kayıt ID'si |
| `userId` | String | Kaydı oluşturan kullanıcının ID'si (Auth'dan gelir) |
| `startDate` | Date | Mesai başlangıç zamanı |
| `endDate` | Date | Mesai bitiş zamanı |
| `description` | String | Açıklama notu |
| `createdAt` | Date | Kayıt oluşturulma zamanı |

## Çevresel Değişkenler (.env)

| Değişken | Açıklama | Örnek |
|---|---|---|
| `MONGODB_URI` | MongoDB bağlantı stringi | `mongodb+srv://user:pass@cluster.mongodb.net/circa` |

## Kurulum Notları

- Vercel üzerinde `MONGODB_URI` environment variable'ı tanımlanmalıdır.
- API rotaları `vercel.json` veya varsayılan `/api` dizini üzerinden otomatik algılanır.
