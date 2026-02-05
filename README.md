# Circa - Mesai Takip Sistemi

Circa, Apex ekosistemine entegre edilmiş, modern ve kullanıcı dostu bir mesai takip uygulamasıdır. Kullanıcıların mesai giriş-çıkışlarını kaydetmelerini, geçmiş kayıtlarını görüntülemelerini ve raporlar almalarını sağlar.

## Özellikler

- **Kolay Mesai Girişi**: Kullanıcı dostu arayüz ile hızlıca vardiya ve mesai kaydı oluşturma.
- **Geçmiş Görüntüleme**: Kaydedilen tüm mesailerin listelenmesi ve filtrelenmesi.
- **Raporlama**: Mesai verileri üzerinden detaylı raporlar oluşturma (Geliştirme aşamasında).
- **Apex Entegrasyonu**: Apex hesabı ile sorunsuz kimlik doğrulama ve geçiş.

## Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

### Gereksinimler

- Node.js (v18 veya üzeri)
- MongoDB veritabanı

### Adımlar

1. Projeyi klonlayın ve proje dizinine gidin:
   ```bash
   git clone <repo-url>
   cd Circa
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Gerekli çevresel değişkenleri ayarlayın (`.env` dosyası oluşturun):
   ```env
   MONGODB_URI=mongodb+srv://... (Veritabanı bağlantı adresi)
   ```

4. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

## Teknolojiler

- **Frontend**: React, Vite, Tailwind CSS, Lucide React
- **Backend (API)**: Vercel Serverless Functions
- **Veritabanı**: MongoDB
- **Kimlik Doğrulama**: Apex Auth Entegrasyonu

## Lisans

Bu proje özel mülkiyettir. İzinsiz kopyalanması ve dağıtılması yasaktır.
