# Kurulum ve Dağıtım Kılavuzu

Bu kılavuz, Türk Teknoloji Radarı uygulamasının taşınabilir versiyonunun nasıl kurulacağını ve çalıştırılacağını açıklar.

## 1. Paket İçeriği
**Not:** Bu proje Git deposundan indirildiyse, `dist` klasörü mevcut olmayacaktır. Bu klasörü oluşturmak için **Teknik Genel Bakış** dokümanındaki "Prodüksiyon / Taşınabilir Mod" adımlarını izleyerek kendi paketinizi oluşturmalısınız.

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

## 5. Linux ve Docker ile Çalıştırma
Bu uygulama Linux sistemlerinde çalışmak üzere Docker desteği sunar.

1.  Temel kurulum (Docker ve Docker Compose) yapın.
2.  Proje dizininde terminali açın.
3.  Şu komutu çalıştırın:
    ```bash
    docker-compose up -d --build
    ```
4.  Detaylı bilgi için **`docs/LINUX_DEPLOYMENT_TR.md`** dosyasına bakın.

**Not:** Eğer mevcut verilerinizi (kullanıcılar, teknolojiler) korumak istiyorsanız, `radar.db` dosyasını da kopyaladığınızdan emin olun.

## 6. Sorun Giderme
**Soru: Tarayıcı açılıyor ama "Bağlantı Reddedildi" veya hata görüyorum.**
- `start.bat` dosyasını çalıştırdığınızda açılan **siyah sunucu penceresini** kontrol edin.
- Eğer pencerede kırmızı hata mesajları varsa, bu hataları not alın.
- Yaygın bir hata, `node_sqlite3.node` dosyasının eksik olması veya uyumsuz olmasıdır.

**Soru: "Port 3000 is already in use" hatası alıyorum.**
- Bilgisayarınızda 3000 portunu kullanan başka bir uygulama olabilir. Görev Yöneticisi'nden çakışan uygulamayı kapatın.

**Soru: Veritabanı hataları alıyorum.**
- Uygulamanın bulunduğu klasöre "Yazma İzni" (Write Permission) olduğundan emin olun. Uygulama `radar.db` dosyasını oluşturmak ve güncellemek için yazma iznine ihtiyaç duyar.

## 7. Sıkça Sorulan Sorular (SSS)

**Soru: Bu işlem bilgisayarıma bir kurulum yapıyor mu?**
Hayır. Bu bir "kurulum" değildir. `dist` klasörü tamamen **taşınabilirdir**. Klasörü USB belleğe atıp başka bir Windows bilgisayara takarak doğrudan çalıştırabilirsiniz. Bilgisayarın kayıt defterine veya sistem dosyalarına hiçbir şey yazmaz.

**Soru: Programı nasıl kapatırım?**
`start.bat` dosyasını çalıştırdığınızda açılan **siyah komut pencresini** kapatmanız yeterlidir. Bu pencereyi kapattığınızda sunucu durur.

**Soru: Girdiğim veriler ne olacak?**
Tüm verileriniz (teknolojiler, kullanıcılar, ayarlar), `dist` klasörü içinde otomatik olarak oluşturulan **`radar.db`** dosyasında saklanır.
- Programı kapatıp tekrar açtığınızda verileriniz **korunur**.
- Uygulamayı başka bir bilgisayara taşırken `radar.db` dosyasını da klasörle birlikte taşıdığınız sürece verileriniz kaybolmaz.
- **Önemli:** Eğer `dist` klasörünü silerseniz, verileriniz de silinir. `radar.db` dosyasının yedeğini alarak verilerinizi yedekleyebilirsiniz.
