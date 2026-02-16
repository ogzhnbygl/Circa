# Circa - Mesai Takip Sistemi

Circa, Apex ekosistemine entegre edilmiş, modern ve kullanıcı dostu bir mesai ve vardiya takip uygulamasıdır. "Zamanın değerini bilmek", Circa'nın temel felsefesidir.

## 🚀 Özellikler

- **Kolay Mesai Girişi:**
    - Kullanıcı dostu arayüz ile saniyeler içinde vardiya ve mesai kaydı oluşturma.
    - Tarih ve saat manipülasyonları için optimize edilmiş form yapısı.
- **Geçmiş Görüntüleme:**
    - Kaydedilen tüm mesailerin kronolojik listesi.
    - Gelişmiş filtreleme seçenekleri (tarih aralığı, proje bazlı).
- **Raporlama ve Analiz:**
    - Mesai verileri üzerinden detaylı grafikler ve özet kartları.
    - Çalışan verimliliğini artıran içgörüler (Geliştirme aşamasında).
- **Apex Entegrasyonu:**
    - Apex hesabı ile sorunsuz "Single Sign-On" deneyimi.
    - Merkezi güvenlik ve yetkilendirme.

## 🛠️ Teknolojiler

Circa, performans ve kullanıcı deneyimi odaklı modern teknolojilerle inşa edilmiştir:

### Frontend
- **Framework:** [React](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend
- **Runtime:** [Vercel Serverless Functions](https://vercel.com/docs/functions)
- **Database:** [MongoDB](https://www.mongodb.com/)

## 📦 Kurulum

Projeyi yerel ortamınızda çalıştırmak için:

### Gereksinimler
- Node.js (v18+)
- MongoDB veritabanı

### Adımlar

1. **Repoyu klonlayın:**
   ```bash
   git clone <repo-url>
   cd Circa
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Çevresel Değişkenler:**
   `.env` dosyasını oluşturun:
   ```env
   MONGODB_URI=mongodb+srv://...
   ```

4. **Geliştirme Sunucusunu Başlatın:**
   ```bash
   npm run dev
   ```
   Uygulama `http://localhost:5173` adresinde çalışacaktır.

## 📂 Proje Yapısı

- `/src`: Frontend kaynak kodları.
- `/api`: Backend API fonksiyonları (Shifts).
- `/public`: Statik dosyalar.

Detaylı teknik bilgi için [TECHNICAL.md](./TECHNICAL.md) dosyasına bakabilirsiniz.

## 📜 Lisans

Bu proje özel mülkiyettir. İzinsiz kopyalanması ve dağıtılması yasaktır.
