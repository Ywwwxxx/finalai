// Tahmin sonucunu al
const prediction = await model.predict(webcam.capture());

// En yüksek olasılıklı sınıfı bul
let highest = prediction[0].className;

// Yeni kategoriler: yumruk, x, dua, pence, normal
if (highest === "yumruk") {
    sendToRoblox("yumruk");
} else if (highest === "x") {
    sendToRoblox("x");
} else if (highest === "dua") {
    sendToRoblox("dua");
} else if (highest === "pence") {
    sendToRoblox("pence");
} else if (highest === "normal") {
    sendToRoblox("normal");
}
