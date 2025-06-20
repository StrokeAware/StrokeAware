// GazeTest.jsx
import React, { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./GazeTest.css";

// ─── Chart.js setup ────────────────────────────────────────────────────────────
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// ─── Component ────────────────────────────────────────────────────────────────
export default function GazeTest() {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const faceMesh   = useRef(null);
  const cameraInst = useRef(null);
  const mounted    = useRef(false);     // guard against double-init in StrictMode

  /* ------------- state ------------- */
  const [step, setStep]                     = useState("calibration");
  const [status, setStatus]                 = useState(
    "1. มองตรง แล้วกดปุ่ม Calibrate (Spacebar)"
  );
  const [calCenter, setCalCenter]           = useState(null);
  const [gaze, setGaze]                     = useState({});
  const [iris, setIris]                     = useState(null);
  const [summary, setSummary]               = useState(null);
  const [moveLeft, setMoveLeft]             = useState([]);
  const [moveRight, setMoveRight]           = useState([]);
  const [eyeBoxPos, setEyeBoxPos]           = useState({ left: 0, top: 0 });
  const [eyeBoxColor, setEyeBoxColor]       = useState("#dc3545");

  /* ───────────────── Initialise FaceMesh + camera (run once) ──────────────── */
  useEffect(() => {
    if (mounted.current) return;      // already initialised
    mounted.current = true;

    faceMesh.current = new FaceMesh({
      locateFile: (f) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${f}`,  // 🛈 match version
    });
    faceMesh.current.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    faceMesh.current.onResults(onResults);

    cameraInst.current = new Camera(videoRef.current, {
      onFrame: async () => {
        try {
          await faceMesh.current.send({ image: videoRef.current });
        } catch (err) {
          /* swallow occasional send errors */
        }
      },
      width: 640,
      height: 480,
    });
    cameraInst.current.start();

    // cleanup on unmount
    return () => {
      cameraInst.current?.stop();
      faceMesh.current?.close?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ───────────────── Space-bar listener (run once) ────────────────────────── */
  useEffect(() => {
    const keyHandler = (e) => e.code === "Space" && handleCapture();
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [iris, step, calCenter, gaze]);

  /* ───────────────── onResults callback ───────────────────────────────────── */
  function onResults(res) {
  const canvas = canvasRef.current;
  const ctx    = canvas.getContext("2d");
  canvas.width = 640;
  canvas.height = 480;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(res.image, 0, 0, canvas.width, canvas.height);

  // draw centre box
  const boxW = 120, boxH = 60;
  const left = canvas.width / 2 - boxW / 2;
  const top  = canvas.height / 2 - boxH / 2;
  setEyeBoxPos({ left, top });

  let boxColor = "#dc3545"; // default (red)

  if (res.multiFaceLandmarks?.length) {
    const lm        = res.multiFaceLandmarks[0];
    const rightIris = lm.slice(468, 473);
    const leftIris  = lm.slice(473, 478);

    const avgRight = avgPt(rightIris, canvas.width, canvas.height);
    const avgLeft  = avgPt(leftIris,  canvas.width, canvas.height);

    drawDot(ctx, avgRight, "blue");
    drawDot(ctx, avgLeft,  "red");

    setIris({ left: avgLeft, right: avgRight });
    setMoveLeft((p)  => [...p.slice(-49),  avgLeft.x]);
    setMoveRight((p) => [...p.slice(-49), avgRight.x]);

    const cX = (avgLeft.x + avgRight.x) / 2;
    const cY = (avgLeft.y + avgRight.y) / 2;
    const tol = 20;
    const inside =
      cX >= left - tol && cX <= left + boxW + tol &&
      cY >= top  - tol && cY <= top  + boxH + tol;

    boxColor = inside ? "#28a745" : "#dc3545";
    setEyeBoxColor(boxColor);
  } else {
    setEyeBoxColor("#dc3545");
  }

  ctx.lineWidth = 3;
  ctx.strokeStyle = boxColor;
  ctx.strokeRect(left, top, boxW, boxH);
}


  /* ───────────────── helpers ──────────────────────────────────────────────── */
  const avgPt = (pts, w, h) => {
    const { x, y } = pts.reduce(
      (a, p) => ({ x: a.x + p.x, y: a.y + p.y }),
      { x: 0, y: 0 }
    );
    return { x: (x / pts.length) * w, y: (y / pts.length) * h };
  };

  const drawDot = (ctx, pos, color) => {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  };

  /* ───────────────── capture logic ────────────────────────────────────────── */
  function handleCapture() {
    if (!iris) return setStatus("ไม่พบค่าลูกตา ลองอีกครั้ง");

    const midX = iris.left.x + (iris.right.x - iris.left.x) / 2;

    if (step === "calibration") {
      setCalCenter(midX);
      setStatus("2. กรอกตาไปซ้ายสุด แล้วกด Spacebar");
      setStep("left");
    } else if (step === "left") {
      setGaze({ left: iris.left.x - calCenter });
      setStatus("3. กรอกตาไปขวาสุด แล้วกด Spacebar");
      setStep("right");
    } else if (step === "right") {
      const dxRight   = iris.right.x - calCenter;
      const result    = { ...gaze, right: dxRight };
      const threshold = 20;
      const goodL     = Math.abs(result.left)  >= threshold;
      const goodR     = Math.abs(result.right) >= threshold;

      const txt =
        goodL && goodR ? "✅ ปกติ"
        : !goodL && !goodR ? "⚠️ ผิดปกติทั้งสองข้าง"
        : !goodL ? "⚠️ กรอกตาซ้ายผิดปกติ"
        : "⚠️ กรอกตาขวาผิดปกติ";

      setSummary({ center: calCenter, ...result, summary: txt });
      setStatus("วิเคราะห์เสร็จสิ้น");
      setStep("done");
    }
  }

  /* ───────────────── Chart data ───────────────────────────────────────────── */
  const chartData = {
    labels: moveLeft.map((_, i) => i + 1),
    datasets: [
      { label: "ตาซ้าย (px)", data: moveLeft,  borderColor: "#ff6384", tension: 0.3 },
      { label: "ตาขวา (px)",  data: moveRight, borderColor: "#36a2eb", tension: 0.3 },
    ],
  };

  /* ───────────────── UI ───────────────────────────────────────────────────── */
  return (
    <div className="container">
      <h1 style={{fontFamily:"poppins"}}> Iris Gaze Calibration</h1>
      <p className="instructions">
        <strong>คำแนะนำ:</strong> จัดศีรษะให้อยู่กลางกล้อง<br />
        มองตรงไปยังกรอบ <span style={{ color: "#28a745" }}>สีเขียว</span><br />
        กด <strong>Spacebar</strong> เพื่อคาลิเบรต
      </p>

      <video ref={videoRef} style={{ display: "none" }} />
      <canvas
        ref={canvasRef}
        style={{ borderRadius: 8, boxShadow: "0 0 10px rgba(0,0,0,0.3)" }}
      />

      <p className="status">{status}</p>

      {summary && (
        <div className="result">
          <p>🎯 Center: {summary.center.toFixed(2)} px</p>
          <p>👈 ซ้าย&nbsp;&nbsp;: {summary.left.toFixed(2)} px</p>
          <p>👉 ขวา&nbsp;&nbsp;: {summary.right.toFixed(2)} px</p>
          <p>🧠 {summary.summary}</p>
        </div>
      )}

      <div style={{ maxWidth: 600, marginTop: 20 }}>
        <Line data={chartData} />
      </div>
    </div>
  );
}
