import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import stringSimilarity from 'string-similarity';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../../component/auth';
import Swal from 'sweetalert2';
import './Speech.css';

const SpeechEvaluationApp = () => {
  const navigate = useNavigate();
  const [isComplete, setIsComplete] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState(null);
  const [allowed, setAllowed] = useState(null);

  const task = {
    text: "ยายพาหลานไปซื้อขนมที่ตลาด",
    prompt: "พูดประโยค "
  };

  const evaluationLevels = [
    { label: "พูดชัดเจน", color: "#10B981", emoji: "✅", value: "no" },
    { label: "พูดไม่ชัดเล็กน้อย", color: "#F59E0B", emoji: "⚠️", value: "yes" },
    { label: "ฟังไม่เข้าใจ", color: "#EF4444", emoji: "❌", value: "yes" }
  ];

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    const patientName = localStorage.getItem('patientName');
    if (!patientName) {
      navigate('/PatientDetail');
      setAllowed(false);
    } else {
      setAllowed(true);
    }
  }, [navigate]);

  const getScore = (spoken) => {
    const similarity = stringSimilarity.compareTwoStrings(spoken.trim(), task.text.trim());
    if (similarity >= 0.85) return 0;
    if (similarity >= 0.5) return 1;
    return 2;
  };

  const storeSpeechResult = async (result) => {
    try {
      const docId = localStorage.getItem("patientId");
      if (docId) {
        const docRef = doc(firestore, "patients_topform", docId);
        await updateDoc(docRef, {
          speechResult: result.level.value
        });
      }
    } catch (err) {
      console.error("Error updating Firestore:", err);
      Swal.fire({
        title: 'Error',
        text: 'Failed to save results',
        icon: 'error',
        timer: 2000
      });
    }
  };

  const startEvaluation = () => {
    resetTranscript();
    setIsRecording(true);
    SpeechRecognition.startListening({ language: 'th-TH', continuous: false });
  };

  const stopEvaluation = () => {
    SpeechRecognition.stopListening();
    setIsRecording(false);

    const score = getScore(transcript);
    const resultObj = {
      transcript,
      score,
      level: evaluationLevels[score]
    };
    setResult(resultObj);
    setIsComplete(true);
    storeSpeechResult(resultObj);
  };

  const resetAll = () => {
    setResult(null);
    setIsComplete(false);
    resetTranscript();
  };

  if (allowed === null) return <div className="spe-loading">Loading...</div>;
  if (allowed === false) return null;

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="spe-container">
        <div className="spe-error-card">
          <h2>⚠️ ไม่รองรับการใช้งาน</h2>
          <p>เบราว์เซอร์นี้ไม่รองรับการจดจำเสียง กรุณาใช้ Chrome หรือ Edge</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spe-container">
      <div className="spe-card">
        <div className="spe-header">
          <h1 style={{fontSize:"40px"}}>แบบประเมินการออกเสียง</h1>
          <p style={{fontSize:"20px"}}>ทดสอบความชัดเจนในการพูดของคุณ</p>
        </div>

        {!isComplete ? (
          <div className="spe-content">
            <div className="spe-task-card">
              <div className="spe-task-prompt">
                <span>โปรด:</span>
                <h2>{task.prompt}</h2>
              </div>
              <div className="spe-target-text">
                <h3>{task.text}</h3>
              </div>
            </div>

            <div className="spe-recording-section">
              <button
                className={`spe-record-button ${isRecording ? 'spe-recording' : ''}`}
                onClick={isRecording ? stopEvaluation : startEvaluation}
              >
                <div className="spe-button-content">
                  {isRecording ? (
                    <>
                      <div className="spe-pulse-animation" />
                      <span>หยุด</span>
                    </>
                  ) : (
                    <>
                      <div className="spe-mic-icon" />
                      <span>เริ่มพูด</span>
                    </>
                  )}
                </div>
              </button>

              {transcript && (
                <div className="spe-speech-preview">
                  <p>คุณพูดว่า:</p>
                  <div className="spe-transcript">{transcript}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="spe-results">
            <h2>ผลการประเมิน</h2>

            <div className="spe-results-summary">
              <div
                className="spe-result-card"
                style={{ borderLeft: `4px solid ${result.level.color}` }}
              >
                <div className="spe-result-content">
                  <h3>{task.text}</h3>
                  <p className="spe-prompt-text">{task.prompt}</p>
                  <p className="spe-transcript-text">"{result.transcript}"</p>
                </div>
                <div
                  className="spe-score-tag"
                  style={{
                    backgroundColor: `${result.level.color}20`,
                    color: result.level.color
                  }}
                >
                  {result.level.emoji} {result.level.label}
                </div>
              </div>
            </div>

            <div className="spe-action-buttons">
              <Link to="/BEFAST_MAIN_TIME" className="spe-next-button">
                ถัดไป
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechEvaluationApp;