import { useState, useContext, useEffect } from "react";
import { ThemeContext } from "./context/ThemeContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import "./css/Public/Homepage.css"
// import "./css/Public/SubsriptionPlans.css"
// import "./css/Public/GlobalPrivacyPolicy.css"
// import "./css/Public/TermsofService.css"
// import "./css/Public/ContactUs.css"
// import "./css/Public/AboutUs.css"
// import "./css/Public/OurServices.css"
// import "./css/Public/APIReference.css"
// import "./css/Public/Changelogs.css"
// import "./css/Public/ProductAuthentication.css"
// import "./css/Public/ProductSingleSignOn.css"
// import "./css/Public/MultiFactorAuth.css"
// import "./css/Public/APIAccess.css"
// import "./css/Public/IntegrationGuide.css"
// import "./css/Public/PublicRoadmap.css"
// import "./css/Public/ScheduleDemo.css"
// import "./css/Public/WatchDemo.css"

import "./css/Components/Navbar.css"
import "./css/Components/Footer.css"
// import "./css/Components/NotificationAlertDisplay.css"
// import "./css/Components/VirtualKeyboard.css"
// import "./css/Components/ClientLogin.css"
// import "./css/Components/FloatingActionButton.css"
// import "./css/Components/ErrorPage.css"

// import "./css/Client/ClientRegistration.css"
// import "./css/Client/ClientProfile.css"
// import "./css/Client/ClientMainSettings.css"
// import "./css/Client/ClientSecurity.css"
// import "./css/Client/CustomRegistrationForm.css"
// import "./css/Client/ClientDashboard.css"
// import "./css/Client/AddTeamMember.css"
// import "./css/Client/ClientTeamManagement.css"
// import "./css/Client/BillingAndSubscription.css"
// import "./css/Client/UsersAnalytics.css"

// import "./css/User/UserRegistraton.css"
// import "./css/User/UserLogin.css"
// import "./css/User/UserProfile.css"
// import "./css/User/UserForgotPassword.css"
// import "./css/User/UserSettings.css"
// import "./css/User/UserEmailVerification.css"

// import "./css/Admin/AdminNavbar.css"
// import "./css/Admin/AdminSidebar.css"
// import "./css/Admin/AdminRegistration.css"
// import "./css/Admin/AdminEmailVerification.css"
// import "./css/Admin/AdminLogin.css"
// import "./css/Admin/AdminProfile.css"
// import "./css/Admin/AdminSecurity.css"
// import "./css/Admin/AdminDashboard.css"
// import "./css/Admin/AdminSystemHealth.css"
// import "./css/Admin/AdminUsersList.css"
// import "./css/Admin/SubscriptionPlans.css"
// import "./css/Admin/PrivacyPolicy.css"
// import "./css/Admin/TermsOfUse.css"
// import "./css/Admin/AdminSettings.css"
// import "./css/Admin/AdminClientLogs.css"
// import "./css/Admin/AdminSearchBar.css"
// import "./css/Admin/NotificationManager.css"

import Navbar from './components/Navbar';
import Footer from './components/Footer';
// import NotificationAlertDisplay from './components/Footer';
// import FloatingActionButton from './components/FloatingActionButton';
import Homepage from "./pages/Public/Homepage";
import Drill from "./pages/Public/Drill";
// import SubsriptionPlans from './pages/Public/SubsriptionPlans';
// import GlobalPrivacyPolicy from './pages/Public/GlobalPrivacyPolicy';
// import TermsofService from './pages/Public/TermsofService';
// import ContactUs from './pages/Public/ContactUs';
// import AboutUs from './pages/Public/AboutUs';
// import OurServices from './pages/Public/OurServices';
// import APIReference from './pages/Public/APIReference';
// import Changelogs from './pages/Public/Changelogs';
// import ProductAuthentication from './pages/Public/ProductAuthentication';
// import ProductSingleSignOn from './pages/Public/ProductSingleSignOn';
// import MultiFactorAuth from './pages/Public/MultiFactorAuth';
// import APIAccess from './pages/Public/APIAccess';
// import IntegrationGuide from './pages/Public/IntegrationGuide';
// import PublicRoadmap from './pages/Public/PublicRoadmap';
// import ScheduleDemo from './pages/Public/ScheduleDemo';
// import WatchDemo from './pages/Public/WatchDemo';

// import UserRegistration from './pages/User/Auth/UserRegistration';
// import UserLogin from './pages/User/Auth/UserLogin';
// import UserEmailVerificatoin from './pages/User/Auth/UserEmailVerificatoin';
// import UserForgotPassword from './pages/User/Auth/UserForgotPassword';
// import UserProfile from './pages/User/Profile/UserProfile';
// import GeneralSettings from './pages/User/Settings/GeneralSettings';
// import SecuritySetting from './pages/User/Settings/SecuritySetting';
// import NotificationSettings from './pages/User/Settings/NotificationSettings';

// import ClientLogin from './pages/Client/Auth/ClientLogin';
// import ClientRegistration from './pages/Client/Auth/ClientRegistration';
// import ClientEmailVerification from './pages/Client/Auth/ClientEmailVerification';
// import ClientProfile from './pages/Client/Profile/ClientProfile';
// import ClientMainSettings from './pages/Client/Settings/ClientMainSettings';
// import ClientSecurity from './pages/Client/Settings/ClientSecurity';
// import CustomRegistrationForm from './pages/Client/CustomRegistrationForm/CustomRegistrationForm';
// import ClientDashboard from './pages/Client/Dashboard/ClientDashboard';
// import UsersAnalytics from './pages/Client/Dashboard/UsersAnalytics';
// import AddTeamMember from './pages/Client/Team/AddTeamMember';
// import ClientTeamManagement from './pages/Client/Team/ClientTeamManagement';
// import BillingAndSubscription from './pages/Client/Billing/BillingAndSubscription';
// import UsersList from './pages/Client/List/UsersList';
// import ClientsOwnLogs from './pages/Client/Logs/ClientsOwnLogs';
// import ClientsUsersLogs from './pages/Client/Logs/ClientsUsersLogs';

