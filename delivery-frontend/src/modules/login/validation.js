export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
    return password.length >= 6;
};

export const validateOTP = (otp) => {
    return /^\d{6}$/.test(otp);
};
