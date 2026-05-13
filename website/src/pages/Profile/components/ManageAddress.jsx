import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { getProfileDetails } from "../../../utils/profileApi";
import { addAddress, updateAddress, deleteAddress } from "../../../utils/addressApi";

function ManageAddress() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialForm = {
    address_name: "Home",
    address_type: "myself",
    contact_person_name: "",
    contact_phone: "",
    address_line_1: "",
    address_line_2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    is_default: true,
    country: "India",
    latitude: 0,
    longitude: 0,
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (showForm && !editId) {
      setFormData(initialForm);
    }
  }, [showForm, editId]);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);

      const res = await getProfileDetails();

      if (res?.success) {
        setAddresses(res.data.addresses || []);
      }
    } catch (error) {
      toast.error("Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      const res = await deleteAddress(id);

      if (res.success) {
        toast.success("Deleted");
        fetchAddresses();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete");
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "pincode" && value.length === 6) {
      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${value}`
        );

        const data = await response.json();

        if (
          data[0]?.Status === "Success" &&
          data[0]?.PostOffice?.length > 0
        ) {
          const postOffice = data[0].PostOffice[0];

          setFormData((prev) => ({
            ...prev,
            pincode: value,
            city: postOffice.District,
            state: postOffice.State,
          }));
        }
      } catch (error) {}
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const payload = {
        ...formData,
        latitude: Number(formData.latitude) || 23.1765,
        longitude: Number(formData.longitude) || 75.8362,
      };

      const res = editId
        ? await updateAddress(editId, payload)
        : await addAddress(payload);

      if (res.success) {
        toast.success(editId ? "Updated" : "Saved");
        setShowForm(false);
        setEditId(null);
        setFormData(initialForm);
        fetchAddresses();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Validation Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[414px] flex items-center justify-center w-full bg-[var(--card-bg)] rounded-[var(--radius-xl)] border border-[var(--border)] text-sm font-bold text-[var(--primary)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-[414px] w-full p-4 bg-[var(--card-bg)] rounded-[var(--radius-xl)] border border-[var(--border)] shadow-sm flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border)] shrink-0">
        <h2 className="text-lg font-black text-[var(--text-main)]">
          My Addresses
        </h2>

        {!showForm && (
          <button
            onClick={() => {
              setEditId(null);
              setShowForm(true);
            }}
            className="px-4 h-9 bg-[var(--primary)] text-white font-black text-[10px] uppercase tracking-widest rounded-full"
          >
            + Add New
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-2 pb-1">
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
              {["Home", "Office", "Other"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      address_name: t,
                    }))
                  }
                  className={`h-8 rounded-lg text-[10px] font-black uppercase transition-all border ${
                    formData.address_name === t
                      ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
                      : "bg-white text-slate-400 border-slate-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      address_type: "myself",
                    }))
                  }
                  className={`flex-1 h-8 rounded-lg text-[10px] font-black transition-all border ${
                    formData.address_type === "myself"
                      ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
                      : "bg-white text-slate-500 border-slate-200"
                  }`}
                >
                  Myself
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      address_type: "someone_else",
                    }))
                  }
                  className={`flex-1 h-8 rounded-lg text-[10px] font-black transition-all border ${
                    formData.address_type === "someone_else"
                      ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
                      : "bg-white text-slate-500 border-slate-200"
                  }`}
                >
                  Someone Else
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-wide ml-1 mb-1 block">
                    {formData.address_type === "someone_else"
                      ? "Receiver Name"
                      : "Full Name"}
                  </label>

                  <input
                    name="contact_person_name"
                    value={formData.contact_person_name}
                    onChange={handleChange}
                    placeholder={
                      formData.address_type === "someone_else"
                        ? "Receiver Name"
                        : "Full Name"
                    }
                    required
                    className="w-full h-10 px-3 bg-white rounded-xl border border-transparent focus:border-[var(--primary)] outline-none text-[11px] font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-wide ml-1 mb-1 block">
                    Phone
                  </label>

                  <input
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    required
                    className="w-full h-10 px-3 bg-white rounded-xl border border-transparent focus:border-[var(--primary)] outline-none text-[11px] font-semibold"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wide ml-1 mb-1 block">
                Address Line 1
              </label>

              <input
                name="address_line_1"
                value={formData.address_line_1}
                onChange={handleChange}
                placeholder="House No, Street"
                required
                className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-transparent focus:border-[var(--primary)] outline-none text-[11px] font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wide ml-1 mb-1 block">
                  Address Line 2
                </label>

                <input
                  name="address_line_2"
                  value={formData.address_line_2}
                  onChange={handleChange}
                  placeholder="Area, Colony"
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-transparent focus:border-[var(--primary)] outline-none text-[11px] font-semibold"
                />
              </div>

              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wide ml-1 mb-1 block">
                  Landmark
                </label>

                <input
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="Nearby Landmark"
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-transparent focus:border-[var(--primary)] outline-none text-[11px] font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wide ml-1 mb-1 block">
                  City
                </label>

                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-transparent focus:border-[var(--primary)] outline-none text-[11px] font-semibold"
                />
              </div>

              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wide ml-1 mb-1 block">
                  State
                </label>

                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-transparent focus:border-[var(--primary)] outline-none text-[11px] font-semibold"
                />
              </div>

              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wide ml-1 mb-1 block">
                  Pincode
                </label>

                <input
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                  maxLength="6"
                  required
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-transparent focus:border-[var(--primary)] outline-none text-[11px] font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 h-10 rounded-xl border border-slate-200 font-black text-[10px] uppercase text-slate-400"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-10 rounded-xl bg-[var(--primary)] text-white font-black text-[10px] uppercase"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {addresses.map((loc) => (
              <div
                key={loc.id}
                className="p-3 rounded-2xl border bg-slate-50 border-slate-100 hover:border-[var(--primary)] transition-all group relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm bg-white text-[var(--primary)]">
                    {loc.address_name === "Home" ? (
                      <HomeOutlinedIcon fontSize="small" />
                    ) : loc.address_name === "Office" ? (
                      <BusinessOutlinedIcon fontSize="small" />
                    ) : (
                      <LocationOnOutlinedIcon fontSize="small" />
                    )}
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditId(loc.id);
                        setFormData(loc);
                        setShowForm(true);
                      }}
                      className="p-1.5 text-blue-500"
                    >
                      <EditOutlinedIcon sx={{ fontSize: 16 }} />
                    </button>

                    <button
                      onClick={() => handleDelete(loc.id)}
                      className="p-1.5 text-red-500"
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2 h-6 rounded-full bg-[var(--primary)] text-white text-[9px] font-black uppercase flex items-center">
                    {loc.address_name}
                  </span>

                  <span className="px-2 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[9px] font-black uppercase flex items-center">
                    {loc.address_type === "someone_else"
                      ? "Someone Else"
                      : "Myself"}
                  </span>
                </div>

                <p className="text-[10px] font-bold text-[var(--primary)] uppercase">
                  {loc.contact_person_name}
                </p>

                <p className="text-[10px] text-slate-500 font-semibold mb-1">
                  {loc.contact_phone}
                </p>

                <div className="space-y-0.5 text-[11px] text-slate-500 font-medium">
                  <p>{loc.address_line_1}</p>

                  {loc.address_line_2 && <p>{loc.address_line_2}</p>}

                  {loc.landmark && <p>{loc.landmark}</p>}

                  <p>
                    {loc.city}, {loc.state} - {loc.pincode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageAddress;