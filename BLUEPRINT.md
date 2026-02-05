# Circa Blueprint

## Genel Bakış
Circa, vardiya ve mesai takibi için tasarlanmış web tabanlı bir uygulamadır. Apex ana uygulaması ile entegre çalışarak ortak kimlik doğrulama mekanizmasını kullanır.

## Mimari

Uygulama, modern web standartlarına uygun olarak tasarlanmış olup, aşağıdaki bileşenlerden oluşur:

### Frontend
- **Framework**: React.js ile Tek Sayfalı Uygulama (SPA) mimarisi.
- **Build Tool**: Vite, hızlı geliştirme ve derleme süreçleri için.
- **Styling**: Tailwind CSS ile utility-first CSS yaklaşımı.

### Backend (Serverless)
- **Runtime**: Vercel Serverless Functions.
- **API**: RESTful API endpoints.
- **Veritabanı**: MongoDB (Cloud Atlas).

## Veri Akışı

1. **Kullanıcı Etkileşimi**: Kullanıcı arayüz üzerinden veri girer (örn. mesai ekleme).
2. **API İsteği**: React bileşeni, `/api` altındaki endpoint'lere asenkron istekler gönderir.
3. **İşlem**: Serverless fonksiyon isteği karşılar, gerekli doğrulamaları (Authentication) yapar.
4. **Veritabanı**: İşlenen veri MongoDB veritabanına kaydedilir veya sorgulanır.
5. **Yanıt**: Sonuç JSON formatında frontend'e döner ve arayüz güncellenir.

## Temel Bileşenler (React)

- **`App.jsx`**: Ana uygulama kapsayıcısı, routing ve layout yönetimi.
- **`AddShiftForm.jsx`**: Yeni mesai kaydı oluşturma formu.
- **`RecentShifts.jsx`**: Geçmiş mesai kayıtlarının listelendiği bileşen.
- **`Reports.jsx`**: Grafikler ve özet tablolarla raporlama ekranı.
- **`AuthContext.jsx`**: Kullanıcı oturum durumunun tüm uygulama genelinde yönetimi.

## Entegrasyonlar

- **Apex Auth**: Kullanıcı kimlik doğrulaması için merkezi Apex sistemini kullanır.
- **Vercel**: Deployment ve serverless altyapısı.
