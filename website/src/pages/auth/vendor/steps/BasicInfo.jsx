import StorefrontIcon from "@mui/icons-material/Storefront";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import ContactEmergencyIcon from "@mui/icons-material/ContactEmergency";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import InputComponent from "../../../../components/common/InputComponent"; 

function BasicInfo({ vendorData, handleChange }) {
  const availableCategories = ["Restaurant", "Grocery", "Pharmacy", "Electronics", "Fashion"];

  const handleCategoryToggle = (category) => {
    let currentCategories = vendorData.businessCategory || [];
    
    if (currentCategories.includes(category)) {
      currentCategories = currentCategories.filter(c => c !== category);
    } else {
      currentCategories = [...currentCategories, category];
    }

    handleChange({
      target: { name: "businessCategory", value: currentCategories }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
      {/* Full Width Business Name */}
      <div className="md:col-span-2">
        <InputComponent 
          icon={StorefrontIcon} 
          label="Business Name" 
          name="businessName" 
          value={vendorData.businessName} 
          onChange={handleChange} 
        />
      </div>
      
      {/* Multi-select Category Chips */}
      <div className="md:col-span-2 mb-4 mt-1">
        <label className="text-xs font-semibold text-textLight block mb-2">
          Business Category (Select multiple)
        </label>
        <div className="flex flex-wrap gap-2.5">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`px-4 py-1.5 rounded-full border-[1.5px] text-[13px] font-semibold cursor-pointer transition-all outline-none ${
                vendorData.businessCategory?.includes(cat) 
                  ? 'bg-primary border-primary text-white shadow-md' 
                  : 'border-borderMain bg-bgSoft text-textMuted hover:border-primary hover:text-primary'
              }`}
              onClick={() => handleCategoryToggle(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      {/* Grid Inputs */}
      <InputComponent icon={PersonIcon} label="Owner Full Name" name="ownerName" value={vendorData.ownerName} onChange={handleChange} />
      <InputComponent icon={EmailIcon} type="email" label="Email Address" name="email" value={vendorData.email} onChange={handleChange} />
      <InputComponent icon={LockIcon} type="password" label="Password" name="password" value={vendorData.password} onChange={handleChange} />
      
      <div className="flex flex-col gap-1 mb-3 relative z-50">
        <label className="text-xs font-semibold text-textLight">Contact Number</label>
        <PhoneInput 
          country="in" 
          value={vendorData.contactNumber} 
          onChange={(value) => handleChange({ target: { name: 'contactNumber', value } })} 
          inputClass="!w-full !h-12 !pl-[55px] !rounded-md !border-1.5 !border-borderMain !bg-bgSoft !text-sm transition-all focus:!border-primary focus:!bg-white focus:!ring-2 focus:!ring-teal-50"
          buttonClass="!border-none !bg-transparent !border-r !border-borderMain !rounded-l-md"
        />
      </div>
      
      <div className="md:col-span-2">
        <InputComponent icon={ContactEmergencyIcon} label="Emergency Contact" name="emergencyContact" value={vendorData.emergencyContact} onChange={handleChange} />
      </div>
    </div>
  );
}

export default BasicInfo;