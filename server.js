// server.js
import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json({ limit: "5mb" }));
app.use(express.static("public")); // index.html + script.js dosyaların için

let lastGesture = null;
let lastProbability = null;
let lastUpdatedAt = null;

// Sağlık kontrolü
app.get("/health", (req, res) => {
    res.json({ ok: true, modelLoaded: true });
});

// Web sayfası (kamera + model) buraya gesture gönderir
app.post("/update", (req, res) => {
    const { gesture, probability } = req.body;

    if (!gesture) {
        return res.status(400).json({ error: "gesture missing" });
    }

    lastGesture = gesture;
    lastProbability = probability ?? null;
    lastUpdatedAt = Date.now();

    return res.json({ ok: true });
});

// Roblox buradan en son gesture'ı okur
app.get("/latest", (req, res) => {
    res.json({
        gesture: lastGesture,
        probability: lastProbability,
        updatedAt: lastUpdatedAt
    });
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
    console.log("Server running on port", port);
});
