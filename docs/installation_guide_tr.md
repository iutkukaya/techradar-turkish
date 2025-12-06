# Kurulum ve Dağıtım Kılavuzu

Bu kılavuz, Türk Teknoloji Radarı uygulamasının taşınabilir versiyonunun nasıl kurulacağını ve çalıştırılacağını açıklar.

## 1. Paket İçeriği
Oluşturulan `dist` klasörü, uygulamanın çalışması için gereken her şeyi içerir:
- **`turkish-tech-radar-server.exe`**: Uygulamanın ana sunucu dosyası.
- **`node_sqlite3.node`**: Veritabanı motoru için gerekli dosya.
- **`public/`**: Web arayüzü dosyaları (HTML, CSS, JS).
- **`start.bat`**: Uygulamayı kolayca başlatmak için komut dosyası.
- **`radar.db`**: Veritabanı dosyası (ilk çalıştırmada otomatik oluşturulur).

## 2. Kurulum Gereksinimleri
Bu paket **taşınabilirdir (portable)**.
- Hedef bilgisayarda **Node.js kurulu olmasına gerek yoktur**.
- Sadece Windows işletim sistemi gereklidir.

## 3. Uygulamayı Çalıştırma
1.  `dist` klasörünü bilgisayarınızda istediğiniz bir yere kopyalayın (Örn: Masaüstü).
2.  Klasörün içindeki **`start.bat`** dosyasına çift tıklayın.
3.  Siyah bir komut penceresi açılacak ve sunucu başlatılacaktır.
4.  Birkaç saniye sonra varsayılan internet tarayıcınız otomatik olarak açılarak `http://localhost:3000` adresine gidecektir.

## 4. Başka Bir Sunucuya Taşıma
Uygulamayı başka bir bilgisayara veya sunucuya taşımak için:
1.  Tüm `dist` klasörünü bir `.zip` dosyası olarak sıkıştırın.
2.  Hedef bilgisayara kopyalayın ve zipten çıkarın.
3.  `start.bat` ile çalıştırın.

**Not:** Eğer mevcut verilerinizi (kullanıcılar, teknolojiler) korumak istiyorsanız, `radar.db` dosyasını da kopyaladığınızdan emin olun.

## 5. Sorun Giderme
**Soru: Siyah ekran açılıp hemen kapanıyor.**
- `turkish-tech-radar-server.exe` dosyasını doğrudan çalıştırmayı deneyin. Eğer bir hata mesajı görürseniz not alın.

**Soru: "Port 3000 is already in use" hatası alıyorum.**
- Bilgisayarınızda 3000 portunu kullanan başka bir uygulama olabilir. Görev Yöneticisi'nden çakışan uygulamayı kapatın.

**Soru: Veritabanı hataları alıyorum.**
- Uygulamanın bulunduğu klasöre "Yazma İzni" (Write Permission) olduğundan emin olun. Uygulama `radar.db` dosyasını oluşturmak ve güncellemek için yazma iznine ihtiyaç duyar.
