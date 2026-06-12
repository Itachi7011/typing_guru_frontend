import { useState, useContext, useEffect } from "react";
import { ThemeContext } from "./context/ThemeContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import "./css/Public/Homepage.css"
import "./css/Public/AnalyticsAndDailyChallenge.css"
import "./css/Public/AboutAndContactUs.css"
import "./css/Public/PrivacyAndTermsAndLanguages.css"
import "./css/Public/ExamPractice.css"
import "./css/Public/Home_Sidebar.css"
import "./css/Public/Drill.css"


import "./css/Components/Navbar.css"
import "./css/Components/Footer.css"
import "./css/Components/HandVisualizer.css"


import Navbar from './components/Navbar';
import Footer from './components/Footer';
// import NotificationAlertDisplay from './components/Footer';
// import FloatingActionButton from './components/FloatingActionButton';
import Homepage from "./pages/Public/Homepage";
import Drill from "./pages/Public/Drill";
import AboutUs from "./pages/Public/AboutUs";
import ContactUs from "./pages/Public/ContactUs";
import DailyChallenge from "./pages/Public/DailyChallenge";
import PrivacyPolicy from "./pages/Public/PrivacyPolicy";
import TermsOfService from "./pages/Public/TermsOfService";
import LanguagesDescription from "./pages/Public/LanguagesDescription";
import ExamPractice from "./pages/Public/ExamPractice";

import Analytics from "./pages/Users/Analytics";



// import Error404 from './components/Error/Error404';

function App() {
  const { isDarkMode } = useContext(ThemeContext);
  // const token1 = localStorage.getItem("adminToken");

  return (
    <>
      <div className={isDarkMode ? "dark" : "light"}>
        <Router>
          {/* 
          {token1 ? <AdminNavbar /> : <Navbar />}
          <AdminSidebar />
        
          <FloatingActionButton /> */}

          {/* <AdminNavSidebar /> */}
           <Navbar />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/drills" element={<Drill />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contac-us" element={<ContactUs />} />
            <Route path="/daily" element={<DailyChallenge />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/languages" element={<LanguagesDescription />} />
            <Route path="/exams" element={<ExamPractice />} />

            <Route path="/user/analytics" element={<Analytics />} />
            

            {/* <Route path="*" element={<Error404 />} /> */}
          </Routes>

          <Footer />
        </Router>
      </div>
    </>
  );
}

export default App;
