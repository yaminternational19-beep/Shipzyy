import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

const menuItems = [
  { id: "personal", label: "Personal Information", icon: <PersonOutlineIcon /> },
  { id: "address", label: "Manage Address", icon: <LocationOnOutlinedIcon /> },
  { id: "wallet", label: "My Wallet", icon: <AccountBalanceWalletOutlinedIcon /> },
  { id: "password", label: "Password Manager", icon: <LockOutlinedIcon /> },
  { id: "about", label: "About Us", icon: <InfoOutlinedIcon /> },
  { id: "privacy", label: "Privacy Policy", icon: <SecurityOutlinedIcon /> },
  { id: "terms", label: "Terms & Conditions", icon: <GavelOutlinedIcon /> },
  { id: "logout", label: "Logout", icon: <LogoutOutlinedIcon /> },
];

function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="account-sidebar glass-panel">
      {menuItems.map((item) => (
        <button
          key={item.id}
          className={`sidebar-item ${activeTab === item.id ? "active" : ""}`}
          onClick={() => setActiveTab(item.id)}
        >
          <span className="sidebar-icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default Sidebar;