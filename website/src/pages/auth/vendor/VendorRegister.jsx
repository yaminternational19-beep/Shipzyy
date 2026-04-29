// src/pages/Auth/vendor/VendorRegister.jsx
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Steps Import
import BasicInfo from "./steps/BasicInfo";
import Location from "./steps/Location";
import BusinessIds from "./steps/BusinessIds";
import BankDetails from "./steps/BankDetails";

function VendorRegister() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  //  State Data
  const [vendorData, setVendorData] = useState({
    businessName: "", businessCategory: [], ownerName: "", email: "", password: "", contactNumber: "", emergencyContact: "",
    address: "", city: "", state: "", country: "India", pincode: "", geoLocation: "",
    tradeLicense: "",
    bankName: "", accountHolderName: "", accountNumber: "", ifscCode: ""
  });

  useEffect(() => {
    if (!user || user.role !== "vendor") {
      // navigate("/register"); 
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setVendorData({ ...vendorData, [e.target.name]: e.target.value });
    setError(""); 
  };

  const handleVendorSubmit = () => {
    if (!vendorData.bankName || !vendorData.accountNumber || !vendorData.ifscCode) {
      return setError("Bank details are incomplete.");
    }
    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast.success("Vendor Registered Successfully! Please login.", { position: "top-center" });
      navigate("/login");
    }, 1000);
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!vendorData.businessName || !vendorData.ownerName || !vendorData.email || !vendorData.password) {
        return setError("Basic Info is incomplete. Please fill all fields.");
      }
      if (!vendorData.contactNumber || vendorData.contactNumber.length < 10) {
        return setError("Please enter a valid Contact Number.");
      }
    }
    if (currentStep === 2) {
      if (!vendorData.address || !vendorData.city || !vendorData.pincode) {
        return setError("Location details are incomplete.");
      }
    }

    setError("");
    setCurrentStep((prev) => prev + 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <BasicInfo vendorData={vendorData} handleChange={handleChange} />;
      case 2: return <Location vendorData={vendorData} handleChange={handleChange} />;
      case 3: return <BusinessIds vendorData={vendorData} handleChange={handleChange} />;
      case 4: return <BankDetails vendorData={vendorData} handleChange={handleChange} />;
      default: return <BasicInfo vendorData={vendorData} handleChange={handleChange} />;
    }
  };

  const steps = ['Basic Info', 'Location', 'Business IDs', 'Bank Details'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* 🔥 WIDTH AUR PADDING ADJUSTED YAHAN HAI */}
      <div className="w-full max-w-[650px] md:max-w-[700px] bg-cardBg rounded-2xl shadow-float border border-borderMain p-6 md:p-8 animate-fade-in relative">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-textMain mb-1">Register New Vendor</h2>
            <p className="text-xs font-medium text-textMuted">Onboard a professional partner to the platform</p>
          </div>
          <button 
            onClick={() => navigate("/register")}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-bgSoft text-textMuted hover:bg-red-50 hover:text-danger transition-colors outline-none"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Stepper UI */}
        <div className="flex justify-between items-center relative mb-8">
          <div className="absolute top-4 left-0 w-full h-[2px] bg-slate-200 -z-10"></div>
          
          {steps.map((label, index) => {
            const isActive = currentStep === index + 1;
            const isCompleted = currentStep > index + 1;
            return (
              <div key={index} className="flex flex-col items-center relative z-10 w-1/4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCompleted ? 'bg-success text-white shadow-md' : 
                  isActive ? 'bg-brand-gradient text-white shadow-md ring-4 ring-teal-100' : 
                  'bg-white border-2 border-slate-200 text-slate-400'
                }`}>
                  {isCompleted ? "✓" : index + 1}
                </div>
                <span className={`text-[11px] mt-2 font-bold text-center transition-colors ${
                  isActive || isCompleted ? 'text-textMain' : 'text-slate-400'
                }`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Form Content (Slightly reduced min-height) */}
        <div className="min-h-[220px] mb-5">
          {renderStepContent()}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-center text-[13px] font-bold text-danger mb-4 animate-pulse">{error}</p>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex gap-3 border-t border-slate-100 pt-5">
          {currentStep > 1 && (
            <button 
              type="button" 
              onClick={() => { setError(""); setCurrentStep(prev => prev - 1); }}
              className="flex-[0.4] h-11 rounded-lg bg-bgSoft text-textMain font-bold text-[13px] transition-all hover:bg-slate-200 hover:-translate-y-0.5"
            >
              Previous
            </button>
          )}

          {currentStep < 4 ? (
            <button 
              type="button" 
              onClick={nextStep}
              className="flex-1 h-11 rounded-lg bg-brand-gradient text-white font-bold text-[13px] transition-all hover:shadow-float hover:-translate-y-0.5"
            >
              Save & Next Step
            </button>
          ) : (
            <button 
              type="button" 
              onClick={handleVendorSubmit} 
              disabled={loading}
              className="flex-1 h-11 rounded-lg bg-success text-white font-bold text-[13px] transition-all hover:shadow-float hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-70 disabled:transform-none"
            >
              {loading ? "Processing..." : "Complete Registration"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default VendorRegister;