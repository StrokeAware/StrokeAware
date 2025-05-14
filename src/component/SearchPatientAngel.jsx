import React, { useState, useRef } from 'react';
import { firestore } from './auth'; // Firebase config
import { collection, query, where, getDocs } from 'firebase/firestore';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Link } from 'react-router-dom';
import './SearchPatientAngel.css';
import StrokeAwareButton from '../component/pic/StrokeAwareButton.png';
import Back from '../component/pic/Back.png';

const StrokeFormOverlay = () => {
  const [idCardInput, setIdCardInput] = useState('');
  const [patientData, setPatientData] = useState(null);
  const formRef = useRef(null);

  const handleSearch = async () => {
    setPatientData(null);

    if (idCardInput.trim() === '' || idCardInput.length !== 13) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'กรุณากรอกบัตรชาชนให้ถูกต้อง (13 หลัก)',
      });
      return;
    }

    try {
      const q = query(
        collection(firestore , 'patients_topform'),
        where('idCard', '==', idCardInput.trim())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Swal.fire({
          icon: 'error',
          title: 'ไม่พบข้อมูล',
          text: 'ไม่มีผู้ป่วยที่ใช้เลขบัตรประชาชนนี้อยู่ในระบบ',
        });
        return;
      }

      const data = querySnapshot.docs[0].data();
      setPatientData(data);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถค้นหาข้อมูลได้', 'error');
    }
  };

  const handleDownload = async () => {
    if (!formRef.current) return;
    const canvas = await html2canvas(formRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'px', [canvas.width, canvas.height]);
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('stroke_form_filled.pdf');
  };

  return (
    <div style={{ padding: '20px', fontFamily: "Prompt"}}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to={'/Inform'} className='BackButton'>
          <img src={Back} alt="Back" />
        </Link>
        <h2 style={{ margin: 0 }}>🔍 ค้นหาผู้ป่วยและผลการประเมิน</h2>
      </div>

      <Link to='/Inform' className='StrokeAwareTopRight'><img src={StrokeAwareButton}></img></Link>

      <input
        type="text"
        value={idCardInput}
        onChange={(e) => setIdCardInput(e.target.value)}
        placeholder="ใส่เลขบัตรประชาชน 13 หลัก"
        style={{
          marginLeft: "100px",
          padding: '8px',
          width: '300px',
          marginRight: '10px',
          borderRadius: "25px",
          fontFamily: "Prompt"
        }}
      />
      <button onClick={handleSearch} className='Search'>
        ค้นหา
      </button>

      {patientData && (
        <>
          <button onClick={handleDownload} className='Downloadbtn'>
            📥 ดาวน์โหลดเป็น PDF
          </button>

          <div ref={formRef} className="form-container">
            <img src="/StrokeAwareResultFormAngel.png" alt="Stroke Form" className="form-background" />

            {/* Overlaying normal fields */}
            <div className="overlay name">{patientData.name}</div>
            <div className="overlay surname">{patientData.surname}</div>
            <div className="overlay age">{patientData.age}</div>
            <div className="overlay gender">{patientData.gender}</div>
            <div className="overlay disease">{patientData.disease}</div>
            <div className="overlay phone">{patientData.phone}</div>
            <div className="overlay formDate">{patientData.formDate}</div>
            <div className="overlay formTime">{patientData.formTime}</div>
            <div className="overlay TimeFactor">{patientData.TimeFactor}</div>

            {/* Overlaying ID card split into 13 digits */}
            {patientData.idCard && patientData.idCard.split('').map((digit, index) => (
              <div key={index} className={`overlay idcard-digit idcard-${index}`}>
                {digit}
              </div>
            ))}

            {/* BEFAST results: show ✓ in correct column */}
            {patientData.balanceResult === 'yes' && <div className="overlay checkbox angel-balance-yes">✓</div>}
            {patientData.balanceResult === 'no' && <div className="overlay checkbox angel-balance-no">✓</div>}


            {patientData.eyeTestResult === 'yes' && <div className="overlay checkbox angel-eye-yes">✓</div>}
            {patientData.eyeTestResult === 'no' && <div className="overlay checkbox angel-eye-no">✓</div>}

            {patientData.faceAsymmetryResult === 'yes' && <div className="overlay checkbox angel-face-yes">✓</div>}
            {patientData.faceAsymmetryResult === 'no' && <div className="overlay checkbox angel-face-no">✓</div>}

            {patientData.armResult === 'yes' && <div className="overlay checkbox angel-arm-yes">✓</div>}
            {patientData.armResult === 'no' && <div className="overlay checkbox angel-arm-no">✓</div>}

            {patientData.speechResult === 'yes' && <div className="overlay checkbox angel-speech-yes">✓</div>}
            {patientData.speechResult === 'no' && <div className="overlay checkbox angel-speech-no">✓</div>}
          </div>
        </>
      )}
    </div>
  );
};

export default StrokeFormOverlay;
