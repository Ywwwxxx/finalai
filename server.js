// server.js
import express from "express";
import * as tf from "@tensorflow/tfjs-node";
import * as tmImage from "@teachablemachine/image";

const app = express();
app.use(express.json({ limit: "10mb" }));

// Model yükleme
const modelURL = "model/model.json";
const metadataURL = "model/metadata.json";

let model;
(async () => {
  model = await tmImage.load(modelURL, metadataURL);
  console.log("✅ Model yüklendi");
})();

// Gelen resmi sınıflandırma fonksiyonu
async function classifyImage(imageBuffer) {
  const image = tf.node.decodeImage(imageBuffer);
  const prediction = await model.predict(image);
  image.dispose();

  // En yüksek olasılıklı sınıfı bul
  let best = prediction[0].className;
  let highestProb = prediction[0].probability;
  for (let p of prediction) {
    if (p.probability > highestProb) {
      best = p.className;
      highestProb = p.probability;
    }
  }
  return best;
}

// API endpoint
app.post("/classify", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    const buffer = Buffer.from(imageBase64, "base64");
    const gesture = await classifyImage(buffer);
    res.json({ gesture });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Classification failed" });
  }
});

// Sunucu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});