import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logonew.jpeg";
import api from "../../utils/api";

function Footer() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/customers/home?page=1&limit=10");
        if (response.data && response.data.success) {
          const allCategories = response.data.data.categories || [];
          const validCategories = allCategories.filter(
            (cat) => cat.subcategories && cat.subcategories.length > 0
          );
          setCategories(validCategories);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchCategories();
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <footer className="bg-slate-900 text-slate-400 pt-20 relative overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-cyan-400 to-emerald-500 absolute top-0 left-0"></div>

      <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 lg:gap-20 items-start mb-16">
          
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="flex items-center gap-4 mb-6">
              <img src={logo} alt="Shipzyy" className="w-12 h-12 rounded-lg object-cover" />
              <h2 className="text-3xl text-white font-extrabold tracking-tight m-0">
                Ship<span className="text-cyan-400">zyy</span>
              </h2>
            </div>
            <p className="text-base leading-relaxed w-full max-w-[450px] mb-8 text-slate-300">
              Experience the future of delivery. Fresh groceries, latest tech, and 
              premium essentials delivered in minutes, not hours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start w-full sm:w-auto">
              <a href="https://apple.com" target="_blank" rel="noreferrer" className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center justify-center gap-3 cursor-pointer transition-all duration-300 text-white hover:bg-white/10 hover:border-cyan-400 hover:-translate-y-1 hover:shadow-lg">
                <span className="text-2xl"></span>
                <div className="flex flex-col text-left">
                  <small className="text-[10px] leading-tight">Download on the</small>
                  <strong className="text-sm">App Store</strong>
                </div>
              </a>
              <a href="https://play.google.com" target="_blank" rel="noreferrer" className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center justify-center gap-3 cursor-pointer transition-all duration-300 text-white hover:bg-white/10 hover:border-cyan-400 hover:-translate-y-1 hover:shadow-lg">
                <span className="text-xl">▶</span>
                <div className="flex flex-col text-left">
                  <small className="text-[10px] leading-tight">Get it on</small>
                  <strong className="text-sm">Google Play</strong>
                </div>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 text-center sm:text-left">
            <div>
              <h4 className="text-white text-xl mb-6 font-bold">Support</h4>
              <ul className="space-y-4">
                <li>
                  <Link 
                    to="/info/faq" 
                    onClick={handleScrollTop}
                    className="text-slate-400 transition-all duration-300 text-[15px] inline-block hover:text-cyan-400 sm:hover:translate-x-2 hover:-translate-y-1 sm:hover:translate-y-0"
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/info/aboutUs" 
                    onClick={handleScrollTop}
                    className="text-slate-400 transition-all duration-300 text-[15px] inline-block hover:text-cyan-400 sm:hover:translate-x-2 hover:-translate-y-1 sm:hover:translate-y-0"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/info/termsConditions" 
                    onClick={handleScrollTop}
                    className="text-slate-400 transition-all duration-300 text-[15px] inline-block hover:text-cyan-400 sm:hover:translate-x-2 hover:-translate-y-1 sm:hover:translate-y-0"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/info/privacyPolicy" 
                    onClick={handleScrollTop}
                    className="text-slate-400 transition-all duration-300 text-[15px] inline-block hover:text-cyan-400 sm:hover:translate-x-2 hover:-translate-y-1 sm:hover:translate-y-0"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-xl mb-6 font-bold">Categories</h4>
              <ul className="space-y-4">
                {categories.length > 0 ? (
                  categories.slice(0, 5).map((category) => (
                    <li key={category.id}>
                      <Link 
                        to={`/shop?category=${encodeURIComponent(category.name)}`} 
                        onClick={handleScrollTop}
                        className="text-slate-400 transition-all duration-300 text-[15px] inline-block hover:text-cyan-400 sm:hover:translate-x-2 hover:-translate-y-1 sm:hover:translate-y-0"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li><Link to="/shop?category=grocery" onClick={handleScrollTop} className="text-slate-400 transition-all duration-300 text-[15px] inline-block hover:text-cyan-400 sm:hover:translate-x-2 hover:-translate-y-1 sm:hover:translate-y-0">Fresh Food</Link></li>
                    <li><Link to="/shop?category=Electronics&subcategory=All" onClick={handleScrollTop} className="text-slate-400 transition-all duration-300 text-[15px] inline-block hover:text-cyan-400 sm:hover:translate-x-2 hover:-translate-y-1 sm:hover:translate-y-0">Electronics</Link></li>
                    <li><Link to="/shop?category=fashion" onClick={handleScrollTop} className="text-slate-400 transition-all duration-300 text-[15px] inline-block hover:text-cyan-400 sm:hover:translate-x-2 hover:-translate-y-1 sm:hover:translate-y-0">Fashion</Link></li>
                    <li><Link to="/shop?category=beauty" onClick={handleScrollTop} className="text-slate-400 transition-all duration-300 text-[15px] inline-block hover:text-cyan-400 sm:hover:translate-x-2 hover:-translate-y-1 sm:hover:translate-y-0">Beauty</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-white/5 w-full"></div>

        <div className="py-10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div>
            <p className="text-slate-400 leading-relaxed">© 2026 Shippzyy Inc. All rights reserved.</p>
            <p className="text-[13px] text-slate-500 mt-1">
              Designed and developed by{" "}
              <a 
                href="https://blackcube.ae/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-cyan-400 font-bold hover:text-emerald-400 transition-colors duration-300 underline-offset-4 hover:underline"
              >
                Blackcube Solutions LLC
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;