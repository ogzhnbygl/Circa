# Circa - Vizyon ve Blueprint

> "Zaman, yerine konması mümkün olmayan tek sermayedir."  
> Circa, emeğin ve zamanın değerini şeffaf, adil ve otomatik kurallarla kayıt altına alan ekosistem zaman platformudur.

---

## 🌟 1. Ürün Vizyonu ve Felsefesi

Modern araştırma merkezlerinde, biyoteknoloji laboratuvarlarında ve saha operasyonlarında (özellikle hayvan deneyleri, hücre kültürleri ve kesintisiz bakım gerektiren merkezlerde) mesai saatleri geleneksel 09:00 - 17:00 kalıbına sığmaz. Hafta sonu nöbetleri, bayram vardiyaları ve gece kontrolleri operasyonun kaçınılmaz parçalarıdır.

Circa, bu özverili çalışmaları birer "bürokratik yük" olmaktan çıkarıp:
1. **Adil ve Şeffaf Denklik:** Çalışılan her fazla mesai dakikasının, yasal ve kurumsal katsayılarla çarpılarak personele izin hakkı olarak eksiksiz dönmesini garanti eder.
2. **Kağıtsız ve Bürokrasi-Free İzin:** Islak imza kağıtları arasında kaybolan izin taleplerini tek tıkla dijitale taşır; otomatik bakiye takibiyle yöneticinin ve çalışanın aynı şeffaf tabloyu görmesini sağlar.
3. **Resmi Evrak Uyumluluğu:** İhtiyaç duyulduğunda üniversite ve kurum yönetimlerine sunulabilecek resmi formatlı dilekçeleri tek tıkla üretir.

---

## 🏛️ 2. Mimari Tasarım İlkeleri

- **Tek Odak, Sıfır Karmaşa (Single Responsibility):** Circa, şişkin İK yazılımlarının aksine yalnızca mesai, izin ve hak ediş dengesine odaklanır.
- **Apex Hub & Spoke Entegrasyonu:** Ekosistemdeki diğer uydular gibi (LabProject, Silo, Dispo, Locus) Circa da kullanıcı yönetimi için Apex Hub'a güvenir. Çift şifre, ayrı kayıt veya senkronizasyon gecikmesi yoktur.
- **Timezone-First Yaklaşım:** Tarih manipülasyonları asla istemcinin veya sunucunun rasgele yerel saat dilimine emanet edilmez; gün bazlı string formatı ve UTC standartları esastır.
- **Dönem Bütünlüğü (Immutability):** İşlenmiş ve bakiyeye dönüştürülmüş dönemler geçmişe dönük manipülasyona karşı kilitlenir; kurumsal veri bütünlüğü sağlanır.

---

## 📐 3. İş Mantığı ve Domain Kuralları

### 3.1 Fazla Mesai Katsayı Matrisi
Fazla mesai saatlerinin izin hak edişine dönüştürülmesinde aşağıdaki katsayı algoritması uygulanır:

$$\text{Hak Edilen İzin Süresi} = \text{Fiili Süre (Saat)} \times \text{Katsayı}$$

| Gün / Durum Tipi | Katsayı | Gerekçe & Açıklama |
| :--- | :---: | :--- |
| **Hafta İçi (Pazartesi - Cuma)** | **`1.7x`** | Standart fazla mesai katsayısı |
| **Cumartesi Günü** | **`1.7x`** | Hafta sonu nöbeti katsayısı |
| **Pazar Günü** | **`3.0x`** | Haftalık dinlenme hakkı katsayısı (`getUTCDay() === 0`) |
| **Resmi Tatil / Bayram** | **`3.0x`** | Ulusal ve resmi bayram nöbetleri katsayısı (`shiftType === 'holiday'`) |

### 3.2 Gece Vardiyası Kuralı
Başlangıç saati bitiş saatinden büyük olan vardiyalarda (örneğin 22:00 giriş, 06:00 çıkış):
$$\text{Fiili Süre} = (\text{Bitiş} - \text{Başlangıç}) + 24 \text{ saat}$$
şeklinde normalize edilir ve negatif süre oluşması engellenir.

### 3.3 İzin Kullanım Matematiği
- **Tam Gün İzin:** Çalışanın seçtiği her bir takvim günü için bakiyeden net **8 saat** düşülür:
  $$\text{Düşüm} = \text{Gün Sayısı} \times 8 \text{ saat}$$
- **Saatlik İzin:** İznin kullanıldığı gün içindeki saat aralığı dakika bazında hesaplanarak saate çevrilir:
  $$\text{Düşüm} = \frac{\text{Bitiş Dakikası} - \text{Başlangıç Dakikası}}{60} \text{ saat}$$

### 3.4 Yaşam Döngüsü ve Onay Kuralları
1. **İzin Talebi:** Başlangıçta daima `status: 'pending'` olarak kaydedilir. Bu aşamada bakiye henüz düşmez.
2. **İzin Onayı:** Yalnızca yönetici (`admin`) tarafından onaylanabilir. Onaylandığı an `balances` koleksiyonuna negatif bir kullanım kaydı (`type: 'usage'`) atılır.
3. **İptal / Silme Kuralı:** Yalnızca `pending` durumundaki izinler iptal edilebilir. Onaylanmış bir izin iptal edilemez; düzeltme yönetici tarafından yeni bir dengeleme hareketiyle yapılmalıdır.
4. **Mesai Silme Kuralı:** Eğer bir ayın mesaileri yönetici tarafından bakiyelere işlendiyse (`api/shifts/process`), normal çalışan o aya ait mesai kayıtlarını silemez.

