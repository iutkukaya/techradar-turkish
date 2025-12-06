# Teknik Genel Bakış

Bu belge, Türk Teknoloji Radarı uygulaması için kod tabanı yapısına ve önemli dosyalara üst düzey bir genel bakış sağlar.

## Dizin Yapısı

```
/
├── client/                 # Frontend Uygulaması (React + Vite)
│   ├── public/             # Statik varlıklar (favicon vb.)
│   ├── src/
│   │   ├── components/     # React Bileşenleri
│   │   │   ├── AdminDashboard.jsx  # Ana yönetim paneli bileşeni
│   │   │   ├── Login.jsx           # Giriş sayfası bileşeni
│   │   │   ├── Radar.jsx           # D3.js görselleştirme mantığı
│   │   │   └── RadarView.jsx       # Genel radar görünümü sarmalayıcısı
│   │   ├── hooks/          # Özel React Hook'ları
│   │   │   └── useSessionManager.js # Oturum zaman aşımı mantığı
│   │   ├── App.jsx         # Ana uygulama bileşeni ve yönlendirme
│   │   ├── index.css       # Global stiller ve değişkenler
│   │   └── main.jsx        # Giriş noktası
│   ├── index.html          # HTML şablonu
│   └── vite.config.js      # Vite yapılandırması
│
├── server/                 # Backend Uygulaması (Node.js + Express)
│   ├── database.js         # SQLite bağlantısı ve şema başlatma
│   ├── server.js           # Ana sunucu dosyası (API rotaları ve middleware)
│   ├── package.json        # Backend bağımlılıkları
│   └── radar.db            # SQLite veritabanı dosyası (çalışma zamanında oluşturulur)
```

## Önemli Dosyalar ve Fonksiyonlar

### Backend (`server/`)

#### `server.js`
- **Kimlik Doğrulama:**
    - `POST /api/login`: Kullanıcıları doğrular ve JWT verir.
    - `POST /api/refresh-token`: Süresi dolmuş erişim tokenlarını yeniler.
    - `authenticateToken`: JWT'leri doğrulamak için ara yazılım.
    - `checkAdmin`: Sadece yönetici erişimini zorunlu kılan ara yazılım.
- **Radar API:**
    - `GET /api/radar`: Tüm teknolojileri getirir.
    - `POST /api/radar`: Yeni bir teknoloji ekler.
    - `PUT /api/radar/:id`: Bir teknolojiyi günceller (konum dahil).
    - `DELETE /api/radar/:id`: Bir teknolojiyi siler.
- **Ayarlar API:**
    - `GET /api/settings`: Görsel ayarları getirir.
    - `PUT /api/settings`: Görsel ayarları günceller.
- **Kullanıcı Yönetimi:**
    - `GET /api/users`: Tüm kullanıcıları listeler.
    - `POST /api/users`: Yeni bir kullanıcı oluşturur.
    - `PUT /api/users/:id`: Kullanıcı şifresini/yetkilerini günceller.

#### `database.js`
- SQLite veritabanını başlatır.
- Tabloları oluşturur: `users`, `technologies`, `settings`.
- Varsayılan yönetici kullanıcısını oluşturur (`admin` / `admin123`).

### Frontend (`client/`)

#### `src/components/Radar.jsx`
- **Çekirdek Görselleştirme:** Radarı işlemek için D3.js kullanır.
- **Kuvvet Simülasyonu:** Noktaların üst üste binmesini önlemek için çarpışma algılamasını yönetir.
- **Sürükle & Bırak:** Yöneticiler için sürükleme mantığını uygular.
- **Çizim:** Halkaları, çizgileri, noktaları ve etiketleri çizer.

#### `src/components/AdminDashboard.jsx`
- **Durum Yönetimi:** Teknolojiler, kullanıcılar ve ayarlar formları için durumu yönetir.
- **Sekmeler:** Teknolojiler, Kullanıcılar, Logo ve Ayarlar görünümleri arasında geçiş yapar.
- **Form İşleme:** Öğe oluşturma/düzenleme işlemlerini yönetir.
- **Dinamik Stiller:** Renk ayarlarını form girdilerine uygular.

#### `src/components/RadarView.jsx`
- **Veri Getirme:** Yükleme sırasında radar verilerini ve ayarları getirir.
- **Düzen:** `Radar` bileşenini, markalamayı, lejantları ve köşe listelerini işler.
- **Pop-up'lar:** Teknoloji detaylarını göstermek için üzerine gelme durumunu yönetir.

#### `src/hooks/useSessionManager.js`
- **Oturum Mantığı:** Kullanıcı etkinliğini izler (fare hareketi, tıklamalar).
- **Otomatik Çıkış:** 10 dakika boyunca işlem yapmayan kullanıcıların oturumunu kapatır.
- **Token Yenileme:** Kullanıcı aktifse tokenı otomatik olarak yeniler.

## Değişiklik Yapma

### Renkleri Değiştirme
- **Çalışma Zamanı:** Yönetim Paneli > Ayarlar sekmesini kullanın.
- **Varsayılanlar:** `client/src/components/AdminDashboard.jsx` ve `client/src/components/RadarView.jsx` içindeki `defaultSettings` nesnesini düzenleyin.

### Yeni Çeyrekler/Halkalar Ekleme
- **Veritabanı:** Şema değişikliği gerekmez (metin olarak saklanır).
- **Frontend:** `Radar.jsx`, `RadarView.jsx` ve `AdminDashboard.jsx` içindeki `quadrants` ve `rings` dizilerini güncelleyin.

### Yetkileri Değiştirme
- **Backend:** `server.js` ara yazılımını veya `database.js` içindeki `users` tablosu şemasını güncelleyin.
- **Frontend:** `AdminDashboard.jsx` içindeki yetki kontrollerini güncelleyin.

## Bağımlılıklar

### Frontend (`client/package.json`)
- `react`: ^19.2.0
- `react-dom`: ^19.2.0
- `react-router-dom`: ^7.9.6
- `d3`: ^7.9.0
- `vite`: ^7.2.4 (Dev)

### Backend (`server/package.json`)
- `express`: ^4.18.2
- `sqlite3`: ^5.1.7
- `bcrypt`: ^5.1.1
- `jsonwebtoken`: ^9.0.2
- `cors`: ^2.8.5
- `multer`: ^2.0.2
- `nodemon`: ^3.0.3 (Dev)

## Uygulamayı Çalıştırma

### Geliştirme Modu
1.  **Backend:** `cd server` -> `npm start`
2.  **Frontend:** `cd client` -> `npm run dev`

### Prodüksiyon / Taşınabilir Mod
Uygulama `pkg` kullanılarak bağımsız bir yürütülebilir dosya halinde paketlenmiştir.
- **Konum:** `server/dist/`
- **Yürütülebilir Dosya:** `turkish-tech-radar-server.exe`
- **Başlatma Komut Dosyası:** `start.bat` (Sunucuyu başlatır ve tarayıcıyı açar)
- **Bağımlılıklar:** `dist` klasörü, Node.js kurulu olmadan uygulamanın çalışması için gereken `node_sqlite3.node` ikili dosyasını ve `public` varlıklarını içerir.
