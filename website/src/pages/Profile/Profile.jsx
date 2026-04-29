import { useState, useEffect, useRef } from "react"; 
import Sidebar from "./components/Sidebar";
import PersonalInfo from "./components/PersonalInfo";
import ManageAddress from "./components/ManageAddress";
import PasswordManager from "./components/PasswordManager";
import LogoutPanel from "./components/LogoutPanel";
import Wallet from "./components/Wallet";
import AboutUs from "./components/AboutUs";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsConditions from "./components/TermsConditions";

import "./profile1.css";
function Profile() {
  const [activeTab, setActiveTab] = useState("personal");
  
  const profileTopRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      if (profileTopRef.current) {
        profileTopRef.current.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        });
      }
    }, 50);
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case "personal": return <PersonalInfo />;
      case "address": return <ManageAddress />;
      case "wallet": return <Wallet />;
      case "password": return <PasswordManager />;
      case "about": return <AboutUs />;
      case "privacy": return <PrivacyPolicy />;
      case "terms": return <TermsConditions />;
      case "logout": return <LogoutPanel />;
      default: return <PersonalInfo />;
    }
  };

  return (
 
    <div className="account-page" ref={profileTopRef} style={{ scrollMarginTop: "100px" }}>
      <div className="account-header">
        <h1>My Account</h1>
        <p>Home / My Account</p>
      </div>

      <div className="account-layout container">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Animation ke liye 'key' important hai */}
        <div key={activeTab} className="account-content glass-panel">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Profile;