// public/script.js

const API_BASE = "https://handai-1.onrender.com"; // KENDİ Render URL'in

// Bu fonksiyon SENDE ZATEN VAR, sadece örnek:
// Bunu değiştirme, sadece aşağıdaki sendGestureToServer ile bağlayacağız.
async function predictGestureFromFrame() {
    // Buraya kendi kamera + model kodun zaten yazılı:
    // - kameradan frame al
    // - tfjs ile modele ver
    // - en yüksek olasılıklı gesture'ı bul

    // ÖRNEK DÖNÜŞ (bunu gerçekte modelden alıyorsun):
    // return { gesture: "yumruk", probability: 0.92 };

    // Şimdilik, test için:
    return { gesture: "normal", probability: 0.99 };
}

// Backend'e gesture gönderen fonksiyon
async function sendGestureToServer(gesture, probability) {
    try {
        await fetch(API_BASE + "/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gesture, probability })
        });
    } catch (err) {
        console.error("update hatası:", err);
    }
}

// Sürekli tahmin yapıp backend'e atan loop
async function loop() {
    while (true) {
        const { gesture, probability } = await predictGestureFromFrame();

        console.log("Tarayıcıda algılanan:", gesture, probability);

        // Backend'e gönder
        sendGestureToServer(gesture, probability);

        // 0.5 saniyede bir
        await new Promise(r => setTimeout(r, 500));
    }
}

loop();
