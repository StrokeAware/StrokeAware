import React, { useState, useEffect } from 'react';
import './LoginRegister.css';
import BrainSide from './pic/BrainSide.png';
import {auth} from './auth.js';
import {signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './auth.js';
import { Link , useNavigate} from 'react-router-dom';
import Swal from 'sweetalert2';


export default function Login() {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
        Swal.fire({
          title: 'ลงชื่อเข้าสำเร็จ',
          icon: 'success',
          confirmButtonText: 'ดำเนินการต่อ',
        });

      navigate("/Inform"); // ⬅️ This should work now
  
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error.message);
      Swal.fire({
        title: 'ลงชื่อเข้าล้มเหลว',
        text: 'อีเมล หรือ รหัสผ่าน ไม่ถูกต้อง',
        icon: 'error',
        confirmButtonText: 'ลองอีกครั้ง',
        
      });
    }
  };
  
  return (
    <div className='container'>
      <div className='Name'>
        <div className='Top'>Stroke Aware</div>
        <div className='Top-1'>แพลตฟอร์มคัดกรองโรคหลอดเลือดสมองจากแบบประเมินและคลื่นไฟฟ้าสมองด้วยปัญญาประดิษฐ์</div>
      </div>
      <div className='BrainFront-container'>
        <img src={BrainSide} alt='BrainFront' style={{ width: '210px', height: 'auto' }} />
      </div>
      <div className='header'>
        <div className='text'>เข้าสู่ระบบ</div>
      </div>
      <div className='inputs-container'>
        <div>
          <input className='input-email1'
            type="email"
            placeholder='อีเมล'
            style={{ fontFamily: 'prompt', fontWeight: 500 }}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <input className='input-password1'
            type="password"
            placeholder='รหัสผ่าน'
            style={{ fontFamily: 'prompt', fontWeight: 500 }}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="submit" onClick={handleSubmit}>
        ลงชื่อเข้า
        </button>
          {/* fordev */}
          <Link to="/Inform" className='login'>Inform</Link>
        <div className='login'>
          ยังไม่มีบัญชี?
        <Link
          to="/Register"
          className="Register"
        >
          ลงทะเบียน
        </Link>
        </div>
      </div>
    </div>
  );
}

