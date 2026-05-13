import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation, Link, useNavigate } from "react-router-dom"; 
import { toast } from "react-toastify";

// Icons
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";

// API
import { getProfileDetails } from "../../../utils/profileApi";
import { addAddress, updateAddress } from "../../../utils/addressApi";

function HeaderSearch() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [selectedLocation, setSelectedLocation] = useState("Select Location");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [isLiveLocation, setIsLiveLocation] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const token = localStorage.getItem("token") || localStorage.getItem("refreshToken");
    const isLoggedIn = !!token;

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
        latitude: 23.1765,
        longitude: 75.8362,
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (isLoggedIn) {
            fetchUserAddresses();
        } else {
            askInitialPermission();
        }
    }, [isLoggedIn]);

    const fetchUserAddresses = async () => {
        try {
            const res = await getProfileDetails();
            if (res?.success) {
                const addrs = res.data.addresses || [];
                setAddresses(addrs);
                const def = addrs.find(a => a.is_default) || addrs[0];
                if (def) {
                    setSelectedLocation(`${def.city}, ${def.pincode}`);
                    setIsLiveLocation(false);
                }
            }
        } catch (err) { console.error(err); }
    };

    const askInitialPermission = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchReverseGeocode(pos.coords.latitude, pos.coords.longitude),
            () => setSelectedLocation("Select Location"),
            { enableHighAccuracy: true, timeout: 5000 }
        );
    };

    const fetchReverseGeocode = async (lat, lon) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
            );
            const data = await res.json();
            
            if (data && data.address) {
                const addr = data.address;
                
                const locationName = 
                    addr.suburb || 
                    addr.neighbourhood || 
                    addr.tehsil || 
                    addr.village || 
                    addr.town || 
                    addr.city_district || 
                    addr.city || 
                    "Unknown Location";

                const post = addr.postcode ? `, ${addr.postcode}` : "";
                
                setSelectedLocation(`${locationName}${post}`);
                setIsLiveLocation(true);
            }
        } catch (err) {
            console.error("Geocoding Error:", err);
            setSelectedLocation("Location Set"); 
        }
    };

    const handleUseCurrent = () => {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                fetchReverseGeocode(pos.coords.latitude, pos.coords.longitude);
                setIsLocating(false);
                setIsModalOpen(false);
            },
            () => { toast.error("Permission denied"); setIsLocating(false); }
        );
    };

    const handleChange = async (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === "pincode" && value.length === 6) {
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
                const data = await res.json();
                if (data[0]?.Status === "Success") {
                    const post = data[0].PostOffice[0];
                    setFormData(prev => ({ ...prev, city: post.District, state: post.State }));
                }
            } catch (err) {}
        }
    };

    const handleEditClick = (e, addr) => {
        e.stopPropagation();
        setEditId(addr.id);
        setFormData(addr);
        setShowAddForm(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const res = editId ? await updateAddress(editId, formData) : await addAddress(formData);
            if (res.success) {
                toast.success(editId ? "Updated" : "Saved");
                setShowAddForm(false);
                setEditId(null);
                fetchUserAddresses();
            }
        } catch (err) { toast.error("Error saving address"); }
        finally { setIsSubmitting(false); }
    };

    if (location.pathname === "/search") return null;

    return (
        <>
            {/* Header UI */}
            <div className="flex items-center gap-3 w-full px-1 py-2">
                
                {/* Location Box */}
                <div 
                    onClick={() => setIsModalOpen(true)} 
                    className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-cyan-900 shadow-sm transition-all shrink-0 max-w-[180px] md:max-w-[240px]"
                >
                    <div className="w-8 h-8 rounded-full bg-cyan-900 flex items-center justify-center text-white relative shrink-0">
                        <LocationOnIcon sx={{ fontSize: 18 }} />
                        {isLiveLocation && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-white"></span>
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-0.5">Delivering to</span>
                        <strong className="text-[12px] font-extrabold text-slate-800 truncate leading-tight">
                            {selectedLocation}
                        </strong>
                    </div>
                </div>

                {/* Search Bar*/}
                <Link 
                    to="/search" 
                    className="flex-1 flex items-center gap-3 px-4 h-16 rounded-full bg-slate-50 border border-cyan-800 group decoration-none hover:border-cyan-900 transition-all"
                >
                    <SearchIcon className="text-cyan-900 group-hover:scale-110 transition-transform" sx={{ fontSize: 20 }} />
                    <span className="text-slate-400 font-bold text-sm truncate">Search for groceries...</span>
                </Link>
            </div>

            {/* Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"></div>
                    <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b flex justify-between items-center">
                            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Select Location</h2>
                            <button onClick={() => setIsModalOpen(false)} className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"><CloseIcon /></button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                            <button onClick={handleUseCurrent} disabled={isLocating} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-cyan-900 text-white shadow-lg active:scale-95 transition-all">
                                <MyLocationIcon className={isLocating ? "animate-spin" : ""} /> 
                                <span className="font-black text-sm uppercase tracking-widest">{isLocating ? "Locating..." : "Use Current Location"}</span>
                            </button>

                            <div className="space-y-4">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Saved Addresses</h3>
                                {isLoggedIn ? (
                                    <div className="space-y-3">
                                        {addresses.map((addr) => (
                                            <div key={addr.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-cyan-900 bg-slate-50 cursor-pointer transition-all group">
                                                <div className="flex items-start gap-4 flex-1" onClick={() => { setSelectedLocation(`${addr.city}, ${addr.pincode}`); setIsModalOpen(false); }}>
                                                    <div className="mt-1 text-cyan-900">
                                                        {addr.address_name === "Home" ? <HomeOutlinedIcon /> : <BusinessOutlinedIcon />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-800 text-sm uppercase leading-none mb-1">{addr.address_name}</span>
                                                        <p className="text-xs font-bold text-slate-500 line-clamp-1">{addr.address_line_1}, {addr.city}</p>
                                                    </div>
                                                </div>
                                                <button onClick={(e) => handleEditClick(e, addr)} className="p-2 text-slate-300 hover:text-cyan-900"><EditOutlinedIcon fontSize="small" /></button>
                                            </div>
                                        ))}
                                        {!showAddForm && (
                                            <button onClick={() => { setEditId(null); setFormData(initialForm); setShowAddForm(true); }} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:border-cyan-900 hover:text-cyan-900 transition-all">+ Add New Address</button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed">
                                        <button onClick={() => { setIsModalOpen(false); setShowAuthModal(true); }} className="text-cyan-900 font-black text-sm underline">Login to see addresses</button>
                                    </div>
                                )}
                            </div>

                            {showAddForm && (
                                <form onSubmit={handleFormSubmit} className="space-y-3 p-4 border rounded-2xl bg-slate-50 animate-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">{editId ? "Update" : "New Address"}</span>
                                        <button type="button" onClick={() => setShowAddForm(false)} className="text-[10px] font-black text-rose-500 uppercase underline">Cancel</button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["myself", "someone_else"].map(t => (
                                            <button key={t} type="button" onClick={() => setFormData({...formData, address_type: t})} className={`h-8 rounded-lg text-[9px] font-black uppercase border transition-all ${formData.address_type === t ? "bg-cyan-900 text-white border-cyan-900" : "bg-white text-slate-400 border-slate-200"}`}>{t.replace('_', ' ')}</button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input name="contact_person_name" placeholder="Full Name" className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none font-bold text-xs" value={formData.contact_person_name} onChange={handleChange} required />
                                        <input name="contact_phone" placeholder="Phone No" className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none font-bold text-xs" value={formData.contact_phone} onChange={handleChange} required />
                                    </div>
                                    <input name="address_line_1" placeholder="House No / Flat / Street" className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none font-bold text-xs" value={formData.address_line_1} onChange={handleChange} required />
                                    <input name="address_line_2" placeholder="Area / Colony (Optional)" className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none font-bold text-xs" value={formData.address_line_2} onChange={handleChange} />
                                    <div className="grid grid-cols-3 gap-2">
                                        <input name="pincode" placeholder="Pincode" className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none font-bold text-xs" value={formData.pincode} onChange={handleChange} maxLength="6" required />
                                        <input placeholder="City" className="w-full h-10 px-3 rounded-xl border-none font-bold text-xs bg-slate-200/50 text-slate-500" value={formData.city} readOnly />
                                        <input placeholder="State" className="w-full h-10 px-3 rounded-xl border-none font-bold text-xs bg-slate-200/50 text-slate-500" value={formData.state} readOnly />
                                    </div>
                                    <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black uppercase text-xs shadow-md active:scale-95 transition-all">
                                        {isSubmitting ? "Processing..." : "Save Address"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

export default HeaderSearch;