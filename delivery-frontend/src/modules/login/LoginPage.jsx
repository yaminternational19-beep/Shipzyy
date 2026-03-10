import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Lock,
    Mail,
    ChevronLeft,
    ArrowRight,
    Eye,
    EyeOff
} from 'lucide-react';
import './Login.css';
import { validateEmail, validatePassword } from './validation';
import Toast from '../../components/common/Toast/Toast';
import { loginApi, verifyLoginOtpApi, resendOtpApi } from '../../api/auth.api';
import ForgotPassword from './ForgotPassword';

const LoginPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Credentials, 2: OTP
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(15);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [receivedOtpInfo, setReceivedOtpInfo] = useState({ message: '', otp: '' });
    const timerRef = useRef(null);

    useEffect(() => {
        if (step === 2 && timer > 0) {
            timerRef.current = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            clearInterval(timerRef.current);
        }

        return () => clearInterval(timerRef.current);
    }, [step, timer]);

    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) return showToast('Please enter a valid email address');
        if (!validatePassword(password)) return showToast('Check the password');

        setIsLoading(true);
        try {
            const res = await loginApi({ email, password });
            const { login_token, otp: serverOtp } = res.data.data;

            // Save temporarily for OTP step
            localStorage.setItem("login_token", login_token);

            setReceivedOtpInfo({
                message: res.data.message || 'OTP sent successfully',
                otp: serverOtp
            });

            setStep(2);
            setTimer(45);
            showToast(`${res.data.message || 'OTP sent'}. OTP: ${serverOtp}`, 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (value, index) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) return showToast('Please enter 6-digit OTP');

        setIsLoading(true);
        try {
            const login_token = localStorage.getItem("login_token");
            const res = await verifyLoginOtpApi({
                login_token,
                otp: otpValue
            });

            const { accessToken, refreshToken, role } = res.data.data;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("userRole", role);
            localStorage.setItem("isAuthenticated", "true");

            // Remove temporary login token
            localStorage.removeItem("login_token");

            showToast(res.data.message || 'Login successful!', 'success');
            setTimeout(() => navigate('/'), 1000);
        } catch (err) {
            showToast(err.response?.data?.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (timer === 0) {
            setIsLoading(true);
            try {
                const session_token = localStorage.getItem("login_token");
                const res = await resendOtpApi({ session_token });
                const serverOtp = res.data.data?.otp;
                setTimer(45);

                if (serverOtp) {
                    setReceivedOtpInfo({
                        message: res.data.message || 'OTP resent successfully!',
                        otp: serverOtp
                    });
                    showToast(`${res.data.message}. OTP: ${serverOtp}`, 'success');
                } else {
                    showToast(res.data.message || 'OTP resent successfully!', 'success');
                }
            } catch (err) {
                showToast(err.response?.data?.message || 'Failed to resend OTP');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                {isForgotPassword ? (
                    <ForgotPassword onBack={() => setIsForgotPassword(false)} showToast={showToast} />
                ) : step === 1 ? (
                    <div className="step-content">
                        <div className="login-header">
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'var(--primary-color)',
                                borderRadius: '16px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                marginBottom: 'var(--spacing-md)',
                                boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
                            }}>
                                <Lock size={32} />
                            </div>
                            <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Log In</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Welcome back! Please enter your details.</p>
                        </div>
                        <form onSubmit={handleLoginSubmit}>
                            <div className="input-group">
                                <label className="input-label">Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="email"
                                        className="input-field"
                                        placeholder="admin@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Password</label>
                                <div className="input-wrapper">
                                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="input-field"
                                        placeholder="admin123"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            padding: '4px'
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', marginBottom: 'var(--spacing-md)' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsForgotPassword(true)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--primary-color)',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        padding: 0,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <button type="submit" className="login-button" disabled={isLoading}>
                                {isLoading ? "Processing..." : "Continue"} <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="step-content">
                        <button className="back-btn" onClick={() => { setStep(1); setReceivedOtpInfo({ message: '', otp: '' }); }} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)', cursor: 'pointer' }}>
                            <ChevronLeft size={18} /> Back to login
                        </button>
                        <div className="login-header">
                            <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Verify OTP</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Enter 6-digit code sent to <strong>{email}</strong></p>
                            {receivedOtpInfo.otp && (
                                <div style={{
                                    marginTop: '16px',
                                    padding: '12px',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    borderRadius: '12px',
                                    border: '1px dashed var(--primary-color)',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {receivedOtpInfo.message}
                                    </p>
                                    <p style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)', letterSpacing: '2px' }}>
                                        {receivedOtpInfo.otp}
                                    </p>
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleVerifyOtp}>
                            <div className="otp-container">
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        id={`otp-${idx}`}
                                        type="text"
                                        className="otp-input"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                                        maxLength={1}
                                    />
                                ))}
                            </div>
                            <button type="submit" className="login-button" disabled={isLoading}>
                                {isLoading ? "Verifying..." : "Verify & Login"}
                            </button>
                            <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {timer > 0 ? (
                                        <span>Resend code in <strong style={{ color: 'var(--primary-color)' }}>{timer}s</strong></span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={isLoading}
                                            style={{ background: 'none', color: 'var(--primary-color)', fontWeight: 600, padding: 0, opacity: isLoading ? 0.7 : 1 }}
                                        >
                                            {isLoading ? "Resending..." : "Resend Now"}
                                        </button>
                                    )}
                                </p>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {toast.show && (
                <div className="toast-container">
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast({ ...toast, show: false })}
                    />
                </div>
            )}
        </div>
    );
};

export default LoginPage;
