import React, { useState, useEffect } from 'react';
import { firestore } from './auth';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './LoginRegister.css';

const PatientTopForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    age: '',
    idCard: '',
    gender: '',
    disease: '',
    phone: '',
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    if (firestore) {
      setFirebaseInitialized(true);
    } else {
      console.error('Firestore instance is not available');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.name.trim()) errors.push('กรุณากรอกชื่อ');
    if (!formData.surname.trim()) errors.push('กรุณากรอกสกุล');
    if (!formData.age.trim() || isNaN(formData.age) || +formData.age <= 0) errors.push('กรุณากรอกอายุให้ถูกต้อง');
    if (!formData.idCard.trim() || !/^\d{13}$/.test(formData.idCard.trim())) errors.push('เลขบัตรประชาชนต้องมี 13 หลัก');
    if (!formData.gender) errors.push('กรุณาเลือกเพศ');
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.trim())) errors.push('เบอร์โทรศัพท์ต้องมี 10 หลัก');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firebaseInitialized) {
      Swal.fire('ระบบผิดปกติ', 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้', 'error');
      return;
    }

    setIsSubmitting(true);
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      Swal.fire({
        title: 'กรุณาตรวจสอบข้อมูล',
        html: validationErrors.map(err => `• ${err}`).join('<br>'),
        icon: 'error'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const q = query(collection(firestore, 'patients_topform'), where('idCard', '==', formData.idCard));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Swal.fire({
          title: 'มีข้อมูลซ้ำ',
          text: 'เลขบัตรประชาชนนี้มีอยู่ในระบบแล้ว',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        });
        setIsSubmitting(false);
        return;
      }

      const now = new Date();
      const months = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
      const day = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear() + 543;
      const hour = now.getHours().toString().padStart(2, '0');
      const minute = now.getMinutes().toString().padStart(2, '0');
      const formattedDate = `${monthName} ${day} พ.ศ. ${year}`;
      const formattedTime = `เวลา ${hour}:${minute} น.`;

      const docRef = await addDoc(collection(firestore, 'patients_topform'), {
        ...formData,
        fullName: `${formData.name} ${formData.surname}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        formDate: formattedDate,
        formTime: formattedTime
      });

      localStorage.setItem('patientName', `${formData.name} ${formData.surname}`);
      localStorage.setItem('patientId', docRef.id);

      await Swal.fire({
        title: 'บันทึกสำเร็จ',
        text: 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      }).then(() => {
        navigate('/BEFAST_MAIN_BALANCE');
      });

      setIsSaved(true);
    } catch (error) {
      console.error('Firestore error:', error);
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: `ไม่สามารถบันทึกข้อมูลได้: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'เข้าใจแล้ว'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="patient-form-container">
      <h2 className="form-title">🩺 กรอกข้อมูลส่วนตัวผู้รับการตรวจ</h2>
      <form onSubmit={handleSubmit} className="patient-form">
        <div className="form-group">
          <label>ชื่อ</label>
          <input name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>สกุล</label>
          <input name="surname" value={formData.surname} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>อายุ</label>
          <input name="age" value={formData.age} onChange={handleChange} required type="number" min="1" />
        </div>
        <div className="form-group">
          <label>เลขบัตรประชาชน (13 หลัก)</label>
          <input name="idCard" value={formData.idCard} onChange={handleChange} required pattern="\d{13}" />
        </div>
        <div className="form-group">
          <label>เพศ</label>
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">เลือกเพศ</option>
            <option value="ชาย">ชาย</option>
            <option value="หญิง">หญิง</option>
          </select>
        </div>
        <div className="form-group">
          <label>โรคประจำตัว (ถ้ามี)</label>
          <input name="disease" value={formData.disease} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>เบอร์โทรศัพท์ (10 หลัก)</label>
          <input name="phone" value={formData.phone} onChange={handleChange} required pattern="\d{10}" />
        </div>
        <div className="button-detail-container">
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>
      </form>
      {isSaved && (
        <div className="next-page-container">
          <Link to="/BEFAST_MAIN_BALANCE" className="next-page-btn">ไปหน้าถัดไป</Link>
        </div>
      )}
    </div>
  );
};

export default PatientTopForm;
