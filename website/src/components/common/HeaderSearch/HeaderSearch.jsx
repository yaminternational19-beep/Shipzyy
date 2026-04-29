import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

// Icons
import LocationOnIcon from "@mui/icons-material/LocationOn";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";

import { useCart } from "../../../pages/cart/CartContext";
import products from "../../../data/products.json";

function HeaderSearch() {
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();

  const [selectedLocation, setSelectedLocation] = useState("New Delhi, 110001");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: "", phone: "", street: "", landmark: "", city: "", state: "", pin: "", type: "Home"
  });

  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  // Close search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Search Logic ---
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  const handleSearchClick = (productId) => {
    setIsSearchFocused(false);
    setQuery("");
    navigate(`/product/${productId}`);
  };

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 w-full">
        
        {/* --- Location Pill --- */}
        <button 
          onClick={() => setShowLocationModal(true)}
          className="flex items-center gap-3 p-1.5 pr-5 bg-[var(--bg)] border border-[var(--border)] rounded-2xl lg:rounded-full shadow-[var(--shadow-sm)] hover:border-[var(--primary)] transition-all min-w-full lg:min-w-[280px] group"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--secondary)] shrink-0 shadow-[var(--shadow-sm)]">
            <LocationOnIcon fontSize="small" />
          </div>
          <div className="flex flex-col items-start overflow-hidden text-left">
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Delivering to</span>
            <strong className="text-sm font-black text-[var(--primary)] truncate w-40">{selectedLocation}</strong>
          </div>
          <KeyboardArrowDownIcon className="ml-auto text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-all" />
        </button>

        {/* --- Search Bar --- */}
        <div className={`relative flex-1 flex items-center gap-3 px-5 h-14 rounded-2xl lg:rounded-full transition-all w-full border ${isSearchFocused ? 'bg-[var(--bg)] border-[var(--primary)] shadow-[var(--shadow-md)]' : 'bg-[var(--bg-soft)] border-[var(--border)] shadow-[var(--shadow-sm)]'}`}>
          <SearchIcon className={isSearchFocused ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'} />
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-base font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)] placeholder:font-medium"
            placeholder="Search for fresh spinach, milk..."
            value={query}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[var(--text-muted)] hover:text-[var(--danger)]">
              <CloseIcon fontSize="small" />
            </button>
          )}
        </div>
      </div>

      {/* --- SEARCH SUGGESTIONS DROPDOWN --- */}
      {isSearchFocused && query.length > 0 && (
        <div className="absolute top-full left-0 lg:left-auto lg:right-0 w-full lg:w-[calc(100%-300px)] bg-[var(--card-bg)] mt-3 rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-float)] overflow-hidden z-[1100] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-4">
            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[2px] mb-4 px-2">Suggestions for "{query}"</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id}
                  onClick={() => handleSearchClick(product.id)}
                  className="flex items-center gap-4 p-3 rounded-[var(--radius-md)] hover:bg-[var(--bg-soft)] cursor-pointer group transition-all"
                >
                  <div className="w-14 h-14 bg-[var(--bg-soft)] rounded-[var(--radius-sm)] overflow-hidden flex items-center justify-center p-2 group-hover:bg-[var(--bg)] border border-transparent group-hover:border-[var(--border)]">
                    <img src={product.product_image} alt={product.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-black text-[var(--primary)]">₹{product.offer_price}</span>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-[var(--text-muted)]">
                        <AccessTimeIcon style={{ fontSize: '10px' }} /> 8 MINS
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart(product); setIsCartOpen(true); }}
                    className="p-2 bg-[var(--bg)] border border-[var(--primary)] text-[var(--primary)] rounded-lg hover:bg-[var(--primary)] hover:text-[var(--secondary)] transition-all scale-0 group-hover:scale-100 shadow-[var(--shadow-sm)]"
                  >
                    <AddIcon fontSize="small" />
                  </button>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-[var(--text-muted)] font-bold italic">No matches found. Try searching for something else!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- LOCATION MODAL --- */}
      {showLocationModal && createPortal(
        <div className="fixed inset-0 z-[2000] flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-[var(--glass-overlay)] backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowLocationModal(false)} />
          
          <div className="relative w-full lg:max-w-xl bg-[var(--card-bg)] rounded-t-[40px] lg:rounded-[40px] shadow-[var(--shadow-float)] p-6 lg:p-10 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex justify-between items-center mb-8">
               {isAddingAddress ? (
                 <button onClick={() => setIsAddingAddress(false)} className="flex items-center gap-2 text-[var(--text-muted)] font-black uppercase text-xs hover:text-[var(--primary)]">
                    <ArrowBackIcon fontSize="inherit" /> Back
                 </button>
               ) : (
                 <div>
                    <h3 className="text-2xl font-black text-[var(--primary)] tracking-tight">Select Location</h3>
                    <p className="text-[var(--text-muted)] text-sm font-bold">Where should we deliver your order?</p>
                 </div>
               )}
               <button onClick={() => setShowLocationModal(false)} className="w-10 h-10 flex items-center justify-center bg-[var(--bg-soft)] rounded-full hover:bg-[var(--danger)] hover:text-[var(--secondary)] text-[var(--text-main)] transition-all">
                  <CloseIcon />
               </button>
            </div>

            {isAddingAddress ? (
              /* Detailed form  */
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="flex gap-3">
                   {["Home", "Work", "Other"].map(type => (
                     <button 
                       key={type}
                       onClick={() => setAddressForm({...addressForm, type})}
                       className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${addressForm.type === type ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--secondary)] shadow-[var(--shadow-sm)]' : 'bg-[var(--bg-soft)] border-transparent text-[var(--text-muted)]'}`}
                     >
                       {type}
                     </button>
                   ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="p-4 bg-[var(--bg-soft)] rounded-2xl font-bold text-[var(--text-main)] outline-none border-2 border-transparent focus:border-[var(--primary)] focus:bg-[var(--bg)] transition-all" placeholder="Receiver's Name" />
                  <input className="p-4 bg-[var(--bg-soft)] rounded-2xl font-bold text-[var(--text-main)] outline-none border-2 border-transparent focus:border-[var(--primary)] focus:bg-[var(--bg)] transition-all" placeholder="Phone Number" />
                </div>
                <input className="p-4 bg-[var(--bg-soft)] rounded-2xl font-bold text-[var(--text-main)] outline-none border-2 border-transparent focus:border-[var(--primary)] focus:bg-[var(--bg)] transition-all" placeholder="Flat / House No. / Building" />
                <button className="w-full py-5 bg-[var(--primary)] text-[var(--secondary)] rounded-[24px] font-black shadow-[var(--shadow-md)] hover:bg-[var(--primary-hover)] transition-all uppercase tracking-widest">
                   Save & Deliver Here
                </button>
              </div>
            ) : (
              /* Saved addresses */
              <div className="flex flex-col gap-6">
                <button onClick={() => setIsAddingAddress(true)} className="flex items-center gap-4 p-5 border-2 border-dashed border-[var(--border)] rounded-3xl hover:border-[var(--primary)] hover:bg-[var(--bg-soft)] transition-all group text-left">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg-soft)] flex items-center justify-center text-[var(--text-main)] group-hover:bg-[var(--primary)] group-hover:text-[var(--secondary)] transition-all">
                    <AddIcon />
                  </div>
                  <div>
                    <p className="font-black text-[var(--text-main)] text-lg group-hover:text-[var(--primary)] transition-colors">Add New Address</p>
                    <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest">For a different location</p>
                  </div>
                </button>

                <button className="flex items-center gap-4 p-5 bg-[var(--primary)] text-[var(--secondary)] rounded-3xl shadow-[var(--shadow-md)] hover:scale-[1.01] transition-all">
                  <MyLocationIcon className="animate-pulse text-[var(--secondary)]" />
                  <div className="text-left">
                    <p className="font-black text-lg">Use Current Location</p>
                    <p className="text-xs text-[var(--secondary)] opacity-80 font-bold uppercase tracking-widest">Using GPS</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default HeaderSearch;