// script.js
const API_URL = "https://your-render-app.onrender.com/predict/upload";

document.getElementById("predictBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files.length) {
    alert("Lütfen bir resim seçin!");
    return;
  }

  const formData = new FormData();
  formData.append("image", fileInput.files[0]);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    document.getElementById("result").textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error(err);
    alert("Tahmin sırasında hata oluştu!");
  }
});