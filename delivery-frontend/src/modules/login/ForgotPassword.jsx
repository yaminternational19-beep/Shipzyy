import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, ChevronLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { forgotPasswordApi, verifyResetOtpApi, resetPasswordApi, resendOtpApi } from '../../api/auth.api';

const ForgotPassword = ({ onBack, showToast }) => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [timer, setTimer] = useState(0);
    const [resetToken, setResetToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (timer > 0) {
            timerRef.current = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [timer]);

    const handleEmailSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!email) return showToast('Please enter your email');
        setIsLoading(true);
        try {
            const res = await forgotPasswordApi({ email });
            const { reset_token } = res.data.data;
            setResetToken(reset_token);

            showToast(res.data.message || 'OTP sent to your email', 'success');
            setStep(2);
            setTimer(45);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (timer === 0) {
            setIsLoading(true);
            try {
                const res = await resendOtpApi({ session_token: resetToken });
                setTimer(45);
                showToast(res.data.message || 'OTP resent successfully!', 'success');
            } catch (err) {
                showToast(err.response?.data?.message || 'Failed to resend OTP');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleOtpChange = (value, index) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5) {
            const nextInput = document.getElementById(`reset-otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`reset-otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) return showToast('Please enter 6-digit OTP');

        setIsLoading(true);
        try {
            const res = await verifyResetOtpApi({
                reset_token: resetToken,
                otp: otpValue
            });

            // Capture the new reset_token for the final step
            const newResetToken = res.data?.data?.reset_token;
            if (newResetToken) {
                setResetToken(newResetToken);
            }

            showToast(res.data.message || 'OTP Verified', 'success');
            setStep(3);
        } catch (err) {
            showToast(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return showToast('Passwords do not match');
        if (newPassword.length < 6) return showToast('Password must be at least 6 characters');

        setIsLoading(true);
        try {
            const res = await resetPasswordApi({
                reset_token: resetToken,
                new_password: newPassword,
                confirm_password: confirmPassword
            });
            showToast(res.data.message || 'Password reset successful! Please login with your new password.', 'success');
            onBack(); // Go back to login
        } catch (err) {
            showToast(err.response?.data?.message || 'Reset failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-password-flow">
            <button
                className="back-btn"
                onClick={onBack}
                style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--spacing-lg)',
                    cursor: 'pointer',
                    padding: 0
                }}
            >
                <ChevronLeft size={18} /> Back to login
            </button>

            {step === 1 && (
                <div className="step-content">
                    <div className="login-header">
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Forgot Password</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>No worries! Enter your email and we'll send you a reset code.</p>
                    </div>
                    <form onSubmit={handleEmailSubmit}>
                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <div className="input-wrapper">
                                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="email"
                                    className="input-field"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? "Sending..." : "Send Reset Code"} <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                        </button>
                    </form>
                </div>
            )}

            {step === 2 && (
                <div className="step-content">
                    <div className="login-header">
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Verify Code</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Enter 6-digit code sent to <strong>{email}</strong></p>
                    </div>
                    <form onSubmit={handleVerifyOtp}>
                        <div className="otp-container">
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    id={`reset-otp-${idx}`}
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
                            {isLoading ? "Verifying..." : "Verify & Continue"}
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
                                        style={{ background: 'none', color: 'var(--primary-color)', fontWeight: 600, padding: 0, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
                                    >
                                        {isLoading ? "Resending..." : "Resend Now"}
                                    </button>
                                )}
                            </p>
                        </div>
                    </form>
                </div>
            )}

            {step === 3 && (
                <div className="step-content">
                    <div className="login-header">
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Reset Password</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Choose a strong password you haven't used before.</p>
                    </div>
                    <form onSubmit={handleResetPassword}>
                        <div className="input-group">
                            <label className="input-label">New Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="input-field"
                                    placeholder="Minimum 6 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
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
                        <div className="input-group">
                            <label className="input-label">Confirm Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="input-field"
                                    placeholder="Repeat your new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;
