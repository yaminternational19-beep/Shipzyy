import { useState, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"; 

function PersonalInfo() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  // State to manage lock/unlock edit mode
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    avatar: user?.avatar || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    // Prevent image upload if profile is locked
    if (!isEditing) {
      return toast.info("Please click 'Edit Profile' to change your photo.", { position: "top-center" });
    }
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      return toast.error("Name and Email are required!");
    }

    updateUser(formData);
    setIsEditing(false); // Lock the profile again after saving
    toast.success("Profile updated successfully!");
  };

  const handleCancel = () => {
    // Revert form data back to original user data if cancelled
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      gender: user?.gender || "",
      avatar: user?.avatar || "",
    });
    setIsEditing(false); // Lock the profile
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">

      {/* Header with Title and Edit Button */}
      <div className="section-header-action">
        <h2 className="section-title" style={{ marginBottom: 0 }}>Personal Information</h2>

        {!isEditing && (
          <button
            type="button"
            className="edit-icon-btn"
            onClick={() => setIsEditing(true)}
          >
            <EditOutlinedIcon fontSize="small" /> Edit Profile
          </button>
        )}
      </div>

      {/* Avatar Upload */}
      <div className="profile-upload-section" style={{ marginTop: "20px" }}>
        <div
          className={`profile-avatar-large ${!isEditing ? 'disabled-avatar' : ''}`}
          onClick={handleImageClick}
        >
          {formData.avatar ? <img src={formData.avatar} alt="Profile" /> : <span>Upload</span>}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          hidden
          disabled={!isEditing}
        />

        {isEditing && <p className="upload-hint">Click image to upload profile photo</p>}
      </div>

      {/* Form Fields */}
      <div className="grid-2">
        <div className="form-group">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder=" "
            disabled={!isEditing}
            className={!isEditing ? "input-disabled" : ""}
          />
          <label>Full Name *</label>
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder=" "
            disabled={!isEditing}
            className={!isEditing ? "input-disabled" : ""}
          />
          <label>Email *</label>
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            maxLength="10"
            placeholder=" "
            disabled={!isEditing}
            className={!isEditing ? "input-disabled" : ""}
          />
          <label>Phone</label>
        </div>

        <div className="form-group">
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            disabled={!isEditing}
            className={!isEditing ? "input-disabled" : ""}
          >
            <option value="" disabled hidden></option> /* Added empty option for floating label state */
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <label>Gender</label>
        </div>
      </div>

      {/* Action Buttons (Only visible when editing) */}
      {isEditing && (
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="primary-btn" style={{ marginTop: 0 }}>
            Save Changes
          </button>
        </div>
      )}
    </form>
  );
}

export default PersonalInfo;