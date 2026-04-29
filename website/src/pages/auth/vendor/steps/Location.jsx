// src/pages/Auth/vendor/steps/Location.jsx
import HomeIcon from "@mui/icons-material/Home";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import MapIcon from "@mui/icons-material/Map";
import PinDropIcon from "@mui/icons-material/PinDrop";
import PublicIcon from "@mui/icons-material/Public";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import InputComponent from "../../../../components/common/InputComponent"; 

function Location({ vendorData, handleChange }) {
  
  //Fetch GPS Location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleChange({
            target: { 
              name: "geoLocation", 
              value: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}` 
            }
          });
        },
        (error) => {
          alert("Please allow location access to fetch coordinates.",error);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-2">
      {/* Full width Address */}
      <div className="md:col-span-2">
        <InputComponent 
          icon={HomeIcon} 
          label="Complete Business Address" 
          name="address" 
          value={vendorData.address} 
          onChange={handleChange} 
        />
      </div>
      
      {/* Grid Inputs */}
      <InputComponent icon={LocationCityIcon} label="City" name="city" value={vendorData.city} onChange={handleChange} />
      <InputComponent icon={MapIcon} label="State" name="state" value={vendorData.state} onChange={handleChange} />
      <InputComponent icon={PinDropIcon} label="Pincode" name="pincode" value={vendorData.pincode} onChange={handleChange} />
      <InputComponent icon={PublicIcon} label="Country" name="country" value={vendorData.country} onChange={handleChange} />

      {/* Geo Location Field with Fetch Button */}
      <div className="md:col-span-2 flex flex-col gap-1 mb-3 relative z-10">
        <label className="text-xs font-semibold text-textLight pl-1">Store GPS Coordinates</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            readOnly 
            value={vendorData.geoLocation} 
            placeholder="Click button to fetch ->" 
            className="flex-1 h-11 px-3 rounded-md bg-bgSoft border-1.5 border-borderMain text-sm text-textMuted outline-none"
          />
          <button 
            type="button" 
            onClick={handleGetLocation} 
            className="h-11 px-4 rounded-md bg-brand-gradient text-white flex items-center justify-center transition-all hover:shadow-md hover:-translate-y-0.5"
            title="Fetch My Location"
          >
            <MyLocationIcon fontSize="small" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Location;