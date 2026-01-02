# client.py
import cv2
import base64
import requests
import time

API_URL = "https://your-render-app.onrender.com/predict/base64"

cap = cv2.VideoCapture(0)  # varsayılan webcam
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

while True:
    ret, frame = cap.read()
    if not ret:
        time.sleep(0.2)
        continue

    # JPEG olarak sıkıştır ve base64’e çevir
    _, buf = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
    b64 = base64.b64encode(buf.tobytes()).decode('utf-8')

    try:
        r = requests.post(API_URL, json={"imageBase64": b64}, timeout=3)
        if r.ok:
            print(r.json())  # latestResult döner
    except Exception as e:
        print("err", e)

    time.sleep(0.25)  # 4 Hz civarı