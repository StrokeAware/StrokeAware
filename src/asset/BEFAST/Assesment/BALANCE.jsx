import React, { useRef, useEffect, useState } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { Pose } from "@mediapipe/pose";
import "@mediapipe/pose/pose";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../../component/auth";
import BALANCEnarrator from "./NarratorAsset/BALANCEnarrator.mp3";
import Swal from "sweetalert2";
import Audiobutton from "./NarratorAsset/Audiobutton.png";
import Audiomutebutton from "./NarratorAsset/Audiomutebutton.png";

const BALANCE = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  const [balanceScore, setBalanceScore] = useState(100);
  const [average, setAverage] = useState(null);
  const [balanceFlag, setBalanceFlag] = useState(null);
  const [isCalculatingAverage, setIsCalculatingAverage] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [startTriggered, setStartTriggered] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [testPhase, setTestPhase] = useState("standby");
  const [isInCenter, setIsInCenter] = useState(false);
  const [centerCheckPassed, setCenterCheckPassed] = useState(false);
  const [deviation, setDeviation] = useState(null);
  const [standbyTimer, setStandbyTimer] = useState(10); // นับถอยหลังช่วง standby
  const cameraInstance = useRef(null);
  const hasSpoken = useRef(false); // prevent duplicate speech

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "th-TH";
    speechSynthesis.speak(utterance);
  };

  
  useEffect(() => {
    if (!startTriggered || testPhase !== "standby" || centerCheckPassed) return;
    if (standbyTimer === 0) {
      // ยังไม่อยู่กลางเส้นใน 5 วินาที ให้ถือว่าจบ assessment
      handleFailAssessment();
      return;
    }
    const timer = setTimeout(() => setStandbyTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [standbyTimer, testPhase, startTriggered, centerCheckPassed]);

  useEffect(() => {
    if (!startTriggered) return;

    let pose;
    let camera;
    if (!videoRef.current || !canvasRef.current) return;

    pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);

    camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) await pose.send({ image: videoRef.current });
      },
      width: 740,
      height: 580,
    });

    camera.start();
    cameraInstance.current = camera;

    return () => {
      if (cameraInstance.current) {
        cameraInstance.current.stop();
        cameraInstance.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [startTriggered]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((e) => console.warn("Auto-play failed:", e));
    }
  }, []);

  useEffect(() => {
    if (countdown === null) return;

    const timer = setTimeout(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1);
        if (countdown === 8 && !hasSpoken.current) {
          speak("เริ่มเดินได้");
          hasSpoken.current = true;
        }
      } else {
        if (testPhase === "counting") {
          startCollectingBalance();
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, testPhase]);

  useEffect(() => {
  if (
    testPhase === "standby" &&
    !centerCheckPassed &&
    deviation !== null &&
    deviation.x < 0.02 && 
    deviation.y < ALLOWABLE_Y_DIFF 
  ) {
    setIsInCenter(true);
    setCenterCheckPassed(true);
    setCountdown(8);
    setTestPhase("counting");
    hasSpoken.current = false;
  }
}, [testPhase, centerCheckPassed, deviation]);


  const handleFailAssessment = async () => {
    setShowInstructions(false);
    setTestPhase("finished");
    setStartTriggered(false);

    try {
      const docId = localStorage.getItem("patientId");
      if (docId) {
        const docRef = doc(firestore, "patients_topform", docId);
        await updateDoc(docRef, {
          balanceResult: "yes",
          balanceAverage: 0,
        });
      }
    } catch (err) {
      console.error("Error updating Firebase:", err);
    }

    Swal.fire({
      title: "ประเมินเสร็จสิ้น (ยังไม่ยืนตรงกลาง)",
      icon: "warning",
      confirmButtonText: "ถัดไป",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/BEFAST_MAIN_EYES");
      }
    });
  };

  const handleStart = () => {
    setShowInstructions(false);
    setStartTriggered(true);
    setTestPhase("standby");
    setCountdown(null);
    setIsInCenter(false);
    setCenterCheckPassed(false);
    setDeviation(null);
    setStandbyTimer(10); 
  };

  const onResults = (results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(video, 0, 0, width, height);
    drawCenterLine(ctx, width, height);
    if (results.poseLandmarks) {
      drawSkeleton(ctx, results.poseLandmarks, width, height);
      drawLandmarks(ctx, results.poseLandmarks, width, height);
      checkBalance(results.poseLandmarks);
    }
  };

  const drawCenterLine = (ctx, width, height) => {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();

  const horizontalLineY = height * 0.7;
  ctx.beginPath();
  ctx.moveTo(0, horizontalLineY);
  ctx.lineTo(width, horizontalLineY);
  ctx.stroke();

  ctx.setLineDash([]);
};

  const drawSkeleton = (ctx, landmarks, width, height) => {
    ctx.strokeStyle = "#4169E1";
    ctx.lineWidth = 2;
    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24],
      [23, 25], [25, 27], [27, 29], [29, 31],
      [24, 26], [26, 28], [28, 30], [30, 32],
    ];
    connections.forEach(([start, end]) => {
      if (landmarks[start] && landmarks[end]) {
        ctx.beginPath();
        ctx.moveTo(landmarks[start].x * width, landmarks[start].y * height);
        ctx.lineTo(landmarks[end].x * width, landmarks[end].y * height);
        ctx.stroke();
      }
    });
  };

  const drawLandmarks = (ctx, landmarks, width, height) => {
    ctx.fillStyle = "#FFA500";
    landmarks.forEach((landmark) => {
      ctx.beginPath();
      ctx.arc(landmark.x * width, landmark.y * height, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const HORIZONTAL_LINE_RATIO = 0.7;
  const ALLOWABLE_Y_DIFF = 0.07;
  
  const checkBalance = (landmarks) => {
  if (!landmarks[11] || !landmarks[12]) return;
  const left = landmarks[11];
  const right = landmarks[12];
  const midX = (left.x + right.x) / 2;
  const midY = (left.y + right.y) / 2;

  const devX = Math.abs(midX - 0.5);
  const devY = Math.abs(midY - HORIZONTAL_LINE_RATIO);

  const percent = Math.max(0, 1 - devX * 2) * 100;
  setBalanceScore(parseFloat(percent.toFixed(2)));

  setDeviation({ x: devX, y: devY });
};

  const startCollectingBalance = () => {
    if (isCalculatingAverage) return;
    if (videoRef.current) {
      videoRef.current.pause();
      const stream = videoRef.current.srcObject;
      if (stream) stream.getTracks().forEach((track) => track.stop());
    }

    setIsCalculatingAverage(true);
    setAverage(null);
    setBalanceFlag(null);

    const samples = [];
    const interval = setInterval(() => samples.push(balanceScore), 100);

    setTimeout(async () => {
      clearInterval(interval);
      const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
      const avgFixed = avg.toFixed(2);
      const flag = avg < 70 ? "yes" : "no";

      setAverage(avgFixed);
      setBalanceFlag(flag);
      setIsCalculatingAverage(false);

      try {
        const docId = localStorage.getItem("patientId");
        if (docId) {
          const docRef = doc(firestore, "patients_topform", docId);
          await updateDoc(docRef, {
            balanceResult: flag,
            balanceAverage: avgFixed,
          });
        }
      } catch (err) {
        console.error("Error updating Firebase:", err);
      }

      Swal.fire({
        title: "ประเมินเสร็จสิ้น",
        icon: "success",
        confirmButtonText: "ถัดไป",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/BEFAST_MAIN_EYES");
        }
      });
    }, 1000);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  return (
  <div className="container">
    <div className="BALANCEheader" style={{ width: "800px" }}>แบบประเมินการทรงตัว</div>
    {showInstructions && (
      <div className="instruction-popup" style={{ alignItems: "center", textAlign: "center" }}>
        <div className="popup-content" style={{ fontFamily: "Prompt" }}>
          <h2 style={{ fontSize: "35px", marginTop: "20px", textDecoration: "underline" }}>วิธีการประเมิน</h2>
          <div className="instruction-steps" style={{ color: "#787878", marginLeft: "-30px" }}>
            <div className="step">1. ก้าวถอยห่างจากกล้องประมาณ 6 ก้าว และยืนให้ตรงเส้นกลางหน้าจอ</div>
            <div className="step">2. หากได้ยินคำสั่งเริ่มเดินได้ ค่อยๆเดินเข้าหากล้อง</div>
          </div>
          <audio ref={audioRef} src={BALANCEnarrator} autoPlay />
          <div className="ismutepiccontainer">
            <button onClick={toggleMute} className="ismutepicBALANCE">
              <img src={isMuted ? Audiobutton : Audiomutebutton} style={{ width: "60px", height: "auto" }} alt="Audio Toggle" />
            </button>
          </div>
          <button onClick={handleStart} className="insideStart" style={{ marginTop: "-20px", marginBottom: "20px" }}>
            เริ่ม
          </button>
        </div>
      </div>
    )}

    <video ref={videoRef} autoPlay playsInline muted style={{ display: "none" }} />
    <canvas
      ref={canvasRef}
      width={640}
      height={480}
      className="canvas"
      style={{ display: startTriggered ? "block" : "none" }}
    />

    {testPhase === "standby" && !isInCenter && (
      <div>
        <p style={{ fontSize: "24px", fontFamily: "Prompt", fontWeight: "bold", marginTop: "20px" }}>
          กรุณายืนตรงกลางเส้น
        </p>
        <p style={{ fontSize: "24px", color: "#b22", fontFamily: "Prompt" }}>
          เวลาที่เหลือ: {standbyTimer} วินาที
        </p>
      </div>
    )}

    {testPhase === "counting" && countdown !== true && (
      <div style={{ textAlign: "center", marginTop: "15px" }}>
        <p style={{ fontSize: "24px", fontFamily: "Prompt", fontWeight: "bold" }}>
          เริ่มเดิน คุณเหลือเวลาอีก
        </p>
        <p style={{ fontSize: "32px", fontFamily: "Prompt", fontWeight: "bold" }}>
          {countdown}
        </p>
      </div>
    )}

    {isCalculatingAverage && (
      <p style={{ fontFamily: "Prompt", fontWeight: "500", fontSize: "26px", marginTop: "30px" }}>
        กำลังประมวลผล...
      </p>
    )}
  </div>
);
};

export default BALANCE;
