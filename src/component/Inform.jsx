import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./LoginRegister.css";
import Plus from "./Plus.png";
import { Link, useNavigate } from 'react-router-dom';
import BEFASTcomponent from "./pic/BEFASTcomponent.png";
import SearchIcon from "./pic/SearchIcon.png"

export function Inform() {
    return (
            <div>
                <div className="StrokeAwareCenter">
                Stroke Aware
                <img src={Plus} alt="Plus Icon" className="PlusIconCenter" />
            </div>

            <div className="container">
                <div className="Top-2" style={{ margin: '11px' }}>
                    แบบประเมินความเสี่ยงโรคหลอดเลือดสมอง
                </div>
                <div className="MiddleBoxRow1">
                    <div className="insideTitle" style={{ fontFamily: "poppins" }}>
                        B E F A S T
                    </div>
                    <div className="imagecomponentrightContainer1">
                            <img src={BEFASTcomponent} className="imagecomponentright4" alt="BEFAST" />
                        </div>
                        <div className="insideDetail">
                        BEFAST แบบประเมินช่วยให้จดจำอาการและอาการแสดงของโรคหลอดเลือดสมองได้ง่ายและครบถ้วน การรู้จักอาการและนำผู้ป่วยส่งโรงพยาบาลได้อย่างรวดเร็วจะช่วยเพิ่มโอกาสในการฟื้นตัวลดความเสี่ยงจากภาวะแทรกซ้อนได้
                    </div>
                    <Link to="/PatientDetail" className="insideStart">เริ่มทำ</Link>
                </div>
                <div className="MiddleBoxRow2">
                    <div className="insideTitle" style={{ fontFamily: "Prompt" , fontSize:"33px", marginTop:"20px"}}>
                        ค้นหาผู้ป่วยและผลการประเมิน
                    </div>
                        <div className="imagecomponentrightContainer2">
                            <img src={SearchIcon} className="imagecomponentright5" alt="BEFAST" />
                        </div>
                    <div className="ButtonBox">
                        <Link to="/SearchByIdCard" className="insideSearch">ค้นหา</Link>
                    </div>
                    
                </div>  
            </div>
            <Link to="/SearchByIdCardAngel" className="submit">go Angel</Link>
            <Link to="/DoctorDashboard" className="submit">go Dashboard</Link>
            {/* <Link to="/Hospital" className="submit">go Map</Link> */}
        </div>
    );
}
