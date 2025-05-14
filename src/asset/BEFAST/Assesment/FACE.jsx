import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { doc, setDoc } from 'firebase/firestore';
import {firestore } from '../../../component/auth';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './FaceAsymmetry.css';

const FaceAsymmetry = () => {
  const navigate = useNavigate();
  const videoRef = useRef();
  const canvasRef = useRef();
  const [asymmetryScore, setAsymmetryScore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isFaceInFrame, setIsFaceInFrame] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const countdownRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  useEffect(() => {
    // Check for patient ID at the start
    const patientId = localStorage.getItem("patientId");
    if (!patientId) {
      navigate('/patientDetail');
      return;
    }

    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
          Swal.fire('Error', 'Cannot access camera', 'error');
        });
    };

    const loadModels = async () => {
      try {
        setIsLoading(true);
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);
        startVideo();
      } catch (error) {
        console.error("Error loading models:", error);
        Swal.fire('Error', 'Failed to load face detection models', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();

    return () => {
      stopCamera();
      clearCountdown();
      clearDetectionInterval();
    };
  }, [navigate]);

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const clearCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(3);
  };

  const clearDetectionInterval = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  const startCountdown = () => {
    clearCountdown();
    setIsDetecting(true);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearCountdown();
          captureAndAnalyze();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || hasCompleted) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);

      const detections = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true);

      if (detections) {
        const landmarks = detections.landmarks.positions;
        const nose = landmarks[30];
        const pairs = [[36, 45], [39, 42], [31, 35], [48, 54], [2, 14]];
        let totalDiff = 0;

        pairs.forEach(([leftIdx, rightIdx]) => {
          const left = landmarks[leftIdx];
          const right = landmarks[rightIdx];
          const mirroredRightX = 2 * nose.x - right.x;
          const dx = left.x - mirroredRightX;
          const dy = left.y - right.y;
          totalDiff += Math.sqrt(dx * dx + dy * dy);
        });

        const averageDiff = (totalDiff / pairs.length).toFixed(2);
        setAsymmetryScore(averageDiff);
        stopCamera();

        await saveToFirebase(averageDiff > 5 ? 'yes' : 'no');
        setHasCompleted(true);
        showResultAlert();
      }
    } catch (error) {
      console.error("Error in face analysis:", error);
      Swal.fire('Error', 'Failed to analyze face', 'error');
    } finally {
      setIsDetecting(false);
    }
  };

  const saveToFirebase = async (result) => {
    try {
      const patientId = localStorage.getItem("patientId");
      if (!patientId) {
        navigate('/patientDetail');
        return;
      }

      await setDoc(doc(firestore , "patients_topform", patientId), {
        faceAsymmetryResult: result,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error("Error saving to Firebase:", err);
      Swal.fire('Error', 'Failed to save results', 'error');
    }
  };

  const showResultAlert = () => {
    Swal.fire({
      title: 'การประเมินเสร็จสิ้น',
      icon: 'success',
      confirmButtonText: 'ถัดไป',
      allowOutsideClick: false,
    }).then(() => {
      navigate('/BEFAST_MAIN_ARM');
    });
  };

  const handleVideoPlay = () => {
    if (hasCompleted) return;
    clearDetectionInterval();

    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || isDetecting || hasCompleted) return;

      try {
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks(true);

        const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
        canvasRef.current.getContext('2d').clearRect(0, 0, dims.width, dims.height);

        if (detections) {
          const resized = faceapi.resizeResults(detections, dims);
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);

          const faceBox = resized.detection.box;
          const frameCenterX = dims.width / 2;
          const frameCenterY = dims.height / 2;
          const faceCenterX = faceBox.x + faceBox.width / 2;
          const faceCenterY = faceBox.y + faceBox.height / 2;

          const isCentered =
            Math.abs(faceCenterX - frameCenterX) < 50 &&
            Math.abs(faceCenterY - frameCenterY) < 50 &&
            faceBox.width > 150;

          setIsFaceInFrame(isCentered);

          if (isCentered && !isDetecting && !countdownRef.current && !hasCompleted) {
            startCountdown();
          } else if (!isCentered && countdownRef.current) {
            clearCountdown();
            setIsDetecting(false);
          }
        } else {
          setIsFaceInFrame(false);
          if (countdownRef.current) {
            clearCountdown();
            setIsDetecting(false);
          }
        }
      } catch (error) {
        console.error("Error in face detection:", error);
      }
    }, 300);
  };

  return (
    <div className="face-asymmetry-container">
      <div className="face-asymmetry-title" style={{ color: "#b897ff" }}>
        แบบประเมินวิเคราะห์ความปกติของใบหน้า
      </div>

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading facial recognition models...</p>
        </div>
      ) : (
        <>
          <div className="video-canvas-wrapper">
            {!hasCompleted && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  onPlay={handleVideoPlay}
                  className="video-element"
                />
                <canvas ref={canvasRef} className="canvas-overlay" />
                <div className="capture-frame">
                  <div className="frame-border"></div>
                  {isDetecting && isFaceInFrame && (
                    <div className="countdown-overlay">
                      <div className="countdown-circle">{countdown}</div>
                      <p>โปรดอย่าขยับ</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="instructions">
            {!hasCompleted ? (
              <>
                <p style={{ marginTop: "20px" }}>1. โปรดนำหน้าเข้าในกรอบสี่เหลี่ยม</p>
                <p>2. อยู่กับที่เป็นเวลา 3 วินาที จนนับถอยหลังเสร็จ</p>
                {isFaceInFrame && !isDetecting && (
                  <p className="face-detected">พบใบหน้า! กรุณาอยู่นิ่ง...</p>
                )}
              </>
            ) : (
              <p className="assessment-complete" style={{ marginTop: "20px" }}>
                กำลังแสดงผลลัพธ์...
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FaceAsymmetry;