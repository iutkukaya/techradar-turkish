# Türk Teknoloji Radarı - Genel Bakış

## Özet
**Türk Teknoloji Radarı**, teknolojileri izlemek ve kategorize etmek için tasarlanmış etkileşimli, web tabanlı bir görselleştirme aracıdır. Dinamik bir D3.js tabanlı radar, yönetim için güvenli bir admin paneli ve kapsamlı özelleştirme seçenekleri içerir.

## Özellikler

### 1. Etkileşimli Radar Görselleştirmesi
- **Çeyrekler:** Teknolojiler dört çeyreğe ayrılır: *Araçlar*, *Diller ve Çerçeveler*, *Platformlar* ve *Teknikler*.
- **Halkalar:** Öğeler benimsenme durumlarına göre eşmerkezli halkalara yerleştirilir: *Benimse*, *Test Et*, *Değerlendir* ve *Çık*.
- **Etkileşimli Noktalar:** Bir noktanın üzerine gelindiğinde detaylı bilgi gösterilir.
- **Çarpışma Algılama:** Bir kuvvet simülasyonu, noktaların üst üste binmemesini sağlayarak okunabilirliği korur.
- **Duyarlı Tasarım:** Radar, ekran boyutuna uyacak şekilde otomatik olarak ayarlanır.

### 2. Yönetim Paneli
- **Güvenli Giriş:** Oturum yönetimi ile JWT kimlik doğrulaması ile korunur.
- **Teknoloji Yönetimi:** Teknolojileri ekleyin, düzenleyin ve silin.
- **Kullanıcı Yönetimi:** Belirli yetkilere sahip kullanıcılar oluşturun ve yönetin (RBAC).
    - **Admin:** Tam erişim.
    - **Çeyrek Bazlı:** Sadece atandıkları çeyrekteki teknolojileri düzenleyebilirler.
- **Özelleştirme:**
    - **Renkler:** Halka renklerini, metin renklerini ve arka plan gradyanlarını özelleştirin.
    - **Logo:** Radar görünümü için özel bir logo yükleyin.

### 3. Kullanıcı Deneyimi
- **Kategorize Listeler:** Teknolojiler, hızlı başvuru için ekranın köşelerinde listelenir.
- **Lejantlar:** Halkalar ve durum göstergeleri (Yeni, Halka Atladı, Halka Düştü) için net açıklamalar.
- **Kalıcılık:** Sürüklenen pozisyonlar Adminler için otomatik olarak kaydedilir.

## Kullanım

### Uygulamayı Başlatma
- **Taşınabilir Sürüm:** `dist` klasöründeki `start.bat` dosyasına çift tıklayın.
- **Geliştirici Sürümü:** `server` klasöründe `npm start`, `client` klasöründe `npm run dev` komutlarını çalıştırın.

### Radarı Görüntüleme
1.  Uygulamayı tarayıcınızda açın (varsayılan: `http://localhost:3000`).
2.  Noktaların üzerine gelerek veya köşelerdeki listeleri kontrol ederek radarı keşfedin.
3.  Renk kodlarını ve şekilleri anlamak için alttaki lejantları kullanın.

### Yönetim Paneli
1.  Sağ üstteki **"Yönetici Girişi"** butonuna tıklayın.
2.  Bilgilerinizle giriş yapın.
3.  **Teknolojiler Sekmesi:** Radar öğelerini yönetin.
4.  **Kullanıcılar Sekmesi:** Diğer kullanıcıları yönetin (Sadece Admin).
5.  **Logo Yükle Sekmesi:** Uygulama logosunu güncelleyin.
6.  **Ayarlar Sekmesi:** Radarın görsel görünümünü özelleştirin.

## Teknik Yığın
- **Frontend:** React, Vite, D3.js
- **Backend:** Node.js, Express, SQLite
- **Kimlik Doğrulama:** JWT, Bcrypt
