# Yönetici Kılavuzu: LDAP, Loglama ve Syslog

Bu doküman, Teknoloji Radarı uygulamasına eklenen yeni **LDAP Entegrasyonu** ve **Loglama Sistemi** özelliklerinin nasıl yapılandırılacağını ve kullanılacağını açıklar.

---

## 1. LDAP Entegrasyonu (Active Directory)

Uygulamanın kullanıcıları Active Directory veya OpenLDAP sunucularından doğrulamasını ve içeri aktarmasını sağlar.

### Yapılandırma
Sisteme **Admin** yetkisi ile giriş yapın ve **Ayarlar (Settings)** sekmesine gidin.

*   **LDAP URL:** Sunucu adresi (Örn: `ldap://192.168.1.5` veya `ldaps://domain.com:636`). SSL kullanılıyorsa `ldaps` protokolünü seçin.
*   **Bind DN:** Sorgu yapacak yetkili kullanıcı (Örn: `cn=admin,dc=example,dc=com` veya `DOMAIN\user`).
*   **Bind Password:** Yetkili kullanıcının şifresi.
*   **Search Base:** Aramanın yapılacağı kök dizin (Örn: `dc=example,dc=com` veya `ou=Users,dc=company,dc=local`).
*   **Search Filter:** Kullanıcıları filtrelemek için sorgu (Örn: `(sAMAccountName={{username}})`).
    *   `{{username}}` ifadesi, giriş yapan kullanıcının adıyla otomatik değiştirilir.
*   **Aktif/Pasif:** Entegrasyonu açıp kapatmak için anahtarı kullanın.

### Kullanıcı İçe Aktarma (Import Users)
1.  **Kullanıcılar (Users)** sekmesine gidin.
2.  **"Import from LDAP"** butonuna tıklayın.
3.  Kullanıcı adı veya isim ile arama yapın.
4.  Gelen listeden kullanıcıları seçip **"Import Selected"** butonuna basın.
5.  İçe aktarılan kullanıcılar şifresiz olarak kaydedilir; giriş yaparken doğrudan LDAP sunucusuna sorulur.

---

## 2. Gelişmiş Loglama (Logging)

Uygulama artık yapılan her işlemi kayıt altına almaktadır.

### 2.1. Kimlik Doğrulama Logları (Auth Logs)
*   **Kapsam:** Başarılı/Başarısız giriş denemeleri ve çıkış işlemleri.
*   **Detaylar:** Kullanıcı Adı, IP Adresi, Tarayıcı Bilgisi (User Agent), Zaman Damgası.
*   **Not:** IPv6 formatındaki IP adresleri `::ffff:` öneki temizlenerek saf IPv4 olarak kaydedilir.

### 2.2. Denetim Logları (Audit Logs)
*   **Kapsam:** Teknoloji ekleme/silme/güncelleme ve Ayar değişiklikleri.
*   **Akıllı Loglama:** Ayar değişikliklerinde sadece **değişen alanlar** kaydedilir, gereksiz veri kirliliği önlenir.
*   **Detaylar:** Kim yaptı?, Ne zaman yaptı?, Eski değer neydi?, Yeni değer ne?

---

## 3. Syslog Entegrasyonu

Loglarınızı merkezi bir log toplama sunucusuna (Graylog, Splunk, ELK, vb.) yönlendirebilirsiniz.

### Yapılandırma
**Ayarlar (Settings)** sekmesinin en altındaki **"Loglama Ayarları (Syslog)"** bölümünü kullanın.

*   **Host:** Syslog sunucunuzun IP adresi (Örn: `192.168.1.50`).
*   **Port:** Genellikle `514` (UDP) veya `1514` (TCP).
*   **Protocol:** UDP (daha hızlı) veya TCP (daha güvenli) seçin.
*   **Enable Syslog:** Yönlendirmeyi başlatmak için bu özelliği aktif edin.

**Önemli:** Ayarları kaydettiğiniz anda sunucu yeniden başlatmaya gerek kalmadan yeni hedefe log göndermeye başlar.

---

## Sorun Giderme

*   **LDAP Bağlantı Hatası:** "Test Connection" butonu ile ayarları doğrulayın. Güvenlik duvarının LDAP portuna (389 veya 636) izin verdiğinden emin olun.
*   **Syslog Logları Gelmiyor:** Hedef sunucunun portunun açık olduğunu ve Syslog formatını (`RFC5424` veya `RFC3164`) kabul ettiğini kontrol edin.
*   **Saat Uyumsuzluğu:** Loglardaki saatler sunucunun yerel saatine göre ayarlanmıştır. Sunucu saatinin doğru olduğunu kontrol edin.
