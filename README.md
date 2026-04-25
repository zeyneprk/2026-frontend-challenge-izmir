# 🕵️‍♂️ The Podo Case: Forensics Investigation Dashboard

**The Podo Case**, kaybolan "Podo" karakterinin izini sürmek için tasarlanmış, gelişmiş bir adli bilişim (forensics) ve dedektiflik analiz platformudur. 5 farklı kaynaktan gelen verileri normalize ederek, şüpheliler arasındaki çelişkileri yakalar ve interaktif bir soruşturma deneyimi sunar.

## 🚀 Öne Çıkan Özellikler

-   **Intelligence Hub:** 5 farklı Jotform kaynağından (Checkins, Messages, Sightings, Notes, Tips) gelen verilerin anlık senkronizasyonu.
-   **Automated Red-Flag Detection:** Şüphelilerin mesajları ile lokasyon verileri arasındaki tutarsızlıkları (örn: "Evdeyim" deyip Kordon'da görülmesi) otomatik tespit eden çelişki algoritması.
-   **WhatsApp Forensics UI:** Mesajlaşma verilerini gerçekçi bir WhatsApp arayüzü ile thread'ler halinde inceleme imkanı.
-   **Interactive Map (Leaflet):** Hareket rotalarını çizen, resizable (yüksekliği ayarlanabilir) ve interaktif pinleme yapılabilen koyu temalı harita.
-   **Creative Evidence Board:** Kişisel notları dijital bir "mantar pano" üzerinde post-it'ler şeklinde görselleştirme.
-   **Fuzzy Search & Identity Resolution:** "Alican" ve "Alicann" gibi typo hatalarını otomatik düzelterek verileri doğru kişilerle eşleştiren akıllı kimlik yönetimi.

## 🛠️ Teknik Stack

-   **Framework:** React 18 + Vite
-   **Styling:** Tailwind CSS
-   **State Management:** React Context API + Custom Hooks
-   **Maps:** React Leaflet (Leaflet.js)
-   **Data Fetching:** Jotform API v1 (with Proxy handling for CORS)
-   **Utilities:** Levenshtein-based Fuzzy Search, Date-fns, Lucide Icons

## 📦 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Depoyu Klonlayın:**
    ```bash
    git clone [https://github.com/zeyneprk/2026-frontend-challenge-izmir.git](https://github.com/zeyneprk/2026-frontend-challenge-izmir.git)
    cd 2026-frontend-challenge-izmir
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Environment Variables Ayarı:**
    Kök dizinde bir `.env` dosyası oluşturun ve Jotform API anahtarınızı ekleyin:
    ```env
    VITE_JOTFORM_API_KEY=b119f8e8fd7fe6fbdb3aa032cef23299
    ```

4.  **Uygulamayı Başlatın:**
    ```bash
    npm run dev
    ```
    Tarayıcınızda `http://localhost:5173` adresine giderek soruşturmaya başlayabilirsiniz.

## 🔍 Proje Yapısı (Architecture)

-   `src/components/detective`: Projeye özel analiz bileşenleri (Timeline, Map, WhatsApp UI).
-   `src/context`: Global veri yönetimi ve filtreleme mantığı.
-   `src/services`: API istekleri ve hata yönetimi.
-   `src/utils`: Çelişki algılama, isim normalizasyonu ve puanlama algoritmaları.

## 👤 Geliştirici
**Zeynep Reyyan Kaleli** *3rd Year Computer Engineering Student @ Dokuz Eylül University*