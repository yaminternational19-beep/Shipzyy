import { useState, useEffect, useRef } from "react"; 
import { useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import PersonalInfo from "./components/PersonalInfo";
import ManageAddress from "./components/ManageAddress";
import PasswordManager from "./components/PasswordManager";
import LogoutPanel from "./components/LogoutPanel";
import Wallet from "./components/Wallet";
import AboutUs from "./components/AboutUs";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsConditions from "./components/TermsConditions";
import DeletePage from "./components/DeletePage";

function Profile() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "personal");
  const profileTopRef = useRef(null);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

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
      // case "password": return <PasswordManager />;
      case "about": return <AboutUs />;
      case "privacy": return <PrivacyPolicy />;
      case "terms": return <TermsConditions />;
      case "logout": return <LogoutPanel />;
      case "delete": return <DeletePage />;
      default: return <PersonalInfo />;
    }
  };

  return (
    <div className="pt-10 pb-20 min-h-screen" ref={profileTopRef} style={{ scrollMarginTop: "100px" }}>
      <div className="text-center mb-10">
        <h1 className="text-[36px] font-black text-[var(--secondary)] tracking-tight">My Account</h1>
        <p className="text-[13px] text-[var(--secondary)] opacity-80 font-bold uppercase tracking-widest mt-2">Home / My Account</p>
      </div>

      <div className="container max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-[320px] shrink-0 sticky top-[100px] z-10">
             <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          
          <div key={activeTab} className="flex-1 w-full min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;