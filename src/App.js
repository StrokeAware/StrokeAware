import React, { useEffect } from 'react'; 
import Register from './component/Register';
import Login from './component/Login';
import Otp from './asset/Otp/Otp'
import { Inform } from './component/Inform';
import {BEFAST_MAIN_BALANCE} from './asset/BEFAST/BEFAST_MAIN_BALANCE'
import {BEFAST_MAIN_EYES} from './asset/BEFAST/BEFAST_MAIN_EYES'
import {BEFAST_MAIN_FACE} from './asset/BEFAST/BEFAST_MAIN_FACE'
import {BEFAST_MAIN_ARM} from './asset/BEFAST/BEFAST_MAIN_ARM'
import {BEFAST_MAIN_SPEECH} from './asset/BEFAST/BEFAST_MAIN_SPEECH'
import {BEFAST_MAIN_TIME} from './asset/BEFAST/BEFAST_MAIN_TIME'
import ArmStrengthTest from './asset/BEFAST/Assesment/ARM_ass'
import Speech from './asset/BEFAST/Assesment/Speech';
import BALANCE from './asset/BEFAST/Assesment/BALANCE'
import FACE from './asset/BEFAST/Assesment/FACE'
import EYE from './asset/BEFAST/Assesment/EYE.jsx'
import TimeMap from './asset/BEFAST/Assesment/TimeMap.js'
import PatientDetail from './component/PatientDetail.jsx'
import {VoiceTrigger} from './component/TestVoiceSpeech.js'
import SearchByIdCard from './component/SearchPatient.jsx';
import Hospital from './asset/BEFAST/Assesment/Hospital.jsx';
import SearchByIdCardAngel from './component/SearchPatientAngel.jsx';
import DoctorDashboard from './component/Dashboard.jsx';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


function App() {
      useEffect(() => {
    // Clear user data on app load
    localStorage.removeItem('patientName');
    localStorage.removeItem('patientId');
    // Add more items if needed
  }, []);
  return (
    <Router>
      <Routes>
        <Route
                        exact
                        path="/"
                        element={<Login />}
                    />
        <Route          path="/Register"
                        element={<Register/>}
                    />
        <Route
                        path="/Inform"
                        element={<Inform/>}
                    />
         <Route
                        path="/Otp"
                        element={<Otp/>}
                    />
        <Route
                        path="/BEFAST_MAIN_BALANCE"
                        element={<BEFAST_MAIN_BALANCE/>}
                    />
        <Route
                        path="/BEFAST_MAIN_EYES"
                        element={<BEFAST_MAIN_EYES/>}
                    />
        <Route
                        path="/BEFAST_MAIN_FACE"
                        element={<BEFAST_MAIN_FACE/>}
                    />
        <Route
                        path="/BEFAST_MAIN_ARM"
                        element={<BEFAST_MAIN_ARM/>}
                    />
        <Route
                        path="/BEFAST_MAIN_SPEECH"
                        element={<BEFAST_MAIN_SPEECH/>}
                    />
        <Route
                        path="/BEFAST_MAIN_TIME"
                        element={<BEFAST_MAIN_TIME/>}
                    />         
        <Route
                        path="/ArmStrengthTest"
                        element={<ArmStrengthTest/>}
                    />      
        <Route
                        path="/Speech"
                        element={<Speech/>}
                    />
        <Route
                        path="/BALANCE"
                        element={<BALANCE/>}
                    />
        <Route
                        path="/FACE"
                        element={<FACE/>}
                    />
        <Route
                        path="/EYE"
                        element={<EYE/>}
                    />  
        <Route
                        path="/TimeMap"
                        element={<TimeMap/>}
                    />
        <Route
                        path="/PatientDetail"
                        element={<PatientDetail/>}
                    />
        <Route
                        path="/VoiceTrigger"
                        element={<VoiceTrigger/>}
                    />
        <Route
                        path="/SearchByIdCard"
                        element={<SearchByIdCard/>}
                    />
        <Route
                        path="/SearchByIdCardAngel"
                        element={<SearchByIdCardAngel/>}
                    />
        <Route
                        path="/Hospital"
                        element={<Hospital/>}
                    />
        <Route
                        path="/DoctorDashboard"
                        element={<DoctorDashboard/>}
                    />
      </Routes>
    </Router>
  );
}

export default App;

