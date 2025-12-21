# Yönetici Kılavuzu

## 1. Yönetim Paneline Erişim

### Uygulamayı Başlatma
Panele erişmeden önce uygulamanın çalıştığından emin olun:
- **Taşınabilir:** `start.bat` dosyasına çift tıklayın.
- **Geliştirici:** `npm start` (sunucu) ve `npm run dev` (istemci) komutlarını çalıştırın.

Yönetim paneline erişmek için ana sayfaya (`http://localhost:3000`) gidin ve sağ üst köşedeki **"Yönetici Girişi"** butonuna tıklayın.

**Varsayılan Bilgiler:**
- **Kullanıcı Adı:** `admin`
- **Şifre:** `admin`
*(Not: Lütfen ilk girişinizden sonra bu şifreyi hemen değiştirin)*

## 2. Panele Genel Bakış
Panel dört ana sekmeye ayrılmıştır:
1.  **Teknolojiler:** Radardaki öğeleri yönetin.
2.  **Kullanıcılar:** Sistem kullanıcılarını ve yetkilerini yönetin (Sadece Admin).
3.  **Logo Yükle:** Uygulama logosunu değiştirin.
4.  **Ayarlar:** Görsel temayı özelleştirin.

## 3. Teknoloji Yönetimi
### Yeni Teknoloji Ekleme
1.  **Teknolojiler** sekmesine gidin.
2.  **"+ Yeni Ekle"** butonuna tıklayın.
3.  Formu doldurun:
    - **İsim:** Teknolojinin adı.
    - **Açıklama:** Kısa bir açıklama (üzerine gelindiğinde görünür).
    - **Çeyrek:** Kategoriyi seçin (örn. Araçlar).
    - **Halka:** Benimsenme durumunu seçin (örn. Benimse).
    - **Öznitelik:** İsteğe bağlı durum göstergesi (Yeni, Halka Atladı, Halka Düştü).
    - **Aktif:** Öğeyi silmeden radardan gizlemek için işareti kaldırın.
4.  **"Kaydet"** butonuna tıklayın.

### Düzenleme/Silme
- Bir öğeyi değiştirmek için **"Düzenle"** butonuna tıklayın.
- Bir öğeyi kalıcı olarak kaldırmak için **"Sil"** butonuna tıklayın.

## 4. Kullanıcı Yönetimi (Sadece Admin)
### Kullanıcı Oluşturma
1.  **Kullanıcılar** sekmesine gidin.
2.  **"+ Yeni Kullanıcı"** butonuna tıklayın.
3.  Bir **Kullanıcı Adı** ve **Şifre** girin.
4.  **Yetkiler**i seçin:
    - **ADMIN:** Her şeyi yönetebilir.
    - **Belirli Çeyrek:** Sadece o çeyrekteki öğeleri ekleyebilir/düzenleyebilir.
5.  **"Kaydet"** butonuna tıklayın.

### Şifre Değiştirme
- Kendi şifrenizi Kullanıcılar sekmesinin altındaki "Şifremi Değiştir" bölümünden değiştirebilirsiniz.
- Adminler, kullanıcıyı düzenleyerek diğer kullanıcıların şifrelerini sıfırlayabilir.

## 5. Radarı Özelleştirme
### Logo
- **Logo Yükle** sekmesine gidin.
- Bir PNG resmi seçin ve **"Yükle"** butonuna tıklayın.
- Yeni logoyu görmek için sayfayı yenileyin.

### Görsel Ayarlar
- **Ayarlar** sekmesine gidin.
- **Genel Renkler:** Arka plan gradyanını ve ana başlık rengini değiştirin.
- **Liste Renkleri:** Köşelerdeki listelerin rengini değiştirin.
- **Halka Renkleri:** Her bir halka için renkleri değiştirin (Benimse, Test Et, vb.).
- **İsimlendirmeler:** Çeyreklerin, Halkaların ve Durumların isimlerini değiştirin (örn. "Araçlar" yerine "Tools").
- Değişiklikleri uygulamak için **"Ayarları Kaydet"** butonuna tıklayın.

## 6. Sürükle & Bırak ile Konumlandırma
- Giriş yapmış bir yönetici olarak, radardaki noktaları sürükleyerek konumlarını ayarlayabilirsiniz.
- Fareyi bıraktığınızda yeni konum **otomatik olarak kaydedilir**.
- Sürükleme işlemi, öğenin atandığı çeyrek ve halka ile sınırlıdır.
