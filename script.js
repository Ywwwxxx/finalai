const URL = "./";
let model, webcam;

async function init() {
    model = await tmImage.load(URL + "model.json", URL + "metadata.json");

    const webcamElement = document.getElementById("webcam");
    webcam = await navigator.mediaDevices.getUserMedia({ video: true });
    webcamElement.srcObject = webcam;

    setInterval(predict, 500);
}

async function predict() {
    const prediction = await model.predict(document.getElementById("webcam"));

    const best = prediction.reduce((a, b) => (a.probability > b.probability ? a : b));

    fetch("/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            label: best.className,
            mean: best.probability
        })
    });
}

init();