import CryptoJS from "crypto-js";

const SECRET_KEY = "your_secret_key_here";

export const encodeId = (id) => {
    const encrypted = CryptoJS.AES.encrypt(String(id), SECRET_KEY).toString();
    return encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const decodeId = (encoded) => {
    try {
        let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        
        const bytes = CryptoJS.AES.decrypt(base64, SECRET_KEY);
        const originalId = bytes.toString(CryptoJS.enc.Utf8);
        
        if (!originalId) return encoded; 
        
        return originalId;
    } catch (error) {
        return encoded || null , console.error("Error decoding ID:", error);
    }
};