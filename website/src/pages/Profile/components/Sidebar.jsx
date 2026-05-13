import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const menuItems = [
  { id: "personal", label: "Profile", icon: <PersonOutlineIcon /> },
  { id: "address", label: "Address", icon: <LocationOnOutlinedIcon /> },
  { id: "wallet", label: "Wallet", icon: <AccountBalanceWalletOutlinedIcon /> },
  { id: "about", label: "About", icon: <InfoOutlinedIcon /> },
  { id: "privacy", label: "Privacy", icon: <SecurityOutlinedIcon /> },
  { id: "terms", label: "Terms", icon: <GavelOutlinedIcon /> },
  { id: "logout", label: "Logout", icon: <LogoutOutlinedIcon />, isDanger: true },
  { id: "delete", label: "Delete", icon: <DeleteOutlineIcon />, isDanger: true },
];

function Sidebar({ activeTab, setActiveTab }) {
  return (
   
  
    <div className="w-full h-auto md:h-fit sticky top-0 z-20 md:static bg-[var(--card-bg)] border-b md:border border-[var(--border)] md:rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
      <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible no-scrollbar p-2 md:p-4 gap-2 md:gap-1.5">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          
          let btnClass = "flex items-center gap-2 md:gap-5 px-4 md:px-6 py-2.5 md:py-4 rounded-full md:rounded-[var(--radius-md)] font-bold text-sm md:text-lg transition-all duration-300 whitespace-nowrap border-2 md:border-l-[5px] md:border-t-0 md:border-r-0 md:border-b-0 ";
          let iconClass = "flex items-center justify-center scale-100 md:scale-125 ";

          if (item.isDanger) {
            if (isActive) {
              btnClass += "bg-red-50 border-red-500 text-red-600";
              iconClass += "text-red-600";
            } else {
              btnClass += "border-transparent text-red-500 hover:bg-red-50 hover:text-red-600";
              iconClass += "text-red-400";
            }
          } else {
            if (isActive) {
              btnClass += "bg-[var(--bg-soft)] border-[var(--primary)] text-[var(--primary)]";
              iconClass += "text-[var(--primary)]";
            } else {
              btnClass += "border-transparent text-[var(--text-main)] hover:bg-[var(--bg-soft)] hover:text-[var(--primary)]";
              iconClass += "text-[var(--text-muted)]";
            }
          }

          return (
            <button
              key={item.id}
              className={btnClass}
              onClick={() => setActiveTab(item.id)}
            >
              <span className={iconClass}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Sidebar;