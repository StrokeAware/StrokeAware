import React, { useState } from "react";
import '../../component/LoginRegister.css';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { Link, Navigate } from "react-router-dom";
import { firestore } from '../../component/auth';
import { doc, updateDoc } from 'firebase/firestore';

import TIMEcomponent from "./asset_pic/TIMEcomponent.png";
import plus from '../../component/pic/Plus asset.png';

export function BEFAST_MAIN_TIME() {
    const [hours, setHours] = useState("");
    const [minutes, setMinutes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const patientName = localStorage.getItem('patientName');
    const patientId = localStorage.getItem('patientId');

    if (!patientName || !patientId) {
        return <Navigate to="/SearchByIdCardAngel" replace />;
    }

    const handleSubmit = async () => {
        if (isNaN(hours) || isNaN(minutes) || hours === "" || minutes === "") {
            Swal.fire({
                icon: 'error',
                title: 'กรอกข้อมูลไม่ถูกต้อง',
                text: 'กรุณากรอกตัวเลขเท่านั้น',
                customClass: { text: 'swal-text' }
            });
            return;
        }

        const h = parseInt(hours);
        const m = parseInt(minutes);

        if (h < 0 || h > 23 || m < 0 || m > 59) {
            Swal.fire({
                icon: 'error',
                title: 'กรอกข้อมูลไม่ถูกต้อง',
                text: 'ชั่วโมงต้องอยู่ระหว่าง 0-23 และนาทีต้องอยู่ระหว่าง 0-59',
                customClass: { text: 'swal-text' }
            });
            return;
        }

        const totalHours = h + m / 60;
        const TimeFactor = `${h}.${m.toString().padStart(2, '0')}`;
        setIsSubmitting(true);

        const updatePatientWithLocation = async (lat, lng) => {
            try {
                const patientRef = doc(firestore, "patients_topform", patientId);
                await updateDoc(patientRef, {
                    TimeFactor,
                    lat,
                    lng
                });

                localStorage.removeItem('patientName');
                localStorage.removeItem('patientId');

                if (totalHours > 4.5) {
                    await Swal.fire({
                        icon: 'warning',
                        title: 'อาการนานเกิน 4.5 ชั่วโมง',
                        text: 'โปรดรับผลการประเมินทั้งหมดที่หน้าต่อไป',
                        confirmButtonText: 'ตกลง'
                    });
                } else if (totalHours > 1) {
                    await Swal.fire({
                        icon: 'info',
                        title: 'อาการนานเกิน 1 ชั่วโมง',
                        text: 'โปรดรับผลการประเมินทั้งหมดที่หน้าต่อไป',
                        confirmButtonText: 'ตกลง'
                    });
                }

                navigate("/InForm");

            } catch (error) {
                console.error("Error updating patient document:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง',
                    confirmButtonText: 'ตกลง'
                });
            } finally {
                setIsSubmitting(false);
            }
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                updatePatientWithLocation(latitude, longitude);
            },
            (error) => {
                console.warn("Location permission denied:", error);
                Swal.fire({
                }).then(() => {
                    updatePatientWithLocation(null, null);
                });
            }
        );
    };

    return (
        <div style={{ pointerEvents: isSubmitting ? "none" : "auto", opacity: isSubmitting ? 0.5 : 1 }}>
            <div className="StrokeAwareCenter" style={{ fontWeight: 'bold', letterSpacing: "5px" }}>
                B E F A S T
            </div>
            <div className="StrokeAwareTopRight">
                Stroke Aware
                <img src={plus} style={{ marginLeft: "20px", marginBottom: "2px" }} />
            </div>
            <div className="d-flex justify-content-center gap-4 mt-4 BoxContainer">
                <div className="MiddleBoxTestRowTIME">
                    <div className="insideTitleBEFAST" style={{ fontFamily: "Poppins" }}>
                        T I M E
                    </div>
                    <div className="image-container">
                        <img src={TIMEcomponent} className="centerpictureMAIN5" />
                    </div>
                    <div className="insideTitleTHTIME" style={{ fontFamily: "Prompt" }}>
                        คุณมีอาการมาข้างต้นมานานแค่ไหนแล้ว <span style={{ fontWeight: "700", textDecoration: "underline" }}>(หากมี)</span>
                        <p style={{ fontWeight: "500", color: "#787878" }}>** หากไม่มีให้ใส่ 0 : 0 **</p>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '45px',
                            marginLeft: "-15px",
                            fontFamily: 'Prompt',
                            fontWeight: "600",
                            fontSize: "25px"
                        }}>
                            <div>ชั่วโมง</div>
                            <div>นาที</div>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px',
                            marginTop: '10px'
                        }}>
                            <input
                                type="number"
                                min="0"
                                max="23"
                                value={hours}
                                onChange={(e) => setHours(e.target.value)}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    fontSize: '24px',
                                    textAlign: 'center',
                                    borderRadius: '10px',
                                    border: '1px solid gray',
                                    fontFamily: "Prompt"
                                }}
                            />
                            <div style={{ fontSize: '24px' }}>:</div>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={minutes}
                                onChange={(e) => setMinutes(e.target.value)}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    fontSize: '24px',
                                    textAlign: 'center',
                                    borderRadius: '10px',
                                    border: '1px solid gray',
                                    fontFamily: "Prompt"
                                }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="insideStart"
                        disabled={isSubmitting}
                        style={{
                            marginTop: '20px',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            fontFamily: 'Prompt'
                        }}
                    >
                        {isSubmitting ? 'กำลังประมวลผล...' : 'ยืนยัน'}
                    </button>
                </div>
            </div>

            {patientName && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    fontFamily: 'Prompt',
                    background: '#f0f0f0',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    boxShadow: '0 0 5px rgba(0,0,0,0.1)'
                }}>
                    👤 {patientName}
                </div>
            )}
        </div>
    );
}
