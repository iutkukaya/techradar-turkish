# Uygulama Planı - Türk Teknoloji Radarı

## Hedef Tanımı
Türkçe, etkileşimli ve yerinde kurulum (on-premise) bir Teknoloji Radarı uygulaması geliştirmek. Sistem, teknolojileri dört çeyrek ve dört halka üzerinde görselleştirmeyi, yönetim ve özelleştirme için güvenli bir admin paneli sunmayı hedefler.

## Tamamlanan Özellikler

### 1. Backend Altyapısı
- **Sunucu:** Node.js & Express sunucusu.
- **Veritabanı:** `users`, `technologies` ve `settings` tablolarına sahip SQLite veritabanı.
- **Kimlik Doğrulama:** Kayan oturum zaman aşımı (10dk aktif, 24s token) ile JWT tabanlı kimlik doğrulama.
- **API:** Teknolojiler, kullanıcılar ve ayarlar üzerinde CRUD işlemleri için RESTful uç noktalar.
- **Güvenlik:** Bcrypt şifre hashleme ve Rol Tabanlı Erişim Kontrolü (RBAC).

### 2. Frontend Uygulaması
- **Çerçeve:** Vite ile React.
- **Stil:** Glassmorphism tasarım sistemine sahip özel CSS.
- **Görselleştirme:** Çakışmayan noktalar için kuvvet simülasyonlu D3.js tabanlı radar.
- **Etkileşim:** Üzerine gelince detaylar, sürükle-bırak konumlandırma (Sadece Admin).

### 3. Yönetim Paneli
- **Teknoloji Yönetimi:** Radar öğeleri için tam CRUD yetenekleri.
- **Kullanıcı Yönetimi:** Detaylı yetkilerle kullanıcı oluşturma/düzenleme/silme.
- **Özelleştirme:**
    - **Logo Yükleme:** Uygulama logosunu değiştirme.
    - **Dinamik Ayarlar:** Halkalar, metin ve arka plan için renkleri özelleştirme.

### 4. Kullanıcı Deneyimi Geliştirmeleri
- **Duyarlı Tasarım:** Farklı ekran boyutlarına uyum sağlar.
- **Kategorize Listeler:** Teknolojilerin hızlı taranması için köşe listeleri.
- **Lejantlar:** Halkalar ve öznitelik şekilleri (Yeni, Halka Atladı/Düştü) için görsel rehberler.
- **Kalıcılık:** Sürüklenen pozisyonlar veritabanına kaydedilir.

## Doğrulama Planı

### Otomatik Testler
- [x] Backend API testleri (Geliştirme sırasında Postman/Curl ile manuel).
- [x] Frontend derleme doğrulaması (`npm run build`).

### Manuel Doğrulama
- [x] **Giriş Akışı:** Admin girişi ve oturum zaman aşımını doğrulama.
- [x] **CRUD İşlemleri:** Teknoloji ve kullanıcı ekleme, düzenleme, silme.
- [x] **Yetkiler:** Kısıtlı kullanıcıların sadece izin verilen çeyrekleri düzenleyebildiğini doğrulama.
- [x] **Görseller:** Radar çizimi, yeniden boyutlandırma ve renk özelleştirmesini kontrol etme.
- [x] **Kalıcılık:** Bir noktayı sürükleyin, sayfayı yenileyin, konumun kaydedildiğini doğrulayın.

## Dağıtım
- **Taşınabilir Sürüm:** Uygulama, yürütülebilir dosya ve varlıkları içeren bağımsız bir `dist` klasöründe paketlenmiştir.
- **Çalıştırma:** Sunucuyu başlatmak ve tarayıcıyı açmak için `start.bat` dosyasını kullanın.
- **Taşınabilirlik:** `dist` klasörü ziplenebilir ve Node.js gerektirmeden herhangi bir Windows makinesine taşınabilir.
