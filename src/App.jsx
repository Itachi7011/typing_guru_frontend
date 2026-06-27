import { useState, useContext, useEffect } from "react";
import { ThemeContext } from "./context/ThemeContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import "./css/Public/Homepage.css";
import "./css/Public/Analytics.css";
import "./css/Public/AboutAndContactUs.css";
import "./css/Public/PrivacyAndTermsAndLanguages.css";
import "./css/Public/ExamPractice.css";
import "./css/Public/Home_Sidebar.css";
import "./css/Public/Drill.css";
import "./css/Public/DailyChallenge.css";
import "./css/Public/Typinggameshub.css";
import "./css/Public/Typinggamesplay.css";

import "./css/Users/Auth.css";
import "./css/Users/Profile.css";

import "./css/Components/Navbar.css";
import "./css/Components/Footer.css";
import "./css/Components/HandVisualizer.css";
import "./css/Components/ErrorPage.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
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

import Signup from "./pages/Users/auth/Signup";
import Login from "./pages/Users/auth/Login";
import ForgotPassword from "./pages/Users/auth/ForgotPassword";
import Verification from "./pages/Users/auth/Verification";
import Profile from "./pages/Users/Profile";
import Analytics from "./pages/Users/Analytics";

import AnaTypinggameshubytics from "./pages/Public/Games/Typinggameshub";

import Error404 from './components/Error/Error404';

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

            <Route path="/games" element={<AnaTypinggameshubytics />} />

            <Route path="/user/auth/signup" element={<Signup />} />
            <Route path="/user/auth/login" element={<Login />} />
            <Route path="/user/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/user/auth/verification" element={<Verification />} />
            <Route path="/user/profile" element={<Profile />} />
            <Route path="/user/analytics" element={<Analytics />} />

            <Route path="*" element={<Error404 />} />
          </Routes>

          <Footer />
        </Router>
      </div>
    </>
  );
}

export default App;
