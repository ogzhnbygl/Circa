# Circa - Vizyon ve Blueprint

## 🌟 Vizyon

**Zaman**, en değerli ve geri döndürülemez kaynağımızdır. Circa, bu kaynağın nasıl kullanıldığını görünür kılmak için tasarlanmıştır.

Sadece bir "giriş-çıkış kartı" değil, çalışanların emeklerinin karşılığını şeffaf bir şekilde takip edebileceği, yöneticilerin ise iş gücü planlamasını veriye dayalı yapabileceği bir platformdur.

> "Circa: Her saniyenin kaydı."

## 🏗️ Mimari

Circa, sadelik üzerine kurulmuştur. Karmaşık HR yönetim sistemlerinin aksine, "Tek İş, Tek Odak" prensibiyle çalışır.

1.  **Hızlı Veri Girişi:** Kullanıcıyı yormayan, mümkünse tek tıkla işlem yapabilen arayüzler.
2.  **Merkezi Entegrasyon:** Apex ile tam entegre çalışarak ekstra şifre veya kurulum gerektirmez.

## 🎨 Tasarım Prensipleri

- **Akışkanlık:** Arayüz, kullanıcının düşünce hızında hareket etmelidir. Bekleme süreleri minimize edilmiştir.
- **Netlik:** Karmaşık tablolar yerine, anlaşılır grafikler ve özetler ön plandadır.
- **Mobil Öncelikli:** Mesai takibi genellikle hareket halindeyken yapılır. Circa, mobil cihazlarda kusursuz çalışacak şekilde tasarlanmıştır.

## 🗺️ Yol Haritası (Roadmap)

### Faz 1: Temel Fonksiyonlar (Tamamlandı ✅)
- [x] Vardiya giriş ve çıkış kayıtları.
- [x] Geçmiş kayıtların listelenmesi.
- [x] Apex auth entegrasyonu (`verifyUser` ve paylaşılan oturum).

### Faz 2: Raporlama, Doğrulama ve Yönlendirme (Tamamlandı ✅)
- [x] **Grafiksel Raporlar:** Haftalık ve aylık çalışma sürelerinin `/reports` sayfasında görselleştirilmesi.
- [x] **PDF Export:** Resmi bordro veya izin raporu için koordinat ve tablo taşma düzeltmeli PDF çıktı sistemi.
- [x] **Timezone Güvenliği:** Takvimde gün kaymalarını önlemek için string tabanlı tarih seçimi ve sunucuda UTC çarpan analizi.
- [x] **Yönlendirme:** `react-router-dom` ile `/`, `/leaves`, `/reports` rotalarının kurgulanması.
- [x] **Zod Doğrulamaları:** Mesai ve izin kayıtlarının sunucu tarafında veri şeması doğrulaması.

### Faz 3: Akıllı Özellikler (Planlanıyor)
- [ ] **Otomatik Hatırlatıcılar:** Mesai bitiminde çıkış yapmayı unutan kullanıcılara bildirim.
- [ ] **Vardiya Planlama:** Gelecek haftaların vardiya planını oluşturma ve paylaşma.
- [ ] **Bordro Entegrasyonu:** Hesaplanan katsayılı mesai sürelerinin muhasebe yazılımlarına otomatik aktarılması.
