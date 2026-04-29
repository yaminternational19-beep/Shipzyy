import BadgeIcon from "@mui/icons-material/Badge";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useRef, useState } from "react";
import InputComponent from "../../../../components/common/InputComponent";

function BusinessIds({ vendorData, handleChange }) {
  const fileRef = useRef(null);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      // handleChange({ target: { name: "tradeLicenseFile", value: e.target.files[0] }});
    }
  };

  return (
    <div className="grid grid-cols-1 gap-y-4 mt-2">
      <InputComponent 
        icon={BadgeIcon} 
        label="Trade License Number" 
        name="tradeLicense" 
        value={vendorData.tradeLicense} 
        onChange={handleChange} 
      />
      
      <div className="flex flex-col gap-1.5 mt-2">
        <label className="text-xs font-semibold text-textLight">
          Upload Trade License (PDF/Image)
        </label>
        
        {/* Clickable Drag & Drop Style Box */}
        <div 
          className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-borderMain rounded-xl bg-bgSoft cursor-pointer transition-all hover:border-primary hover:bg-slate-50 group"
          onClick={() => fileRef.current.click()}
        >
          <input 
            type="file" 
            accept="image/*,.pdf" 
            ref={fileRef} 
            className="hidden" 
            onChange={handleFileChange} 
          />
          <UploadFileIcon 
            className="text-primary transition-transform group-hover:-translate-y-1" 
            style={{ fontSize: '40px' }} 
          />
          <p className="text-[13px] font-semibold text-textMain mt-3">
            {fileName ? fileName : "Click to upload PDF or Image"}
          </p>
          {!fileName && <span className="text-[11px] text-textMuted mt-1">Max file size: 5MB</span>}
        </div>
      </div>
    </div>
  );
}

export default BusinessIds;