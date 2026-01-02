import express from 'express';
import cors from 'cors';
import multer from 'multer';
import tf from '@tensorflow/tfjs-node';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Model yolu
const MODEL_PATH = path.join(process.cwd(), 'model/model.json');
let model = null;
let latestResult = {};

// Modeli yükle
async function loadModel() {
  try {
    model = await tf.loadLayersModel(`file://${MODEL_PATH}`);
    console.log('Model başarıyla yüklendi');
  } catch (err) {
    console.error('Model yüklenirken hata:', err);
  }
}
loadModel();

// Upload ayarı
const upload = multer({ storage: multer.memoryStorage() });

// Görüntüyü tensöre çevir
function decodeImageToTensor(buffer) {
  const imgTensor = tf.node.decodeImage(buffer, 3);
  const resized = tf.image.resizeBilinear(imgTensor, [224, 224]);
  const normalized = resized.div(255.0);
  const batched = normalized.expandDims(0);
  imgTensor.dispose();
  resized.dispose();
  normalized.dispose();
  return batched;
}

// Sağlık kontrolü
app.get('/health', (req, res) => {
  res.json({ ok: true, modelLoaded: !!model });
});

// Base64 tahmin
app.post('/predict/base64', async (req, res) => {
  try {
    if (!model) return res.status(503).json({ error: 'Model yüklenmedi' });
    const { imageBase64 } = req.body;
    const buffer = Buffer.from(imageBase64, 'base64');
    const input = decodeImageToTensor(buffer);
    const logits = model.execute(input);
    const probs = await tf.softmax(logits).array();
    tf.dispose([input, logits]);

    const p = probs[0];
    const maxIdx = p.indexOf(Math.max(...p));
    latestResult = { topLabel: maxIdx, probabilities: p };
    res.json(latestResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Tahmin hatası' });
  }
});

// Upload tahmin
app.post('/predict/upload', upload.single('image'), async (req, res) => {
  try {
    if (!model) return res.status(503).json({ error: 'Model yüklenmedi' });
    const input = decodeImageToTensor(req.file.buffer);
    const logits = model.execute(input);
    const probs = await tf.softmax(logits).array();
    tf.dispose([input, logits]);

    const p = probs[0];
    const maxIdx = p.indexOf(Math.max(...p));
    latestResult = { topLabel: maxIdx, probabilities: p };
    res.json(latestResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Tahmin hatası' });
  }
});

// Son tahmin
app.get('/latest', (req, res) => {
  res.json(latestResult);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`API on ${PORT}`));

