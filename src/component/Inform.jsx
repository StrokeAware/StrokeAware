import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./LoginRegister.css";
import Plus from "./Plus.png";
import { Link } from 'react-router-dom';
import SearchIcon from './pic/SearchIcon.png'
import Dashboard from './pic/Dashboard.png'

export function Inform() {
    return (
        <div>
            <div className="StrokeAwareCenter">
                Stroke Sight
                <img src={Plus} alt="Plus Icon" className="PlusIconCenter" />
            </div>
            <div className="container mt-4">

                {/* BEFAST Card */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <div className="insideTitle" style={{ fontFamily: "poppins" }}>
                            <strong>B E F A S T</strong>
                        </div>
                        <div className="d-flex align-items-center mb-3">
                            <div className="insideDetail flex-grow-1">
                                BEFAST แบบประเมินช่วยให้จดจำอาการและอาการแสดงของโรคหลอดเลือดสมองได้ง่ายและครบถ้วน การรู้จักอาการและนำผู้ป่วยส่งโรงพยาบาลได้อย่างรวดเร็วจะช่วยเพิ่มโอกาสในการฟื้นตัวลดความเสี่ยงจากภาวะแทรกซ้อนได้
                            </div>
                        </div>
                        <Link to="/PatientDetail" className="btn btn-primary w-100" style={{backgroundColor:"#8961df", borderRadius:"50px", fontFamily:"Prompt", fontWeight:"500"}}>เริ่มทำ</Link>
                    </div>
                </div>

                {/* Row for 2 lower cards: */}
                <div className="">
                    {/* Search Card */}
                    <div className="col-md-0 mb-4 row justify-content-start">
                        <div className="card shadow-sm mb-4" style={{textAlign:"center", textJustify:"cetner"}}>
                          <div className="card-body">
                            {/* Responsive heading: text left, icon right */}
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <span style={{
                                fontFamily: "Prompt",
                                fontWeight: "bold",
                                fontSize: "2rem",
                              }}>
                                ค้นหาผู้ป่วยและผลการประเมิน
                              </span>
                              <img
                                src={SearchIcon}
                                alt="icon"
                                style={{
                                  width: "40px",      // Responsive: You can use %, clamp(), or media queries for more control
                                  height: "40px",
                                  marginLeft:"30px",
                                  objectFit: "contain",
                                  flexShrink: 0      // Don't let icon shrink on small screens
                                }}
                              />
                            </div>
                            <Link
                              to="/SearchByIdCardAngel"
                              className="btn w-100"
                              style={{
                                backgroundColor: "#8961df",
                                borderRadius: "50px",
                                fontFamily: "Prompt",
                                fontWeight: "500",
                                color: "#fff"
                              }}
                            >
                              ค้นหา
                            </Link>
                          </div>
                        </div>
                    </div>
                    {/* Dashboard Card */}
                    <div className="col-md-0 mb-4 row justify-content-start">
                        <div className="card shadow-sm mb-4">
                            <div className="card-body d-flex flex-column justify-content-between">
                                <div>
                                    <span style={{
                                fontFamily: "Prompt",
                                fontWeight: "bold",
                                fontSize: "2rem",
                              }}>
                                ค้นหาผู้ป่วยและผลการประเมิน
                              </span>
                                    <img
                                src={Dashboard}
                                alt="icon"
                                style={{
                                  width: "50px",      // Responsive: You can use %, clamp(), or media queries for more control
                                  height: "50px",
                                  marginLeft:"30px",
                                  objectFit: "contain",
                                  flexShrink: 0      // Don't let icon shrink on small screens
                                }}
                              />
                                </div>
                                <Link
                              to="/DoctorDashBoard"
                              className="btn w-100"
                              style={{
                                backgroundColor: "#8961df",
                                borderRadius: "50px",
                                fontFamily: "Prompt",
                                fontWeight: "500",
                                color: "#fff"
                              }}
                            >
                              Dash Board
                            </Link>
                            </div>
                        </div>
                    </div>
                </div>
              
            </div>
        </div>
    );
}
