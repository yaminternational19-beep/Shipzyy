// import { useState, useEffect, useRef } from "react";
// import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
// import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
// import MyLocationIcon from "@mui/icons-material/MyLocation";
// import SearchIcon from "@mui/icons-material/Search";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import StarOutlineIcon from "@mui/icons-material/StarOutline";
// import CircularProgress from "@mui/material/CircularProgress";
// import "./common.css";

// function LocationPicker() {
//   const [location, setLocation] = useState("Detect location");
//   const [isDetecting, setIsDetecting] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
  
//   const dropdownRef = useRef(null);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const detectLocation = (e) => {
//     e.stopPropagation(); // Prevent dropdown from toggling
//     if (!navigator.geolocation) {
//       handleSelectLocation("Indore, MP");
//       return;
//     }

//     setIsDetecting(true);
//     setLocation("Detecting...");
//     setIsOpen(false);

//     navigator.geolocation.getCurrentPosition(
//       () => {
//         setTimeout(() => {
//           handleSelectLocation("Indore, MP");
//           setIsDetecting(false);
//         }, 800);
//       },
//       () => {
//         handleSelectLocation("Indore, MP");
//         setIsDetecting(false);
//       }
//     );
//   };

//   const handleSelectLocation = (newLocation) => {
//     setLocation(newLocation);
//     setIsOpen(false);
//     setSearchQuery("");
//   };

//   const popularCities = ["Mumbai, MH", "Delhi, DL", "Bangalore, KA", "Hyderabad, TS"];
//   const recentLocations = ["Pune, MH", "Ahmedabad, GJ"];

//   return (
//     <div className="location-picker-wrapper" ref={dropdownRef}>
//       {/* Main Trigger Button */}
//       <button 
//         className={`location-btn glass-panel premium-hover ${isDetecting ? 'detecting' : ''} ${isOpen ? 'active' : ''}`} 
//         onClick={() => !isDetecting && setIsOpen(!isOpen)}
//         disabled={isDetecting}
//       >
//         <div className="icon-circle">
//           {isDetecting ? (
//             <CircularProgress size={16} color="inherit" />
//           ) : (
//             <LocationOnOutlinedIcon fontSize="small" />
//           )}
//         </div>
//         <span className="loc-text">{location}</span>
//         <KeyboardArrowDownIcon 
//           fontSize="small" 
//           className={`arrow-icon ${isDetecting ? 'hidden' : ''} ${isOpen ? 'rotated' : ''}`} 
//         />
//       </button>

//       {/* Dropdown Menu */}
//       <div className={`location-dropdown ${isOpen ? 'open' : ''}`}>
        
//         {/* Search Bar inside dropdown */}
//         <div className="dropdown-search">
//           <SearchIcon className="search-icon-small" />
//           <input 
//             type="text" 
//             placeholder="Search for your city..." 
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>

//         <div className="dropdown-body">
//           {/* Auto Detect Option */}
//           <div className="dropdown-item detect-item" onClick={detectLocation}>
//             <MyLocationIcon className="item-icon detect-icon" />
//             <div className="item-content">
//               <span className="item-title">Detect my location</span>
//               <span className="item-subtitle">Using GPS</span>
//             </div>
//           </div>

//           <div className="dropdown-divider"></div>

//           {/* Recent Locations */}
//           {searchQuery === "" && (
//             <div className="location-group">
//               <span className="group-label">Recent</span>
//               {recentLocations.map((city, idx) => (
//                 <div key={idx} className="dropdown-item" onClick={() => handleSelectLocation(city)}>
//                   <AccessTimeIcon className="item-icon" />
//                   <span className="item-title">{city}</span>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Popular Cities */}
//           {searchQuery === "" && (
//             <div className="location-group">
//               <span className="group-label">Popular Cities</span>
//               {popularCities.map((city, idx) => (
//                 <div key={idx} className="dropdown-item" onClick={() => handleSelectLocation(city)}>
//                   <StarOutlineIcon className="item-icon" />
//                   <span className="item-title">{city}</span>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Search Results (Dummy) */}
//           {searchQuery !== "" && (
//             <div className="dropdown-item" onClick={() => handleSelectLocation(searchQuery)}>
//               <LocationOnOutlinedIcon className="item-icon" />
//               <span className="item-title">Search results for "{searchQuery}"</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default LocationPicker;