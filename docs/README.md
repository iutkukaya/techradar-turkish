# Türk Teknoloji Radarı (Turkish Technology Radar)

Bu proje, teknolojileri izlemek ve kategorize etmek için geliştirilmiş, etkileşimli ve web tabanlı bir teknoloji radarı uygulamasıdır.

![Radar Görünümü](docs/radar_screenshot.png)
*(Not: Ekran görüntüsü varsa buraya eklenebilir)*

## Özellikler
- **Dinamik Görselleştirme:** D3.js ile oluşturulmuş, sürükle-bırak destekli radar.
- **Yönetim Paneli:** Teknolojileri, kullanıcıları ve ayarları yönetmek için güvenli panel.
- **Taşınabilirlik:** Kurulum gerektirmeyen, taşınabilir `.exe` olarak paketlenebilir.
- **Türkçe Arayüz:** Tamamen Türkçe kullanıcı deneyimi.

## Dokümantasyon
Detaylı bilgi için `docs/` klasöründeki rehberlere göz atabilirsiniz:

- **[Kurulum ve Dağıtım Kılavuzu](docs/installation_guide_tr.md):** Uygulamanın nasıl çalıştırılacağı ve paketleneceği.
- **[Kullanım Kılavuzu](docs/walkthrough_tr.md):** Uygulamanın özellikleri ve kullanımı.
- **[Yönetici Kılavuzu](docs/admin_guide_tr.md):** Yönetim paneli kullanımı.
- **[Teknik Genel Bakış](docs/technical_overview_tr.md):** Kod yapısı ve geliştirme detayları.

## Hızlı Başlangıç (Geliştiriciler İçin)

Projeyi bilgisayarınıza indirdikten sonra:

1.  **Bağımlılıkları Yükleyin:**
    ```bash
    cd server && npm install
    cd ../client && npm install
    ```

2.  **Geliştirme Modunda Çalıştırın:**
    - Terminal 1 (Server): `cd server && npm start`
    - Terminal 2 (Client): `cd client && npm run dev`

3.  **Taşınabilir Sürüm Oluşturun (Build):**
    ```bash
    cd server
    npm run build:exe  # (Bu komut pkg kullanarak dist klasörünü oluşturur)
    ```

## Lisans
Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.
