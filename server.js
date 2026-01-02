// server.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import tf from '@tensorflow/tfjs-node';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Teachable Machine export klasörünü buraya koy (model.json + weights.bin)
const MODEL_PATH = 'model/model.json';

// Sınıf etiketlerini Teachable Machine’den aldıysan ekle:
const LABELS = ['ClassA', 'ClassB', 'ClassC']; // kendi etiketlerinle güncelle

let model = null;
let latestResult = { timestamp: 0, labels: LABELS, probabilities: [], topLabel: null, topProb: 0 };

async function loadModel() {
  model = await tf.loadGraphModel(`file://${MODEL_PATH}`);
  console.log('Model loaded');
}
loadModel().catch(console.error);

// Multer ile form-data’da gelen dosyayı alalım
const upload = multer({ storage: multer.memoryStorage() });

function decodeImageToTensor(buffer) {
  // tf.node.decodeImage: RGB tensör üretir, [H,W,3]
  const imgTensor = tf.node.decodeImage(buffer, 3);
  // Teachable Machine genelde 224x224 ister; modeline göre düzenle:
  const resized = tf.image.resizeBilinear(imgTensor, [224, 224]);
  const normalized = resized.div(255.0);
  const batched = normalized.expandDims(0); // [1,H,W,3]
  imgTensor.dispose();
  resized.dispose();
  normalized.dispose();
  return batched;
}

app.get('/health', (req, res) => {
  res.json({ ok: true, modelLoaded: !!model });
});

// Base64 JSON ile gönderim
app.post('/predict/base64', async (req, res) => {
  try {
    if (!model) return res.status(503).json({ error: 'Model not loaded' });
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' });

    const buffer = Buffer.from(imageBase64, 'base64');
    const input = decodeImageToTensor(buffer);
    const logits = model.execute(input);
    const probs = await tf.softmax(logits).array();
    tf.dispose([input, logits]);

    const p = probs[0];
    const maxIdx = p.indexOf(Math.max(...p));
    latestResult = {
      timestamp: Date.now(),
      labels: LABELS,
      probabilities: p,
      topLabel: LABELS[maxIdx],
      topProb: p[maxIdx]
    };

    res.json(latestResult);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'inference_failed' });
  }
});

// Form-data ile dosya gönderim
app.post('/predict/upload', upload.single('image'), async (req, res) => {
  try {
    if (!model) return res.status(503).json({ error: 'Model not loaded' });
    if (!req.file) return res.status(400).json({ error: 'image file required' });

    const input = decodeImageToTensor(req.file.buffer);
    const logits = model.execute(input);
    const probs = await tf.softmax(logits).array();
    tf.dispose([input, logits]);

    const p = probs[0];
    const maxIdx = p.indexOf(Math.max(...p));
    latestResult = {
      timestamp: Date.now(),
      labels: LABELS,
      probabilities: p,
      topLabel: LABELS[maxIdx],
      topProb: p[maxIdx]
    };

    res.json(latestResult);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'inference_failed' });
  }
});

// Roblox’un çekeceği son durum
app.get('/latest', (req, res) => {
  res.json(latestResult);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API on ${PORT}`));