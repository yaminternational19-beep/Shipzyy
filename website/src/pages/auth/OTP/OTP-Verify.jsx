// src/pages/Auth/OTP/VerifyOtp.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOtp, resendOtp } from "../../../utils/authApi";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import bg from "../../../assets/deliveryimage.jpg";

function VerifyOtp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30); 
  const inputsRef = useRef([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const phone = location.state?.phone || location.state?.mobile || "";
  const initialToken = location.state?.token || "";
  const purpose = location.state?.purpose || "login"; 
  const type = location.state?.type || "login";

  const [currentToken, setCurrentToken] = useState(initialToken);

  useEffect(() => {
    if (!phone || !currentToken) {
      toast.error("Invalid session. Please request OTP again.");
      navigate("/login");
    }
  }, [phone, currentToken, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim().slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split("").forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      const lastIndex = Math.min(pastedData.length - 1, 5);
      inputsRef.current[lastIndex].focus();
      setError("");
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      // Service Layer Call
      const response = await verifyOtp({
        token: currentToken,
        otp: otpValue,
        purpose: purpose
      });

      if (response.success) {
        toast.success("Verification successful!");
        const { customer, accessToken, refreshToken } = response.data;

        login(customer, accessToken, refreshToken); 

        navigate(type === "reset" ? "/reset-password" : "/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    try {
      const response = await resendOtp({ token: currentToken });
      if (response.success) {
        toast.info("New OTP sent!");
        setTimer(30); 
        if (response.data?.token) setCurrentToken(response.data.token); 
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not resend OTP.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 bg-gradient-to-br from-slate-50 to-indigo-50">
      
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[420px] flex flex-col rounded-2xl bg-cardBg shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-borderMain overflow-hidden animate-fade-in">
        
        {/* 🔥 SEAMLESS HEADER (Brand Slogan at the Top) 🔥 */}
        <div className="w-full pt-8 pb-3 px-6 text-center z-20">
          <h2 className="text-[22px] md:text-[26px] font-black mb-0.5 text-transparent bg-clip-text bg-brand-gradient tracking-tight">
            Fast & Secure
          </h2>
          <p className="text-[12px] md:text-[13px] font-bold text-textMuted">
            Final step to your destination.
          </p>
        </div>

        {/* IMAGE SECTION - Clean Image Only */}
        <div className="h-[120px] relative w-full">
          <img src={bg} alt="verification" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10 z-10"></div>
        </div>

        {/* FORM SECTION */}
        <div className="px-8 pb-10 pt-8 text-center">
          
          <h2 className="text-2xl font-bold text-textMain mb-1">
            Verify OTP
          </h2>
          <p className="text-[13px] font-medium text-textMuted mb-6">
            Code sent to <span className="font-bold text-primary">+91 {phone}</span>
          </p>

          <form onSubmit={handleSubmit}>
            {/* OTP BOXES */}
            <div className="flex justify-center gap-2 sm:gap-3 mb-7" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  maxLength={1}
                  ref={(el) => (inputsRef.current[index] = el)}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-[42px] h-[52px] sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg border-2 border-borderMain bg-bgSoft text-textMain transition-all outline-none 
                  hover:border-primary/50 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 focus:-translate-y-1"
                />
              ))}
            </div>

            {error && <p className="text-[12px] text-danger font-semibold mb-4 animate-pulse">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 rounded-xl bg-brand-gradient text-white font-bold text-[15px] transition-all hover:shadow-lg active:scale-95 disabled:opacity-70 disabled:transform-none"
            >
              {loading ? "Verifying..." : "Verify & Proceed"}
            </button>
          </form>

          {/* TIMER / RESEND */}
          <div className="mt-6 text-sm">
            <span className="text-textMuted">Didn't receive the code? </span>
            {timer > 0 ? (
              <span className="font-bold text-primary bg-teal-50 px-3 py-1 rounded-full animate-pulse ml-1 inline-block">
                Resend in {timer}s
              </span>
            ) : (
              <button 
                type="button" 
                onClick={handleResendOtp}
                className="font-bold text-primary hover:underline underline-offset-4 decoration-2 ml-1"
              >
                Resend Now
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;