// import AdminNavbar from './pages/Admin/AdminComponents/AdminNavbar';
// import AdminSidebar from './pages/Admin/AdminComponents/AdminSidebar';
// import AdminRegistration from './pages/Admin/Auth/AdminRegistration';
// import AdminEmailVerification from './pages/Admin/Auth/AdminEmailVerification';
// import AdminLogin from './pages/Admin/Auth/AdminLogin';
// import AdminProfile from './pages/Admin/Profile/AdminProfile';
// import AdminSecurity from './pages/Admin/Profile/AdminSecurity';
// import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard';
// import AdminSystemHealth from './pages/Admin/Dashboard/AdminSystemHealth';
// import AdminUsersList from './pages/Admin/AdminUsersList';
// import SubscriptionPlans from './pages/Admin/SubscriptionPlans';
// import PrivacyPolicy from './pages/Admin/PrivacyPolicyAndTerms/PrivacyPolicy';
// import TermsOfUse from './pages/Admin/PrivacyPolicyAndTerms/TermsOfUse';
// import AdminClientLogs from './pages/Admin/Logs/AdminClientLogs';
// import AdminUserLogs from './pages/Admin/Logs/AdminUserLogs';
// import AdminSettings from './pages/Admin/Settings/AdminSettings';
// import AdminSearchBar from './pages/Admin/Settings/SearchBarSettings/AdminSearchBar';
// import NotificationManager from './pages/Admin/Settings/Notifications/NotificationManager';

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
            {/* <Route path="/pricing" element={<SubsriptionPlans />} />
            <Route path="/privacy-policy" element={<GlobalPrivacyPolicy />} />
            <Route path="/TermsofService" element={<TermsofService />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/our-services" element={<OurServices />} />
            <Route path="/my-api-reference" element={<APIReference />} />
            <Route path="/changelog" element={<Changelogs />} />
            <Route path="/product/authentication" element={<ProductAuthentication />} />
            <Route path="/product/sso" element={<ProductSingleSignOn />} />
            <Route path="/product/mfa" element={<MultiFactorAuth />} />
            <Route path="/product/api" element={<APIAccess />} />
            <Route path="/integration-guides" element={<IntegrationGuide />} />
            <Route path="/public-roadmap" element={<PublicRoadmap />} />
            <Route path="/schedule-demo" element={<ScheduleDemo />} />
            <Route path="/watch-demo" element={<WatchDemo />} />

            <Route path="/user/registration" element={<UserRegistration />} />
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/user/email-verification" element={<UserEmailVerificatoin />} />
            <Route path="/user/forgot-password" element={<UserForgotPassword />} />
            <Route path="/user/profile" element={<UserProfile />} />
            <Route path="/user/generalSettings" element={<GeneralSettings />} />
            <Route path="/user/securitySettings" element={<SecuritySetting />} />
            <Route path="/user/notificationsSettings" element={<NotificationSettings />} />

            <Route path="/client/signup" element={<ClientRegistration />} />
            <Route path="/client/login" element={<ClientLogin />} />
            <Route path="/client/email-verification" element={<ClientEmailVerification />} />
            <Route path="/client/profile" element={<ClientProfile />} />
            <Route path="/client/settings/general" element={<ClientMainSettings />} />
            <Route path="/client/settings/security" element={<ClientSecurity />} />
            <Route path="/client/settings/custom-registration-form" element={<CustomRegistrationForm />} />
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/analytics" element={<UsersAnalytics />} />
            <Route path="/AddTeamMember" element={<AddTeamMember />} />
            <Route path="/ClientTeamManagement" element={<ClientTeamManagement />} />
            <Route path="/client/billing" element={<BillingAndSubscription />} />
            <Route path="/client/users/all" element={<UsersList />} />
            <Route path="/client/logs/my-logs" element={<ClientsOwnLogs />} />
            <Route path="/client/logs/users-logs" element={<ClientsUsersLogs />} />


            <Route path="/admin/registration" element={<AdminRegistration />} />
            <Route path="/admin/email-verification" element={<AdminEmailVerification />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/settings/security" element={<AdminSecurity />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/system/health" element={<AdminSystemHealth />} />
            <Route path="/admin/users/all" element={<AdminUsersList />} />
            <Route path="/admin/billing/subscriptions" element={<SubscriptionPlans />} />
            <Route path="/admin/notification/manager" element={<NotificationManager />} />
            <Route path="/admin/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/admin/terms-of-use" element={<TermsOfUse />} />
            <Route path="/admin/clients/logs" element={<AdminClientLogs />} />
            <Route path="/admin/users/logs" element={<AdminUserLogs />} />
            <Route path="/admin/settings/general" element={<AdminSettings />} />
            <Route path="/admin/settings/nav-options" element={<AdminSearchBar />} /> */}

            {/* <Route path="*" element={<Error404 />} /> */}
          </Routes>

          <Footer />
        </Router>
      </div>
    </>
  );
}

export default App;
