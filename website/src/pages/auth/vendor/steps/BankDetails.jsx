import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import NumbersIcon from "@mui/icons-material/Numbers";
import CodeIcon from "@mui/icons-material/Code";
import InputComponent from "../../../../components/common/InputComponent";

function BankDetails({ vendorData, handleChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-2">
      <InputComponent 
        icon={AccountBalanceIcon} 
        label="Bank Name" 
        name="bankName" 
        value={vendorData.bankName} 
        onChange={handleChange} 
      />
      <InputComponent 
        icon={AccountBoxIcon} 
        label="Account Holder Name" 
        name="accountHolderName" 
        value={vendorData.accountHolderName} 
        onChange={handleChange} 
      />
      <InputComponent 
        icon={NumbersIcon} 
        label="Account Number" 
        name="accountNumber" 
        value={vendorData.accountNumber} 
        onChange={handleChange} 
      />
      <InputComponent 
        icon={CodeIcon} 
        label="IFSC Code" 
        name="ifscCode" 
        value={vendorData.ifscCode} 
        onChange={handleChange} 
      />
    </div>
  );
}

export default BankDetails;