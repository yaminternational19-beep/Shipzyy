import { useState } from "react";
import { toast } from "react-toastify";
import mockData from "../../../data/mockData.json";

// Icons
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";

function ManageAddress() {
  // Load initial addresses from JSON
  const [addresses, setAddresses] = useState(mockData.locations);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    label: "",
    address: "",
    zip: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getIcon = (label) => {
    const lower = label.toLowerCase();
    if (lower.includes("home")) return <HomeOutlinedIcon />;
    if (lower.includes("office") || lower.includes("work")) return <BusinessOutlinedIcon />;
    return <LocationOnOutlinedIcon />;
  };

  const handleDelete = (id) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
    toast.info("Address deleted successfully", { position: "top-center" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.label || !formData.address || !formData.zip) {
      return toast.error("Please fill all required fields", { position: "top-center" });
    }

    const newAddress = {
      id: Date.now(), // Generate a unique ID
      label: formData.label,
      address: formData.address,
      zip: formData.zip,
      icon: "custom",
    };

    setAddresses([...addresses, newAddress]); // Add to list
    setFormData({ label: "", address: "", zip: "" }); // Reset form
    setShowForm(false); // Go back to list view
    toast.success("New address added successfully!", { position: "top-center" });
  };

  return (
    <div className="manage-address-section">
      <div className="section-header-action">
        <h2 className="section-title" style={{ marginBottom: 0 }}>Saved Addresses</h2>

        {/* Toggle Button for Add Address */}
        {!showForm && (
          <button
            type="button"
            className="edit-icon-btn"
            onClick={() => setShowForm(true)}
          >
            <AddIcon fontSize="small" /> Add New
          </button>
        )}
      </div>

      {/* VIEW 1: ADD NEW ADDRESS FORM */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="add-address-form form-slide-in">
          <p className="section-subtitle">Enter details for your new delivery location.</p>

          <div className="grid-2">
            <div className="form-group">
              <input name="label" value={formData.label} onChange={handleChange} placeholder=" " required />
              <label>Address Label (e.g. Home, Office) *</label>
            </div>
            <div className="form-group">
              <input type="text" name="zip" value={formData.zip} onChange={handleChange} placeholder=" " maxLength="6" required />
              <label>Pincode / Zip Code *</label>
            </div>
          </div>

          <div className="form-group">
            <input name="address" value={formData.address} onChange={handleChange} placeholder=" " required />
            <label>Complete Address *</label>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" style={{ marginTop: 0 }}>
              Save Address
            </button>
          </div>
        </form>
      ) : (
        /* VIEW 2: SAVED ADDRESSES GRID */
        <div className="address-cards-grid">
          {addresses.map((loc) => (
            <div className="profile-address-card" key={loc.id}>
              <div className="addr-icon">{getIcon(loc.label)}</div>
              <div className="addr-details">
                <h4>{loc.label}</h4>
                <p>{loc.address}</p>
                <span>Pin: {loc.zip}</span>
              </div>
              <button
                className="delete-addr-btn"
                onClick={() => handleDelete(loc.id)}
                title="Delete Address"
              >
                <DeleteOutlineIcon fontSize="small" />
              </button>
            </div>
          ))}

          {/* Add New Address Card Placeholder */}
          <div className="profile-address-card add-new-card" onClick={() => setShowForm(true)}>
            <div className="add-circle">
              <AddIcon />
            </div>
            <h4>Add New Address</h4>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageAddress;