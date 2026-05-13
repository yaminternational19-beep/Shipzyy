import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"; 
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import WcOutlinedIcon from "@mui/icons-material/WcOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import { getProfileDetails, updateProfileDetails } from "../../../utils/profileApi";
import { useAuth } from "../../../context/AuthContext"; 

function PersonalInfo() {
  const { updateUser } = useAuth(); 
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", gender: "", avatar: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await getProfileDetails();
      if (res && res.success) {
        const customer = res.data.customer;
        const initialData = {
          name: customer.name || "", 
          email: customer.email || "", 
          phone: customer.mobile || "", 
          gender: customer.gender || "", 
          avatar: customer.profile_image || "",
        };
        setFormData(initialData);
        setOriginalData(initialData);
      }
    } catch (error) { 
      toast.error("Failed to load profile details"); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageClick = () => {
    if (!isEditing) return toast.info("Click 'Edit Profile' to change photo.");
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFormData((prev) => ({ ...prev, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const dataToSubmit = new FormData();
      dataToSubmit.append('name', formData.name);
      dataToSubmit.append('email', formData.email);
      if (formData.gender) dataToSubmit.append('gender', formData.gender);
      if (selectedFile) dataToSubmit.append('profile_image', selectedFile);

      const res = await updateProfileDetails(dataToSubmit);
      if (res && res.success) {
        toast.success("Profile updated!");
        updateUser(res.data.customer); 
        setIsEditing(false);
        fetchProfile();
      }
    } catch (error) { toast.error("Failed to update"); }
    finally { setIsSubmitting(false); }
  };

  if (isLoading) return <div className="h-[414px] flex items-center justify-center w-full bg-[var(--card-bg)] rounded-[var(--radius-xl)] border border-[var(--border)] animate-pulse">Loading...</div>;

  return (
    <div className="h-[414px] w-full p-8 bg-[var(--card-bg)] rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-sm)] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border)] shrink-0">
        <h2 className="text-2xl font-black text-[var(--text-main)]">Personal Information</h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-[var(--primary)] text-[var(--primary)] font-black text-[12px] uppercase tracking-widest rounded-full hover:bg-[var(--primary)] hover:text-white transition-all shadow-sm">
            <EditOutlinedIcon fontSize="small" /> Edit Profile
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center mb-10">
            <div className={`relative w-28 h-28 rounded-full border-4 transition-all ${isEditing ? 'border-[var(--primary)] cursor-pointer' : 'border-[var(--border)]'} overflow-hidden group`} onClick={handleImageClick}>
              {formData.avatar ? <img src={formData.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center"><PersonOutlineOutlinedIcon className="text-slate-300 scale-[2]" /></div>}
              {isEditing && <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><CameraAltOutlinedIcon className="text-white" /></div>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} hidden />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Full Name</label>
              <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all ${isEditing ? 'bg-[var(--bg-soft)] border-transparent focus-within:border-[var(--primary)] focus-within:bg-white' : 'bg-transparent border-[var(--border)] opacity-70'}`}>
                <PersonOutlineOutlinedIcon className="text-slate-400" />
                <input name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent outline-none font-bold text-[15px]" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Email Address</label>
              <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all ${isEditing ? 'bg-[var(--bg-soft)] border-transparent focus-within:border-[var(--primary)] focus-within:bg-white' : 'bg-transparent border-[var(--border)] opacity-70'}`}>
                <MailOutlineIcon className="text-slate-400" />
                <input name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent outline-none font-bold text-[15px]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Mobile Number</label>
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-[var(--border)] opacity-60 bg-slate-50">
                <PhoneOutlinedIcon className="text-slate-400" />
                <input value={formData.phone} disabled className="w-full bg-transparent outline-none font-bold text-[15px]" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Gender</label>
              <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all ${isEditing ? 'bg-[var(--bg-soft)] border-transparent focus-within:border-[var(--primary)] focus-within:bg-white' : 'bg-transparent border-[var(--border)] opacity-70'}`}>
                <WcOutlinedIcon className="text-slate-400" />
                <select name="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent outline-none font-bold text-[15px] appearance-none cursor-pointer">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-4 pt-6 border-t border-[var(--border)]">
              <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 rounded-2xl border-2 border-[var(--border)] font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-4 rounded-2xl bg-[var(--primary)] text-white font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default PersonalInfo;