import express from "express";
import * as tf from "@tensorflow/tfjs-node";
import fs from "fs";

const app = express();
app.use(express.json({ limit: "10mb" }));

// Modeli yükle
let model;
(async () => {
  model = await tf.loadLayersModel("file://model/model.json");
  console.log("✅ Model yüklendi");
})();

// Metadata (sınıf etiketleri)
const metadata = JSON.parse(fs.readFileSync("model/metadata.json", "utf8"));
const labels = metadata.labels;

// Sınıflandırma yardımcıları
function preprocess(imageBuffer) {
  return tf.node
    .decodeImage(imageBuffer, 3)
    .resizeNearestNeighbor([224, 224]) // Teachable Machine default
    .expandDims(0)
    .toFloat()
    .div(tf.scalar(255));
}

async function classifyImage(imageBuffer) {
  if (!model) throw new Error("Model henüz yüklenmedi");
  const input = preprocess(imageBuffer);
  const output = model.predict(input);
  const probs = output.dataSync();
  input.dispose();
  output.dispose();

  let maxIndex = 0;
  let maxProb = probs[0];
  for (let i = 1; i < probs.length; i++) {
    if (probs[i] > maxProb) {
      maxProb = probs[i];
      maxIndex = i;
    }
  }
  return { gesture: labels[maxIndex], probability: maxProb };
}

// API endpoint: Base64 resim alır
app.post("/classify", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: "imageBase64 gerekli" });
    const buffer = Buffer.from(imageBase64, "base64");
    const result = await classifyImage(buffer);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Classification failed" });
  }
});

// Sağlık kontrolü
app.get("/health", (req, res) => {
  res.json({ ok: true, modelLoaded: !!model });
});

// Sunucu başlat
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});