import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function LogoutPanel() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info("You have been logged out.");
    navigate("/login");
  };

  return (
    <div className="logout-panel">
      <h2 className="section-title">Sign Out</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
        Are you sure you want to log out of your account? You will need to enter your credentials to access your profile again.
      </p>
      <button className="primary-btn logout-btn" onClick={handleLogout} style={{ background: "var(--danger)" }}>
        Yes, Logout
      </button>
    </div>
  );
}

export default LogoutPanel;