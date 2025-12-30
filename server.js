const express = require("express");
const app = express();

let lastData = { label: "None", mean: 0 };

app.use(express.json());
app.use(express.static("."));

app.post("/update", (req, res) => {
    lastData = req.body;
    res.send("OK");
});

app.get("/api/predict", (req, res) => {
    res.json(lastData);
});

app.listen(10000, () => console.log("Server running"));