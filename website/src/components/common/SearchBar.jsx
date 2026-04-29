// import { useState, useRef, useEffect } from "react";
// import SearchIcon from "@mui/icons-material/Search";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
// import "./common.css";

// // --- MOCK DATA STRUCTURE ---
// const mockSuggestions = [
//   "vegetable",
//   "green vegetable",
//   "organic vegetable",
//   "vegetable bag"
// ];

// const mockProducts = [
//   {
//     id: 1,
//     name: "Green Chilli (Hari Mirch)",
//     weight: "100 g",
//     price: 23,
//     oldPrice: 29,
//     discount: "20% OFF",
//     time: "8 MINS",
//     image: "https://images.unsplash.com/photo-1598514982205-f36b96d1ea8d?auto=format&fit=crop&w=150&q=80"
//   },
//   {
//     id: 2,
//     name: "Green Capsicum (Shimla Mirch)",
//     weight: "250 g",
//     price: 21,
//     oldPrice: 24,
//     discount: "12% OFF",
//     time: "8 MINS",
//     image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=150&q=80"
//   },
//   {
//     id: 3,
//     name: "Lady Finger (Bhindi)",
//     weight: "250 g",
//     price: 25,
//     oldPrice: 30,
//     discount: "16% OFF",
//     time: "8 MINS",
//     image: "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&w=150&q=80"
//   },
//   {
//     id: 4,
//     name: "Spinach (Palak)",
//     weight: "200 g",
//     price: 15,
//     oldPrice: 17,
//     discount: "11% OFF",
//     time: "8 MINS",
//     image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=150&q=80"
//   },
//   {
//     id: 5,
//     name: "Cabbage",
//     weight: "1 pc",
//     price: 45,
//     oldPrice: 55,
//     discount: "18% OFF",
//     time: "8 MINS",
//     image: "https://images.unsplash.com/photo-1596199050105-6d5d32222916?auto=format&fit=crop&w=150&q=80"
//   }
// ];

// function SearchBar() {
//   const [query, setQuery] = useState("");
//   const [isFocused, setIsFocused] = useState(false);
//   const dropdownRef = useRef(null);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsFocused(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Filter logic 
//   const filteredSuggestions = mockSuggestions.filter((item) =>
//     item.toLowerCase().includes(query.toLowerCase())
//   );
  
//   const filteredProducts = mockProducts.filter((product) =>
//     product.name.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase() === "vege"
//   );

//   return (
//     <div className="search-container" ref={dropdownRef}>
//       <div className={`search-input-wrapper ${isFocused ? "focused" : ""}`}>
//         <SearchIcon className="search-icon" />
//         <input
//           placeholder="Search 'vegetables'"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           onFocus={() => setIsFocused(true)}
//         />
//       </div>

//       {/* EXPANDED DROPDOWN */}
//       {query && isFocused && (
//         <div className="search-dropdown mega-dropdown glass-panel">
          
//           {/* 1. TEXT SUGGESTIONS SECTION */}
//           <div className="suggestions-list">
//             {filteredSuggestions.length > 0 ? (
//               filteredSuggestions.map((item, i) => (
//                 <div 
//                   key={i} 
//                   className="suggestion-text-item" 
//                   onClick={() => { setQuery(item); setIsFocused(false); }}
//                 >
//                   <SearchIcon className="item-icon" fontSize="small" />
//                   <span>
//                     {/* Bold the part of the text that matches the query for better UX */}
//                     <strong>{query}</strong>{item.substring(query.length)}
//                   </span>
//                 </div>
//               ))
//             ) : (
//               <div className="dropdown-empty">No categories found for "{query}"</div>
//             )}
//           </div>

//           {/* 2. PRODUCT PREVIEW SECTION */}
//           {filteredProducts.length > 0 && (
//             <div className="products-preview-section">
//               <h4 className="results-title">Results for "{query}"</h4>
              
//               <div className="products-row">
//                 {filteredProducts.map((product) => (
//                   <div className="mini-product-card" key={product.id}>
                    
//                     {/* Image Box with Discount */}
//                     <div className="img-box">
//                       {product.discount && <span className="blue-badge">{product.discount}</span>}
//                       <img src={product.image} alt={product.name} />
//                     </div>

//                     {/* Delivery Time */}
//                     <div className="delivery-time">
//                       <AccessTimeIcon fontSize="inherit" /> {product.time}
//                     </div>

//                     {/* Product Details */}
//                     <div className="mini-title">{product.name}</div>
                    
//                     <div className="weight-selector">
//                       {product.weight} <KeyboardArrowDownIcon fontSize="inherit" />
//                     </div>

//                     {/* Price and Add Button */}
//                     <div className="price-add-row">
//                       <div className="price-block">
//                         <span className="current-price">₹{product.price}</span>
//                         <span className="old-price">₹{product.oldPrice}</span>
//                       </div>
//                       <button className="mini-add-btn">ADD</button>
//                     </div>

//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//         </div>
//       )}
//     </div>
//   );
// }

// export default SearchBar;