---

## 🗺️ 4. Yol Haritası ve Fazlar

```mermaid
flowchart TD
    subgraph Faz 1 [Faz 1: Çekirdek Temeller ✅]
        F1A["Vardiya Giriş & Çıkış Kaydı"]
        F1B["Apex SSO Entegrasyonu"]
        F1C["Geçmiş Hareketler Listesi"]
    end

    subgraph Faz 2 [Faz 2: İzin, Katsayı & Raporlama ✅]
        F2A["Katsayı Hesaplama Motoru (1.7x / 3.0x)"]
        F2B["İzin Yönetimi & Onay Bakiye Mekanizması"]
        F2C["Timezone-Safe MultiSelectCalendar"]
        F2D["Resmi PDF Dilekçe Üretimi (Tinos Fontları)"]
        F2E["CSV Injection Korumalı Excel İhracı"]
        F2F["react-router-dom v7 Rota Yapısı"]
        F2G["Zod v4 Katı Doğrulamaları"]
    end

    subgraph Faz 3 [Faz 3: Akıllı Vardiya & Ekip Planlama 📋]
        F3A["İleriye Dönük Vardiya Planlayıcı"]
        F3B["Mesai Bitim / Çıkış Hatırlatıcı Bildirimler"]
        F3C["Mobil Öncelikli PWA Çevrimdışı Modu"]
        F3D["Kurumsal Slack/E-posta Bildirim Webhook'ları"]
    end

    subgraph Faz 4 [Faz 4: Bordro & Yasal Uyumluluk 🚀]
        F4A["Muhasebe / Bordro Yazılımı Entegrasyonu"]
        F4B["Yıllık İzin Kıdem Takibi ve Yasal İzin Defteri"]
        F4C["Elektronik İmza (e-İmza / Mobil İmza) Desteği"]
    end

    Faz 1 --> Faz 2
    Faz 2 --> Faz 3
    Faz 3 --> Faz 4
```

### Faz 1: Çekirdek Temeller (Tamamlandı ✅)
- [x] Vardiya başlangıç ve bitiş saatlerinin kaydedilmesi.
- [x] Apex merkezi kimlik doğrulamasına (`verifyUser`, `interapp_session`) entegre giriş kontrolü.
- [x] Son mesai hareketlerinin arayüzde kartlar halinde listelenmesi.

### Faz 2: İzin Takip, Katsayı Motoru ve Resmi Raporlama (Tamamlandı ✅)
- [x] **Aylık Katsayı Motoru (`process.js`):** Hafta içi/Cumartesi `1.7x`, Pazar ve resmi tatiller `3.0x` çarpanları ile hak ediş hesaplama.
- [x] **İzin Takip Sistemi (`LeaveTracking.jsx`):** Tam gün ve saatlik izin talepleri, yönetici onay mekanizması, onay sonrası otomatik negatif bakiye düşümü.
- [x] **Timezone Güvenliği:** Takvimde string tabanlı tarih seçimi (`MultiSelectCalendar`), sunucuda UTC analizi.
- [x] **Resmi PDF Dilekçe Motoru:** İMU DEHAL kurumsal formatında Türkçe karakter destekli (Tinos TTF) mesai icmal ve izin dilekçesi üretimi.
- [x] **Güvenli CSV/Excel Çıktısı:** Formül enjeksiyonu korumalı aylık döküm ihracı.
- [x] **Zod v4 Doğrulaması:** Tüm mutation endpoint'lerinin şema kontrolü.
- [x] **URL Yönlendirmesi:** `react-router-dom` v7 ile `/`, `/permissions`, `/reports` mimarisi.

### Faz 3: Akıllı Vardiya ve Ekip Planlama (Planlanıyor 📋)
- [ ] **İleriye Dönük Vardiya Planlama:** Yöneticilerin gelecek haftaların nöbet ve vardiya takvimini oluşturabilmesi ve personelle paylaşabilmesi.
- [ ] **Mesai Bitim Hatırlatıcıları:** Çıkış saati geldiğinde unutan personele otomatik e-posta / tarayıcı bildirimi.
- [ ] **Ekip Müsaitlik Matrisi:** İzinli ve nöbetçi personelin tek ekranda çakışma kontrolüyle gösterimi.
- [ ] **Slack / Webhook Bildirimleri:** Yeni bir izin talebi geldiğinde veya mesai işlendiğinde ilgili kanala anlık özet iletimi.

### Faz 4: Bordro Entegrasyonu ve Yasal Uyumluluk (Gelecek Vizyon 🚀)
- [ ] **Bordro Yazılımı API Köprüsü:** Hesaplanan saatlik hak edişlerin ve izin kullanım dökümlerinin kurumun muhasebe ve bordro sistemine otomatik aktarımı.
- [ ] **Yıllık İzin Kıdem Takibi:** 4857 sayılı İş Kanunu ve 657 sayılı DMK mevzuatına uygun yıllık izin hak edişlerinin sisteme eklenmesi.
- [ ] **Elektronik İmza (e-İmza):** PDF dilekçelerin sistem üzerinden mobil imza veya e-İmza ile onaylanıp arşivlenmesi.
