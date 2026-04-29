import { NavLink, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded"; 
import { useWishlist } from "../../pages/wishlist/WishlistContext";
import { useCart } from "../../pages/cart/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useOrders } from "../../pages/cart/OrdersContext";
import logo from "../../assets/logonew.jpeg";
import HeaderSearch from "../common/HeaderSearch/HeaderSearch";

function Navbar() {
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  const { getCartCount } = useCart();
  const { wishlist } = useWishlist();
  const { orders } = useOrders();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayCartCount = isLoggedIn ? getCartCount() : 0;

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-pill)] transition-all duration-300 font-extrabold text-base ${
      isActive 
      ? "bg-[var(--primary)] text-[var(--secondary)] shadow-[var(--shadow-sm)] scale-105" 
      : "text-[var(--text-muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--primary)]"
    }`;

  return (
    <header className="sticky top-0 z-[1000] w-full bg-[var(--bg)] backdrop-blur-md border-b border-[var(--border)] shadow-[var(--shadow-sm)]">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <img src={logo} alt="Logo" className="w-10 h-10 rounded-[var(--radius-md)] object-cover border border-[var(--border)] transition-all" />
              <span className="text-2xl font-black text-[var(--primary)] tracking-tighter">Shipzyy</span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-2">
            <NavLink to="/" className={navLinkClasses}>
              <HomeOutlinedIcon fontSize="small" />
              <span>Home</span>
            </NavLink>

            {isLoggedIn && (
              <>
                <NavLink to="/wishlist" className={navLinkClasses}>
                  <div className="relative flex items-center">
                    <FavoriteBorderIcon fontSize="small" />
                    {wishlist?.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[var(--danger)] w-2 h-2 rounded-full border border-[var(--card-bg)] animate-pulse"></span>
                    )}
                  </div>
                  <span>Wishlist</span>
                </NavLink>

                <NavLink to="/orders" className={navLinkClasses}>
                  <div className="relative flex items-center">
                    <ShoppingBagOutlinedIcon fontSize="small" />
                    {orders?.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[var(--primary-hover)] w-2 h-2 rounded-full border border-[var(--card-bg)]"></span>
                    )}
                  </div>
                  <span>Orders</span>
                </NavLink>
              </>
            )}

            <NavLink to="/cart" className={navLinkClasses}>
              <div className="relative flex items-center">
                <ShoppingCartOutlinedIcon fontSize="small" />
                {displayCartCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-[var(--primary)] text-[var(--secondary)] text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-[var(--card-bg)] font-black shadow-[var(--shadow-sm)]">
                    {displayCartCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </NavLink>

            <NavLink to="/help" className={navLinkClasses}>
              <CallOutlinedIcon fontSize="small" />
              <span>Help</span>
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              {!isLoggedIn ? (
                <Link to="/login" className="bg-[var(--primary)] text-[var(--secondary)] font-black px-8 py-3 rounded-[var(--radius-lg)] hover:bg-[var(--primary-hover)] transition-all shadow-[var(--shadow-md)] text-sm">
                  Login
                </Link>
              ) : (
                <div 
                  className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--primary)] border border-[var(--glass-border)] cursor-pointer hover:scale-105 transition-all flex items-center justify-center shadow-[var(--shadow-md)]"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <PersonRoundedIcon className="text-[var(--secondary)] scale-110" />
                </div>
              )}

              {isDropdownOpen && (
                <div className="absolute right-0 mt-5 w-72 bg-[var(--glass-dropdown)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-float)] p-2 animate-in fade-in zoom-in duration-200 z-[1100]">
                  <div className="flex items-center gap-4 px-4 py-5 mb-2 bg-[var(--bg-soft)] rounded-[var(--radius-lg)]">
                    <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--secondary)] shadow-[var(--shadow-sm)]">
                      <PersonRoundedIcon fontSize="medium" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Account</p>
                      <p className="text-[var(--text-main)] font-black text-base truncate">
                        {user?.phone || user?.name || "User"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link 
                      to="/profile" 
                      onClick={() => setIsDropdownOpen(false)} 
                      className="flex items-center justify-between px-5 py-4 text-[var(--text-main)] hover:bg-[var(--bg-soft)] rounded-[var(--radius-lg)] transition-all group"
                    >
                      <div className="flex items-center gap-3 font-bold text-sm">
                        <PersonOutlineRoundedIcon className="text-[var(--text-light)] group-hover:text-[var(--primary)]" /> 
                        Profile Details
                      </div>
                      <span className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                    
                    <button 
                     onClick={logout}
                      className="w-full flex items-center gap-3 px-5 py-4 text-[var(--danger)] hover:bg-[var(--bg-soft)] rounded-[var(--radius-lg)] font-extrabold text-sm transition-all group"
                    >
                      <div className="p-2 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-sm)] group-hover:bg-[var(--danger)] group-hover:text-[var(--secondary)] group-hover:border-transparent transition-colors">
                        <LogoutRoundedIcon fontSize="small" /> 
                      </div>
                      Logout Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-soft)] py-3 border-t border-[var(--border)]">
        <div className="mx-auto max-w-[1600px] px-4 md:px-8">
          <HeaderSearch />
        </div>
      </div>
    </header>
  );
}

export default Navbar;